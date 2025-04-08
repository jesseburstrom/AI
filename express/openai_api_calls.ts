import * as https from 'https';
import * as fs from 'fs';
import * as path from 'path';
import FormData, { SubmitOptions } from 'form-data';
import { IncomingMessage } from 'http';
import * as dotenv from 'dotenv';
dotenv.config({ path: path.resolve(__dirname, '.env.local') });

const apiKey: string = process.env.OPENAI_API_KEY as string;

if (!apiKey) {
  throw new Error('Please set the OPENAI_API_KEY environment variable.');
}

let currentVectorStoreId: string = '';
let currentAssistantID: string = '';
let currentThreadID: string = '';
let currentRunID: string = '';
let currentFileID: string = '';

function uploadFile(
    fileData: Buffer,
    fileName: string,
    callback: (err: Error | null, result?: any) => void
  ): void {
    const form = new FormData();
    form.append('file', fileData, fileName);
    form.append('purpose', 'user_data'); // Set the appropriate purpose
  
    const options: SubmitOptions = {
      protocol: 'https:',
      hostname: 'api.openai.com',
      path: '/v1/files',
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'OpenAI-Beta': 'assistants=v2',
        ...form.getHeaders(),
      },
    };
  
    form.submit(options, (err: any, res: IncomingMessage) => {
      if (err) return callback(err);
  
      let data = '';
      res.on('data', (chunk: any) => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          console.log('Upload response data:', data); // Log raw response
          const parsedData = JSON.parse(data);
          if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
            callback(null, parsedData);
          } else {
            callback(new Error(parsedData.error.message), parsedData);
          }
        } catch (e) {
          callback(e as Error);
        }
      });
    });
  }

function createVectorStore(
  fileIds: string[],
  name: string,
  callback: (err: Error | null, result?: any) => void
): void {
  const postData = JSON.stringify({
    file_ids: fileIds,
    name: name,
  });

  const options = {
    hostname: 'api.openai.com',
    path: '/v1/vector_stores',
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'OpenAI-Beta': 'assistants=v2',
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData),
    },
  };

  makeRequest(options, postData, callback);
}

function createAssistant(
  name: string,
  model: string,
  vectorStoreId: string,
  callback: (err: Error | null, result?: any) => void
): void {
  const postData = JSON.stringify({
    model: model,
    name: name,
    description: `Assistant for ${name}`,
    tools: [
      {
        type: 'file_search',
      },
    ],
    tool_resources: {
      file_search: {
        vector_store_ids: [vectorStoreId],
      },
    },
  });

  const options = {
    hostname: 'api.openai.com',
    path: '/v1/assistants',
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'OpenAI-Beta': 'assistants=v2',
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData),
    },
  };

  makeRequest(options, postData, callback);
}

async function createVectorStoreAndAssistant(
  name: string,
  jsonData: string | null = null
): Promise<any> {
  try {
    let fileData: Buffer;
    const fileName = `${name}.json`;

    if (jsonData) {
      fileData = Buffer.from(jsonData, 'utf-8');
    } else {
      const filePath = path.join(__dirname, fileName);
      fileData = fs.readFileSync(filePath); // Read JSON from file
    }

    // Step 1: Upload the file
    const fileResponse = await new Promise<any>((resolve, reject) => {
      uploadFile(fileData, fileName, (err, result) => {
        if (err) return reject(err);
        resolve(result);
      });
    });
    currentFileID = fileResponse.id;

    if (!currentFileID) {
      throw new Error('File ID is missing from the response');
    }
    console.log(`File uploaded successfully. File ID: ${currentFileID}`);

    // Step 2: Create the vector store
    const vectorStoreResponse = await new Promise<any>((resolve, reject) => {
      createVectorStore([currentFileID], name, (err, result) => {
        if (err) return reject(err);
        resolve(result);
      });
    });

    currentVectorStoreId = vectorStoreResponse.id;
    if (!currentVectorStoreId) {
      throw new Error('Vector Store ID is missing from the response');
    }
    console.log(
      `Vector store created successfully. Vector Store ID: ${currentVectorStoreId}`
    );

    // Step 3: Create the assistant with the vector store ID
    const assistantResponse = await new Promise<any>((resolve, reject) => {
      createAssistant(name, 'gpt-4o-mini', currentVectorStoreId, (err, result) => {
        if (err) return reject(err);
        resolve(result);
      });
    });

    currentAssistantID = assistantResponse.id;
    console.log('Assistant created successfully:', assistantResponse);

    // Return the assistant object
    return assistantResponse;
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
}

function listAssistants(
  limit: number = 20,
  order: 'asc' | 'desc' = 'desc',
  after: string | null = null,
  before: string | null = null,
  callback: (err: Error | null, result?: any) => void
): void {
  let queryParams = `?limit=${limit}&order=${order}`;
  if (after) queryParams += `&after=${after}`;
  if (before) queryParams += `&before=${before}`;

  const options = {
    hostname: 'api.openai.com',
    path: `/v1/assistants${queryParams}`,
    method: 'GET',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'OpenAI-Beta': 'assistants=v2',
    },
  };

  https
    .get(options, (res: IncomingMessage) => {
      let data = '';

      res.on('data', (chunk: any) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const parsedData = JSON.parse(data);
          if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
            callback(null, parsedData);
          } else {
            callback(new Error(parsedData.error.message), parsedData);
          }
        } catch (e) {
          callback(e as Error);
        }
      });
    })
    .on('error', (e: Error) => {
      callback(e);
    });
}

