// main.tsx - Simple global error setup
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.js';
import * as Sentry from '@sentry/react';
// import { BrowserTracing } from '@sentry/tracing';


Sentry.init({
  dsn: 'https://127851e6d6bd00abd4f08fef437a9bab@o4508545652948992.ingest.de.sentry.io/4509387975622736',
  sendDefaultPii: true,
  // integrations: [new BrowserTracing()],
  tracesSampleRate: 1.0,
});

// Capture ALL unhandled errors automatically
window.addEventListener('error', (event) => {
  Sentry.captureException(event.error);
});

// Capture ALL unhandled promise rejections automatically
window.addEventListener('unhandledrejection', (event) => {
  Sentry.captureException(event.reason);
});

const SentryApp = Sentry.withErrorBoundary(App, {
  fallback: ({ error, resetError }) => (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <h2>Something went wrong</h2>
      <button onClick={resetError}>Try again</button>
    </div>
  ),
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <SentryApp />
  </StrictMode>
);
