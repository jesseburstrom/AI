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
import { useState, useEffect } from 'react';
import { getErrorMessage } from '../utils/errors';
import { fetchAssistants, setAssistantOnServer, deleteCurrentThread, createThread, createMessage, createRun, retrieveRunStatus, listAllMessages, deleteAssistant, createAssistant, } from '../services/AssistantManagerServices';
import PromptResponse from './PromptResponse';
import FolderSelector from './FolderSelector';
const AssistantManager = () => {
    const [assistants, setAssistants] = useState([]);
    const [selectedAssistant, setSelectedAssistant] = useState('');
    const [currentAssistant, setCurrentAssistant] = useState('');
    const [userInput, setUserInput] = useState('');
    const [responseOutput, setResponseOutput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [currentThreadID, setCurrentThreadID] = useState('');
    const [showAssistantCreation, setShowAssistantCreation] = useState(false);
    useEffect(() => {
        const initialize = () => __awaiter(void 0, void 0, void 0, function* () {
            try {
                const assistantNames = yield fetchAssistants();
                setAssistants(assistantNames);
            }
            catch (err) { // Assuming err has a message property
                setError(getErrorMessage(err) || 'An unexpected error occurred.');
            }
        });
        initialize();
    }, []);
    const refreshAssistants = () => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const assistantNames = yield fetchAssistants();
            setAssistants(assistantNames);
        }
        catch (err) {
            setError(getErrorMessage(err) || 'Failed to fetch assistants.');
        }
    });
    const handleAssistantCreated = (assistantName, jsonData) => __awaiter(void 0, void 0, void 0, function* () {
        if (!jsonData || !assistantName.trim()) {
            alert('Please provide a name for the new assistant and select the folder data.');
            return;
        }
        try {
            // Call createAssistant from the services
            const response = yield createAssistant(assistantName, jsonData);
            console.log('Assistant created successfully:', response);
            // After assistant creation, refresh the list
            yield refreshAssistants();
            setSelectedAssistant(assistantName);
            setCurrentAssistant(assistantName);
            yield setAssistantOnServer(assistantName);
            const threadID = yield createThread();
            setCurrentThreadID(threadID);
            // Reset state
            setShowAssistantCreation(false);
        }
        catch (error) {
            console.error('Error creating assistant:', error);
            setError('Failed to create assistant: ' + (error.message || 'Unknown error'));
        }
    });
    const handleAssistantChange = (e) => __awaiter(void 0, void 0, void 0, function* () {
        const assistantName = e.target.value;
        if (currentThreadID) {
            yield deleteCurrentThread(currentThreadID); // Pass threadID here
            setCurrentThreadID(''); // Reset the thread ID after deletion
        }
        setSelectedAssistant(assistantName);
        if (assistantName) {
            try {
                yield setAssistantOnServer(assistantName);
                setCurrentAssistant(assistantName);
                const threadID = yield createThread();
                setCurrentThreadID(threadID);
            }
            catch (err) {
                setError(getErrorMessage(err) || 'Failed to change assistant.');
            }
        }
        else {
            setCurrentAssistant('');
        }
    });
    const processInput = () => __awaiter(void 0, void 0, void 0, function* () {
        let input = userInput.trim();
        if (input === '') {
            input = 'describe with code examples the project';
        }
        const systemPrompt = 'You are a great coder and in the json files provided is the structure including file content of a programming project.';
        const fullSystemPrompt = `${systemPrompt}\n\nUser: ${input}`;
        try {
            yield createMessage(input);
            yield createRun(fullSystemPrompt);
            yield checkRunStatus();
        }
        catch (err) {
            setError(getErrorMessage(err) || 'Failed to process input.');
        }
    });
    const checkRunStatus = () => __awaiter(void 0, void 0, void 0, function* () {
        setIsLoading(true); // Set loading to true when starting the check
        try {
            let runStatus = yield retrieveRunStatus();
            if (runStatus.status === 'completed') {
                const allMessages = yield listAllMessages();
                if (allMessages.data.length > 0 &&
                    allMessages.data[0].content.length > 0 &&
                    allMessages.data[0].content[0].text.value) {
                    const assistantResponse = allMessages.data[0].content[0].text.value;
                    setResponseOutput(assistantResponse);
                }
                else {
                    setError('No messages found.');
                }
                setIsLoading(false);
            }
            else if (runStatus.status === 'queued' || runStatus.status === 'in_progress') {
                // Instead of using setTimeout, we will keep polling until we get the final status
                const interval = setInterval(() => __awaiter(void 0, void 0, void 0, function* () {
                    try {
                        const status = yield retrieveRunStatus();
                        if (status.status === 'completed') {
                            clearInterval(interval);
                            const allMessages = yield listAllMessages();
                            if (allMessages.data.length > 0 &&
                                allMessages.data[0].content.length > 0 &&
                                allMessages.data[0].content[0].text.value) {
                                const assistantResponse = allMessages.data[0].content[0].text.value;
                                setResponseOutput(assistantResponse);
                            }
                            else {
                                setError('No messages found.');
                            }
                            setIsLoading(false);
                        }
                    }
                    catch (err) {
                        clearInterval(interval);
                        setError(getErrorMessage(err) || 'Failed to retrieve run status.');
                        setIsLoading(false);
                    }
                }), 1000);
            }
            else {
                setError(`Unknown run status: ${runStatus.status}`);
                setIsLoading(false);
            }
        }
        catch (err) {
            setError(getErrorMessage(err) || 'Failed to check run status.');
            setIsLoading(false);
        }
    });
    const handleDeleteAssistant = () => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const message = yield deleteAssistant();
            alert(message);
            setSelectedAssistant('');
            setCurrentAssistant('');
            yield refreshAssistants();
        }
        catch (err) {
            setError(getErrorMessage(err) || 'Failed to delete assistant.');
        }
    });
    return (_jsxs("div", { style: styles.mainContainer, children: [_jsx("h1", { children: "Assistant Manager" }), _jsx("h2", { children: "Select Assistant" }), _jsxs("select", { onChange: handleAssistantChange, value: selectedAssistant, style: styles.select, children: [_jsx("option", { value: "", children: "Select an Assistant" }), assistants.map((assistant, index) => (_jsx("option", { value: assistant, children: assistant }, index)))] }), _jsxs("p", { children: ["Current Assistant: ", currentAssistant || 'None'] }), error && _jsx("p", { style: { color: 'red' }, children: error }), _jsxs("div", { style: { display: 'flex', gap: '10px', marginBottom: '20px' }, children: [selectedAssistant && (_jsx("button", { onClick: handleDeleteAssistant, style: styles.deleteButton, children: "Delete Assistant" })), _jsx("button", { onClick: () => setShowAssistantCreation(true), style: styles.openButton, children: "Create New Assistant" })] }), showAssistantCreation && (_jsx(FolderSelector, { onAssistantCreated: handleAssistantCreated, onCancel: () => setShowAssistantCreation(false) })), selectedAssistant && (_jsx(PromptResponse, { userInput: userInput, setUserInput: setUserInput, processInput: processInput, isLoading: isLoading, responseOutput: responseOutput }))] }));
};
// Updated styles with TypeScript type annotations
const styles = {
    mainContainer: {
        padding: '20px',
        fontFamily: 'Arial, sans-serif',
        display: 'flex', // Enable Flexbox
        flexDirection: 'column', // Arrange children vertically
        alignItems: 'center', // Center children horizontally
        justifyContent: 'flex-start', // Align children to the top
        minHeight: '100vh', // Ensure the container takes full viewport height
        boxSizing: 'border-box', // Include padding in the element's total width and height
    },
    select: {
        width: '50%', // Increased from 25% to 50%
        padding: '10px',
        borderRadius: '4px',
        border: '1px solid #ccc',
        marginBottom: '10px',
        // Removed margin: '0 auto' as Flexbox handles centering
    },
    openButton: {
        padding: '10px 20px',
        backgroundColor: '#008CBA',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        marginBottom: '20px',
        display: 'inline-block',
    },
    deleteButton: {
        padding: '10px 20px',
        backgroundColor: '#f44336',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        marginBottom: '20px',
        display: 'inline-block',
        marginRight: '10px',
    },
};
export default AssistantManager;
