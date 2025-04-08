import React from 'react';
import ReactDOM from 'react-dom/client';
//import AssistantManager from './components/AssistantManager';
const AssistantManager = require('./components/AssistantManager').default;
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AssistantManager />
  </React.StrictMode>
);
