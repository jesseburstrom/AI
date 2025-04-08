// server.ts
import express, { Request, Response } from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import * as path from 'path';


import {
  createVectorStoreAndAssistant,
  listAssistants,
  createThread,
  createMessage,
  createRun,
  retrieveRun,
  listMessages,
  listFiles,
  uploadJsonAndCreateVectorStore,
  addFileToVectorStore,
  removeFileFromVectorStore,
  deleteVectorStore,
  deleteAssistant,
  setCurrentAssistant,
  listVectorStoreFiles,
  deleteThread,
  deleteAllObjects
} from './openai_api_calls';

const app = express();
app.use(cors());
const port = 8000;

// Middleware to parse JSON request bodies
app.use(bodyParser.json({ limit: '50mb' }));

// Interfaces for request bodies
interface CreateAssistantRequestBody {
  name: string;
  jsonData: any;
}

interface SetAssistantByNameRequestBody {
  name: string;
}

interface CreateMessageRequestBody {
  role: string;
  content: string;
  attachments?: any;
  metadata?: any;
}

interface CreateThreadRequestBody {
  messages: any;
  toolResources: any;
  metadata: any;
}

interface CreateRunRequestBody {
  instructions: string;
  additionalInstructions?: string;
  additionalMessages?: any;
  tools?: any;
  metadata?: any;
  temperature?: number;
  topP?: number;
}

interface DeleteThreadRequestBody {
  currentThreadID: string;
}

interface UploadJsonRequestBody {
  jsonData: any;
  vectorStoreName: string;
}

interface FileIdRequestBody {
  fileId: string;
}

interface Assistant {
  id: string;
  name: string;
  // Add other properties if needed
}

// Interface for the request body
interface AssistantInteractRequestBody {
  name: string; // Assistant name
  instructions: string; // Prompt
}

// POST endpoint to interact with the assistant
app.post('/assistant-interact', async (req: Request<{}, {}, AssistantInteractRequestBody>, res: Response) => {
  const { name, instructions } = req.body;

  if (!name || !instructions) {
    return res.status(400).json({ error: 'Assistant name and instructions are required' });
  }

  try {
    // Step 1: List assistants and find the one with the given name
    const assistantsResponse = await new Promise<any>((resolve, reject) => {
      listAssistants(100, 'desc', null, null, (err, result) => {
        if (err) return reject(err);
        resolve(result);
      });
    });

    const assistant = assistantsResponse.data.find((assistant: Assistant) => assistant.name === "CM");

    if (!assistant) {
      return res.status(404).json({ error: 'Assistant not found' });
    }

    // Step 2: Set the current assistant
    setCurrentAssistant(assistant);

    // Step 3: Create a new thread
    await new Promise<any>((resolve, reject) => {
      createThread([], null, null, (err, result) => {
        if (err) return reject(err);
        resolve(result);
      });
    });

    // Step 4: Create a message with the user's instructions
    await new Promise<any>((resolve, reject) => {
      createMessage('user', instructions, null, null, (err, result) => {
        if (err) return reject(err);
        resolve(result);
      });
    });

    // Step 5: Create a run to process the message
    await new Promise<any>((resolve, reject) => {
      createRun(
        null, // Instructions are already provided in the message
        null,
        null,
        null,
        null,
        0.5,
        1,
        (err, result) => {
          if (err) return reject(err);
          resolve(result);
        }
      );
    });

    // Step 6: Wait for the run to complete
    let runCompleted = false;
    let runResult;

    while (!runCompleted) {
      await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds before checking again

      runResult = await new Promise<any>((resolve, reject) => {
        retrieveRun((err, result) => {
          if (err) return reject(err);
          resolve(result);
        });
      });
      console.log(runResult.status);
      if (runResult && runResult.status === 'completed') {
        runCompleted = true;
      } else if (runResult && runResult.status === 'failed') {
        return res.status(500).json({ error: 'Run failed', details: runResult });
      }
      // Continue polling if the run is still processing
    }

    // Step 7: Retrieve the assistant's response from the messages
    const messagesResponse = await new Promise<any>((resolve, reject) => {
      listMessages(20, 'asc', null, null, (err, result) => {
        if (err) return reject(err);
        resolve(result);
      });
    });

    const assistantMessages = messagesResponse.data.filter((message: any) => message.role === 'assistant');
    const lastAssistantMessage = assistantMessages[assistantMessages.length - 1];

    const assistantResponse = lastAssistantMessage ? lastAssistantMessage.content : null;

    res.status(200).json({ assistantResponse });
    
  } catch (error: any) {
    console.error('Error in assistant interaction:', error);
    res.status(500).json({ error: 'Failed to interact with assistant', details: error.message });
  }
});

