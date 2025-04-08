import React, { useState, useEffect, FC } from 'react';
import {
    fetchAssistants,
    setAssistantOnServer,
    deleteCurrentThread,
    createThread,
    createMessage,
    createRun,
    retrieveRunStatus,
    listAllMessages,
    deleteAssistant,
    createAssistant,
} from '../services/AssistantManagerServices';
import PromptResponse from './PromptResponse';
import FolderSelector from './FolderSelector';

// Define interfaces for the expected data structures
interface RunStatus {
    status: 'completed' | 'queued' | 'in_progress' | string;
}

interface MessageContent {
    text: {
        value: string;
    };
}

interface MessageData {
    content: MessageContent[];
}

interface AllMessages {
    data: MessageData[];
}

// Define the type for FolderSelector's onAssistantCreated prop
interface FolderSelectorProps {
    onAssistantCreated: (assistantName: string, jsonData: any) => Promise<void>;
    onCancel: () => void;
}

// Define the type for PromptResponse's props
interface PromptResponseProps {
    userInput: string;
    setUserInput: React.Dispatch<React.SetStateAction<string>>;
    processInput: () => Promise<void>;
    isLoading: boolean;
    responseOutput: string;
}

const AssistantManager: FC = () => {
    const [assistants, setAssistants] = useState<string[]>([]);
    const [selectedAssistant, setSelectedAssistant] = useState<string>('');
    const [currentAssistant, setCurrentAssistant] = useState<string>('');
    const [userInput, setUserInput] = useState<string>('');
    const [responseOutput, setResponseOutput] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>('');
    const [currentThreadID, setCurrentThreadID] = useState<string>('');
    const [showAssistantCreation, setShowAssistantCreation] = useState<boolean>(false);

    useEffect(() => {
        const initialize = async () => {
            try {
                const assistantNames: string[] = await fetchAssistants();
                setAssistants(assistantNames);
            } catch (err: any) { // Assuming err has a message property
                setError(err.message || 'An unexpected error occurred.');
            }
        };

        initialize();
    }, []);

    const refreshAssistants = async () => {
        try {
            const assistantNames: string[] = await fetchAssistants();
            setAssistants(assistantNames);
        } catch (err: any) {
            setError(err.message || 'Failed to fetch assistants.');
        }
    };

    const handleAssistantCreated = async (assistantName: string, jsonData: any): Promise<void> => {
        if (!jsonData || !assistantName.trim()) {
            alert('Please provide a name for the new assistant and select the folder data.');
            return;
        }

        try {
            // Call createAssistant from the services
            const response = await createAssistant(assistantName, jsonData);
            console.log('Assistant created successfully:', response);

            // After assistant creation, refresh the list
            await refreshAssistants();
            setSelectedAssistant(assistantName);
            setCurrentAssistant(assistantName);

            await setAssistantOnServer(assistantName);
            const threadID: string = await createThread();
            setCurrentThreadID(threadID);

            // Reset state
            setShowAssistantCreation(false);
        } catch (error: any) {
            console.error('Error creating assistant:', error);
            setError('Failed to create assistant: ' + (error.message || 'Unknown error'));
        }
    };

    const handleAssistantChange = async (e: React.ChangeEvent<HTMLSelectElement>): Promise<void> => {
        const assistantName = e.target.value;
    
        if (currentThreadID) {
            await deleteCurrentThread(currentThreadID); // Pass threadID here
            setCurrentThreadID(''); // Reset the thread ID after deletion
        }
    
        setSelectedAssistant(assistantName);
        if (assistantName) {
            try {
                await setAssistantOnServer(assistantName);
                setCurrentAssistant(assistantName);
    
                const threadID: string = await createThread();
                setCurrentThreadID(threadID);
            } catch (err: any) {
                setError(err.message || 'Failed to change assistant.');
            }
        } else {
            setCurrentAssistant('');
        }
    };
    

    const processInput = async (): Promise<void> => {
        let input = userInput.trim();
        if (input === '') {
            input = 'describe with code examples the project';
        }

        const systemPrompt =
            'You are a great coder and in the json files provided is the structure including file content of a programming project.';
        const fullSystemPrompt = `${systemPrompt}\n\nUser: ${input}`;

        try {
            await createMessage(input);
            await createRun(fullSystemPrompt);
            await checkRunStatus();
        } catch (err: any) {
            setError(err.message || 'Failed to process input.');
        }
    };

    const checkRunStatus = async (): Promise<void> => {
        setIsLoading(true); // Set loading to true when starting the check
        try {
            let runStatus: RunStatus = await retrieveRunStatus();

            if (runStatus.status === 'completed') {
                const allMessages: AllMessages = await listAllMessages();
                if (
                    allMessages.data.length > 0 &&
                    allMessages.data[0].content.length > 0 &&
                    allMessages.data[0].content[0].text.value
                ) {
                    const assistantResponse: string = allMessages.data[0].content[0].text.value;
                    setResponseOutput(assistantResponse);
                } else {
                    setError('No messages found.');
                }
                setIsLoading(false);
            } else if (runStatus.status === 'queued' || runStatus.status === 'in_progress') {
                // Instead of using setTimeout, we will keep polling until we get the final status
                const interval = setInterval(async () => {
                    try {
                        const status: RunStatus = await retrieveRunStatus();
                        if (status.status === 'completed') {
                            clearInterval(interval);
                            const allMessages: AllMessages = await listAllMessages();
                            if (
                                allMessages.data.length > 0 &&
                                allMessages.data[0].content.length > 0 &&
                                allMessages.data[0].content[0].text.value
                            ) {
                                const assistantResponse: string = allMessages.data[0].content[0].text.value;
                                setResponseOutput(assistantResponse);
                            } else {
                                setError('No messages found.');
                            }
                            setIsLoading(false);
                        }
                    } catch (err: any) {
                        clearInterval(interval);
                        setError(err.message || 'Failed to retrieve run status.');
                        setIsLoading(false);
                    }
                }, 1000);
            } else {
                setError(`Unknown run status: ${runStatus.status}`);
                setIsLoading(false);
            }
        } catch (err: any) {
            setError(err.message || 'Failed to check run status.');
            setIsLoading(false);
        }
    };

    const handleDeleteAssistant = async (): Promise<void> => {
        try {
            const message: string = await deleteAssistant();
            alert(message);
            setSelectedAssistant('');
            setCurrentAssistant('');
            await refreshAssistants();
        } catch (err: any) {
            setError(err.message || 'Failed to delete assistant.');
        }
    };

    return (
        <div style={styles.mainContainer}>
            <h1>Assistant Manager</h1>

            <h2>Select Assistant</h2>
            <select onChange={handleAssistantChange} value={selectedAssistant} style={styles.select}>
                <option value="">Select an Assistant</option>
                {assistants.map((assistant, index) => (
                    <option key={index} value={assistant}>
                        {assistant}
                    </option>
                ))}
            </select>

            <p>Current Assistant: {currentAssistant || 'None'}</p>

            {error && <p style={{ color: 'red' }}>{error}</p>}

            <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                {selectedAssistant && (
                    <button onClick={handleDeleteAssistant} style={styles.deleteButton}>
                        Delete Assistant
                    </button>
                )}

                <button onClick={() => setShowAssistantCreation(true)} style={styles.openButton}>
                    Create New Assistant
                </button>
            </div>

            {showAssistantCreation && (
                <FolderSelector
                    onAssistantCreated={handleAssistantCreated}
                    onCancel={() => setShowAssistantCreation(false)}
                />
            )}

            {/* Conditionally render the PromptResponse component only if an assistant is selected */}
            {selectedAssistant && (
                <PromptResponse
                    userInput={userInput}
                    setUserInput={setUserInput}
                    processInput={processInput}
                    isLoading={isLoading}
                    responseOutput={responseOutput}
                />
            )}
        </div>
    );
};

// Updated styles with TypeScript type annotations
const styles: { [key: string]: React.CSSProperties } = {
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
