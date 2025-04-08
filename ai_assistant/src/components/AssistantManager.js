"use strict";
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importStar(require("react"));
const AssistantManagerServices_1 = require("../services/AssistantManagerServices");
const PromptResponse_1 = __importDefault(require("./PromptResponse"));
const FolderSelector_1 = __importDefault(require("./FolderSelector"));
const AssistantManager = () => {
    const [assistants, setAssistants] = (0, react_1.useState)([]);
    const [selectedAssistant, setSelectedAssistant] = (0, react_1.useState)('');
    const [currentAssistant, setCurrentAssistant] = (0, react_1.useState)('');
    const [userInput, setUserInput] = (0, react_1.useState)('');
    const [responseOutput, setResponseOutput] = (0, react_1.useState)('');
    const [isLoading, setIsLoading] = (0, react_1.useState)(false);
    const [error, setError] = (0, react_1.useState)('');
    const [currentThreadID, setCurrentThreadID] = (0, react_1.useState)('');
    const [showAssistantCreation, setShowAssistantCreation] = (0, react_1.useState)(false);
    (0, react_1.useEffect)(() => {
        const initialize = () => __awaiter(void 0, void 0, void 0, function* () {
            try {
                const assistantNames = yield (0, AssistantManagerServices_1.fetchAssistants)();
                setAssistants(assistantNames);
            }
            catch (err) { // Assuming err has a message property
                setError(err.message || 'An unexpected error occurred.');
            }
        });
        initialize();
    }, []);
    const refreshAssistants = () => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const assistantNames = yield (0, AssistantManagerServices_1.fetchAssistants)();
            setAssistants(assistantNames);
        }
        catch (err) {
            setError(err.message || 'Failed to fetch assistants.');
        }
    });
    const handleAssistantCreated = (assistantName, jsonData) => __awaiter(void 0, void 0, void 0, function* () {
        if (!jsonData || !assistantName.trim()) {
            alert('Please provide a name for the new assistant and select the folder data.');
            return;
        }
        try {
            // Call createAssistant from the services
            const response = yield (0, AssistantManagerServices_1.createAssistant)(assistantName, jsonData);
            console.log('Assistant created successfully:', response);
            // After assistant creation, refresh the list
            yield refreshAssistants();
            setSelectedAssistant(assistantName);
            setCurrentAssistant(assistantName);
            yield (0, AssistantManagerServices_1.setAssistantOnServer)(assistantName);
            const threadID = yield (0, AssistantManagerServices_1.createThread)();
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
            yield (0, AssistantManagerServices_1.deleteCurrentThread)(currentThreadID); // Pass threadID here
            setCurrentThreadID(''); // Reset the thread ID after deletion
        }
        setSelectedAssistant(assistantName);
        if (assistantName) {
            try {
                yield (0, AssistantManagerServices_1.setAssistantOnServer)(assistantName);
                setCurrentAssistant(assistantName);
                const threadID = yield (0, AssistantManagerServices_1.createThread)();
                setCurrentThreadID(threadID);
            }
            catch (err) {
                setError(err.message || 'Failed to change assistant.');
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
            yield (0, AssistantManagerServices_1.createMessage)(input);
            yield (0, AssistantManagerServices_1.createRun)(fullSystemPrompt);
            yield checkRunStatus();
        }
        catch (err) {
            setError(err.message || 'Failed to process input.');
        }
    });
    const checkRunStatus = () => __awaiter(void 0, void 0, void 0, function* () {
        setIsLoading(true); // Set loading to true when starting the check
        try {
            let runStatus = yield (0, AssistantManagerServices_1.retrieveRunStatus)();
            if (runStatus.status === 'completed') {
                const allMessages = yield (0, AssistantManagerServices_1.listAllMessages)();
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
                        const status = yield (0, AssistantManagerServices_1.retrieveRunStatus)();
                        if (status.status === 'completed') {
                            clearInterval(interval);
                            const allMessages = yield (0, AssistantManagerServices_1.listAllMessages)();
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
                        setError(err.message || 'Failed to retrieve run status.');
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
            setError(err.message || 'Failed to check run status.');
            setIsLoading(false);
        }
    });
    const handleDeleteAssistant = () => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const message = yield (0, AssistantManagerServices_1.deleteAssistant)();
            alert(message);
            setSelectedAssistant('');
            setCurrentAssistant('');
            yield refreshAssistants();
        }
        catch (err) {
            setError(err.message || 'Failed to delete assistant.');
        }
    });
    return (react_1.default.createElement("div", { style: styles.mainContainer },
        react_1.default.createElement("h1", null, "Assistant Manager"),
        react_1.default.createElement("h2", null, "Select Assistant"),
        react_1.default.createElement("select", { onChange: handleAssistantChange, value: selectedAssistant, style: styles.select },
            react_1.default.createElement("option", { value: "" }, "Select an Assistant"),
            assistants.map((assistant, index) => (react_1.default.createElement("option", { key: index, value: assistant }, assistant)))),
        react_1.default.createElement("p", null,
            "Current Assistant: ",
            currentAssistant || 'None'),
        error && react_1.default.createElement("p", { style: { color: 'red' } }, error),
        react_1.default.createElement("div", { style: { display: 'flex', gap: '10px', marginBottom: '20px' } },
            selectedAssistant && (react_1.default.createElement("button", { onClick: handleDeleteAssistant, style: styles.deleteButton }, "Delete Assistant")),
            react_1.default.createElement("button", { onClick: () => setShowAssistantCreation(true), style: styles.openButton }, "Create New Assistant")),
        showAssistantCreation && (react_1.default.createElement(FolderSelector_1.default, { onAssistantCreated: handleAssistantCreated, onCancel: () => setShowAssistantCreation(false) })),
        selectedAssistant && (react_1.default.createElement(PromptResponse_1.default, { userInput: userInput, setUserInput: setUserInput, processInput: processInput, isLoading: isLoading, responseOutput: responseOutput }))));
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
exports.default = AssistantManager;