// POST endpoint to create a vector store and assistant
app.post('/create-assistant', async (req: Request<{}, {}, CreateAssistantRequestBody>, res: Response) => {
  const { name, jsonData } = req.body;

  if (!name || !jsonData) {
    return res.status(400).json({ error: 'Name and JSON data are required' });
  }

  try {
    const assistantResponse = await createVectorStoreAndAssistant(name, jsonData);
    res.status(200).json(assistantResponse);
  } catch (error: any) {
    console.error('Error creating assistant:', error);
    res.status(500).json({ error: 'Failed to create assistant', details: error.message });
  }
});

app.get('/assistants', (req: Request, res: Response) => {
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : undefined;
  
    const orderParam = req.query.order as string | undefined;
    const order = orderParam === 'asc' || orderParam === 'desc' ? orderParam : undefined;
  
    const after = req.query.after as string | undefined;
    const before = req.query.before as string | undefined;
  
    listAssistants(
      limit,
      order,
      after,
      before,
      (err: Error | null, assistants: { data: Assistant[] }) => {
        if (err) {
          console.error('Error listing assistants:', err);
          return res.status(500).json({
            error: 'Failed to list assistants',
            details: getErrorMessage(err),
          });
        }
  
        const assistantNames = assistants.data.map((assistant) => assistant.name); // Extract names
        res.status(200).json({ names: assistantNames }); // Return only names
      }
    );
  });
  

app.post('/set-assistant-by-name', (req: Request<{}, {}, SetAssistantByNameRequestBody>, res: Response) => {
  const { name } = req.body;

  if (!name) {
    return res.status(400).json({ error: 'Assistant name is required' });
  }

  listAssistants(100, 'desc', null, null, (err: Error | null, assistants: { data: Assistant[] }) => {
    if (err) {
      console.error('Error listing assistants:', err);
      return res.status(500).json({ error: 'Failed to list assistants', details: getErrorMessage(err) });
    }

    const assistant = assistants.data.find((assistant) => assistant.name === name);
    if (!assistant) {
      return res.status(404).json({ error: 'Assistant not found' });
    }
    console.log('assistant id ' + assistant.id);
    setCurrentAssistant(assistant); // Set the assistant using the ID
    res.status(200).json({ message: `Assistant '${name}' set successfully` });
  });
});

app.post('/create-thread', (req: Request<{}, {}, CreateThreadRequestBody>, res: Response) => {
  const { messages, toolResources, metadata } = req.body;

  createThread(messages, toolResources, metadata, (err: Error | null, thread: any) => {
    if (err) {
      console.error('Error creating thread:', err);
      return res.status(500).json({ error: 'Failed to create thread', details: getErrorMessage(err) });
    }

    res.status(200).json(thread);
  });
});

app.post('/create-message', (req: Request<{}, {}, CreateMessageRequestBody>, res: Response) => {
  const { role, content, attachments, metadata } = req.body;

  if (!role || !content) {
    return res.status(400).json({ error: 'role, and content are required' });
  }

  createMessage(role, content, attachments, metadata, (err: Error | null, message: any) => {
    if (err) {
      console.error('Error creating message:', err);
      return res.status(500).json({ error: 'Failed to create message', details: getErrorMessage(err) });
    }

    res.status(200).json(message);
  });
});

app.post('/create-run', (req: Request<{}, {}, CreateRunRequestBody>, res: Response) => {
  const {
    instructions,
    additionalInstructions,
    additionalMessages,
    tools,
    metadata,
    temperature,
    topP
  } = req.body;

  createRun(
    instructions,
    additionalInstructions,
    additionalMessages,
    tools,
    metadata,
    temperature,
    topP,
    (err: Error | null, run: any) => {
      if (err) {
        console.error('Error creating run:', err);
        return res.status(500).json({ error: 'Failed to create run', details: getErrorMessage(err) });
      }

      res.status(200).json(run);
    }
  );
});

app.get('/retrieve-run', (req: Request, res: Response) => {
  retrieveRun((err: Error | null, run: any) => {
    if (err) {
      console.error('Error retrieving run:', err);
      return res.status(500).json({ error: 'Failed to retrieve run', details: getErrorMessage(err) });
    }

    res.status(200).json(run);
  });
});

app.get('/list-messages', (req: Request, res: Response) => {
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : undefined;
  
    const orderParam = req.query.order as string | undefined;
    const order = orderParam === 'asc' || orderParam === 'desc' ? orderParam : undefined;
  
    const after = req.query.after as string | undefined;
    const before = req.query.before as string | undefined;
  
    listMessages(
      limit,
      order,
      after,
      before,
      (err: Error | null, messages: any) => {
        if (err) {
          console.error('Error listing messages:', err);
          return res.status(500).json({
            error: 'Failed to list messages',
            details: getErrorMessage(err),
          });
        }
  
        res.status(200).json(messages);
      }
    );
  });
  

