'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useTranslations, useLocale } from 'next-intl';
import Link from 'next/link';
import Image from 'next/image';
import api from '@/lib/api';
import type { Order } from '@/lib/types';
import { useAuthStore } from '@/store/authStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { formatPrice, formatDate } from '@/lib/utils';
import { ArrowLeft, Package, Truck, MapPin, CreditCard, Clock, CheckCircle, XCircle, AlertCircle, Phone, Mail } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

export default function OrderDetailsPage() {
  const t = useTranslations();
  const locale = useLocale();
  const router = useRouter();
  const params = useParams();
  const { isAuthenticated } = useAuthStore();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);

  const orderId = params.orderId as string;

  useEffect(() => {
    if (!isAuthenticated) {
      router.push(`/${locale}/login`);
      return;
    }
    if (orderId) {
      fetchOrderDetails();
    }
  }, [isAuthenticated, orderId]);

  const fetchOrderDetails = async () => {
    try {
      const response = await api.get(`/orders/${orderId}`);
      setOrder(response.data.data);
    } catch (error: any) {
      console.error('Failed to fetch order details:', error);
      toast({
        title: t('common.error'),
        description: error.response?.data?.message || t('orders.fetchError'),
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = async () => {
    if (!order) return;

    setCancelling(true);
    try {
      const response = await api.put(`/orders/${order._id}/cancel`);
      setOrder(response.data.data);
      toast({
        title: t('common.success'),
        description: t('orders.cancelSuccess'),
      });
    } catch (error: any) {
      console.error('Failed to cancel order:', error);
      toast({
        title: t('common.error'),
        description: error.response?.data?.message || t('orders.cancelError'),
        variant: 'destructive',
      });
    } finally {
      setCancelling(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: any = {
      pending: 'secondary',
      confirmed: 'default',
      processing: 'default',
      shipped: 'default',
      delivered: 'outline',
      cancelled: 'destructive',
    };

    const icons: any = {
      pending: <Clock className="h-3 w-3" />,
      confirmed: <CheckCircle className="h-3 w-3" />,
      processing: <Package className="h-3 w-3" />,
      shipped: <Truck className="h-3 w-3" />,
      delivered: <CheckCircle className="h-3 w-3" />,
      cancelled: <XCircle className="h-3 w-3" />,
    };

    return (
      <Badge variant={variants[status] || 'secondary'} className="gap-1">
        {icons[status]}
        {t(`orders.statuses.${status}`)}
      </Badge>
    );
  };

  const getStatusTimeline = () => {
    if (!order) return null;

    const statuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered'];
    const currentIndex = statuses.indexOf(order.orderStatus);

    return (
      <div className="space-y-4">
        {statuses.map((status, index) => (
          <div key={status} className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
              index <= currentIndex ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
            }`}>
              {index < currentIndex ? (
                <CheckCircle className="h-4 w-4" />
              ) : index === currentIndex ? (
                <Clock className="h-4 w-4" />
              ) : (
                <div className="w-2 h-2 rounded-full bg-current" />
              )}
            </div>
            <div className="flex-1">
              <p className={`font-medium ${index <= currentIndex ? 'text-foreground' : 'text-muted-foreground'}`}>
                {t(`orders.statuses.${status}`)}
              </p>
              {index === currentIndex && order.orderStatus === 'shipped' && order.trackingNumber && (
                <p className="text-sm text-muted-foreground">
                  {t('orders.trackingNumber')}: {order.trackingNumber}
                </p>
              )}
              {index === currentIndex && order.estimatedDeliveryDate && (
                <p className="text-sm text-muted-foreground">
                  {t('orders.estimatedDelivery')}: {formatDate(order.estimatedDeliveryDate, locale)}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  };

  const canCancelOrder = order && ['pending', 'confirmed'].includes(order.orderStatus);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-64 w-full" />
          </div>
          <div className="space-y-6">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-48 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <AlertCircle className="h-24 w-24 mx-auto mb-4 text-muted-foreground" />
          <h2 className="text-xl font-semibold mb-2">{t('orders.notFound')}</h2>
          <p className="text-muted-foreground mb-6">{t('orders.notFoundDesc')}</p>
          <Link href={`/${locale}/account/orders`}>
            <Button>{t('orders.backToOrders')}</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link href={`/${locale}/account/orders`}>
          <Button variant="ghost" size="sm" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            {t('orders.backToOrders')}
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">{t('orders.orderDetails')}</h1>
          <p className="text-muted-foreground">{t('orders.orderNumber')}: {order.orderNumber}</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                {t('orders.orderStatus')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  {getStatusBadge(order.orderStatus)}
                  <span className="text-sm text-muted-foreground">
                    {formatDate(order.createdAt, locale)}
                  </span>
                </div>
                {canCancelOrder && (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" size="sm" disabled={cancelling}>
                        {cancelling ? t('common.loading') : t('orders.cancelOrder')}
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>{t('orders.cancelConfirmTitle')}</AlertDialogTitle>
                        <AlertDialogDescription>
                          {t('orders.cancelConfirmDesc')}
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
                        <AlertDialogAction onClick={handleCancelOrder} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                          {t('orders.cancelOrder')}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}
              </div>
              {getStatusTimeline()}
            </CardContent>
          </Card>

          {/* Order Items */}
          <Card>
            <CardHeader>
              <CardTitle>{t('orders.orderItems')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {order.items.map((item) => (
                <div key={item._id} className="flex gap-4 p-4 border rounded-lg">
                  <div className="relative w-20 h-20 rounded-md overflow-hidden bg-muted">
                    {item.image ? (
                      <Image
                        src={item.image}
                        alt={item.name[locale as keyof typeof item.name] || item.name.en}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package className="h-8 w-8 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 space-y-1">
                    <h4 className="font-medium">
                      {item.name[locale as keyof typeof item.name] || item.name.en}
                    </h4>
                    <p className="text-sm text-muted-foreground">SKU: {item.sku}</p>
                    <div className="flex flex-wrap gap-2 text-sm">
                      {item.variantDetails.size && (
                        <Badge variant="outline">{t('products.size')}: {item.variantDetails.size}</Badge>
                      )}
                      {item.variantDetails.color && (
                        <Badge variant="outline">{t('products.color')}: {item.variantDetails.color}</Badge>
                      )}
                      {item.variantDetails.material && (
                        <Badge variant="outline">{t('products.material')}: {item.variantDetails.material}</Badge>
                      )}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        {t('cart.quantity')}: {item.quantity}
                      </span>
                      <span className="font-medium">{formatPrice(item.price * item.quantity, locale)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Customer Notes */}
          {(order.customerNote || order.adminNote) && (
            <Card>
              <CardHeader>
                <CardTitle>{t('orders.notes')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {order.customerNote && (
                  <div>
                    <h4 className="font-medium mb-2">{t('orders.customerNote')}</h4>
                    <p className="text-sm text-muted-foreground bg-muted p-3 rounded-md">
                      {order.customerNote}
                    </p>
                  </div>
                )}
                {order.adminNote && (
                  <div>
                    <h4 className="font-medium mb-2">{t('orders.adminNote')}</h4>
                    <p className="text-sm text-muted-foreground bg-muted p-3 rounded-md">
                      {order.adminNote}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Order Summary */}
          <Card>
            <CardHeader>
              <CardTitle>{t('orders.orderSummary')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span>{t('orders.subtotal')}</span>
                <span>{formatPrice(order.subtotal, locale)}</span>
              </div>
              <div className="flex justify-between">
                <span>{t('orders.shipping')}</span>
                <span>{formatPrice(order.shippingCost, locale)}</span>
              </div>
              <Separator />
              <div className="flex justify-between font-bold text-lg">
                <span>{t('orders.total')}</span>
                <span>{formatPrice(order.total, locale)}</span>
              </div>
            </CardContent>
          </Card>

          {/* Payment Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                {t('orders.paymentInfo')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span>{t('orders.paymentMethod')}</span>
                <Badge variant="outline">
                  {t(`orders.paymentMethods.${order.paymentMethod}`)}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span>{t('orders.paymentStatus')}</span>
                <Badge variant={order.paymentStatus === 'paid' ? 'default' : 'secondary'}>
                  {t(`orders.paymentStatuses.${order.paymentStatus}`)}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Shipping Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                {t('orders.shippingInfo')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span>{t('orders.shippingMethod')}</span>
                <Badge variant="outline">
                  {t(`orders.shippingMethods.${order.shippingMethod}`)}
                </Badge>
              </div>
              <Separator />
              <div className="space-y-2">
                <h4 className="font-medium">{t('orders.shippingAddress')}</h4>
                <div className="text-sm text-muted-foreground space-y-1">
                  <p className="font-medium text-foreground">{order.shippingAddress.fullName}</p>
                  <p>{order.shippingAddress.addressLine}</p>
                  <p>{order.shippingAddress.commune}, {order.shippingAddress.wilaya}</p>
                  <p className="flex items-center gap-2">
                    <Phone className="h-3 w-3" />
                    {order.shippingAddress.phone}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
