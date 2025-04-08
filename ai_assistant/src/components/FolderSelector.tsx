//src/components/FolderSelector.tsx

import React, { useState, FC } from 'react';

// Define the shape of a folder item (file or directory)
interface FolderItemBase {
    name: string;
    path: string;
    isFile: boolean;
}

interface FileFolderItem extends FolderItemBase {
    isFile: true;
    handle: FileSystemFileHandle;
}

interface DirectoryFolderItem extends FolderItemBase {
    isFile: false;
    contents: FolderItem[];
}

type FolderItem = FileFolderItem | DirectoryFolderItem;

// Define the props for the FolderSelector component
interface FolderSelectorProps {
    onAssistantCreated: (assistantName: string, data: Record<string, any>) => void;
    onCancel: () => void;
}

const FolderSelector: FC<FolderSelectorProps> = ({ onAssistantCreated, onCancel }) => {
    // State variables
    const [extensionsCount, setExtensionsCount] = useState<Record<string, number>>({});
    const [selectedExtensions, setSelectedExtensions] = useState<string[]>([]);
    const [folderData, setFolderData] = useState<FolderItem[]>([]);
    const [selectedFiles, setSelectedFiles] = useState<Map<string, FileSystemFileHandle>>(new Map());
    const [showExtensionPopup, setShowExtensionPopup] = useState<boolean>(false);
    const [showFolderTree, setShowFolderTree] = useState<boolean>(false);
    const [newAssistantName, setNewAssistantName] = useState<string>('');

    // New state for expanded folders
    const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());

    // Function to handle folder selection
    const handleFolderSelection = async () => {
        try {
            // Check if the browser supports showDirectoryPicker
            if (!window.showDirectoryPicker) {
                alert('Your browser does not support the Directory Picker API.');
                return;
            }

            const directoryHandle: FileSystemDirectoryHandle = await window.showDirectoryPicker();
            const extensionsMap: Record<string, number> = {};

            const scanFiles = async (folderHandle: FileSystemDirectoryHandle, parentPath = ''): Promise<FolderItem[]> => {
                let currentFolderData: FolderItem[] = [];
                const currentPath = parentPath + '/' + folderHandle.name;

                for await (const entry of folderHandle.values()) {
                    if (entry.kind === 'file') {
                        const fileHandle = entry as FileSystemFileHandle;
                        const file = await fileHandle.getFile();
                        const ext = file.name.includes('.') ? `.${file.name.split('.').pop()}` : '';
                        if (ext) {
                            extensionsMap[ext] = (extensionsMap[ext] || 0) + 1;
                            currentFolderData.push({
                                name: file.name,
                                path: `${currentPath}/${file.name}`,
                                isFile: true,
                                handle: fileHandle,
                            });
                        }
                    } else if (entry.kind === 'directory') {
                        const subfolderHandle = entry as FileSystemDirectoryHandle;
                        const subfolderData = await scanFiles(subfolderHandle, currentPath);
                        currentFolderData.push({
                            name: subfolderHandle.name,
                            path: `${currentPath}/${subfolderHandle.name}`,
                            isFile: false,
                            contents: subfolderData,
                        });
                    }
                }
                return currentFolderData;
            };

            const scannedData = await scanFiles(directoryHandle);
            setFolderData(scannedData);
            setExtensionsCount(extensionsMap);
        } catch (error) {
            console.error('Error selecting folder:', error);
            alert('Error selecting folder');
        }
    };

    // Handle extension selection submission
    const handleSubmitExtensionSelection = () => {
        const checkboxes = document.querySelectorAll<HTMLInputElement>('#extensionCheckboxes input[type="checkbox"]:checked');
        const selected = Array.from(checkboxes).map((checkbox) => checkbox.value);
        setSelectedExtensions(selected);
        setShowExtensionPopup(false);
    };

    // Filter folder data by extensions
    const removeEmptyFolders = (data: FolderItem[]): FolderItem[] => {
        return data.filter((item) => {
            if (item.isFile) {
                const ext = `.${item.name.split('.').pop()}`;
                return selectedExtensions.includes(ext);
            } else {
                item.contents = removeEmptyFolders(item.contents);
                return item.contents.length > 0;
            }
        });
    };

    // Handle showing folder tree
    const handleShowTreeView = () => {
        if (!newAssistantName.trim()) {
            alert('Please provide a name for the new assistant.');
            return;
        }
        setShowFolderTree(true);
    };

    // Toggle file selection
    const toggleFileSelection = (path: string, handle: FileSystemFileHandle) => {
        const updatedSelectedFiles = new Map(selectedFiles);
        if (updatedSelectedFiles.has(path)) {
            updatedSelectedFiles.delete(path);
        } else {
            updatedSelectedFiles.set(path, handle);
        }
        setSelectedFiles(updatedSelectedFiles);
    };

    // Toggle folder expansion
    const toggleFolderExpansion = (folderPath: string) => {
        setExpandedFolders((prev) => {
            const newSet = new Set(prev);
            if (newSet.has(folderPath)) {
                newSet.delete(folderPath);
            } else {
                newSet.add(folderPath);
            }
            return newSet;
        });
    };

    // Function to select all files
    const selectAllFiles = () => {
        const allFiles = new Map<string, FileSystemFileHandle>();
        const traverse = (items: FolderItem[]) => {
            items.forEach((item) => {
                if (item.isFile) {
                    allFiles.set(item.path, item.handle);
                } else {
                    traverse(item.contents);
                }
            });
        };
        traverse(removeEmptyFolders(folderData));
        setSelectedFiles(allFiles);
    };

    // Function to deselect all files
    const deselectAllFiles = () => {
        setSelectedFiles(new Map());
    };

    // Function to select all files under a specific folder
    const selectFilesUnderFolder = (folderItem: FolderItem) => {
        const updatedSelectedFiles = new Map(selectedFiles);
        const traverse = (item: FolderItem) => {
            if (item.isFile) {
                updatedSelectedFiles.set(item.path, item.handle);
            } else {
                item.contents.forEach(traverse);
            }
        };
        traverse(folderItem);
        setSelectedFiles(updatedSelectedFiles);
    };

    // Function to deselect all files under a specific folder
    const deselectFilesUnderFolder = (folderItem: FolderItem) => {
        const updatedSelectedFiles = new Map(selectedFiles);
        const traverse = (item: FolderItem) => {
            if (item.isFile) {
                updatedSelectedFiles.delete(item.path);
            } else {
                item.contents.forEach(traverse);
            }
        };
        traverse(folderItem);
        setSelectedFiles(updatedSelectedFiles);
    };

    // TreeNode component
    interface TreeNodeProps {
        item: FolderItem;
    }

    const TreeNode: FC<TreeNodeProps> = ({ item }) => {
        const isExpanded = expandedFolders.has(item.path);

        if (item.isFile) {
            return (
                <li style={{ cursor: 'pointer', marginLeft: '20px' }}>
                    <span
                        className={selectedFiles.has(item.path) ? 'selected' : ''}
                        style={{
                            backgroundColor: selectedFiles.has(item.path) ? '#d3d3d3' : 'transparent',
                            display: 'inline-block',
                            padding: '2px 5px',
                        }}
                        onClick={(e) => {
                            e.stopPropagation(); // Prevent event from bubbling up
                            toggleFileSelection(item.path, item.handle);
                        }}
                    >
                        📄 {item.name}
                    </span>
                </li>
            );
        } else {
            return (
                <li style={{ cursor: 'pointer', marginLeft: '0' }}>
                    <div
                        title="Click to expand/collapse. Ctrl+Click to deselect all files. Alt+Click to select all files."
                        onClick={(e) => {
                            e.stopPropagation(); // Prevent event from bubbling up
                            if (e.ctrlKey) {
                                // Deselect all files under this folder
                                deselectFilesUnderFolder(item);
                            } else if (e.altKey) {
                                // Select all files under this folder
                                selectFilesUnderFolder(item);
                            } else {
                                toggleFolderExpansion(item.path);
                            }
                        }}
                        style={{ fontWeight: 'bold', display: 'flex', alignItems: 'center' }}
                    >
                        <span style={{ marginRight: '5px' }}>{isExpanded ? '📂' : '📁'}</span>
                        {item.name}
                    </div>
                    {isExpanded && (
                        <ul style={{ listStyleType: 'none', paddingLeft: '20px' }}>
                            {item.contents.map((childItem) => (
                                <TreeNode key={childItem.path} item={childItem} />
                            ))}
                        </ul>
                    )}
                </li>
            );
        }
    };

    // Create tree view
    const createTreeView = (data: FolderItem[]) => {
        return (
            <ul style={{ listStyleType: 'none', paddingLeft: '20px' }}>
                {data.map((item) => (
                    <TreeNode key={item.path} item={item} />
                ))}
            </ul>
        );
    };

    // Load files and generate JSON
    const loadFilesAsJson = async (): Promise<Record<string, any>> => {
        const indexedFiles: Record<string, any> = {};

        for (const [filePath, fileHandle] of selectedFiles) {
            const folderPath = filePath.substring(0, filePath.lastIndexOf('/'));
            const fileName = filePath.substring(filePath.lastIndexOf('/') + 1);
            const file = await fileHandle.getFile();
            const fileContent = await file.text();

            if (!indexedFiles[folderPath]) {
                indexedFiles[folderPath] = { file_contents: {} };
            }
            indexedFiles[folderPath]['file_contents'][fileName] = fileContent;
        }

        return indexedFiles;
    };

    // Handle submission of selected files and generate JSON
    const handleCreateAssistant = async () => {
        if (!newAssistantName.trim()) {
            alert('Please provide a name for the new assistant.');
            return;
        }

        if (selectedFiles.size === 0) {
            alert('Please select at least one file.');
            return;
        }

        try {
            const jsonData = await loadFilesAsJson();
            onAssistantCreated(newAssistantName, jsonData);
        } catch (error) {
            console.error('Error creating assistant:', error);
            alert('Error creating assistant');
        }
    };

    return (
        <div>
            {/* Input for new assistant name */}
            <h2>Enter New Assistant Name</h2>
            <input
                type="text"
                placeholder="Enter new assistant name"
                value={newAssistantName}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewAssistantName(e.target.value)}
                style={styles.input}
            />

            {/* Folder selection and extension filtering */}
            <div style={styles.buttonGroup}>
                <button onClick={handleFolderSelection} style={styles.button}>
                    Choose Folder
                </button>
                <button
                    onClick={() => setShowExtensionPopup(true)}
                    disabled={Object.keys(extensionsCount).length === 0}
                    style={{
                        ...styles.button,
                        ...(Object.keys(extensionsCount).length === 0 ? styles.disabledButton : {}),
                    }}
                >
                    Select Extensions
                </button>
                <button
                    onClick={handleShowTreeView}
                    disabled={selectedExtensions.length === 0}
                    style={{
                        ...styles.button,
                        ...(selectedExtensions.length === 0 ? styles.disabledButton : {}),
                    }}
                >
                    Select Files
                </button>
            </div>

            {/* Extension selection popup */}
            {showExtensionPopup && (
                <div style={styles.popup}>
                    <div style={styles.popupContent}>
                        <h3>Select File Extensions</h3>
                        <div id="extensionCheckboxes" style={{ textAlign: 'left' }}>
                            {Object.keys(extensionsCount)
                                .sort()
                                .map((ext) => (
                                    <div key={ext}>
                                        <input type="checkbox" id={ext} value={ext} />
                                        <label htmlFor={ext}>
                                            {ext} ({extensionsCount[ext]})
                                        </label>
                                    </div>
                                ))}
                        </div>
                        <button onClick={handleSubmitExtensionSelection} style={styles.button}>
                            Submit
                        </button>
                        <button onClick={() => setShowExtensionPopup(false)} style={styles.cancelButton}>
                            Cancel
                        </button>
                    </div>
                </div>
            )}

            {/* Folder tree popup */}
            {showFolderTree && (
                <div style={styles.popup}>
                    <div style={styles.popupContent}>
                        <h3>Select Files</h3>
                        {/* Add Select All and Deselect All buttons */}
                        <div style={styles.buttonGroup}>
                            <button onClick={selectAllFiles} style={styles.button}>
                                Select All
                            </button>
                            <button onClick={deselectAllFiles} style={styles.button}>
                                Deselect All
                            </button>
                        </div>
                        <div>{createTreeView(removeEmptyFolders(folderData))}</div>
                        <div style={styles.buttonGroup}>
                            <button onClick={handleCreateAssistant} style={styles.createButton}>
                                Create Assistant
                            </button>
                            <button onClick={() => setShowFolderTree(false)} style={styles.cancelButton}>
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Cancel button */}
            <div style={styles.buttonGroup}>
                <button onClick={onCancel} style={styles.cancelButton}>
                    Cancel
                </button>
            </div>
        </div>
    );
};

// Styles for the component
const styles: { [key: string]: React.CSSProperties } = {
    input: {
        width: '50%',
        padding: '10px',
        marginBottom: '10px',
        borderRadius: '4px',
        border: '1px solid #ccc',
    },
    buttonGroup: {
        display: 'flex',
        justifyContent: 'center',
        marginTop: '10px',
        flexWrap: 'wrap',
    },
    button: {
        backgroundColor: '#008CBA',
        color: 'white',
        padding: '10px 15px',
        margin: '5px',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
    },
    createButton: {
        backgroundColor: '#4CAF50',
        color: 'white',
        padding: '10px 15px',
        margin: '5px',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
    },
    cancelButton: {
        backgroundColor: '#f44336',
        color: 'white',
        padding: '10px 15px',
        margin: '5px',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
    },
    disabledButton: {
        backgroundColor: '#cccccc',
        color: '#666666',
        cursor: 'not-allowed',
    },
    popup: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'fixed',
        left: 0,
        top: 0,
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        zIndex: 1000,
    },
    popupContent: {
        backgroundColor: 'white',
        padding: '20px',
        borderRadius: '8px',
        width: '400px',
        maxHeight: '80%',
        overflowY: 'auto',
    },
};

export default FolderSelector;

