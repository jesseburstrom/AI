var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React, { useState } from 'react';
import { createAssistant } from '../services/AssistantManagerServices';
import { getErrorMessage } from '../utils/errors';
const AssistantCreation = ({ onClose, onAssistantCreated }) => {
    const [newAssistantName, setNewAssistantName] = useState('');
    const [jsonData, setJsonData] = useState(null); // Replace 'any' with the actual type of JSON data
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    // Handle messages from the iframe (File Picker)
    const handleMessage = (event) => {
        // Add security checks here, e.g., event.origin
        if (typeof event.data === 'object' && event.data !== null) {
            console.log('Received JSON data from iframe:', event.data);
            setJsonData(event.data); // Store the JSON data
        }
    };
    // Add event listener for messages
    React.useEffect(() => {
        window.addEventListener('message', handleMessage);
        return () => {
            window.removeEventListener('message', handleMessage);
        };
    }, []);
    // Helper function to save JSON data locally as a file
    const saveFileLocally = (data, fileName) => {
        const jsonStr = JSON.stringify(data, null, 2); // Convert JSON data to a pretty-printed string
        const blob = new Blob([jsonStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };
    const handleCreateAssistant = () => __awaiter(void 0, void 0, void 0, function* () {
        if (!jsonData) {
            alert('Please generate the JSON data using the file picker first.');
            return;
        }
        if (!newAssistantName.trim()) {
            alert('Please enter a name for the new assistant.');
            return;
        }
        setIsLoading(true);
        setError(null);
        try {
            yield createAssistant(newAssistantName, jsonData);
            alert('Assistant created successfully');
            // Save the JSON data locally as a file named after the assistant with a .json extension
            saveFileLocally(jsonData, `${newAssistantName}.json`);
            // Notify parent component of the new assistant's name
            if (onAssistantCreated) {
                onAssistantCreated(newAssistantName);
            }
            // Reset fields
            setNewAssistantName('');
            setJsonData(null);
            // Close the creation component
            if (onClose) {
                onClose();
            }
        }
        catch (err) {
            console.error('Error creating assistant:', err);
            if (err instanceof Error) {
                setError('Error creating assistant: ' + getErrorMessage(err));
            }
            else {
                setError('Error creating assistant');
            }
        }
        finally {
            setIsLoading(false);
        }
    });
    return (_jsxs("div", { style: styles.container, children: [_jsx("h2", { children: "File Picker" }), _jsx("iframe", { src: "/filepicker.html" // Replace with the actual path to your HTML file
                , width: "100%", height: "300px", title: "File Picker", style: styles.iframe }), _jsx("h2", { children: "Enter New Assistant Name" }), _jsx("input", { type: "text", placeholder: "Enter new assistant name", value: newAssistantName, onChange: (e) => setNewAssistantName(e.target.value), style: styles.input }), error && _jsx("p", { style: styles.error, children: error }), _jsxs("div", { style: styles.buttonContainer, children: [_jsx("button", { onClick: handleCreateAssistant, disabled: isLoading, style: styles.button, children: isLoading ? 'Creating...' : 'Create Assistant' }), _jsx("button", { onClick: onClose, style: styles.cancelButton, children: "Cancel" })] })] }));
};
// Simple inline styles for demonstration
const styles = {
    container: {
        backgroundColor: '#f9f9f9',
        padding: '20px',
        borderRadius: '8px',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
        maxWidth: '600px',
        margin: '0 auto',
    },
    iframe: {
        border: '1px solid #ccc',
        borderRadius: '4px',
    },
    input: {
        width: '100%',
        padding: '10px',
        marginBottom: '10px',
        borderRadius: '4px',
        border: '1px solid #ccc',
    },
    buttonContainer: {
        display: 'flex',
        justifyContent: 'flex-end',
        gap: '10px',
    },
    button: {
        padding: '10px 20px',
        backgroundColor: '#4CAF50',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
    },
    cancelButton: {
        padding: '10px 20px',
        backgroundColor: '#f44336',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
    },
    error: {
        color: 'red',
        marginBottom: '10px',
    },
};
export default AssistantCreation;
