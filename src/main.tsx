import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// Once the SW is active, reload once so COOP/COEP headers take effect —
// enabling SharedArrayBuffer (required by WebLLM) on GitHub Pages.
if (!window.crossOriginIsolated && 'serviceWorker' in navigator) {
  navigator.serviceWorker.ready.then(() => {
    if (!window.crossOriginIsolated) window.location.reload();
  });
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