function createThread(
  messages: any[] = [],
  toolResources: any = null,
  metadata: any = null,
  callback: (err: Error | null, result?: any) => void
): void {
  const postData = JSON.stringify({
    messages: messages,
    tool_resources: toolResources,
    metadata: metadata,
  });

  const options = {
    hostname: 'api.openai.com',
    path: '/v1/threads',
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'OpenAI-Beta': 'assistants=v2',
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData),
    },
  };

  const req = https.request(options, (res: IncomingMessage) => {
    let data = '';

    res.on('data', (chunk: any) => {
      data += chunk;
    });

    res.on('end', () => {
      try {
        const parsedData = JSON.parse(data);
        if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
          currentThreadID = parsedData.id;
          callback(null, parsedData);
        } else {
          callback(new Error(parsedData.error.message), parsedData);
        }
      } catch (e) {
        callback(e as Error);
      }
    });
  });

  req.on('error', (e: Error) => {
    callback(e);
  });

  req.write(postData);
  req.end();
}

function createMessage(
  role: string,
  content: string,
  attachments: any = null,
  metadata: any = null,
  callback: (err: Error | null, result?: any) => void
): void {
  const postData = JSON.stringify({
    role: role,
    content: content,
    attachments: attachments,
    metadata: metadata,
  });

  const options = {
    hostname: 'api.openai.com',
    path: `/v1/threads/${currentThreadID}/messages`,
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'OpenAI-Beta': 'assistants=v2',
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData),
    },
  };

  const req = https.request(options, (res: IncomingMessage) => {
    let data = '';

    res.on('data', (chunk: any) => {
      data += chunk;
    });

    res.on('end', () => {
      try {
        const parsedData = JSON.parse(data);
        if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
          callback(null, parsedData);
        } else {
          callback(new Error(parsedData.error.message), parsedData);
        }
      } catch (e) {
        callback(e as Error);
      }
    });
  });

  req.on('error', (e: Error) => {
    callback(e);
  });

  req.write(postData);
  req.end();
}

function createRun(
  instructions: string | null = null,
  additionalInstructions: string | null = null,
  additionalMessages: any = null,
  tools: any = null,
  metadata: any = null,
  temperature: number = 0.5,
  topP: number = 1,
  callback: (err: Error | null, result?: any) => void
): void {
  const postData = JSON.stringify({
    assistant_id: currentAssistantID,
    instructions: instructions,
    additional_instructions: additionalInstructions,
    additional_messages: additionalMessages,
    tools: tools,
    metadata: metadata,
    temperature: temperature,
    top_p: topP,
  });

  const options = {
    hostname: 'api.openai.com',
    path: `/v1/threads/${currentThreadID}/runs`,
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'OpenAI-Beta': 'assistants=v2',
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData),
    },
  };

  const req = https.request(options, (res: IncomingMessage) => {
    let data = '';

    res.on('data', (chunk: any) => {
      data += chunk;
    });

    res.on('end', () => {
      try {
        const parsedData = JSON.parse(data);
        currentRunID = parsedData.id;
        if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
          callback(null, parsedData);
        } else {
          callback(new Error(parsedData.error.message), parsedData);
        }
      } catch (e) {
        callback(e as Error);
      }
    });
  });

  req.on('error', (e: Error) => {
    callback(e);
  });

  req.write(postData);
  req.end();
}

