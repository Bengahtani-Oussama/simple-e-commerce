// admin-panel/src/pages/inventory/StockHistory.tsx
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  History,
  TrendingUp,
  TrendingDown,
  Package,
  RefreshCw,
  Download,
  Filter,
  Calendar,
  User,
  FileText,
  ShoppingCart,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import api from '@/services/api';
import { formatDateTime, downloadCSV, getImageUrl } from '@/utils';
import type { StockHistory as StockHistoryType } from '@/types';

const StockHistory = () => {
  const { productId, variantId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [history, setHistory] = useState<StockHistoryType[]>([]);
  const [productDetails, setProductDetails] = useState<any>(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 20;

  // Filters
  const [typeFilter, setTypeFilter] = useState('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  useEffect(() => {
    if (productId && variantId) {
      fetchProductDetails();
      fetchHistory();
    }
  }, [productId, variantId, page, typeFilter, dateFrom, dateTo]);

  const fetchProductDetails = async () => {
    try {
      const response = await api.get(`/products/${productId}`);
      const product = response.data.data;
      
      const variant = product.variants.find(
        (v: any) => v._id.toString() === variantId
      );

      setProductDetails({
        product,
        variant,
      });
    } catch (error) {
      console.error('Failed to fetch product:', error);
    }
  };

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const params: any = { page, limit };
      
      if (typeFilter !== 'all') params.type = typeFilter;
      if (dateFrom) params.startDate = dateFrom;
      if (dateTo) params.endDate = dateTo;

      const response = await api.get(
        `/admin/inventory/history/${productId}/${variantId}`,
        { params }
      );

      setHistory(response.data.data || []);
      setTotal(response.data.total || 0);
    } catch (error) {
      console.error('Failed to fetch history:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = () => {
    const exportData = history.map((entry) => ({
      Date: formatDateTime(entry.createdAt),
      Type: entry.type,
      'Previous Stock': entry.previousStock,
      'Quantity Change': entry.quantityChange,
      'New Stock': entry.newStock,
      Reason: entry.reason || 'N/A',
      'Performed By': entry.performedBy?.name || 'System',
    }));

    downloadCSV(
      exportData,
      `stock-history-${productDetails?.variant?.sku || 'export'}-${new Date().toISOString().split('T')[0]}.csv`
    );
  };

  const clearFilters = () => {
    setTypeFilter('all');
    setDateFrom('');
    setDateTo('');
    setPage(1);
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'sale':
        return <ShoppingCart className="h-4 w-4 text-blue-600" />;
      case 'return':
        return <RefreshCw className="h-4 w-4 text-green-600" />;
      case 'restock':
        return <Package className="h-4 w-4 text-purple-600" />;
      case 'adjustment':
        return <TrendingUp className="h-4 w-4 text-orange-600" />;
      case 'correction':
        return <FileText className="h-4 w-4 text-gray-600" />;
      default:
        return <History className="h-4 w-4" />;
    }
  };

  const getTypeBadge = (type: string) => {
    const colors: Record<string, string> = {
      sale: 'bg-blue-100 text-blue-800 border-blue-200',
      return: 'bg-green-100 text-green-800 border-green-200',
      restock: 'bg-purple-100 text-purple-800 border-purple-200',
      adjustment: 'bg-orange-100 text-orange-800 border-orange-200',
      correction: 'bg-gray-100 text-gray-800 border-gray-200',
    };

    return (
      <Badge className={colors[type] || 'bg-gray-100 text-gray-800'}>
        {type}
      </Badge>
    );
  };

  const getChangeIndicator = (change: number) => {
    if (change === 0) return <span className="text-muted-foreground">0</span>;

    return (
      <div className={`flex items-center gap-1 font-semibold ${change > 0 ? 'text-green-600' : 'text-red-600'}`}>
        {change > 0 ? (
          <TrendingUp className="h-4 w-4" />
        ) : (
          <TrendingDown className="h-4 w-4" />
        )}
        <span>{change > 0 ? '+' : ''}{change}</span>
      </div>
    );
  };

  const totalPages = Math.ceil(total / limit);

  if (loading && !history.length) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="h-12 w-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading history...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => navigate('/inventory')}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h2 className="text-2xl font-bold">Stock History</h2>
            <p className="text-muted-foreground">
              View all inventory changes for this product variant
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchHistory}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          <Button variant="outline" onClick={handleExportCSV}>
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          {productId && variantId && (
            <Button
              onClick={() =>
                navigate(`/inventory/adjust/${productId}/${variantId}`)
              }
            >
              Adjust Stock
            </Button>
          )}
        </div>
      </div>

      {/* Product Info Card */}
      {productDetails && (
        <Card>
          <CardHeader>
            <CardTitle>Product Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <img
                src={getImageUrl(
                  productDetails.variant.images[0] || productDetails.product.images[0]
                )}
                alt={productDetails.product.name.en}
                className="h-20 w-20 rounded-lg object-cover"
              />
              <div className="flex-1">
                <h3 className="font-semibold text-lg mb-1">
                  {productDetails.product.name.en}
                </h3>
                <div className="text-sm text-muted-foreground space-y-1">
                  <div>
                    SKU: <code className="bg-muted px-2 py-0.5 rounded">{productDetails.variant.sku}</code>
                  </div>
                  {productDetails.variant.size && (
                    <div>Size: {productDetails.variant.size}</div>
                  )}
                  {productDetails.variant.color && (
                    <div>Color: {productDetails.variant.color}</div>
                  )}
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm text-muted-foreground mb-1">Current Stock</div>
                <div className="text-3xl font-bold text-primary">
                  {productDetails.variant.stock}
                </div>
                <div className="text-xs text-muted-foreground">units</div>
              </div>
            </div>
          </CardContent>
        </Card>
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
          <div className="grid gap-4 md:grid-cols-3">
            {/* Type Filter */}
            <div>
              <Label>Change Type</Label>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="sale">Sales</SelectItem>
                  <SelectItem value="return">Returns</SelectItem>
                  <SelectItem value="restock">Restocks</SelectItem>
                  <SelectItem value="adjustment">Adjustments</SelectItem>
                  <SelectItem value="correction">Corrections</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Date From */}
            <div>
              <Label>From Date</Label>
              <Input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="mt-2"
              />
            </div>

            {/* Date To */}
            <div>
              <Label>To Date</Label>
              <Input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="mt-2"
              />
            </div>
          </div>

          {(typeFilter !== 'all' || dateFrom || dateTo) && (
            <div className="mt-4">
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                Clear Filters
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* History Table */}
      <Card>
        <CardHeader>
          <CardTitle>Stock Changes</CardTitle>
          <CardDescription>
            Showing {history.length} of {total} changes
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date & Time</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Previous Stock</TableHead>
                <TableHead>Change</TableHead>
                <TableHead>New Stock</TableHead>
                <TableHead>Reason</TableHead>
                <TableHead>Performed By</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <TableRow key={i}>
                    <TableCell colSpan={7}>
                      <div className="h-12 bg-muted animate-pulse rounded" />
                    </TableCell>
                  </TableRow>
                ))
              ) : history.length > 0 ? (
                history.map((entry) => (
                  <TableRow key={entry._id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <div className="font-medium">
                            {new Date(entry.createdAt).toLocaleDateString()}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {new Date(entry.createdAt).toLocaleTimeString()}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getTypeIcon(entry.type)}
                        {getTypeBadge(entry.type)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="font-mono">{entry.previousStock}</span>
                    </TableCell>
                    <TableCell>{getChangeIndicator(entry.quantityChange)}</TableCell>
                    <TableCell>
                      <span className="font-mono font-semibold">
                        {entry.newStock}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="max-w-xs">
                        {entry.reason ? (
                          <p className="text-sm line-clamp-2">{entry.reason}</p>
                        ) : (
                          <span className="text-muted-foreground text-sm">
                            No reason provided
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <div className="text-sm font-medium">
                            {entry.performedBy?.name || 'System'}
                          </div>
                          {entry.performedBy?.email && (
                            <div className="text-xs text-muted-foreground">
                              {entry.performedBy.email}
                            </div>
                          )}
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    <History className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground">No stock history found</p>
                    {(typeFilter !== 'all' || dateFrom || dateTo) && (
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
            {total} changes
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

      {/* Summary Card */}
      {history.length > 0 && (
        <Card className="bg-muted/50">
          <CardHeader>
            <CardTitle className="text-base">Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-4">
              <div className="text-center p-4 bg-background rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {history.filter((h) => h.quantityChange > 0).length}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  Stock Increases
                </div>
              </div>
              <div className="text-center p-4 bg-background rounded-lg">
                <div className="text-2xl font-bold text-red-600">
                  {history.filter((h) => h.quantityChange < 0).length}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  Stock Decreases
                </div>
              </div>
              <div className="text-center p-4 bg-background rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  {history.reduce((sum, h) => sum + Math.abs(h.quantityChange), 0)}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  Total Changes
                </div>
              </div>
              <div className="text-center p-4 bg-background rounded-lg">
                <div className="text-2xl font-bold text-purple-600">
                  {history.length}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  Total Records
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default StockHistory;