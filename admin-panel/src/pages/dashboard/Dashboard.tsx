import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ShoppingCart,
  Package,
  Users,
  DollarSign,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Eye,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import api from '@/services/api';
import { formatPrice, formatDate, getStatusColor } from '@/utils';
import type { Order, DashboardStats } from '@/types';

const Dashboard = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      // In a real app, you'd have a dedicated stats endpoint
      // For now, we'll fetch basic data
      // const [ordersRes, productsRes, customersRes] = await Promise.all([
      const [ordersRes, productsRes ] = await Promise.all([
        api.get('/admin/orders?limit=5'),
        api.get('/products?limit=1'),
        // api.get('/admin/users?limit=1'),
      ]);

      const mockStats: DashboardStats = {
        totalRevenue: ordersRes.data.data.reduce(
          (sum: number, order: Order) => sum + order.total,
          0
        ),
        totalOrders: ordersRes.data.total || 0,
        totalCustomers:  0,
        // totalCustomers: customersRes.data.total || 0,
        totalProducts: productsRes.data.total || 0,
        pendingOrders: ordersRes.data.stats?.pendingOrders || 0,
        lowStockProducts: 0,
        recentOrders: ordersRes.data.data || [],
        topProducts: [],
        revenueByMonth: generateMockRevenueData(),
        ordersByStatus: generateMockStatusData(),
      };

      setStats(mockStats);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateMockRevenueData = () => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    return months.map((month) => ({
      month,
      revenue: Math.floor(Math.random() * 50000) + 20000,
    }));
  };

  const generateMockStatusData = () => {
    return [
      { status: 'Pending', count: 12 },
      { status: 'Confirmed', count: 8 },
      { status: 'Shipped', count: 15 },
      { status: 'Delivered', count: 45 },
    ];
  };

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div className="h-4 w-24 bg-muted animate-pulse rounded" />
              <div className="h-8 w-8 bg-muted animate-pulse rounded" />
            </CardHeader>
            <CardContent>
              <div className="h-8 w-32 bg-muted animate-pulse rounded mb-2" />
              <div className="h-4 w-20 bg-muted animate-pulse rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!stats) return null;

  const statCards = [
    {
      title: 'Total Revenue',
      value: formatPrice(stats.totalRevenue),
      change: '+12.5%',
      trend: 'up',
      icon: DollarSign,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      title: 'Total Orders',
      value: stats.totalOrders.toString(),
      change: '+8.2%',
      trend: 'up',
      icon: ShoppingCart,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      title: 'Total Products',
      value: stats.totalProducts.toString(),
      change: '+2.1%',
      trend: 'up',
      icon: Package,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
    {
      title: 'Total Customers',
      value: stats.totalCustomers.toString(),
      change: '+15.3%',
      trend: 'up',
      icon: Users,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                {stat.trend === 'up' ? (
                  <ArrowUpRight className="h-3 w-3 text-green-600" />
                ) : (
                  <ArrowDownRight className="h-3 w-3 text-red-600" />
                )}
                <span className={stat.trend === 'up' ? 'text-green-600' : 'text-red-600'}>
                  {stat.change}
                </span>
                <span>from last month</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Revenue Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Revenue Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={stats.revenueByMonth}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip
                  formatter={(value: number | undefined) => formatPrice(value as number)}
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="#4F46E5"
                  strokeWidth={2}
                  dot={{ fill: '#4F46E5' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Orders by Status */}
        <Card>
          <CardHeader>
            <CardTitle>Orders by Status</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stats.ordersByStatus}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="status" />
                <YAxis />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                  }}
                />
                <Legend />
                <Bar dataKey="count" fill="#10B981" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Recent Orders */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Recent Orders</CardTitle>
          <Button variant="ghost" size="sm" asChild>
            <Link to="/orders">
              View All
              <ArrowUpRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {stats.recentOrders.length > 0 ? (
              stats.recentOrders.map((order: Order) => (
                <div
                  key={order._id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium">#{order.orderNumber}</span>
                      <Badge className={getStatusColor(order.orderStatus)}>
                        {order.orderStatus}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {order.shippingAddress.fullName} • {order.items.length} items
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(order.createdAt)}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-lg">{formatPrice(order.total)}</div>
                    <Button variant="ghost" size="sm" asChild>
                      <Link to={`/orders/${order._id}`}>
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Link>
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No recent orders
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <Link to="/products/create">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Package className="h-5 w-5 text-primary" />
                Add New Product
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Create and publish a new product
              </p>
            </CardContent>
          </Link>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <Link to="/orders?status=pending">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <ShoppingCart className="h-5 w-5 text-primary" />
                Pending Orders ({stats.pendingOrders})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Review and process pending orders
              </p>
            </CardContent>
          </Link>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <Link to="/products?stock=low">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                Low Stock Items ({stats.lowStockProducts})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Products that need restocking
              </p>
            </CardContent>
          </Link>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;