function retrieveRun(callback: (err: Error | null, result?: any) => void): void {
  const options = {
    hostname: 'api.openai.com',
    path: `/v1/threads/${currentThreadID}/runs/${currentRunID}`,
    method: 'GET',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'OpenAI-Beta': 'assistants=v2',
      'Content-Type': 'application/json',
    },
  };

  const req = https.request(options, (res: IncomingMessage) => {
    let data = '';

    res.on('data', (chunk: any) => {
      data += chunk;
    });

    res.on('end', () => {
      try {
        const parsedData = JSON.parse(data);
        if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
          callback(null, parsedData);
        } else {
          callback(new Error(parsedData.error.message), parsedData);
        }
      } catch (e) {
        callback(e as Error);
      }
    });
  });

  req.on('error', (e: Error) => {
    callback(e);
  });

  req.end();
}

function listMessages(
  limit: number = 20,
  order: 'asc' | 'desc' = 'desc',
  after: string | null = null,
  before: string | null = null,
  callback: (err: Error | null, result?: any) => void
): void {
  const queryParams = new URLSearchParams();

  if (limit) queryParams.append('limit', limit.toString());
  if (order) queryParams.append('order', order);
  if (after) queryParams.append('after', after);
  if (before) queryParams.append('before', before);

  const options = {
    hostname: 'api.openai.com',
    path: `/v1/threads/${currentThreadID}/messages?${queryParams.toString()}`,
    method: 'GET',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'OpenAI-Beta': 'assistants=v2',
      'Content-Type': 'application/json',
    },
  };

  const req = https.request(options, (res: IncomingMessage) => {
    let data = '';

    res.on('data', (chunk: any) => {
      data += chunk;
    });

    res.on('end', () => {
      try {
        const parsedData = JSON.parse(data);
        if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
          callback(null, parsedData);
        } else {
          callback(new Error(parsedData.error.message), parsedData);
        }
      } catch (e) {
        callback(e as Error);
      }
    });
  });

  req.on('error', (e: Error) => {
    callback(e);
  });

  req.end();
}

function deleteVectorStore(callback: (err: Error | null, result?: any) => void): void {
  const options = {
    hostname: 'api.openai.com',
    path: `/v1/vector_stores/${currentVectorStoreId}`,
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'OpenAI-Beta': 'assistants=v2',
      'Content-Type': 'application/json',
    },
  };

  const req = https.request(options, (res: IncomingMessage) => {
    let data = '';

    res.on('data', (chunk: any) => {
      data += chunk;
    });

    res.on('end', () => {
      try {
        const parsedData = JSON.parse(data);
        if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
          currentVectorStoreId = '';
          callback(null, parsedData);
        } else {
          callback(new Error(parsedData.error.message), parsedData);
        }
      } catch (e) {
        callback(e as Error);
      }
    });
  });

  req.on('error', (e: Error) => {
    callback(e);
  });

  req.end();
}

function deleteAssistant(callback: (err: Error | null, result?: any) => void): void {
  const options = {
    hostname: 'api.openai.com',
    path: `/v1/assistants/${currentAssistantID}`,
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'OpenAI-Beta': 'assistants=v2',
      'Content-Type': 'application/json',
    },
  };

  const req = https.request(options, (res: IncomingMessage) => {
    let data = '';

    res.on('data', (chunk: any) => {
      data += chunk;
    });

    res.on('end', () => {
      try {
        const parsedData = JSON.parse(data);
        if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
          currentAssistantID = '';
          callback(null, parsedData);
        } else {
          callback(new Error(parsedData.error.message), parsedData);
        }
      } catch (e) {
        callback(e as Error);
      }
    });
  });

  req.on('error', (e: Error) => {
    callback(e);
  });

  req.end();
}

function setCurrentAssistant(assistant: any): void {
  currentAssistantID = assistant.id;

  if (
    assistant.tool_resources &&
    assistant.tool_resources.file_search &&
    assistant.tool_resources.file_search.vector_store_ids
  ) {
    currentVectorStoreId = assistant.tool_resources.file_search.vector_store_ids[0];

    // If vector store is set, retrieve the files associated with it
    listVectorStoreFiles(
      20,
      'desc',
      null,
      null,
      null,
      (err, files) => {
        if (err) {
          console.error('Error retrieving vector store files:', err);
          currentFileID = '';
        } else if (files && files.data && files.data.length > 0) {
          currentFileID = files.data[0].id;
          console.log(`Current File ID: ${currentFileID}`);
        } else {
          currentFileID = '';
        }
      }
    );
  } else {
    currentVectorStoreId = '';
    currentFileID = '';
  }

  console.log(`Current Assistant ID: ${currentAssistantID}`);
  console.log(`Current Vector Store ID: ${currentVectorStoreId}`);
}

