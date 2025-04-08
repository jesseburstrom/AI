// src/services/AssistantManagerServices.ts

import axios, { AxiosInstance, AxiosError } from 'axios';
import { getErrorMessage } from '../utils/errors'; 
// Define interfaces for response data

// Fetch Assistants
interface FetchAssistantsResponse {
    names: string[];
}

// Set Assistant on Server
interface SetAssistantOnServerResponse {
    message: string;
}

// Delete Current Thread
interface DeleteCurrentThreadResponse {
    message: string;
}

// Create Thread
interface CreateThreadResponse {
    threadID: string;
}

// Create Message
interface CreateMessageResponse {
    id: string;
    role: string;
    content: string;
    // Add other fields as needed
}

// Create Run
interface CreateRunResponse {
    threadID: string;
}

// Run Status
interface RunStatus {
    status: 'completed' | 'queued' | 'in_progress' | string;
}

// List All Messages
interface ListAllMessagesResponse {
    data: Array<{
        content: Array<{
            text: {
                value: string;
            };
        }>;
    }>;
}

// Create Assistant
interface CreateAssistantResponse {
    // Define based on actual response
    id: string;
    name: string;
    // Add other fields as necessary
}

// Delete Assistant
interface DeleteAssistantResponse {
    message: string;
}

// Optionally, set a base URL if all requests share the same base
const api: AxiosInstance = axios.create({
    baseURL: 'http://localhost:3000',
    // You can add headers or other configurations here
});

// Fetch list of assistants
export const fetchAssistants = async (): Promise<string[]> => {
    try {
        const response = await api.get<FetchAssistantsResponse>('/assistants');
        return response.data.names;
    } catch (err: unknown) {
        if (axios.isAxiosError(err) && getErrorMessage(err)) {
            throw new Error('Failed to fetch assistants: ' + getErrorMessage(err));
        }
        throw new Error('Failed to fetch assistants: Unknown error');
    }
};

// Set assistant on server
export const setAssistantOnServer = async (assistantName: string): Promise<string> => {
    try {
        const response = await api.post<SetAssistantOnServerResponse>('/set-assistant-by-name', { name: assistantName });
        return response.data.message;
    } catch (err: unknown) {
        if (axios.isAxiosError(err) && getErrorMessage(err)) {
            throw new Error('Failed to set assistant: ' + getErrorMessage(err));
        }
        throw new Error('Failed to set assistant: Unknown error');
    }
};

// Delete the current thread
export const deleteCurrentThread = async (threadID: string): Promise<string> => {
    try {
        const response = await api.delete<DeleteCurrentThreadResponse>('/delete-thread', { data: { threadID } });
        return response.data.message;
    } catch (err: unknown) {
        if (axios.isAxiosError(err) && getErrorMessage(err)) {
            throw new Error('Failed to delete thread: ' + getErrorMessage(err));
        }
        throw new Error('Failed to delete thread: Unknown error');
    }
};

// Create a new thread
export const createThread = async (): Promise<string> => {
    try {
        const response = await api.post<CreateThreadResponse>('/create-thread');
        return response.data.threadID;
    } catch (err: unknown) {
        if (axios.isAxiosError(err) && getErrorMessage(err)) {
            throw new Error('Failed to create thread: ' + getErrorMessage(err));
        }
        throw new Error('Failed to create thread: Unknown error');
    }
};

// Create a new message
export const createMessage = async (input: string): Promise<CreateMessageResponse> => {
    try {
        const response = await api.post<CreateMessageResponse>('/create-message', {
            role: 'user',
            content: input
        });
        return response.data;
    } catch (err: unknown) {
        if (axios.isAxiosError(err) && getErrorMessage(err)) {
            throw new Error('Failed to create message: ' + getErrorMessage(err));
        }
        throw new Error('Failed to create message: Unknown error');
    }
};

// Create a run
export const createRun = async (fullSystemPrompt: string): Promise<string> => {
    try {
        const response = await api.post<CreateRunResponse>('/create-run', {
            instructions: fullSystemPrompt
        });
        return response.data.threadID;
    } catch (err: unknown) {
        if (axios.isAxiosError(err) && getErrorMessage(err)) {
            throw new Error('Failed to create run: ' + getErrorMessage(err));
        }
        throw new Error('Failed to create run: Unknown error');
    }
};

// Retrieve run status
export const retrieveRunStatus = async (): Promise<RunStatus> => {
    try {
        const response = await api.get<RunStatus>('/retrieve-run');
        return response.data;
    } catch (err: unknown) {
        if (axios.isAxiosError(err) && getErrorMessage(err)) {
            throw new Error('Failed to retrieve run status: ' + getErrorMessage(err));
        }
        throw new Error('Failed to retrieve run status: Unknown error');
    }
};

// List all messages
export const listAllMessages = async (): Promise<ListAllMessagesResponse> => {
    try {
        const response = await api.get<ListAllMessagesResponse>('/list-messages', {
            params: {
                limit: 100,
                order: 'desc'
            }
        });
        return response.data;
    } catch (err: unknown) {
        if (axios.isAxiosError(err) && getErrorMessage(err)) {
            throw new Error('Failed to list messages: ' + getErrorMessage(err));
        }
        throw new Error('Failed to list messages: Unknown error');
    }
};

// Create assistant
export const createAssistant = async (name: string, jsonData: any): Promise<CreateAssistantResponse> => {
    try {
        const response = await api.post<CreateAssistantResponse>('/create-assistant', {
            name,
            jsonData: JSON.stringify(jsonData)
        });
        return response.data;
    } catch (err: unknown) {
        if (axios.isAxiosError(err) && getErrorMessage(err)) {
            throw new Error('Failed to create assistant: ' + getErrorMessage(err));
        }
        throw new Error('Failed to create assistant: Unknown error');
    }
};

// Delete assistant and related objects
export const deleteAssistant = async (): Promise<string> => {
    try {
        const response = await api.delete<DeleteAssistantResponse>('/delete-all-objects');
        return response.data.message;
    } catch (err: unknown) {
        if (axios.isAxiosError(err) && getErrorMessage(err)) {
            throw new Error('Failed to delete assistant: ' + getErrorMessage(err));
        }
        throw new Error('Failed to delete assistant: Unknown error');
    }
};
