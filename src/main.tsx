import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './app/App';
import { mockService } from './services/mockService';

async function bootstrapAndRender() {
  // Wait for live API bootstrap (with a 5s timeout fallback) before mounting UI
  await Promise.race([
    mockService.syncWithApi(),
    new Promise<void>((resolve) => setTimeout(resolve, 5000)),
  ]);

  ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}

bootstrapAndRender();
