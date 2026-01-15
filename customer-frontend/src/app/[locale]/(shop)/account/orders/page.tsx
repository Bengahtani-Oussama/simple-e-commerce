'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations, useLocale } from 'next-intl';
import Link from 'next/link';
import api from '@/lib/api';
import type { Order } from '@/lib/types';
import { useAuthStore } from '@/store/authStore';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { formatPrice, formatDate } from '@/lib/utils';
import { Package, Eye } from 'lucide-react';

export default function OrdersPage() {
  const t = useTranslations();
  const locale = useLocale();
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push(`/${locale}/login`);
      return;
    }
    fetchOrders();
  }, [isAuthenticated]);

  const fetchOrders = async () => {
    try {
      const response = await api.get('/orders');
      setOrders(response.data.data || []);
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    } finally {
      setLoading(false);
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

    return (
      <Badge variant={variants[status] || 'secondary'}>
        {t(`orders.statuses.${status}`)}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Skeleton className="h-8 w-48 mb-6" />
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">{t('orders.title')}</h1>

      {orders.length > 0 ? (
        <div className="space-y-4">
          {orders.map((order) => (
            <Card key={order._id}>
              <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Package className="h-5 w-5 text-muted-foreground" />
                      <span className="font-semibold">{order.orderNumber}</span>
                      {getStatusBadge(order.orderStatus)}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {formatDate(order.createdAt, locale)}
                    </div>
                    <div className="text-sm">
                      <span className="text-muted-foreground">{t('orders.items')}: </span>
                      <span className="font-medium">{order.items.length}</span>
                    </div>
                  </div>

                  <div className="flex flex-col sm:items-end gap-2">
                    <div className="text-2xl font-bold text-primary">
                      {formatPrice(order.total, locale)}
                    </div>
                    <Link href={`/${locale}/account/orders/${order._id}`}>
                      <Button variant="outline" size="sm" className="gap-2">
                        <Eye className="h-4 w-4" />
                        {t('orders.viewDetails')}
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <Package className="h-24 w-24 mx-auto mb-4 text-muted-foreground" />
          <h2 className="text-xl font-semibold mb-2">{t('orders.noOrders')}</h2>
          <p className="text-muted-foreground mb-6">{t('cart.continueShopping')}</p>
          <Link href={`/${locale}/products`}>
            <Button>{t('home.hero.shopNow')}</Button>
          </Link>
        </div>
      )}
    </div>
  );
}