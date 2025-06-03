import { useEffect, useState } from "react";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";
import { AlertCircle, CheckCircle, RefreshCw } from "lucide-react";
import { Button } from "./ui/button";
import { useServerPort } from "@/utils/serverPort";

export function ServerStatus() {
  const { isConnected, error } = useServerPort();
  const [isVisible, setIsVisible] = useState(false);
  const [dismissedError, setDismissedError] = useState<string | null>(null);

  useEffect(() => {
    // Only show the status if there's an error and it's not the same as the dismissed one
    if (error && error !== dismissedError) {
      setIsVisible(true);
    } else if (isConnected) {
      // When connection is successful, show briefly then hide
      setIsVisible(true);
      const timer = setTimeout(() => {
        setIsVisible(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isConnected, error, dismissedError]);

  const handleDismiss = () => {
    setIsVisible(false);
    if (error) {
      setDismissedError(error);
    }
  };

  const handleRetry = () => {
    // Reset the dismissed error so the alert can show again
    setDismissedError(null);
    // Dispatch custom event to trigger a retry
    window.dispatchEvent(new CustomEvent('server-retry'));
  };

  // Handle automatic reload if needed
  const handleReload = () => {
    window.location.reload();
  };

  if (!isVisible) return null;

  return (
    <Alert
      variant={isConnected ? "default" : "destructive"}
      className="fixed bottom-4 right-4 w-auto max-w-md z-50 shadow-lg bg-background"
    >
      {isConnected ? (
        <CheckCircle className="h-4 w-4" />
      ) : (
        <AlertCircle className="h-4 w-4" />
      )}
      <AlertTitle>
        {isConnected ? "Connected to server" : "Server connection issue"}
      </AlertTitle>
      <AlertDescription>
        {isConnected
          ? "Your application is successfully connected to the server."
          : `${error || "Cannot connect to the server. Please check if the server is running."}`
        }
      </AlertDescription>
      <div className="mt-2 flex justify-end gap-2">
        {!isConnected && (
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRetry}
              className="flex items-center"
            >
              <RefreshCw className="mr-2 h-3 w-3" />
              Retry Connection
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={handleReload}
              className="flex items-center"
            >
              Reload Page
            </Button>
          </>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={handleDismiss}
        >
          Dismiss
        </Button>
      </div>
    </Alert>
  );
}