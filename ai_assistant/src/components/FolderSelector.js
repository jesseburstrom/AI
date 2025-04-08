var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
};
import { jsxs as _jsxs, jsx as _jsx } from "react/jsx-runtime";
//src/components/FolderSelector.tsx
import { useState } from 'react';
const FolderSelector = ({ onAssistantCreated, onCancel }) => {
    // State variables
    const [extensionsCount, setExtensionsCount] = useState({});
    const [selectedExtensions, setSelectedExtensions] = useState([]);
    const [folderData, setFolderData] = useState([]);
    const [selectedFiles, setSelectedFiles] = useState(new Map());
    const [showExtensionPopup, setShowExtensionPopup] = useState(false);
    const [showFolderTree, setShowFolderTree] = useState(false);
    const [newAssistantName, setNewAssistantName] = useState('');
    // New state for expanded folders
    const [expandedFolders, setExpandedFolders] = useState(new Set());
    // Function to handle folder selection
    const handleFolderSelection = () => __awaiter(void 0, void 0, void 0, function* () {
        try {
            // Check if the browser supports showDirectoryPicker
            if (!window.showDirectoryPicker) {
                alert('Your browser does not support the Directory Picker API.');
                return;
            }
            const directoryHandle = yield window.showDirectoryPicker();
            const extensionsMap = {};
            const scanFiles = (folderHandle_1, ...args_1) => __awaiter(void 0, [folderHandle_1, ...args_1], void 0, function* (folderHandle, parentPath = '') {
                var _a, e_1, _b, _c;
                let currentFolderData = [];
                const currentPath = parentPath + '/' + folderHandle.name;
                try {
                    for (var _d = true, _e = __asyncValues(folderHandle.values()), _f; _f = yield _e.next(), _a = _f.done, !_a; _d = true) {
                        _c = _f.value;
                        _d = false;
                        const entry = _c;
                        if (entry.kind === 'file') {
                            const fileHandle = entry;
                            const file = yield fileHandle.getFile();
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
                        }
                        else if (entry.kind === 'directory') {
                            const subfolderHandle = entry;
                            const subfolderData = yield scanFiles(subfolderHandle, currentPath);
                            currentFolderData.push({
                                name: subfolderHandle.name,
                                path: `${currentPath}/${subfolderHandle.name}`,
                                isFile: false,
                                contents: subfolderData,
                            });
                        }
                    }
                }
                catch (e_1_1) { e_1 = { error: e_1_1 }; }
                finally {
                    try {
                        if (!_d && !_a && (_b = _e.return)) yield _b.call(_e);
                    }
                    finally { if (e_1) throw e_1.error; }
                }
                return currentFolderData;
            });
            const scannedData = yield scanFiles(directoryHandle);
            setFolderData(scannedData);
            setExtensionsCount(extensionsMap);
        }
        catch (error) {
            console.error('Error selecting folder:', error);
            alert('Error selecting folder');
        }
    });
    // Handle extension selection submission
    const handleSubmitExtensionSelection = () => {
        const checkboxes = document.querySelectorAll('#extensionCheckboxes input[type="checkbox"]:checked');
        const selected = Array.from(checkboxes).map((checkbox) => checkbox.value);
        setSelectedExtensions(selected);
        setShowExtensionPopup(false);
    };
    // Filter folder data by extensions
    const removeEmptyFolders = (data) => {
        return data.filter((item) => {
            if (item.isFile) {
                const ext = `.${item.name.split('.').pop()}`;
                return selectedExtensions.includes(ext);
            }
            else {
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
    const toggleFileSelection = (path, handle) => {
        const updatedSelectedFiles = new Map(selectedFiles);
        if (updatedSelectedFiles.has(path)) {
            updatedSelectedFiles.delete(path);
        }
        else {
            updatedSelectedFiles.set(path, handle);
        }
        setSelectedFiles(updatedSelectedFiles);
    };
    // Toggle folder expansion
    const toggleFolderExpansion = (folderPath) => {
        setExpandedFolders((prev) => {
            const newSet = new Set(prev);
            if (newSet.has(folderPath)) {
                newSet.delete(folderPath);
            }
            else {
                newSet.add(folderPath);
            }
            return newSet;
        });
    };
    // Function to select all files
    const selectAllFiles = () => {
        const allFiles = new Map();
        const traverse = (items) => {
            items.forEach((item) => {
                if (item.isFile) {
                    allFiles.set(item.path, item.handle);
                }
                else {
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
    const selectFilesUnderFolder = (folderItem) => {
        const updatedSelectedFiles = new Map(selectedFiles);
        const traverse = (item) => {
            if (item.isFile) {
                updatedSelectedFiles.set(item.path, item.handle);
            }
            else {
                item.contents.forEach(traverse);
            }
        };
        traverse(folderItem);
        setSelectedFiles(updatedSelectedFiles);
    };
    // Function to deselect all files under a specific folder
    const deselectFilesUnderFolder = (folderItem) => {
        const updatedSelectedFiles = new Map(selectedFiles);
        const traverse = (item) => {
            if (item.isFile) {
                updatedSelectedFiles.delete(item.path);
            }
            else {
                item.contents.forEach(traverse);
            }
        };
        traverse(folderItem);
        setSelectedFiles(updatedSelectedFiles);
    };
    const TreeNode = ({ item }) => {
        const isExpanded = expandedFolders.has(item.path);
        if (item.isFile) {
            return (_jsx("li", { style: { cursor: 'pointer', marginLeft: '20px' }, children: _jsxs("span", { className: selectedFiles.has(item.path) ? 'selected' : '', style: {
                        backgroundColor: selectedFiles.has(item.path) ? '#d3d3d3' : 'transparent',
                        display: 'inline-block',
                        padding: '2px 5px',
                    }, onClick: (e) => {
                        e.stopPropagation(); // Prevent event from bubbling up
                        toggleFileSelection(item.path, item.handle);
                    }, children: ["\uD83D\uDCC4 ", item.name] }) }));
        }
        else {
            return (_jsxs("li", { style: { cursor: 'pointer', marginLeft: '0' }, children: [_jsxs("div", { title: "Click to expand/collapse. Ctrl+Click to deselect all files. Alt+Click to select all files.", onClick: (e) => {
                            e.stopPropagation(); // Prevent event from bubbling up
                            if (e.ctrlKey) {
                                // Deselect all files under this folder
                                deselectFilesUnderFolder(item);
                            }
                            else if (e.altKey) {
                                // Select all files under this folder
                                selectFilesUnderFolder(item);
                            }
                            else {
                                toggleFolderExpansion(item.path);
                            }
                        }, style: { fontWeight: 'bold', display: 'flex', alignItems: 'center' }, children: [_jsx("span", { style: { marginRight: '5px' }, children: isExpanded ? '📂' : '📁' }), item.name] }), isExpanded && (_jsx("ul", { style: { listStyleType: 'none', paddingLeft: '20px' }, children: item.contents.map((childItem) => (_jsx(TreeNode, { item: childItem }, childItem.path))) }))] }));
        }
    };
    // Create tree view
    const createTreeView = (data) => {
        return (_jsx("ul", { style: { listStyleType: 'none', paddingLeft: '20px' }, children: data.map((item) => (_jsx(TreeNode, { item: item }, item.path))) }));
    };
    // Load files and generate JSON
    const loadFilesAsJson = () => __awaiter(void 0, void 0, void 0, function* () {
        const indexedFiles = {};
        for (const [filePath, fileHandle] of selectedFiles) {
            const folderPath = filePath.substring(0, filePath.lastIndexOf('/'));
            const fileName = filePath.substring(filePath.lastIndexOf('/') + 1);
            const file = yield fileHandle.getFile();
            const fileContent = yield file.text();
            if (!indexedFiles[folderPath]) {
                indexedFiles[folderPath] = { file_contents: {} };
            }
            indexedFiles[folderPath]['file_contents'][fileName] = fileContent;
        }
        return indexedFiles;
    });
    // Handle submission of selected files and generate JSON
    const handleCreateAssistant = () => __awaiter(void 0, void 0, void 0, function* () {
        if (!newAssistantName.trim()) {
            alert('Please provide a name for the new assistant.');
            return;
        }
        if (selectedFiles.size === 0) {
            alert('Please select at least one file.');
            return;
        }
        try {
            const jsonData = yield loadFilesAsJson();
            onAssistantCreated(newAssistantName, jsonData);
        }
        catch (error) {
            console.error('Error creating assistant:', error);
            alert('Error creating assistant');
        }
    });
    return (_jsxs("div", { children: [_jsx("h2", { children: "Enter New Assistant Name" }), _jsx("input", { type: "text", placeholder: "Enter new assistant name", value: newAssistantName, onChange: (e) => setNewAssistantName(e.target.value), style: styles.input }), _jsxs("div", { style: styles.buttonGroup, children: [_jsx("button", { onClick: handleFolderSelection, style: styles.button, children: "Choose Folder" }), _jsx("button", { onClick: () => setShowExtensionPopup(true), disabled: Object.keys(extensionsCount).length === 0, style: Object.assign(Object.assign({}, styles.button), (Object.keys(extensionsCount).length === 0 ? styles.disabledButton : {})), children: "Select Extensions" }), _jsx("button", { onClick: handleShowTreeView, disabled: selectedExtensions.length === 0, style: Object.assign(Object.assign({}, styles.button), (selectedExtensions.length === 0 ? styles.disabledButton : {})), children: "Select Files" })] }), showExtensionPopup && (_jsx("div", { style: styles.popup, children: _jsxs("div", { style: styles.popupContent, children: [_jsx("h3", { children: "Select File Extensions" }), _jsx("div", { id: "extensionCheckboxes", style: { textAlign: 'left' }, children: Object.keys(extensionsCount)
                                .sort()
                                .map((ext) => (_jsxs("div", { children: [_jsx("input", { type: "checkbox", id: ext, value: ext }), _jsxs("label", { htmlFor: ext, children: [ext, " (", extensionsCount[ext], ")"] })] }, ext))) }), _jsx("button", { onClick: handleSubmitExtensionSelection, style: styles.button, children: "Submit" }), _jsx("button", { onClick: () => setShowExtensionPopup(false), style: styles.cancelButton, children: "Cancel" })] }) })), showFolderTree && (_jsx("div", { style: styles.popup, children: _jsxs("div", { style: styles.popupContent, children: [_jsx("h3", { children: "Select Files" }), _jsxs("div", { style: styles.buttonGroup, children: [_jsx("button", { onClick: selectAllFiles, style: styles.button, children: "Select All" }), _jsx("button", { onClick: deselectAllFiles, style: styles.button, children: "Deselect All" })] }), _jsx("div", { children: createTreeView(removeEmptyFolders(folderData)) }), _jsxs("div", { style: styles.buttonGroup, children: [_jsx("button", { onClick: handleCreateAssistant, style: styles.createButton, children: "Create Assistant" }), _jsx("button", { onClick: () => setShowFolderTree(false), style: styles.cancelButton, children: "Cancel" })] })] }) })), _jsx("div", { style: styles.buttonGroup, children: _jsx("button", { onClick: onCancel, style: styles.cancelButton, children: "Cancel" }) })] }));
};
// Styles for the component
const styles = {
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
