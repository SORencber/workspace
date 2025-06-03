import { StrictMode, Suspense } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { errorMonitor } from './utils/errorMonitor'

// Initialize error monitoring
errorMonitor.init();

// Setup performance monitoring
if ('performance' in window && 'measure' in performance) {
  performance.mark('app-start');
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Suspense fallback={<div className="flex h-screen items-center justify-center">Loading Application...</div>}>
      <App />
    </Suspense>
  </StrictMode>,
)

// Measure initial load performance
if ('performance' in window && 'measure' in performance) {
  window.addEventListener('load', () => {
    performance.mark('app-loaded');
    performance.measure('app-startup', 'app-start', 'app-loaded');
    const measure = performance.getEntriesByName('app-startup')[0];
    console.log(`App startup time: ${measure.duration.toFixed(2)}ms`);
  });
}