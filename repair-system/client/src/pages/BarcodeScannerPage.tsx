import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { BarcodeScanner } from "@/components/BarcodeScanner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/useToast";
import { getOrdersByBarcode, getOrderDetails, updateOrder } from "@/api/orders";
import { OrderType } from "@/api/customers";
import { StatusBadge } from "@/components/StatusBadge";
import { AlertCircle, ArrowLeft, CheckCircle2, PackageCheck } from "lucide-react";

export function BarcodeScannerPage() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);
  const [scannedOrder, setScannedOrder] = useState<OrderType | null>(null);
  const [newStatus, setNewStatus] = useState<string>("");
  const [scanSuccess, setScanSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleBarcodeDetected = async (barcode: string) => {
    setIsProcessing(true);
    setError(null);
    setScanSuccess(false);

    try {
      // Search for order by barcode
      const { orders } = await getOrdersByBarcode(barcode);

      if (orders && orders.length > 0) {
        const order = orders[0];
        setScannedOrder(order);
        setNewStatus(getNextStatus(order.status));
      } else {
        setError("No order found with this barcode. Please try again.");
        setScannedOrder(null);
      }
    } catch (err) {
      console.error("Error finding order:", err);
      setError("Error finding order. Please try again.");
      setScannedOrder(null);
    } finally {
      setIsProcessing(false);
    }
  };

  const getNextStatus = (currentStatus: string): string => {
    switch (currentStatus) {
      case 'pending':
        return 'in_process';
      case 'in_process':
        return 'shipped';
      case 'shipped':
        return 'completed';
      case 'completed':
        return 'closed';
      default:
        return 'pending';
    }
  };

  const handleUpdateStatus = async () => {
    if (!scannedOrder || !newStatus) return;

    setIsProcessing(true);
    try {
      await updateOrder(scannedOrder._id, {
        ...scannedOrder,
        status: newStatus
      });

      toast({
        title: "Status Updated",
        description: `Order ${scannedOrder.orderNumber} updated to ${newStatus.replace('_', ' ')}`,
      });

      setScanSuccess(true);

      // Update local state
      setScannedOrder({
        ...scannedOrder,
        status: newStatus
      });
    } catch (error) {
      console.error("Error updating order status:", error);
      toast({
        title: "Update Failed",
        description: "Could not update the order status",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReset = () => {
    setScannedOrder(null);
    setNewStatus("");
    setScanSuccess(false);
    setError(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Barcode Scanner</h1>
        <Button variant="outline" onClick={() => navigate('/orders')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Orders
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <BarcodeScanner
            onBarcodeDetected={handleBarcodeDetected}
            isProcessing={isProcessing}
          />

          {error && (
            <Alert variant="destructive" className="mt-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {scanSuccess && (
            <Alert className="mt-4 bg-green-100 dark:bg-green-900/30 border-green-200 dark:border-green-900/50">
              <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
              <AlertTitle className="text-green-600 dark:text-green-400">Success</AlertTitle>
              <AlertDescription>Order status updated successfully</AlertDescription>
            </Alert>
          )}
        </div>

        {scannedOrder && (
          <Card>
            <CardHeader>
              <CardTitle>Order Information</CardTitle>
              <CardDescription>
                Details for the scanned order
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="font-medium">Order Number:</span>
                  <span>{scannedOrder.orderNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Current Status:</span>
                  <StatusBadge status={scannedOrder.status} />
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Date Created:</span>
                  <span>{new Date(scannedOrder.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Total Amount:</span>
                  <span>${scannedOrder.totalAmount.toFixed(2)}</span>
                </div>
              </div>

              <div className="pt-4 border-t">
                <div className="mb-2 font-medium">Update Status:</div>
                <Select
                  value={newStatus}
                  onValueChange={setNewStatus}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select new status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="in_process">In Process</SelectItem>
                    <SelectItem value="shipped">Shipped</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-2 pt-4">
                <Button onClick={handleUpdateStatus} disabled={!newStatus || isProcessing} className="flex-1">
                  <PackageCheck className="mr-2 h-4 w-4" />
                  Update Status
                </Button>
                <Button onClick={handleReset} variant="outline" className="flex-1">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Scan Another
                </Button>
              </div>

              <Button
                variant="secondary"
                className="w-full"
                onClick={() => navigate(`/orders/${scannedOrder._id}`)}
              >
                View Full Order Details
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}