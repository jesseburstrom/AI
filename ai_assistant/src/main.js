import { jsx as _jsx } from "react/jsx-runtime";
import React from 'react';
import ReactDOM from 'react-dom/client';
import AssistantManager from './components/AssistantManager';
//const AssistantManager = require('./components/AssistantManager').default;
import './index.css';
ReactDOM.createRoot(document.getElementById('root')).render(_jsx(React.StrictMode, { children: _jsx(AssistantManager, {}) }));
