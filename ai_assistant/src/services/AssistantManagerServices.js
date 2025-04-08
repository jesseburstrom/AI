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
import axios from 'axios';
import { getErrorMessage } from '../utils/errors';
// Optionally, set a base URL if all requests share the same base
const api = axios.create({
    //baseURL: 'http://localhost:8000',
    baseURL: '/assistant',
    // You can add headers or other configurations here
});
// Fetch list of assistants
export const fetchAssistants = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const response = yield api.get('/assistants');
        return response.data.names;
    }
    catch (err) {
        if (axios.isAxiosError(err) && getErrorMessage(err)) {
            throw new Error('Failed to fetch assistants: ' + getErrorMessage(err));
        }
        throw new Error('Failed to fetch assistants: Unknown error');
    }
});
// Set assistant on server
export const setAssistantOnServer = (assistantName) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const response = yield api.post('/set-assistant-by-name', { name: assistantName });
        return response.data.message;
    }
    catch (err) {
        if (axios.isAxiosError(err) && getErrorMessage(err)) {
            throw new Error('Failed to set assistant: ' + getErrorMessage(err));
        }
        throw new Error('Failed to set assistant: Unknown error');
    }
});
// Delete the current thread
export const deleteCurrentThread = (threadID) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const response = yield api.delete('/delete-thread', { data: { threadID } });
        return response.data.message;
    }
    catch (err) {
        if (axios.isAxiosError(err) && getErrorMessage(err)) {
            throw new Error('Failed to delete thread: ' + getErrorMessage(err));
        }
        throw new Error('Failed to delete thread: Unknown error');
    }
});
// Create a new thread
export const createThread = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const response = yield api.post('/create-thread');
        return response.data.threadID;
    }
    catch (err) {
        if (axios.isAxiosError(err) && getErrorMessage(err)) {
            throw new Error('Failed to create thread: ' + getErrorMessage(err));
        }
        throw new Error('Failed to create thread: Unknown error');
    }
});
// Create a new message
export const createMessage = (input) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const response = yield api.post('/create-message', {
            role: 'user',
            content: input
        });
        return response.data;
    }
    catch (err) {
        if (axios.isAxiosError(err) && getErrorMessage(err)) {
            throw new Error('Failed to create message: ' + getErrorMessage(err));
        }
        throw new Error('Failed to create message: Unknown error');
    }
});
// Create a run
export const createRun = (fullSystemPrompt) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const response = yield api.post('/create-run', {
            instructions: fullSystemPrompt
        });
        return response.data.threadID;
    }
    catch (err) {
        if (axios.isAxiosError(err) && getErrorMessage(err)) {
            throw new Error('Failed to create run: ' + getErrorMessage(err));
        }
        throw new Error('Failed to create run: Unknown error');
    }
});
// Retrieve run status
export const retrieveRunStatus = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const response = yield api.get('/retrieve-run');
        return response.data;
    }
    catch (err) {
        if (axios.isAxiosError(err) && getErrorMessage(err)) {
            throw new Error('Failed to retrieve run status: ' + getErrorMessage(err));
        }
        throw new Error('Failed to retrieve run status: Unknown error');
    }
});
// List all messages
export const listAllMessages = () => __awaiter(void 0, void 0, void 0, function* () {
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
        if (axios.isAxiosError(err) && getErrorMessage(err)) {
            throw new Error('Failed to list messages: ' + getErrorMessage(err));
        }
        throw new Error('Failed to list messages: Unknown error');
    }
});
// Create assistant
export const createAssistant = (name, jsonData) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const response = yield api.post('/create-assistant', {
            name,
            jsonData: JSON.stringify(jsonData)
        });
        return response.data;
    }
    catch (err) {
        if (axios.isAxiosError(err) && getErrorMessage(err)) {
            throw new Error('Failed to create assistant: ' + getErrorMessage(err));
        }
        throw new Error('Failed to create assistant: Unknown error');
    }
});
// Delete assistant and related objects
export const deleteAssistant = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const response = yield api.delete('/delete-all-objects');
        return response.data.message;
    }
    catch (err) {
        if (axios.isAxiosError(err) && getErrorMessage(err)) {
            throw new Error('Failed to delete assistant: ' + getErrorMessage(err));
        }
        throw new Error('Failed to delete assistant: Unknown error');
    }
});
