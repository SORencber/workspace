import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Loader2, Camera, Check, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/useToast";
import { useZxing } from "react-zxing";

interface BarcodeScannerProps {
  onBarcodeDetected: (barcode: string) => void;
  isProcessing?: boolean;
}

export function BarcodeScanner({ onBarcodeDetected, isProcessing = false }: BarcodeScannerProps) {
  const [isScanning, setIsScanning] = useState(false);
  const [cameras, setCameras] = useState<MediaDeviceInfo[]>([]);
  const [selectedCamera, setSelectedCamera] = useState<string | null>(null);
  const { toast } = useToast();
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const {
    ref,
    torch: { on: turnOnTorch, off: turnOffTorch },
    stop: stopScanner,
    start: startScanner,
    error: scannerError,
    result,
  } = useZxing({
    onDecodeResult: (result) => {
      if (result && !isProcessing) {
        onBarcodeDetected(result.getText());
        setIsScanning(false);
        stopScanner();
      }
    },
    constraints: selectedCamera
      ? { deviceId: { exact: selectedCamera } }
      : undefined,
    timeBetweenDecodingAttempts: 300,
    paused: !isScanning || isProcessing,
  });

  // Assign the ref to our local ref
  useEffect(() => {
    if (ref && typeof ref === 'function') {
      videoRef.current = null;
      ref((node: HTMLVideoElement | null) => {
        videoRef.current = node;
      });
    } else if (ref && 'current' in ref) {
      videoRef.current = ref.current;
    }
  }, [ref]);

  // Get available cameras
  useEffect(() => {
    const getCameras = async () => {
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = devices.filter(device => device.kind === 'videoinput');
        setCameras(videoDevices);
        if (videoDevices.length > 0) {
          setSelectedCamera(videoDevices[0].deviceId);
        }
      } catch (error) {
        console.error("Error getting cameras:", error);
        toast({
          title: "Camera Access Error",
          description: "Could not access your camera. Please check permissions.",
          variant: "destructive"
        });
      }
    };

    getCameras();
  }, [toast]);

  // Handle scanner errors
  useEffect(() => {
    if (scannerError) {
      console.error("Scanner error:", scannerError);
      toast({
        title: "Scanner Error",
        description: "Could not access the camera or scanner encountered an error.",
        variant: "destructive"
      });
      setIsScanning(false);
    }
  }, [scannerError, toast]);

  const startScanning = () => {
    if (!selectedCamera) {
      toast({
        title: "No Camera Available",
        description: "Could not find a camera to use for scanning.",
        variant: "destructive"
      });
      return;
    }

    setIsScanning(true);
    startScanner();
  };

  const stopScanning = () => {
    setIsScanning(false);
    stopScanner();
  };

  // Clean up on unmount
  useEffect(() => {
    return () => {
      stopScanner();
    };
  }, [stopScanner]);

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Barcode Scanner</CardTitle>
        <CardDescription>
          Position the barcode in front of your camera to scan
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="relative aspect-video rounded-md overflow-hidden bg-secondary">
          {!isScanning && (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground">
              <Camera className="h-10 w-10 mb-2" />
              <p>Camera is off</p>
            </div>
          )}

          <video
            ref={ref}
            className={`w-full h-full object-cover ${isScanning ? 'block' : 'hidden'}`}
            style={{ display: isScanning ? 'block' : 'none' }}
          />

          {isProcessing && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <div className="flex flex-col items-center text-white">
                <Loader2 className="h-10 w-10 animate-spin mb-2" />
                <p>Processing barcode...</p>
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-2">
          {!isScanning ? (
            <Button className="w-full" onClick={startScanning} disabled={isProcessing}>
              <Camera className="mr-2 h-4 w-4" />
              Start Camera
            </Button>
          ) : (
            <Button className="w-full" onClick={stopScanning} variant="outline" disabled={isProcessing}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Reset Camera
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}