function listVectorStoreFiles(
  limit: number = 20,
  order: 'asc' | 'desc' = 'desc',
  after: string | null = null,
  before: string | null = null,
  filter: string | null = null,
  callback: (err: Error | null, result?: any) => void
): void {
  if (!currentVectorStoreId) {
    return callback(new Error('No vector store is currently set.'), null);
  }

  let queryParams = `?limit=${limit}&order=${order}`;
  if (after) queryParams += `&after=${after}`;
  if (before) queryParams += `&before=${before}`;
  if (filter) queryParams += `&filter=${filter}`;

  const options = {
    hostname: 'api.openai.com',
    path: `/v1/vector_stores/${currentVectorStoreId}/files${queryParams}`,
    method: 'GET',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'OpenAI-Beta': 'assistants=v2',
      'Content-Type': 'application/json',
    },
  };

  https
    .get(options, (res: IncomingMessage) => {
      let data = '';

      res.on('data', (chunk: any) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const parsedData = JSON.parse(data);
          if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
            callback(null, parsedData);
          } else {
            callback(new Error(parsedData.error.message), parsedData);
          }
        } catch (error) {
          callback(error as Error);
        }
      });
    })
    .on('error', (e: Error) => {
      callback(e);
    });
}

function deleteThread(
  threadID: string,
  callback: (err: Error | null, result?: any) => void
): void {
  const options = {
    hostname: 'api.openai.com',
    path: `/v1/threads/${threadID}`,
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'OpenAI-Beta': 'assistants=v2',
      'Content-Type': 'application/json',
    },
  };

  const req = https.request(options, (res: IncomingMessage) => {
    let data = '';

    res.on('data', (chunk: any) => {
      data += chunk;
    });

    res.on('end', () => {
      if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
        callback(null, JSON.parse(data));
      } else {
        callback(new Error(`Failed to delete thread: ${data}`));
      }
    });
  });

  req.on('error', (e: Error) => {
    callback(e);
  });

  req.end();
}

async function deleteAllObjects(
  callback: (err: Error | null, result?: any) => void
): Promise<void> {
  try {
    // Step 1: Delete the assistant
    if (currentAssistantID) {
      await new Promise<void>((resolve, reject) => {
        deleteAssistant((err, result) => {
          if (err) return reject(err);
          resolve();
        });
      });
      console.log(`Assistant ${currentAssistantID} deleted successfully.`);
    }

    // Step 2: Delete the vector store
    if (currentVectorStoreId) {
      await new Promise<void>((resolve, reject) => {
        deleteVectorStore((err, result) => {
          if (err) return reject(err);
          resolve();
        });
      });
      console.log(`Vector Store ${currentVectorStoreId} deleted successfully.`);
    }

    // Step 3: Delete the thread
    if (currentThreadID) {
      await new Promise<void>((resolve, reject) => {
        deleteThread(currentThreadID, (err, result) => {
          if (err) return reject(err);
          resolve();
        });
      });
      console.log(`Thread ${currentThreadID} deleted successfully.`);
    }

    // Step 4: Delete the file
    if (currentFileID) {
      await new Promise<void>((resolve, reject) => {
        const options = {
          hostname: 'api.openai.com',
          path: `/v1/files/${currentFileID}`,
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
        };

        const req = https.request(options, (res: IncomingMessage) => {
          let data = '';

          res.on('data', (chunk: any) => {
            data += chunk;
          });

          res.on('end', () => {
            if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
              console.log(`File ${currentFileID} deleted successfully.`);
              resolve();
            } else {
              reject(new Error(`Failed to delete file: ${data}`));
            }
          });
        });

        req.on('error', (e: Error) => {
          reject(e);
        });

        req.end();
      });
    }

    // Reset all IDs
    currentAssistantID = '';
    currentVectorStoreId = '';
    currentThreadID = '';
    currentRunID = '';
    currentFileID = '';

    console.log('All objects deleted successfully.');

    callback(null, { message: 'All objects deleted successfully.' });
  } catch (error) {
    console.error('Error deleting objects:', error);
    callback(error as Error);
  }
}

