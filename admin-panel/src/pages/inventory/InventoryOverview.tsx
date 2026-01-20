// admin-panel/src/pages/inventory/InventoryOverview.tsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Package,
  AlertTriangle,
  TrendingDown,
  Search,
  Filter,
  Download,
  RefreshCw,
  Edit,
  Eye,
  MoreHorizontal,
  History,
  DollarSign,
  Box,
  AlertCircle,
  CheckCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import api from '@/services/api';
import { formatPrice, debounce, downloadCSV, getImageUrl } from '@/utils';
import type { InventoryItem, InventoryStats } from '@/types';

const InventoryOverview = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<InventoryStats>({
    totalProducts: 0,
    totalVariants: 0,
    lowStockItems: 0,
    outOfStock: 0,
    totalStockValue: 0,
  });

  // Filters
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [stockFilter, setStockFilter] = useState('all'); // all, low, out
  const [statusFilter, setStatusFilter] = useState('all'); // all, active, inactive
  const [lowStockThreshold, setLowStockThreshold] = useState(10);

  // Categories for filter
  const [categories, setCategories] = useState<Array<{ _id: string; name: { en: string } }>>([]);

  useEffect(() => {
    fetchInventory();
    fetchCategories();
  }, [lowStockThreshold]);

  useEffect(() => {
    applyFilters();
  }, [search, categoryFilter, stockFilter, statusFilter, items]);

  const fetchInventory = async () => {
    setLoading(true);
    try {
      const response = await api.get('/admin/inventory/overview', {
        params: { lowStockThreshold },
      });
      const inventoryData = response.data.data;
      setItems(inventoryData.items || []);
      setStats(inventoryData.stats || stats);
    } catch (error) {
      console.error('Failed to fetch inventory:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await api.get('/categories', { params: { active: true } });
      setCategories(response.data.data || []);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  };

  const applyFilters = () => {
    let filtered = [...items];

    // Search filter
    if (search) {
      filtered = filtered.filter(
        (item) =>
          item.productName.en.toLowerCase().includes(search.toLowerCase()) ||
          item.sku.toLowerCase().includes(search.toLowerCase())
      );
    }

    // Category filter
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(
        (item) => item.category?._id === categoryFilter
      );
    }

    // Stock level filter
    if (stockFilter === 'low') {
      filtered = filtered.filter((item) => item.isLowStock && item.stock > 0);
    } else if (stockFilter === 'out') {
      filtered = filtered.filter((item) => item.stock === 0);
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(
        (item) => item.isActive === (statusFilter === 'active')
      );
    }

    setFilteredItems(filtered);
  };

  const handleSearch = debounce((value: string) => {
    setSearch(value);
  }, 300);

  const clearFilters = () => {
    setSearch('');
    setCategoryFilter('all');
    setStockFilter('all');
    setStatusFilter('all');
  };

  const handleExportCSV = () => {
    const exportData = filteredItems.map((item) => ({
      SKU: item.sku,
      'Product Name': item.productName.en,
      Category: item.category?.name.en || 'N/A',
      Brand: item.brand?.name || 'N/A',
      Size: item.size || 'N/A',
      Color: item.color || 'N/A',
      Stock: item.stock,
      Price: item.price || 0,
      Status: item.isActive ? 'Active' : 'Inactive',
    }));

    downloadCSV(
      exportData,
      `inventory-${new Date().toISOString().split('T')[0]}.csv`
    );
  };

  const getStockBadge = (item: InventoryItem) => {
    if (item.stock === 0) {
      return <Badge variant="destructive">Out of Stock</Badge>;
    } else if (item.isLowStock) {
      return <Badge className="bg-orange-100 text-orange-800 border-orange-200">Low Stock</Badge>;
    } else {
      return <Badge variant="default">In Stock</Badge>;
    }
  };

  const getStockColor = (item: InventoryItem) => {
    if (item.stock === 0) return 'text-red-600';
    if (item.isLowStock) return 'text-orange-600';
    return 'text-green-600';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Inventory Management</h2>
          <p className="text-muted-foreground">
            Monitor and manage product stock levels ({filteredItems.length} items)
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchInventory}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          <Button variant="outline" onClick={handleExportCSV}>
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button onClick={() => navigate('/inventory/adjustments')}>
            <Edit className="mr-2 h-4 w-4" />
            Stock Adjustments
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalProducts}</div>
            <p className="text-xs text-muted-foreground">
              {stats.totalVariants} variants
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Variants</CardTitle>
            <Box className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalVariants}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Low Stock</CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {stats.lowStockItems}
            </div>
            <p className="text-xs text-muted-foreground">Needs attention</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Out of Stock</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {stats.outOfStock}
            </div>
            <p className="text-xs text-muted-foreground">Critical</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Stock Value</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatPrice(stats.totalStockValue)}
            </div>
            <p className="text-xs text-muted-foreground">Total value</p>
          </CardContent>
        </Card>
      </div>

      {/* Low Stock Alert */}
      {stats.lowStockItems > 0 && (
        <Alert variant="default" className="border-orange-200 bg-orange-50">
          <AlertTriangle className="h-4 w-4 text-orange-600" />
          <AlertTitle className="text-orange-800">Low Stock Alert</AlertTitle>
          <AlertDescription className="text-orange-700">
            {stats.lowStockItems} item(s) are running low on stock. Consider restocking soon.
            <Button
              variant="link"
              className="ml-2 h-auto p-0 text-orange-600"
              onClick={() => setStockFilter('low')}
            >
              View Low Stock Items
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-5">
            {/* Search */}
            <div className="md:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search by product name or SKU..."
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-10"
                  defaultValue={search}
                />
              </div>
            </div>

            {/* Category Filter */}
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat._id} value={cat._id}>
                    {cat.name.en}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Stock Level Filter */}
            <Select value={stockFilter} onValueChange={setStockFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Stock Levels" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Stock Levels</SelectItem>
                <SelectItem value="low">Low Stock Only</SelectItem>
                <SelectItem value="out">Out of Stock</SelectItem>
              </SelectContent>
            </Select>

            {/* Status Filter */}
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {(search || categoryFilter !== 'all' || stockFilter !== 'all' || statusFilter !== 'all') && (
            <div className="mt-4">
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                Clear Filters
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Inventory Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[80px]">Image</TableHead>
                <TableHead>Product</TableHead>
                <TableHead>SKU</TableHead>
                <TableHead>Variant</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Status</TableHead>
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
              ) : filteredItems.length > 0 ? (
                filteredItems.map((item) => (
                  <TableRow key={`${item.productId}-${item.variantId}`}>
                    <TableCell>
                      <img
                        src={getImageUrl(item.image)}
                        alt={item.productName.en}
                        className="h-12 w-12 rounded-lg object-cover"
                      />
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{item.productName.en}</div>
                      <div className="text-xs text-muted-foreground">
                        {item.brand?.name}
                      </div>
                    </TableCell>
                    <TableCell>
                      <code className="text-xs bg-muted px-2 py-1 rounded">
                        {item.sku}
                      </code>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {item.size && <div>Size: {item.size}</div>}
                        {item.color && <div>Color: {item.color}</div>}
                        {item.material && <div>Material: {item.material}</div>}
                        {!item.size && !item.color && !item.material && (
                          <span className="text-muted-foreground">Default</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{item.category?.name.en || 'N/A'}</TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <span className={`font-bold ${getStockColor(item)}`}>
                          {item.stock} units
                        </span>
                        {getStockBadge(item)}
                      </div>
                    </TableCell>
                    <TableCell>
                      {item.price ? formatPrice(item.price) : 'N/A'}
                    </TableCell>
                    <TableCell>
                      <Badge variant={item.isActive ? 'default' : 'secondary'}>
                        {item.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() =>
                              navigate(
                                `/inventory/adjust/${item.productId}/${item.variantId}`
                              )
                            }
                          >
                            <Edit className="mr-2 h-4 w-4" />
                            Adjust Stock
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() =>
                              navigate(
                                `/inventory/history/${item.productId}/${item.variantId}`
                              )
                            }
                          >
                            <History className="mr-2 h-4 w-4" />
                            View History
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() =>
                              navigate(`/products/edit/${item.productId}`)
                            }
                          >
                            <Eye className="mr-2 h-4 w-4" />
                            View Product
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8">
                    <Package className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground">No inventory items found</p>
                    {(search || categoryFilter !== 'all' || stockFilter !== 'all') && (
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
    </div>
  );
};

export default InventoryOverview;