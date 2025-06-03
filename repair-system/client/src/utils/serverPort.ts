import { useState, useEffect, useRef } from 'react';

export const useServerPort = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [apiEndpoint] = useState('/api/ping');
  const checkIntervalRef = useRef<number | null>(null);
  
  // Track the previous connection state to avoid too many notifications
  const lastConnectedRef = useRef(false);

  useEffect(() => {
    const checkServerConnection = async () => {
      try {
        // Use relative URL path to respect proxy settings in vite.config.ts
        const response = await fetch(apiEndpoint, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
          cache: 'no-cache',
          // Add a timeout to prevent hanging requests
          signal: AbortSignal.timeout(5000)
        });

        if (response.ok) {
          setIsConnected(true);
          setError(null);
          
          // Only log reconnection if previously disconnected
          if (!lastConnectedRef.current) {
            console.log('Server connection established');
          }
          lastConnectedRef.current = true;
        } else {
          if (lastConnectedRef.current) {
            console.warn(`Server connection lost: ${response.status}`);
          }
          setIsConnected(false);
          setError(`Server responded with status: ${response.status}`);
          lastConnectedRef.current = false;
        }
      } catch (err: any) {
        if (lastConnectedRef.current) {
          console.warn('Server connection lost', err);
        }
        setIsConnected(false);
        setError(err.name === 'TimeoutError' 
          ? 'Connection timeout. Server is not responding.' 
          : 'Cannot connect to server. Please ensure it is running.');
        lastConnectedRef.current = false;
      }
    };

    // Check connection immediately
    checkServerConnection();

    // Check periodically (every 30 seconds)
    const interval = setInterval(checkServerConnection, 30000);
    checkIntervalRef.current = interval as unknown as number;

    // Add event listener for retry attempts
    const handleRetry = () => {
      checkServerConnection();
    };
    window.addEventListener('server-retry', handleRetry);

    return () => {
      clearInterval(interval);
      window.removeEventListener('server-retry', handleRetry);
      // Clean up any other resources or event listeners
    };
  }, [apiEndpoint]);

  return { isConnected, error };
};