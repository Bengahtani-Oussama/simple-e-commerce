import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Package,
  MapPin,
  CreditCard,
  Truck,
  Calendar,
  Phone,
  Mail,
  Edit,
  CheckCircle,
  XCircle,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import api from "@/services/api";
import {
  formatPrice,
  formatDateTime,
  getStatusColor,
  getImageUrl,
} from "@/utils";
import type { Order, OrderItem } from "@/types";
import { cn } from "@/lib/utils";

const OrderDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  // Status Update Dialog
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [newStatus, setNewStatus] = useState("");
  const [trackingNumber, setTrackingNumber] = useState("");
  const [estimatedDelivery, setEstimatedDelivery] = useState("");
  const [adminNote, setAdminNote] = useState("");

  // Return Dialog
  const [returnDialogOpen, setReturnDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<OrderItem | null>(null);
  const [returnStatus, setReturnStatus] = useState("");
  const [returnQuantity, setReturnQuantity] = useState(1);
  const [returnReason, setReturnReason] = useState("");

  useEffect(() => {
    fetchOrder();
  }, [id]);

  const fetchOrder = async () => {
    try {
      const response = await api.get(`/admin/orders/${id}`);
      const orderData = response.data.data;
      setOrder(orderData);
      setNewStatus(orderData.orderStatus);
      setTrackingNumber(orderData.trackingNumber || "");
      setEstimatedDelivery(
        orderData.estimatedDeliveryDate
          ? new Date(orderData.estimatedDeliveryDate)
              .toISOString()
              .split("T")[0]
          : "",
      );
      setAdminNote(orderData.adminNote || "");
    } catch (error) {
      console.error("Failed to fetch order:", error);
      alert("Failed to load order");
      navigate("/orders");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async () => {
    setUpdating(true);
    try {
      await api.put(`/admin/orders/${id}/status`, {
        orderStatus: newStatus,
        trackingNumber: trackingNumber || undefined,
        estimatedDeliveryDate: estimatedDelivery || undefined,
        adminNote: adminNote || undefined,
      });

      alert("Order status updated successfully!");
      setStatusDialogOpen(false);
      fetchOrder();
    } catch (error: any) {
      console.error("Failed to update status:", error);
      alert(error.response?.data?.message || "Failed to update status");
    } finally {
      setUpdating(false);
    }
  };

  const handleProcessReturn = async () => {
    if (!selectedItem) return;

    setUpdating(true);
    try {
      await api.put(`/admin/orders/${id}/items/${selectedItem._id}/return`, {
        returnStatus,
        returnQuantity,
        returnReason,
      });

      alert("Return processed successfully!");
      setReturnDialogOpen(false);
      setSelectedItem(null);
      fetchOrder();
    } catch (error: any) {
      console.error("Failed to process return:", error);
      alert(error.response?.data?.message || "Failed to process return");
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="h-12 w-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading order...</p>
        </div>
      </div>
    );
  }

  if (!order) return null;

  const statusOptions = [
    {
      value: "pending",
      label: "Pending",
      icon: AlertCircle,
      color: "text-yellow-600",
    },
    {
      value: "confirmed",
      label: "Confirmed",
      icon: CheckCircle,
      color: "text-blue-600",
    },
    {
      value: "processing",
      label: "Processing",
      icon: Package,
      color: "text-purple-600",
    },
    {
      value: "shipped",
      label: "Shipped",
      icon: Truck,
      color: "text-indigo-600",
    },
    {
      value: "delivered",
      label: "Delivered",
      icon: CheckCircle,
      color: "text-green-600",
    },
    {
      value: "cancelled",
      label: "Cancelled",
      icon: XCircle,
      color: "text-red-600",
    },
  ];

  const currentStatusIndex = statusOptions.findIndex(
    (s) => s.value === order.orderStatus,
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/orders")}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h2 className="text-2xl font-bold">Order #{order.orderNumber}</h2>
            <p className="text-muted-foreground">
              {formatDateTime(order.createdAt)}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Badge
            className={cn(
              getStatusColor(order.orderStatus),
              "text-base px-4 py-1",
            )}
          >
            {order.orderStatus}
          </Badge>
          <Button onClick={() => setStatusDialogOpen(true)}>
            <Edit className="mr-2 h-4 w-4" />
            Update Status
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Timeline */}
          <Card>
            <CardHeader>
              <CardTitle>Order Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {statusOptions.map((status, index) => {
                  const isCompleted = index <= currentStatusIndex;
                  const isCurrent = index === currentStatusIndex;
                  const StatusIcon = status.icon;

                  return (
                    <div key={status.value} className="flex items-center gap-4">
                      <div
                        className={`flex h-10 w-10 items-center justify-center rounded-full border-2 ${
                          isCompleted
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-muted bg-muted text-muted-foreground"
                        }`}
                      >
                        <StatusIcon className="h-5 w-5" />
                      </div>
                      <div className="flex-1">
                        <div
                          className={`font-medium ${
                            isCurrent
                              ? "text-primary"
                              : isCompleted
                                ? ""
                                : "text-muted-foreground"
                          }`}
                        >
                          {status.label}
                        </div>
                        {isCurrent && order.updatedAt && (
                          <div className="text-xs text-muted-foreground">
                            {formatDateTime(order.updatedAt)}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Order Items */}
          <Card>
            <CardHeader>
              <CardTitle>Order Items ({order.items.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {order.items.map((item) => (
                  <div
                    key={item._id}
                    className="flex gap-4 p-4 border rounded-lg"
                  >
                    <img
                      src={getImageUrl(item.image)}
                      alt={item.name.en}
                      className="h-20 w-20 object-cover rounded-lg"
                    />
                    <div className="flex-1">
                      <div className="font-medium">{item.name.en}</div>
                      <div className="text-sm text-muted-foreground">
                        SKU: {item.sku}
                      </div>
                      {item.variantDetails && (
                        <div className="text-xs text-muted-foreground">
                          {item.variantDetails.size &&
                            `Size: ${item.variantDetails.size} `}
                          {item.variantDetails.color &&
                            `• Color: ${item.variantDetails.color}`}
                        </div>
                      )}
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-sm">Qty: {item.quantity}</span>
                        {item.returnStatus !== "none" && (
                          <Badge variant="destructive" className="text-xs">
                            Return: {item.returnStatus}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">
                        {formatPrice(item.price)}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Total: {formatPrice(item.price * item.quantity)}
                      </div>
                      {item.returnStatus === "requested" && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="mt-2"
                          onClick={() => {
                            setSelectedItem(item);
                            setReturnStatus("approved");
                            setReturnQuantity(item.returnQuantity || 1);
                            setReturnReason(item.returnReason || "");
                            setReturnDialogOpen(true);
                          }}
                        >
                          Process Return
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Customer Notes */}
          {order.customerNote && (
            <Card>
              <CardHeader>
                <CardTitle>Customer Note</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{order.customerNote}</p>
              </CardContent>
            </Card>
          )}

          {/* Admin Notes */}
          {order.adminNote && (
            <Card>
              <CardHeader>
                <CardTitle>Admin Note</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{order.adminNote}</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Order Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-medium">
                  {formatPrice(order.subtotal)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Shipping</span>
                <span className="font-medium">
                  {formatPrice(order.shippingCost)}
                </span>
              </div>
              <Separator />
              <div className="flex justify-between text-lg font-bold">
                <span>Total</span>
                <span className="text-primary">{formatPrice(order.total)}</span>
              </div>
              {order.hasReturn && (
                <>
                  <Separator />
                  <div className="flex justify-between text-red-600">
                    <span>Return Amount</span>
                    <span className="font-semibold">
                      -{formatPrice(order.returnTotal)}
                    </span>
                  </div>
                  <div className="flex justify-between text-lg font-bold">
                    <span>Net Total</span>
                    <span>{formatPrice(order.total - order.returnTotal)}</span>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Customer Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Customer Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <div className="text-sm text-muted-foreground">Name</div>
                <div className="font-medium">
                  {order.shippingAddress.fullName}
                </div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Phone</div>
                <div className="font-medium flex items-center gap-2">
                  <Phone className="h-3 w-3" />
                  {order.shippingAddress.phone}
                </div>
              </div>
              <Separator />
              <div>
                <div className="text-sm text-muted-foreground">
                  Shipping Address
                </div>
                <div className="text-sm mt-1">
                  {order.shippingAddress.addressLine}
                  <br />
                  {order.shippingAddress.commune},{" "}
                  {order.shippingAddress.wilaya}
                  {order.shippingAddress.postalCode && (
                    <>, {order.shippingAddress.postalCode}</>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Shipping Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Truck className="h-4 w-4" />
                Shipping Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <div className="text-sm text-muted-foreground">Method</div>
                <div className="font-medium">
                  {order.shippingMethod === "home_delivery"
                    ? "Home Delivery"
                    : "Office Pickup"}
                </div>
              </div>
              {order.trackingNumber && (
                <div>
                  <div className="text-sm text-muted-foreground">
                    Tracking Number
                  </div>
                  <div className="font-medium font-mono">
                    {order.trackingNumber}
                  </div>
                </div>
              )}
              {order.estimatedDeliveryDate && (
                <div>
                  <div className="text-sm text-muted-foreground">
                    Estimated Delivery
                  </div>
                  <div className="font-medium flex items-center gap-2">
                    <Calendar className="h-3 w-3" />
                    {formatDateTime(order.estimatedDeliveryDate)}
                  </div>
                </div>
              )}
              {order.deliveredAt && (
                <div>
                  <div className="text-sm text-muted-foreground">
                    Delivered On
                  </div>
                  <div className="font-medium text-green-600">
                    {formatDateTime(order.deliveredAt)}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Payment Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-4 w-4" />
                Payment Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <div className="text-sm text-muted-foreground">Method</div>
                <div className="font-medium">Cash on Delivery</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Status</div>
                <Badge
                  variant={
                    order.paymentStatus === "paid"
                      ? "default"
                      : order.paymentStatus === "pending"
                        ? "secondary"
                        : "destructive"
                  }
                >
                  {order.paymentStatus}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Update Status Dialog */}
      <Dialog open={statusDialogOpen} onOpenChange={setStatusDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Update Order Status</DialogTitle>
            <DialogDescription>
              Change the order status and add tracking information
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Order Status *</Label>
              <Select value={newStatus} onValueChange={setNewStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map((status) => (
                    <SelectItem key={status.value} value={status.value}>
                      {status.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {(newStatus === "shipped" || newStatus === "delivered") && (
              <div>
                <Label>Tracking Number</Label>
                <Input
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  placeholder="Enter tracking number"
                />
              </div>
            )}

            {newStatus === "shipped" && (
              <div>
                <Label>Estimated Delivery Date</Label>
                <Input
                  type="date"
                  value={estimatedDelivery}
                  onChange={(e) => setEstimatedDelivery(e.target.value)}
                />
              </div>
            )}

            <div>
              <Label>Admin Note (Optional)</Label>
              <Textarea
                value={adminNote}
                onChange={(e) => setAdminNote(e.target.value)}
                placeholder="Add internal notes..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setStatusDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleUpdateStatus} disabled={updating}>
              {updating ? "Updating..." : "Update Status"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Process Return Dialog */}
      <Dialog open={returnDialogOpen} onOpenChange={setReturnDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Process Return Request</DialogTitle>
            <DialogDescription>
              Review and approve the return request for {selectedItem?.name.en}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Return Status *</Label>
              <Select value={returnStatus} onValueChange={setReturnStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="approved">Approve Return</SelectItem>
                  <SelectItem value="rejected">Reject Return</SelectItem>
                  <SelectItem value="completed">Mark as Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Return Quantity *</Label>
              <Input
                type="number"
                min="1"
                max={selectedItem?.quantity || 1}
                value={returnQuantity}
                onChange={(e) => setReturnQuantity(Number(e.target.value))}
              />
            </div>

            <div>
              <Label>Return Reason</Label>
              <Textarea
                value={returnReason}
                onChange={(e) => setReturnReason(e.target.value)}
                rows={3}
                readOnly
              />
            </div>

            {returnStatus === "approved" && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm">
                <strong>Note:</strong> Stock will be automatically restored when
                return is approved or completed.
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setReturnDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleProcessReturn} disabled={updating}>
              {updating ? "Processing..." : "Process Return"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default OrderDetail;