app.delete('/delete-thread', (req: Request<{}, {}, DeleteThreadRequestBody>, res: Response) => {
  const { currentThreadID } = req.body;
  if (!currentThreadID) {
    return res.status(400).json({ error: 'No thread ID provided' });
  }

  // Call a function to delete the thread using the currentThreadID
  deleteThread(currentThreadID, (err: Error | null, result: any) => {
    if (err) {
      console.error('Error deleting thread:', err);
      return res.status(500).json({ error: 'Failed to delete thread', details: getErrorMessage(err) });
    }

    res.status(200).json({ message: 'Thread deleted successfully' });
  });
});

// DELETE endpoint to delete all objects (assistant, vector store, thread, and file)
app.delete('/delete-all-objects', async (req: Request, res: Response) => {
  try {
    await new Promise((resolve, reject) => {
      deleteAllObjects((err: Error | null, result: any) => {
        if (err) return reject(err);
        resolve(result);
      });
    });

    res.status(200).json({ message: 'All objects deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting all objects:', error);
    res.status(500).json({ error: 'Failed to delete all objects', details: error.message });
  }
});

//////////////////////////////////////// Not currently used below
app.get('/list-files', (req: Request, res: Response) => {
  const purpose = req.query.purpose as string | undefined;

  listFiles(purpose, (err: Error | null, files: any) => {
    if (err) {
      console.error('Error listing files:', err);
      return res.status(500).json({ error: 'Failed to list files', details: getErrorMessage(err) });
    }

    res.status(200).json(files);
  });
});

app.post('/upload-json-and-create-vector-store', (req: Request<{}, {}, UploadJsonRequestBody>, res: Response) => {
  const { jsonData, vectorStoreName } = req.body;

  if (!jsonData || !vectorStoreName) {
    return res.status(400).json({ error: 'jsonData and vectorStoreName are required' });
  }

  uploadJsonAndCreateVectorStore(jsonData, vectorStoreName, (err: Error | null, vectorStore: any) => {
    if (err) {
      console.error('Error creating vector store:', err);
      return res.status(500).json({ error: 'Failed to create vector store', details: getErrorMessage(err) });
    }

    res.status(200).json(vectorStore);
  });
});

app.post('/add-file-to-vector-store', (req: Request<{}, {}, FileIdRequestBody>, res: Response) => {
  const { fileId } = req.body;

  if (!fileId) {
    return res.status(400).json({ error: 'fileId is required' });
  }

  addFileToVectorStore(fileId, (err: Error | null, result: any) => {
    if (err) {
      console.error('Error adding file to vector store:', err);
      return res.status(500).json({ error: 'Failed to add file to vector store', details: getErrorMessage(err) });
    }

    res.status(200).json(result);
  });
});

app.delete('/remove-file-from-vector-store', (req: Request<{}, {}, FileIdRequestBody>, res: Response) => {
  const { fileId } = req.body;

  if (!fileId) {
    return res.status(400).json({ error: 'fileId is required' });
  }

  removeFileFromVectorStore(fileId, (err: Error | null, result: any) => {
    if (err) {
      console.error('Error removing file from vector store:', err);
      return res.status(500).json({ error: 'Failed to remove file from vector store', details: getErrorMessage(err) });
    }

    res.status(200).json(result);
  });
});

app.delete('/delete-vector-store', (req: Request, res: Response) => {
  deleteVectorStore((err: Error | null, result: any) => {
    if (err) {
      console.error('Error deleting vector store:', err);
      return res.status(500).json({ error: 'Failed to delete vector store', details: getErrorMessage(err) });
    }

    res.status(200).json(result);
  });
});

app.delete('/delete-assistant', (req: Request, res: Response) => {
  deleteAssistant((err: Error | null, result: any) => {
    if (err) {
      console.error('Error deleting assistant:', err);
      return res.status(500).json({ error: 'Failed to delete assistant', details: getErrorMessage(err) });
    }

    res.status(200).json(result);
  });
});


app.get('/vector-store-files', (req: Request, res: Response) => {
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 20;
  
    const orderParam = req.query.order as string | undefined;
    const order = orderParam === 'asc' || orderParam === 'desc' ? orderParam : undefined;
  
    const after = req.query.after as string | undefined;
    const before = req.query.before as string | undefined;
    const filter = req.query.filter as string | undefined;
  
    // Call the listVectorStoreFiles function from openai_api_calls.js
    listVectorStoreFiles(limit, order, after, before, filter, (err: Error | null, files: any) => {
      if (err) {
        console.error('Error listing vector store files:', err);
        return res.status(500).json({ error: 'Failed to list vector store files', details: getErrorMessage(err) });
      }
  
      res.status(200).json(files); // Return the files to the client
    });
  });

  const staticDir = path.join(__dirname, 'dist') // Adjust if your dist is somewhere else
    
  // Serve static files
  app.use(express.static(staticDir));
  
  // Fallback route to serve index.html for any unmatched GET request
  app.get('*', (req: Request, res: Response) => {
    res.sendFile(path.join(staticDir, 'index.html'));
  });
  
// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
