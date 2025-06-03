// Simple error monitoring utility
export const errorMonitor = {
  init: () => {
    // Catch unhandled promises
    window.addEventListener('unhandledrejection', (event) => {
      console.error('Unhandled Promise Rejection:', event.reason);
      // In production, you would send this to your error monitoring service
    });

    // Catch global errors
    window.addEventListener('error', (event) => {
      console.error('Global Error:', event.error);
      // In production, you would send this to your error monitoring service
    });
  },

  // Log an error
  logError: (error: Error, context?: string) => {
    console.error(`Error${context ? ` in ${context}` : ''}:`, error);
    // In production, you would send this to your error monitoring service
  }
};