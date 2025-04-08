"use strict";
// import React, { useState, useEffect, FC } from 'react';
// import ReactMarkdown from 'react-markdown';
// import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
// import { solarizedlight } from 'react-syntax-highlighter/dist/esm/styles/prism';
// import remarkGfm from 'remark-gfm';
// import rehypeRaw from 'rehype-raw';
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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// // Define the shape of the conversation history items
// interface ConversationItem {
//     prompt: string;
//     response: string;
// }
// // Define the props for the PromptResponse component
// interface PromptResponseProps {
//     userInput: string;
//     setUserInput: React.Dispatch<React.SetStateAction<string>>;
//     processInput: () => Promise<void>;
//     isLoading: boolean;
//     responseOutput: string;
// }
// // Define the props for the custom code component in ReactMarkdown
// interface CodeProps {
//     node?: any; // Replace 'any' with a more specific type if available
//     inline?: boolean;
//     className?: string;
//     children?: React.ReactNode; // Made optional
//     [key: string]: any; // Allow additional props
// }
// const PromptResponse: FC<PromptResponseProps> = ({
//     userInput,
//     setUserInput,
//     processInput,
//     isLoading,
//     responseOutput,
// }) => {
//     // State to keep track of the conversation history
//     const [conversationHistory, setConversationHistory] = useState<ConversationItem[]>([]);
//     const [currentPrompt, setCurrentPrompt] = useState<string>('');
//     // Function to handle copying the code block to the clipboard
//     const handleCopyCode = (code: string): void => {
//         navigator.clipboard.writeText(code).then(
//             () => {
//                 alert('Code copied to clipboard!');
//             },
//             (err) => {
//                 console.error('Error copying code: ', err);
//             }
//         );
//     };
//     // Handle prompt submission
//     const handleSubmit = (): void => {
//         if (userInput.trim() === '') {
//             alert('Please enter a prompt before submitting.');
//             return;
//         }
//         setCurrentPrompt(userInput); // Store the current prompt
//         processInput(); // Process the input (assumed to update responseOutput)
//     };
//     // Update the conversation history when a new response is received
//     useEffect(() => {
//         if (responseOutput && currentPrompt) {
//             // setConversationHistory((prevHistory) => [
//             //     ...prevHistory,
//             //     { prompt: currentPrompt, response: responseOutput },
//             // ]);
//             setConversationHistory((prevHistory) => [
//                 { prompt: currentPrompt, response: responseOutput },
//                 ...prevHistory,
//             ]);
//             setUserInput(''); // Clear the input after processing
//             setCurrentPrompt(''); // Reset current prompt
//         }
//         // Only depend on responseOutput to avoid multiple triggers
//     }, [responseOutput]); 
//     // Custom Code Component with proper typing
//     const CodeBlock = ({ node, inline, className, children, ...props }: CodeProps): JSX.Element => {
//         const match = /language-(\w+)/.exec(className || '');
//         const language = match ? match[1] : 'plaintext';
//         // Safely extract the code string from children
//         const code = Array.isArray(children) ? children.join('') : String(children || '');
//         if (!inline) {
//             return (
//                 <div
//                     style={{
//                         position: 'relative',
//                         marginTop: '20px',
//                     }}
//                     {...props}
//                 >
//                     {/* Display the language above the code block */}
//                     <div
//                         style={{
//                             fontStyle: 'italic',
//                             marginBottom: '5px',
//                             textAlign: 'left', // Align language text to the right
//                             fontSize: '12px', // Smaller font size for language label
//                             color: '#555', // Slightly gray color
//                         }}
//                     >
//                         {language.toUpperCase()}
//                     </div>
//                     {/* Syntax highlighter for code */}
//                     <SyntaxHighlighter
//                         style={solarizedlight}
//                         language={language}
//                         PreTag="div"
//                     >
//                         {code.replace(/\n$/, '')}
//                     </SyntaxHighlighter>
//                     {/* Copy button */}
//                     <button
//                         onClick={() => handleCopyCode(code)}
//                         style={styles.copyButton}
//                         aria-label="Copy code to clipboard"
//                     >
//                         Copy
//                     </button>
//                 </div>
//             );
//         } else {
//             return (
//                 <code className={className} {...props}>
//                     {code}
//                 </code>
//             );
//         }
//     };
//     return (
//         <div style={styles.outerContainer}>
//             <div style={styles.container}>
//                 {/* Centered Heading */}
//                 <h2 style={styles.heading}>Prompt Input</h2>
//                 <textarea
//                     rows={10}
//                     cols={30}
//                     placeholder="Enter your prompt here..."
//                     value={userInput}
//                     onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setUserInput(e.target.value)}
//                     style={styles.textarea}
//                 />
//                 <button onClick={handleSubmit} style={styles.submitButton}>
//                     Submit Prompt
//                 </button>
//             </div>
//             <div style={styles.responseContainer}>
//                 {isLoading ? (
//                     <p style={styles.loadingText}>Loading...</p>
//                 ) : (
//                     <>
//                         {/* Centered Heading */}
//                         <h2 style={styles.heading}>Response Output</h2>
//                         <div style={styles.historyContainer}>
//                             {conversationHistory.map((item, index) => (
//                                 <div key={index} style={styles.conversationItem}>
//                                     <div style={styles.prompt}>
//                                         <strong>Prompt:</strong> {item.prompt}
//                                     </div>
//                                     <div style={styles.response}>
//                                         <ReactMarkdown
//                                             children={item.response}
//                                             remarkPlugins={[remarkGfm]}
//                                             rehypePlugins={[rehypeRaw]}
//                                             components={{
//                                                 code: CodeBlock, // Use the correctly typed CodeBlock
//                                             }}
//                                         />
//                                     </div>
//                                 </div>
//                             ))}
//                         </div>
//                     </>
//                 )}
//             </div>
//         </div>
//     );
// };
// // Styles for the component
// const styles: { [key: string]: React.CSSProperties } = {
//     outerContainer: {
//         display: 'flex',
//         flexDirection: 'column',
//         height: '100vh', // Fill the viewport height
//         width: '100%', // Ensure it takes full width of the parent
//         alignItems: 'center', // Center content horizontally
//         justifyContent: 'flex-start', // Align content to the top
//         boxSizing: 'border-box',
//     },
//     container: {
//         padding: '10px',
//         width: '100%',
//         maxWidth: '600px',
//     },
//     heading: {
//         textAlign: 'center', // Center the heading text
//         marginBottom: '20px', // Add spacing below the heading
//     },
//     textarea: {
//         width: '100%',
//         padding: '10px',
//         borderRadius: '4px',
//         border: '1px solid #ccc',
//         marginBottom: '10px',
//         resize: 'vertical', // Allow vertical resizing
//         fontSize: '16px',
//         boxSizing: 'border-box',
//     },
//     submitButton: {
//         padding: '10px 20px',
//         backgroundColor: '#4CAF50',
//         color: 'white',
//         border: 'none',
//         borderRadius: '4px',
//         cursor: 'pointer',
//         display: 'block',
//         margin: '10px auto',
//         fontSize: '16px',
//     },
//     responseContainer: {
//         flexGrow: 1, // Allow this container to grow and fill available space
//         overflowY: 'auto', // Add vertical scrollbar when content exceeds available space
//         padding: '10px',
//         borderTop: '1px solid #ccc',
//         width: '60%', 
//         margin: '0 auto', // Center horizontally
//         textAlign: 'left', // Align text to the left for content
//         boxSizing: 'border-box',
//     },
//     historyContainer: {
//         display: 'flex',
//         flexDirection: 'column',
//     },
//     conversationItem: {
//         marginBottom: '20px',
//     },
//     prompt: {
//         backgroundColor: '#f9f9f9',
//         padding: '10px',
//         borderRadius: '4px',
//         border: '1px solid #e0e0e0',
//         marginBottom: '5px',
//         textAlign: 'left', // Ensure text is left-aligned
//         wordBreak: 'break-word', // Handle long words
//     },
//     response: {
//         paddingLeft: '10px',
//         textAlign: 'left', // Ensure text is left-aligned
//     },
//     copyButton: {
//         position: 'absolute',
//         top: '10px',
//         right: '10px',
//         backgroundColor: '#4CAF50',
//         color: 'white',
//         border: 'none',
//         padding: '5px 10px',
//         cursor: 'pointer',
//         fontSize: '12px',
//         borderRadius: '4px',
//     },
//     loadingText: {
//         textAlign: 'center', // Center the loading text
//         fontStyle: 'italic',
//     },
// };
// export default PromptResponse;
const react_1 = __importStar(require("react"));
const react_markdown_1 = __importDefault(require("react-markdown"));
const react_syntax_highlighter_1 = require("react-syntax-highlighter");
const prism_1 = require("react-syntax-highlighter/dist/esm/styles/prism");
const remark_gfm_1 = __importDefault(require("remark-gfm"));
const rehype_raw_1 = __importDefault(require("rehype-raw"));
const PromptResponse = ({ userInput, setUserInput, processInput, isLoading, responseOutput, }) => {
    // State to keep track of the conversation history
    const [conversationHistory, setConversationHistory] = (0, react_1.useState)([]);
    const [currentPrompt, setCurrentPrompt] = (0, react_1.useState)('');
    // Reference to the response container
    const responseContainerRef = (0, react_1.useRef)(null);
    // Function to handle copying the code block to the clipboard
    const handleCopyCode = (code) => {
        navigator.clipboard.writeText(code).then(() => {
            alert('Code copied to clipboard!');
        }, (err) => {
            console.error('Error copying code: ', err);
        });
    };
    // Handle prompt submission
    const handleSubmit = () => {
        if (userInput.trim() === '') {
            alert('Please enter a prompt before submitting.');
            return;
        }
        setCurrentPrompt(userInput); // Store the current prompt
        processInput(); // Process the input (assumed to update responseOutput)
    };
    // Update the conversation history when a new response is received
    (0, react_1.useEffect)(() => {
        if (responseOutput && currentPrompt) {
            setConversationHistory((prevHistory) => [
                { prompt: currentPrompt, response: responseOutput }, // Prepend new item
                ...prevHistory,
            ]);
            setUserInput(''); // Clear the input after processing
            setCurrentPrompt(''); // Reset current prompt
        }
    }, [responseOutput]);
    // Scroll to the top when new items are prepended
    (0, react_1.useEffect)(() => {
        const container = responseContainerRef.current;
        if (container) {
            container.scrollTop = 0; // Scroll to the top to show new content
        }
    }, [conversationHistory]);
    // Custom Code Component with proper typing
    const CodeBlock = (_a) => {
        var { node, inline, className, children } = _a, props = __rest(_a, ["node", "inline", "className", "children"]);
        const match = /language-(\w+)/.exec(className || '');
        const language = match ? match[1] : 'plaintext';
        // Safely extract the code string from children
        const code = Array.isArray(children) ? children.join('') : String(children || '');
        if (!inline) {
            return (react_1.default.createElement("div", Object.assign({ style: {
                    position: 'relative',
                    marginTop: '20px',
                } }, props),
                react_1.default.createElement("div", { style: {
                        fontStyle: 'italic',
                        marginBottom: '5px',
                        textAlign: 'left', // Align language text to the left
                        fontSize: '12px', // Smaller font size for language label
                        color: '#555', // Slightly gray color
                    } }, language.toUpperCase()),
                react_1.default.createElement(react_syntax_highlighter_1.Prism, { style: prism_1.solarizedlight, language: language, PreTag: "div" }, code.replace(/\n$/, '')),
                react_1.default.createElement("button", { onClick: () => handleCopyCode(code), style: styles.copyButton, "aria-label": "Copy code to clipboard" }, "Copy")));
        }
        else {
            return (react_1.default.createElement("code", Object.assign({ className: className }, props), code));
        }
    };
    return (react_1.default.createElement("div", { style: styles.outerContainer },
        react_1.default.createElement("div", { style: styles.container },
            react_1.default.createElement("h2", { style: styles.heading }, "Prompt Input"),
            react_1.default.createElement("textarea", { rows: 10, cols: 30, placeholder: "Enter your prompt here...", value: userInput, onChange: (e) => setUserInput(e.target.value), style: styles.textarea }),
            react_1.default.createElement("button", { onClick: handleSubmit, style: styles.submitButton }, "Submit Prompt")),
        react_1.default.createElement("div", { style: styles.responseContainer, ref: responseContainerRef }, isLoading ? (react_1.default.createElement("p", { style: styles.loadingText }, "Loading...")) : (react_1.default.createElement(react_1.default.Fragment, null,
            react_1.default.createElement("h2", { style: styles.heading }, "Response Output"),
            react_1.default.createElement("div", { style: styles.historyContainer }, conversationHistory.map((item, index) => {
                // Calculate the prompt number
                const promptNumber = conversationHistory.length - index;
                return (react_1.default.createElement("div", { key: index, style: styles.conversationItem },
                    react_1.default.createElement("div", { style: styles.prompt },
                        react_1.default.createElement("strong", null,
                            "Prompt ",
                            promptNumber,
                            ":"),
                        " ",
                        item.prompt),
                    react_1.default.createElement("div", { style: styles.response },
                        react_1.default.createElement(react_markdown_1.default, { children: item.response, remarkPlugins: [remark_gfm_1.default], rehypePlugins: [rehype_raw_1.default], components: {
                                code: CodeBlock, // Use the correctly typed CodeBlock
                            } }))));
            })))))));
};
// Styles for the component
const styles = {
    outerContainer: {
        display: 'flex',
        flexDirection: 'column',
        height: '100vh', // Fill the viewport height
        width: '100%', // Ensure it takes full width of the parent
        alignItems: 'center', // Center content horizontally
        justifyContent: 'flex-start', // Align content to the top
        boxSizing: 'border-box',
    },
    container: {
        padding: '10px',
        width: '100%',
        maxWidth: '600px',
    },
    heading: {
        textAlign: 'center', // Center the heading text
        marginBottom: '20px', // Add spacing below the heading
    },
    textarea: {
        width: '100%',
        padding: '10px',
        borderRadius: '4px',
        border: '1px solid #ccc',
        marginBottom: '10px',
        resize: 'vertical', // Allow vertical resizing
        fontSize: '16px',
        boxSizing: 'border-box',
    },
    submitButton: {
        padding: '10px 20px',
        backgroundColor: '#4CAF50',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        display: 'block',
        margin: '10px auto',
        fontSize: '16px',
    },
    responseContainer: {
        flexGrow: 1, // Allow this container to grow and fill available space
        overflowY: 'auto', // Add vertical scrollbar when content exceeds available space
        padding: '10px',
        borderTop: '1px solid #ccc',
        width: '60%',
        margin: '0 auto', // Center horizontally
        textAlign: 'left', // Align text to the left for content
        boxSizing: 'border-box',
    },
    historyContainer: {
        display: 'flex',
        flexDirection: 'column',
    },
    conversationItem: {
        marginBottom: '20px',
    },
    prompt: {
        backgroundColor: '#e0f7fa', // Light blue background
        padding: '10px',
        borderRadius: '4px',
        border: '1px solid #b2ebf2',
        marginBottom: '5px',
        textAlign: 'left', // Ensure text is left-aligned
        wordBreak: 'break-word', // Handle long words
    },
    response: {
        paddingLeft: '10px',
        textAlign: 'left', // Ensure text is left-aligned
    },
    copyButton: {
        position: 'absolute',
        top: '10px',
        right: '10px',
        backgroundColor: '#4CAF50',
        color: 'white',
        border: 'none',
        padding: '5px 10px',
        cursor: 'pointer',
        fontSize: '12px',
        borderRadius: '4px',
    },
    loadingText: {
        textAlign: 'center', // Center the loading text
        fontStyle: 'italic',
    },
};
exports.default = PromptResponse;
