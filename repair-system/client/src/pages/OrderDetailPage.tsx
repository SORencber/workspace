import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { BarcodeDisplay } from "@/components/BarcodeDisplay";
import { StatusBadge } from "@/components/StatusBadge";
import { useToast } from "@/hooks/useToast";
import { getOrderDetails, updateOrder } from "@/api/orders";
import { OrderType } from "@/api/customers";
import { ArrowLeft, Clock, Edit, Save, ChevronDown } from "lucide-react";
import { Link } from "react-router-dom";

export function OrderDetailPage() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [order, setOrder] = useState<OrderType | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [status, setStatus] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [fetchAttempted, setFetchAttempted] = useState(false);

  // Use useCallback to prevent unnecessary re-renders
  const fetchOrderDetails = useCallback(async () => {
    if (!orderId || fetchAttempted) return;

    setIsLoading(true);
    try {
      const { order } = await getOrderDetails(orderId);
      setOrder(order);
      setStatus(order.status);
      setNotes(order.notes || "");
      setError(null);
    } catch (error: any) {
      console.error("Error fetching order details:", error);
      setError(error.message || "Failed to fetch order details");
      toast({
        title: "Error",
        description: "Failed to fetch order details",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
      setFetchAttempted(true);
    }
  }, [orderId, toast, fetchAttempted]);

  useEffect(() => {
    fetchOrderDetails();
  }, [fetchOrderDetails]);

  const handleSaveChanges = async () => {
    if (!order || !orderId) return;

    setIsLoading(true);
    try {
      const updatedOrder = await updateOrder(orderId, {
        ...order,
        status,
        notes
      });
      setOrder(updatedOrder.order);
      setIsEditing(false);
      toast({
        title: "Success",
        description: "Order updated successfully"
      });
    } catch (error: any) {
      console.error("Error updating order:", error);
      toast({
        title: "Error",
        description: "Failed to update order",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-200px)]">
        <div className="flex flex-col items-center space-y-4">
          <Clock className="h-12 w-12 animate-spin text-primary" />
          <p className="text-lg font-medium">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">Order Not Found</h1>
          <Button variant="outline" onClick={() => navigate('/orders')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Orders
          </Button>
        </div>
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-muted-foreground mb-4">The order you're looking for doesn't exist or has been removed.</p>
            <Button asChild>
              <Link to="/orders">View All Orders</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">
          Order {order.orderNumber}
        </h1>
        <div className="flex space-x-2">
          {isEditing ? (
            <Button onClick={handleSaveChanges} disabled={isLoading}>
              <Save className="mr-2 h-4 w-4" />
              Save Changes
            </Button>
          ) : (
            <Button onClick={() => setIsEditing(true)}>
              <Edit className="mr-2 h-4 w-4" />
              Edit Order
            </Button>
          )}
          <Button variant="outline" onClick={() => navigate('/orders')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Orders
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Order Information</CardTitle>
            <CardDescription>
              Basic information about this order
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Order Number</p>
                  <p className="text-lg font-semibold">{order.orderNumber}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Status</p>
                  {isEditing ? (
                    <Select value={status} onValueChange={setStatus}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="in_process">In Process</SelectItem>
                        <SelectItem value="shipped">Shipped</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="closed">Closed</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <StatusBadge status={order.status} className="mt-1" />
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Date Created</p>
                  <p>{new Date(order.createdAt).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Last Updated</p>
                  <p>{new Date(order.updatedAt).toLocaleDateString()}</p>
                </div>
              </div>

              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Amount</p>
                <p className="text-2xl font-bold">${order.totalAmount.toFixed(2)}</p>
              </div>

              <div>
                <p className="text-sm font-medium text-muted-foreground">Notes</p>
                {isEditing ? (
                  <Textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Add notes about this order"
                    className="min-h-[100px]"
                  />
                ) : (
                  <p className="text-sm text-muted-foreground">
                    {order.notes || "No notes added for this order."}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Barcode</CardTitle>
            <CardDescription>
              Scan this barcode to quickly access order information
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center py-6">
            <BarcodeDisplay
              value={order.barcode || order.orderNumber}
              printable={true}
            />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Order Items</CardTitle>
          <CardDescription>
            Items included in this order
          </CardDescription>
        </CardHeader>
        <CardContent>
          {order.items.map((item, index) => (
            <div key={index} className="mb-6 last:mb-0">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-semibold">{item.brand} - {item.model}</h3>
                <p className="font-medium">${item.totalPrice.toFixed(2)}</p>
              </div>
              <div className="rounded-md border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Part</TableHead>
                      <TableHead className="text-right">Price</TableHead>
                      <TableHead className="text-right">Quantity</TableHead>
                      <TableHead className="text-right">Subtotal</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {item.parts.map((part, partIndex) => (
                      <TableRow key={partIndex}>
                        <TableCell>{part.name}</TableCell>
                        <TableCell className="text-right">${part.price.toFixed(2)}</TableCell>
                        <TableCell className="text-right">{part.quantity}</TableCell>
                        <TableCell className="text-right font-medium">
                          ${(part.price * part.quantity).toFixed(2)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}