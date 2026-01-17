import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Search, Filter, Download, Eye, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import api from '@/services/api';
import { formatPrice, formatDateTime, getStatusColor, debounce, downloadCSV } from '@/utils';
import type { Order } from '@/types';

const OrderList = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalOrders: 0,
    pendingOrders: 0,
    confirmedOrders: 0,
    shippedOrders: 0,
    deliveredOrders: 0,
    cancelledOrders: 0,
  });

  // Filters
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || '');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 20;

  useEffect(() => {
    fetchOrders();
  }, [search, statusFilter, paymentStatusFilter, dateFrom, dateTo, page]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const params: any = {
        page,
        limit,
      };

      if (search) params.search = search;
      if (statusFilter) params.status = statusFilter;
      if (paymentStatusFilter && paymentStatusFilter !== 'all') params.paymentStatus = paymentStatusFilter;
      if (dateFrom) params.startDate = dateFrom;
      if (dateTo) params.endDate = dateTo;

      const response = await api.get('/admin/orders', { params });
      setOrders(response.data.data || []);
      setTotal(response.data.total || 0);
      
      if (response.data.stats) {
        setStats(response.data.stats);
      }
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = debounce((value: string) => {
    setSearch(value);
    setPage(1);
  }, 500);

  const handleStatusFilterChange = (value: string) => {
    setStatusFilter(value);
    setPage(1);
    if (value) {
      setSearchParams({ status: value });
    } else {
      setSearchParams({});
    }
  };

  const clearFilters = () => {
    setSearch('');
    setStatusFilter('');
    setPaymentStatusFilter('all');
    setDateFrom('');
    setDateTo('');
    setPage(1);
    setSearchParams({});
  };

  const handleExportOrders = () => {
    const exportData = orders.map((order) => ({
      'Order Number': order.orderNumber,
      'Date': formatDateTime(order.createdAt),
      'Customer': order.shippingAddress.fullName,
      'Phone': order.shippingAddress.phone,
      'Wilaya': order.shippingAddress.wilaya,
      'Items': order.items.length,
      'Total': order.total,
      'Status': order.orderStatus,
      'Payment Status': order.paymentStatus,
    }));

    downloadCSV(exportData, `orders-${new Date().toISOString().split('T')[0]}.csv`);
  };

  const totalPages = Math.ceil(total / limit);

  const statusTabs = [
    { value: '', label: 'All Orders', count: stats.totalOrders },
    { value: 'pending', label: 'Pending', count: stats.pendingOrders },
    { value: 'confirmed', label: 'Confirmed', count: stats.confirmedOrders },
    { value: 'shipped', label: 'Shipped', count: stats.shippedOrders },
    { value: 'delivered', label: 'Delivered', count: stats.deliveredOrders },
    { value: 'cancelled', label: 'Cancelled', count: stats.cancelledOrders },
  ];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Orders</h2>
          <p className="text-muted-foreground">
            Manage and process customer orders ({total} orders)
          </p>
        </div>
        <Button onClick={handleExportOrders} variant="outline">
          <Download className="mr-2 h-4 w-4" />
          Export CSV
        </Button>
      </div>

      {/* Status Tabs */}
      <Tabs value={statusFilter} onValueChange={handleStatusFilterChange}>
        <TabsList className="grid w-full grid-cols-6">
          {statusTabs.map((tab) => (
            <TabsTrigger key={tab.value} value={tab.value} className="relative">
              {tab.label}
              {tab.count > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {tab.count}
                </Badge>
              )}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Advanced Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {/* Search */}
            <div className="lg:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search by order number, customer name..."
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-10"
                  defaultValue={search}
                />
              </div>
            </div>

            {/* Payment Status */}
            <Select value={paymentStatusFilter} onValueChange={setPaymentStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Payment Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Payment Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
                <SelectItem value="refunded">Refunded</SelectItem>
              </SelectContent>
            </Select>

            {/* Date Range */}
            <div className="flex gap-2">
              <Input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                placeholder="From"
              />
              <Input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                placeholder="To"
              />
            </div>
          </div>

          {(search || statusFilter || paymentStatusFilter || dateFrom || dateTo) && (
            <div className="mt-4">
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                Clear All Filters
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Orders Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Items</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Payment</TableHead>
                <TableHead className="w-[80px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <TableRow key={i}>
                    <TableCell colSpan={9}>
                      <div className="h-12 bg-muted animate-pulse rounded" />
                    </TableCell>
                  </TableRow>
                ))
              ) : orders.length > 0 ? (
                orders.map((order) => (
                  <TableRow
                    key={order._id}
                    className="cursor-pointer hover:bg-accent/50"
                    onClick={() => navigate(`/orders/${order._id}`)}
                  >
                    <TableCell>
                      <div className="font-medium">#{order.orderNumber}</div>
                      <div className="text-xs text-muted-foreground">
                        {order.trackingNumber && `Tracking: ${order.trackingNumber}`}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">{formatDateTime(order.createdAt)}</div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{order.shippingAddress.fullName}</div>
                      <div className="text-xs text-muted-foreground">
                        {order.shippingAddress.phone}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">{order.shippingAddress.wilaya}</div>
                      <div className="text-xs text-muted-foreground">
                        {order.shippingAddress.commune}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Package className="h-4 w-4 text-muted-foreground" />
                        <span>{order.items.length} items</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-semibold text-lg">{formatPrice(order.total)}</div>
                      {order.hasReturn && (
                        <Badge variant="destructive" className="text-xs">
                          Return: {formatPrice(order.returnTotal)}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(order.orderStatus)}>
                        {order.orderStatus}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          order.paymentStatus === 'paid'
                            ? 'default'
                            : order.paymentStatus === 'pending'
                            ? 'secondary'
                            : 'destructive'
                        }
                      >
                        {order.paymentStatus}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/orders/${order._id}`);
                        }}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8">
                    <Package className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground">No orders found</p>
                    {(search || statusFilter) && (
                      <Button variant="link" onClick={clearFilters} className="mt-2">
                        Clear filters
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {(page - 1) * limit + 1} to {Math.min(page * limit, total)} of{' '}
            {total} orders
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(page - 1)}
              disabled={page === 1}
            >
              Previous
            </Button>
            <div className="flex gap-1">
              {[...Array(Math.min(5, totalPages))].map((_, i) => {
                const pageNum = i + 1;
                return (
                  <Button
                    key={pageNum}
                    variant={page === pageNum ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setPage(pageNum)}
                  >
                    {pageNum}
                  </Button>
                );
              })}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(page + 1)}
              disabled={page === totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderList;