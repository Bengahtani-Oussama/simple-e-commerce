// admin-panel/src/pages/inventory/StockAdjustment.tsx
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Save,
  Plus,
  Minus,
  AlertCircle,
  Package,
  TrendingUp,
  TrendingDown,
  RotateCcw,
  CheckCircle,
  History,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import api from '@/services/api';
import { formatPrice, getImageUrl } from '@/utils';

const StockAdjustment = () => {
  const { productId, variantId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Product and variant details
  const [productDetails, setProductDetails] = useState<any>(null);
  const [currentStock, setCurrentStock] = useState(0);

  // Adjustment form
  const [adjustmentType, setAdjustmentType] = useState<'adjustment' | 'restock' | 'correction'>('adjustment');
  const [operation, setOperation] = useState<'add' | 'subtract' | 'set'>('add');
  const [adjustmentValue, setAdjustmentValue] = useState<number>(0);
  const [reason, setReason] = useState('');

  // Calculated new stock
  const [newStock, setNewStock] = useState(0);

  useEffect(() => {
    if (productId && variantId) {
      fetchProductDetails();
    }
  }, [productId, variantId]);

  useEffect(() => {
    calculateNewStock();
  }, [currentStock, operation, adjustmentValue]);

  const fetchProductDetails = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/products/${productId}`);
      const product = response.data.data;
      
      const variant = product.variants.find(
        (v: any) => v._id.toString() === variantId
      );

      if (!variant) {
        setMessage({ type: 'error', text: 'Variant not found' });
        return;
      }

      setProductDetails({
        product,
        variant,
      });
      setCurrentStock(variant.stock);
      setNewStock(variant.stock);
    } catch (error: any) {
      console.error('Failed to fetch product:', error);
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'Failed to load product details',
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateNewStock = () => {
    if (!adjustmentValue) {
      setNewStock(currentStock);
      return;
    }

    let calculated = currentStock;
    
    switch (operation) {
      case 'add':
        calculated = currentStock + adjustmentValue;
        break;
      case 'subtract':
        calculated = currentStock - adjustmentValue;
        break;
      case 'set':
        calculated = adjustmentValue;
        break;
    }

    setNewStock(Math.max(0, calculated));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!reason.trim()) {
      setMessage({ type: 'error', text: 'Please provide a reason for the adjustment' });
      return;
    }

    if (newStock < 0) {
      setMessage({ type: 'error', text: 'Stock cannot be negative' });
      return;
    }

    if (newStock === currentStock) {
      setMessage({ type: 'error', text: 'No change in stock level' });
      return;
    }

    setSaving(true);
    setMessage(null);

    try {
      const adjustment = operation === 'set' 
        ? adjustmentValue - currentStock 
        : operation === 'add' 
          ? adjustmentValue 
          : -adjustmentValue;

      await api.post('/admin/inventory/adjust', {
        productId,
        variantId,
        adjustment,
        reason,
        type: adjustmentType,
      });

      setMessage({ 
        type: 'success', 
        text: `Stock adjusted successfully! ${currentStock} → ${newStock} units` 
      });

      // Refresh product details
      setTimeout(() => {
        fetchProductDetails();
        setAdjustmentValue(0);
        setReason('');
      }, 1500);

    } catch (error: any) {
      console.error('Failed to adjust stock:', error);
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'Failed to adjust stock',
      });
    } finally {
      setSaving(false);
    }
  };

  const getOperationIcon = () => {
    switch (operation) {
      case 'add':
        return <Plus className="h-5 w-5 text-green-600" />;
      case 'subtract':
        return <Minus className="h-5 w-5 text-red-600" />;
      case 'set':
        return <RotateCcw className="h-5 w-5 text-blue-600" />;
    }
  };

  const getStockChangeIndicator = () => {
    const diff = newStock - currentStock;
    if (diff === 0) return null;
    
    return (
      <div className={`flex items-center gap-1 text-sm ${diff > 0 ? 'text-green-600' : 'text-red-600'}`}>
        {diff > 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
        <span className="font-semibold">
          {diff > 0 ? '+' : ''}{diff} units
        </span>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="h-12 w-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading product details...</p>
        </div>
      </div>
    );
  }

  if (!productDetails) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 mx-auto mb-4 text-red-600" />
          <p className="text-lg font-semibold mb-2">Product not found</p>
          <Button onClick={() => navigate('/inventory')}>
            Back to Inventory
          </Button>
        </div>
      </div>
    );
  }

  const { product, variant } = productDetails;

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
            <h2 className="text-2xl font-bold">Adjust Stock</h2>
            <p className="text-muted-foreground">
              Update inventory levels for {product.name.en}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() =>
              navigate(`/inventory/history/${productId}/${variantId}`)
            }
          >
            <History className="mr-2 h-4 w-4" />
            View History
          </Button>
        </div>
      </div>

      {/* Alert Messages */}
      {message && (
        <Alert variant={message.type === 'error' ? 'destructive' : 'default'}>
          {message.type === 'success' ? (
            <CheckCircle className="h-4 w-4" />
          ) : (
            <AlertCircle className="h-4 w-4" />
          )}
          <AlertTitle>{message.type === 'success' ? 'Success' : 'Error'}</AlertTitle>
          <AlertDescription>{message.text}</AlertDescription>
        </Alert>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Adjustment Form */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Product Info Card */}
            <Card>
              <CardHeader>
                <CardTitle>Product Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-4">
                  <img
                    src={getImageUrl(variant.images[0] || product.images[0])}
                    alt={product.name.en}
                    className="h-24 w-24 rounded-lg object-cover"
                  />
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg mb-1">{product.name.en}</h3>
                    <div className="text-sm text-muted-foreground space-y-1">
                      <div>SKU: <code className="bg-muted px-2 py-0.5 rounded">{variant.sku}</code></div>
                      {variant.size && <div>Size: {variant.size}</div>}
                      {variant.color && <div>Color: {variant.color}</div>}
                      {variant.material && <div>Material: {variant.material}</div>}
                      {variant.price && <div>Price: {formatPrice(variant.price)}</div>}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-muted-foreground mb-1">Current Stock</div>
                    <div className="text-3xl font-bold text-primary">{currentStock}</div>
                    <div className="text-xs text-muted-foreground">units</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Adjustment Details */}
            <Card>
              <CardHeader>
                <CardTitle>Adjustment Details</CardTitle>
                <CardDescription>
                  Specify the type and amount of stock adjustment
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Adjustment Type */}
                <div>
                  <Label>Adjustment Type *</Label>
                  <Select
                    value={adjustmentType}
                    onValueChange={(value: any) => setAdjustmentType(value)}
                  >
                    <SelectTrigger className="mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="adjustment">
                        <div className="flex items-center gap-2">
                          <Package className="h-4 w-4" />
                          <div>
                            <div className="font-medium">Adjustment</div>
                            <div className="text-xs text-muted-foreground">
                              Regular stock adjustment
                            </div>
                          </div>
                        </div>
                      </SelectItem>
                      <SelectItem value="restock">
                        <div className="flex items-center gap-2">
                          <TrendingUp className="h-4 w-4" />
                          <div>
                            <div className="font-medium">Restock</div>
                            <div className="text-xs text-muted-foreground">
                              New inventory received
                            </div>
                          </div>
                        </div>
                      </SelectItem>
                      <SelectItem value="correction">
                        <div className="flex items-center gap-2">
                          <RotateCcw className="h-4 w-4" />
                          <div>
                            <div className="font-medium">Correction</div>
                            <div className="text-xs text-muted-foreground">
                              Fix inventory discrepancy
                            </div>
                          </div>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Separator />

                {/* Operation Type */}
                <div>
                  <Label>Operation *</Label>
                  <div className="grid grid-cols-3 gap-2 mt-2">
                    <Button
                      type="button"
                      variant={operation === 'add' ? 'default' : 'outline'}
                      onClick={() => setOperation('add')}
                      className="flex items-center gap-2"
                    >
                      <Plus className="h-4 w-4" />
                      Add
                    </Button>
                    <Button
                      type="button"
                      variant={operation === 'subtract' ? 'default' : 'outline'}
                      onClick={() => setOperation('subtract')}
                      className="flex items-center gap-2"
                    >
                      <Minus className="h-4 w-4" />
                      Subtract
                    </Button>
                    <Button
                      type="button"
                      variant={operation === 'set' ? 'default' : 'outline'}
                      onClick={() => setOperation('set')}
                      className="flex items-center gap-2"
                    >
                      <RotateCcw className="h-4 w-4" />
                      Set To
                    </Button>
                  </div>
                </div>

                {/* Adjustment Value */}
                <div>
                  <Label>
                    {operation === 'set' ? 'New Stock Level' : 'Quantity'} *
                  </Label>
                  <div className="flex items-center gap-2 mt-2">
                    {getOperationIcon()}
                    <Input
                      type="number"
                      min="0"
                      value={adjustmentValue || ''}
                      onChange={(e) => setAdjustmentValue(Number(e.target.value))}
                      placeholder={operation === 'set' ? 'Enter new stock level' : 'Enter quantity'}
                      className="flex-1"
                      required
                    />
                    <span className="text-sm text-muted-foreground">units</span>
                  </div>
                </div>

                {/* Reason */}
                <div>
                  <Label>Reason *</Label>
                  <Textarea
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="Explain the reason for this adjustment..."
                    rows={3}
                    maxLength={500}
                    required
                    className="mt-2"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    {reason.length}/500 characters
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Submit Button */}
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/inventory')}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={saving || !adjustmentValue || !reason.trim()}
                className="flex-1"
              >
                <Save className="mr-2 h-4 w-4" />
                {saving ? 'Saving...' : 'Save Adjustment'}
              </Button>
            </div>
          </form>
        </div>

        {/* Preview Sidebar */}
        <div className="space-y-6">
          {/* Stock Change Preview */}
          <Card className="sticky top-4">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Stock Preview
              </CardTitle>
              <CardDescription>
                Review changes before saving
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Current Stock */}
              <div className="p-4 bg-muted rounded-lg">
                <div className="text-sm text-muted-foreground mb-1">Current Stock</div>
                <div className="text-2xl font-bold">{currentStock} units</div>
              </div>

              {/* Arrow */}
              {adjustmentValue > 0 && (
                <div className="flex justify-center">
                  {getStockChangeIndicator()}
                </div>
              )}

              {/* New Stock */}
              <div className={`p-4 rounded-lg border-2 ${
                newStock === currentStock 
                  ? 'bg-muted border-muted' 
                  : newStock > currentStock 
                    ? 'bg-green-50 border-green-200' 
                    : 'bg-red-50 border-red-200'
              }`}>
                <div className="text-sm text-muted-foreground mb-1">New Stock</div>
                <div className={`text-2xl font-bold ${
                  newStock === currentStock 
                    ? '' 
                    : newStock > currentStock 
                      ? 'text-green-600' 
                      : 'text-red-600'
                }`}>
                  {newStock} units
                </div>
              </div>

              <Separator />

              {/* Summary */}
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Operation:</span>
                  <Badge variant="outline" className="capitalize">
                    {operation}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Type:</span>
                  <Badge variant="outline" className="capitalize">
                    {adjustmentType}
                  </Badge>
                </div>
                {adjustmentValue > 0 && operation !== 'set' && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Quantity:</span>
                    <span className="font-medium">{adjustmentValue} units</span>
                  </div>
                )}
              </div>

              {/* Warning for negative stock */}
              {newStock === 0 && operation === 'subtract' && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription className="text-xs">
                    This will set stock to 0 (out of stock)
                  </AlertDescription>
                </Alert>
              )}

              {/* Warning for large changes */}
              {Math.abs(newStock - currentStock) > 100 && (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription className="text-xs">
                    Large stock change detected. Please verify the adjustment.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* Quick Tips */}
          <Card className="bg-blue-50 border-blue-200">
            <CardHeader>
              <CardTitle className="text-sm">💡 Quick Tips</CardTitle>
            </CardHeader>
            <CardContent className="text-xs space-y-2">
              <p>• Use <strong>Add</strong> when receiving new inventory</p>
              <p>• Use <strong>Subtract</strong> for damaged/lost items</p>
              <p>• Use <strong>Set To</strong> after physical count</p>
              <p>• Always provide a clear reason for auditing</p>
              <p>• Changes are tracked in history log</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default StockAdjustment;