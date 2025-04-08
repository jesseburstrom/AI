"use strict";
// import React, { useState } from 'react';
// import { createAssistant } from '../services/AssistantManagerServices';
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
// interface AssistantCreationProps {
//     onClose: () => void;
//     onAssistantCreated: (assistantName: string) => void;
// }
// const AssistantCreation: React.FC<AssistantCreationProps> = ({ onClose, onAssistantCreated }) => {
//     const [newAssistantName, setNewAssistantName] = useState<string>('');
//     const [jsonData, setJsonData] = useState<any>(null); // Replace 'any' with the actual type of JSON data
//     const [error, setError] = useState<string | null>(null);
//     const [isLoading, setIsLoading] = useState<boolean>(false);
//     // Handle messages from the iframe (File Picker)
//     const handleMessage = (event: MessageEvent) => {
//         // Add security checks here, e.g., event.origin
//         if (typeof event.data === 'object' && event.data !== null) {
//             console.log('Received JSON data from iframe:', event.data);
//             setJsonData(event.data); // Store the JSON data
//         }
//     };
//     // Add event listener for messages
//     React.useEffect(() => {
//         window.addEventListener('message', handleMessage);
//         return () => {
//             window.removeEventListener('message', handleMessage);
//         };
//     }, []);
//     const handleCreateAssistant = async () => {
//         if (!jsonData) {
//             alert('Please generate the JSON data using the file picker first.');
//             return;
//         }
//         if (!newAssistantName.trim()) {
//             alert('Please enter a name for the new assistant.');
//             return;
//         }
//         setIsLoading(true);
//         setError(null);
//         try {
//             await createAssistant(newAssistantName, jsonData);
//             alert('Assistant created successfully');
//             // Notify parent component of the new assistant's name
//             if (onAssistantCreated) {
//                 onAssistantCreated(newAssistantName); // Pass new assistant name to parent
//             }
//             // Reset fields
//             setNewAssistantName('');
//             setJsonData(null);
//             // Close the creation component
//             if (onClose) {
//                 onClose();
//             }
//         } catch (err) {
//             console.error('Error creating assistant:', err);
//             if (err instanceof Error) {
//                 setError('Error creating assistant: ' + err.message);
//             } else {
//                 setError('Error creating assistant');
//             }
//         } finally {
//             setIsLoading(false);
//         }
//     };
//     return (
//         <div style={styles.container}>
//             <h2>File Picker</h2>
//             <iframe
//                 src="/filepicker.html" // Replace with the actual path to your HTML file
//                 width="100%"
//                 height="300px"
//                 title="File Picker"
//                 style={styles.iframe}
//             ></iframe>
//             <h2>Enter New Assistant Name</h2>
//             <input
//                 type="text"
//                 placeholder="Enter new assistant name"
//                 value={newAssistantName}
//                 onChange={(e) => setNewAssistantName(e.target.value)}
//                 style={styles.input}
//             />
//             {error && <p style={styles.error}>{error}</p>}
//             <div style={styles.buttonContainer}>
//                 <button onClick={handleCreateAssistant} disabled={isLoading} style={styles.button}>
//                     {isLoading ? 'Creating...' : 'Create Assistant'}
//                 </button>
//                 <button onClick={onClose} style={styles.cancelButton}>
//                     Cancel
//                 </button>
//             </div>
//         </div>
//     );
// };
// // Simple inline styles for demonstration
// const styles = {
//     container: {
//         backgroundColor: '#f9f9f9',
//         padding: '20px',
//         borderRadius: '8px',
//         boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
//         maxWidth: '600px',
//         margin: '0 auto',
//     },
//     iframe: {
//         border: '1px solid #ccc',
//         borderRadius: '4px',
//     },
//     input: {
//         width: '100%',
//         padding: '10px',
//         marginBottom: '10px',
//         borderRadius: '4px',
//         border: '1px solid #ccc',
//     },
//     buttonContainer: {
//         display: 'flex',
//         justifyContent: 'flex-end',
//         gap: '10px',
//     },
//     button: {
//         padding: '10px 20px',
//         backgroundColor: '#4CAF50',
//         color: 'white',
//         border: 'none',
//         borderRadius: '4px',
//         cursor: 'pointer',
//     },
//     cancelButton: {
//         padding: '10px 20px',
//         backgroundColor: '#f44336',
//         color: 'white',
//         border: 'none',
//         borderRadius: '4px',
//         cursor: 'pointer',
//     },
//     error: {
//         color: 'red',
//         marginBottom: '10px',
//     },
// };
// export default AssistantCreation;
const react_1 = __importStar(require("react"));
const AssistantManagerServices_1 = require("../services/AssistantManagerServices");
const AssistantCreation = ({ onClose, onAssistantCreated }) => {
    const [newAssistantName, setNewAssistantName] = (0, react_1.useState)('');
    const [jsonData, setJsonData] = (0, react_1.useState)(null); // Replace 'any' with the actual type of JSON data
    const [error, setError] = (0, react_1.useState)(null);
    const [isLoading, setIsLoading] = (0, react_1.useState)(false);
    // Handle messages from the iframe (File Picker)
    const handleMessage = (event) => {
        // Add security checks here, e.g., event.origin
        if (typeof event.data === 'object' && event.data !== null) {
            console.log('Received JSON data from iframe:', event.data);
            setJsonData(event.data); // Store the JSON data
        }
    };
    // Add event listener for messages
    react_1.default.useEffect(() => {
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
            yield (0, AssistantManagerServices_1.createAssistant)(newAssistantName, jsonData);
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
                setError('Error creating assistant: ' + err.message);
            }
            else {
                setError('Error creating assistant');
            }
        }
        finally {
            setIsLoading(false);
        }
    });
    return (react_1.default.createElement("div", { style: styles.container },
        react_1.default.createElement("h2", null, "File Picker"),
        react_1.default.createElement("iframe", { src: "/filepicker.html" // Replace with the actual path to your HTML file
            , width: "100%", height: "300px", title: "File Picker", style: styles.iframe }),
        react_1.default.createElement("h2", null, "Enter New Assistant Name"),
        react_1.default.createElement("input", { type: "text", placeholder: "Enter new assistant name", value: newAssistantName, onChange: (e) => setNewAssistantName(e.target.value), style: styles.input }),
        error && react_1.default.createElement("p", { style: styles.error }, error),
        react_1.default.createElement("div", { style: styles.buttonContainer },
            react_1.default.createElement("button", { onClick: handleCreateAssistant, disabled: isLoading, style: styles.button }, isLoading ? 'Creating...' : 'Create Assistant'),
            react_1.default.createElement("button", { onClick: onClose, style: styles.cancelButton }, "Cancel"))));
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
exports.default = AssistantCreation;
