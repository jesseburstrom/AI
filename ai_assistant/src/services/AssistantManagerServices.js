"use strict";
// src/services/AssistantManagerServices.ts
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
exports.deleteAssistant = exports.createAssistant = exports.listAllMessages = exports.retrieveRunStatus = exports.createRun = exports.createMessage = exports.createThread = exports.deleteCurrentThread = exports.setAssistantOnServer = exports.fetchAssistants = void 0;
const axios_1 = __importDefault(require("axios"));
// Optionally, set a base URL if all requests share the same base
const api = axios_1.default.create({
    baseURL: 'http://localhost:3000',
    // You can add headers or other configurations here
});
// Fetch list of assistants
const fetchAssistants = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const response = yield api.get('/assistants');
        return response.data.names;
    }
    catch (err) {
        if (axios_1.default.isAxiosError(err) && err.message) {
            throw new Error('Failed to fetch assistants: ' + err.message);
        }
        throw new Error('Failed to fetch assistants: Unknown error');
    }
});
exports.fetchAssistants = fetchAssistants;
// Set assistant on server
const setAssistantOnServer = (assistantName) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const response = yield api.post('/set-assistant-by-name', { name: assistantName });
        return response.data.message;
    }
    catch (err) {
        if (axios_1.default.isAxiosError(err) && err.message) {
            throw new Error('Failed to set assistant: ' + err.message);
        }
        throw new Error('Failed to set assistant: Unknown error');
    }
});
exports.setAssistantOnServer = setAssistantOnServer;
// Delete the current thread
const deleteCurrentThread = (threadID) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const response = yield api.delete('/delete-thread', { data: { threadID } });
        return response.data.message;
    }
    catch (err) {
        if (axios_1.default.isAxiosError(err) && err.message) {
            throw new Error('Failed to delete thread: ' + err.message);
        }
        throw new Error('Failed to delete thread: Unknown error');
    }
});
exports.deleteCurrentThread = deleteCurrentThread;
// Create a new thread
const createThread = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const response = yield api.post('/create-thread');
        return response.data.threadID;
    }
    catch (err) {
        if (axios_1.default.isAxiosError(err) && err.message) {
            throw new Error('Failed to create thread: ' + err.message);
        }
        throw new Error('Failed to create thread: Unknown error');
    }
});
exports.createThread = createThread;
// Create a new message
const createMessage = (input) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const response = yield api.post('/create-message', {
            role: 'user',
            content: input
        });
        return response.data;
    }
    catch (err) {
        if (axios_1.default.isAxiosError(err) && err.message) {
            throw new Error('Failed to create message: ' + err.message);
        }
        throw new Error('Failed to create message: Unknown error');
    }
});
exports.createMessage = createMessage;
// Create a run
const createRun = (fullSystemPrompt) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const response = yield api.post('/create-run', {
            instructions: fullSystemPrompt
        });
        return response.data.threadID;
    }
    catch (err) {
        if (axios_1.default.isAxiosError(err) && err.message) {
            throw new Error('Failed to create run: ' + err.message);
        }
        throw new Error('Failed to create run: Unknown error');
    }
});
exports.createRun = createRun;
// Retrieve run status
const retrieveRunStatus = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const response = yield api.get('/retrieve-run');
        return response.data;
    }
    catch (err) {
        if (axios_1.default.isAxiosError(err) && err.message) {
            throw new Error('Failed to retrieve run status: ' + err.message);
        }
        throw new Error('Failed to retrieve run status: Unknown error');
    }
});
exports.retrieveRunStatus = retrieveRunStatus;
// List all messages
const listAllMessages = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const response = yield api.get('/list-messages', {
            params: {
                limit: 100,
                order: 'desc'
            }
        });
        return response.data;
    }
    catch (err) {
        if (axios_1.default.isAxiosError(err) && err.message) {
            throw new Error('Failed to list messages: ' + err.message);
        }
        throw new Error('Failed to list messages: Unknown error');
    }
});
exports.listAllMessages = listAllMessages;
// Create assistant
const createAssistant = (name, jsonData) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const response = yield api.post('/create-assistant', {
            name,
            jsonData: JSON.stringify(jsonData)
        });
        return response.data;
    }
    catch (err) {
        if (axios_1.default.isAxiosError(err) && err.message) {
            throw new Error('Failed to create assistant: ' + err.message);
        }
        throw new Error('Failed to create assistant: Unknown error');
    }
});
exports.createAssistant = createAssistant;
// Delete assistant and related objects
const deleteAssistant = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const response = yield api.delete('/delete-all-objects');
        return response.data.message;
    }
    catch (err) {
        if (axios_1.default.isAxiosError(err) && err.message) {
            throw new Error('Failed to delete assistant: ' + err.message);
        }
        throw new Error('Failed to delete assistant: Unknown error');
    }
});
exports.deleteAssistant = deleteAssistant;