function makeRequest(
  options: https.RequestOptions & { hostname: string; path: string },
  postData: string | null,
  callback: (err: Error | null, result?: any) => void
): void {
  const req = https.request(options, (res: IncomingMessage) => {
    let data = '';

    res.on('data', (chunk: any) => {
      data += chunk;
    });

    res.on('end', () => {
      try {
        console.log(`Response from ${options.path}:`, data); // Log raw response
        const parsedData = JSON.parse(data);
        if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
          callback(null, parsedData);
        } else {
          callback(new Error(parsedData.error.message), parsedData);
        }
      } catch (e) {
        callback(e as Error);
      }
    });
  });

  req.on('error', (e: Error) => {
    callback(e);
  });

  if (postData) {
    req.write(postData);
  }
  req.end();
}

// ////////////////////////////////////////////////////////////////////////// Not currently used below

function removeFileFromVectorStore(
  fileId: string,
  callback: (err: Error | null, result?: any) => void
): void {
  const options = {
    hostname: 'api.openai.com',
    path: `/v1/vector_stores/${currentVectorStoreId}/files/${fileId}`,
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'OpenAI-Beta': 'assistants=v2',
      'Content-Type': 'application/json',
    },
  };

  const req = https.request(options, (res: IncomingMessage) => {
    let data = '';

    res.on('data', (chunk: any) => {
      data += chunk;
    });

    res.on('end', () => {
      try {
        if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
          callback(null, JSON.parse(data));
        } else {
          const parsedData = JSON.parse(data);
          callback(new Error(parsedData.error.message), parsedData);
        }
      } catch (e) {
        callback(e as Error);
      }
    });
  });

  req.on('error', (e: Error) => {
    callback(e);
  });

  req.end();
}

function addFileToVectorStore(
  fileId: string,
  callback: (err: Error | null, result?: any) => void
): void {
  const postData = JSON.stringify({ file_id: fileId });

  const options = {
    hostname: 'api.openai.com',
    path: `/v1/vector_stores/${currentVectorStoreId}/files`,
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'OpenAI-Beta': 'assistants=v2',
      'Content-Length': Buffer.byteLength(postData),
    },
  };

  const req = https.request(options, (res: IncomingMessage) => {
    let data = '';

    res.on('data', (chunk: any) => {
      data += chunk;
    });

    res.on('end', () => {
      try {
        const parsedData = JSON.parse(data);
        if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
          callback(null, parsedData);
        } else {
          callback(new Error(parsedData.error.message), parsedData);
        }
      } catch (e) {
        callback(e as Error);
      }
    });
  });

  req.on('error', (e: Error) => {
    callback(e);
  });

  req.write(postData);
  req.end();
}

function uploadJsonAndCreateVectorStore(
  jsonData: any,
  vectorStoreName: string,
  callback: (err: Error | null, result?: any) => void
): void {
  const fileName = `${vectorStoreName}.json`;

  // Step 1: Upload the JSON as a file
  uploadFile(Buffer.from(JSON.stringify(jsonData)), fileName, (err, uploadResponse) => {
    if (err) return callback(err);

    const fileId = uploadResponse.id;

    // Step 2: Create a vector store with the uploaded file ID
    createVectorStore([fileId], vectorStoreName, callback);
  });
}

function listFiles(
  purpose: string | null = null,
  callback: (err: Error | null, result?: any) => void
): void {
  const queryParams = new URLSearchParams();

  // Add query parameter if 'purpose' is provided
  if (purpose) {
    queryParams.append('purpose', purpose);
  }

  const options = {
    hostname: 'api.openai.com',
    path: `/v1/files?${queryParams.toString()}`,
    method: 'GET',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
  };

  const req = https.request(options, (res: IncomingMessage) => {
    let data = '';

    res.on('data', (chunk: any) => {
      data += chunk;
    });

    res.on('end', () => {
      try {
        const parsedData = JSON.parse(data);
        if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
          callback(null, parsedData);
        } else {
          callback(new Error(parsedData.error.message), parsedData);
        }
      } catch (e) {
        callback(e as Error);
      }
    });
  });

  req.on('error', (e: Error) => {
    callback(e);
  });

  req.end();
}

export {
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
  deleteAllObjects,
};
