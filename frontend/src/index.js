import React from 'react';
import ReactDOM from 'react-dom/client';
import './App.css';
import App from './App';

// Evita overlay de "Uncaught runtime errors" para AbortError (cancelamento/Strict Mode)
window.addEventListener('unhandledrejection', (e) => {
  const reason = e?.reason;
  if (reason?.name === 'AbortError' || (reason?.message && /signal is aborted|aborted without reason/i.test(reason.message))) {
    e.preventDefault();
  }
});

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);