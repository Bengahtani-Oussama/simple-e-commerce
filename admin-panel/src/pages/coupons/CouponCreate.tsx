// admin-panel/src/pages/coupons/CouponCreate.tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Save,
  Percent,
  DollarSign,
  Truck,
  AlertCircle,
  Sparkles,
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
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import api from '@/services/api';
import { formatPrice } from '@/utils';

const CouponCreate = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    code: '',
    type: 'percentage' as 'percentage' | 'fixed' | 'free_shipping',
    discountPercentage: 10,
    discountAmount: 0,
    minOrderValue: 0,
    maxDiscount: 0,
    usageLimit: 0,
    usagePerCustomer: 1,
    startDate: '',
    endDate: '',
    isActive: true,
    description: '',
  });

  const generateCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setFormData((prev) => ({ ...prev, code }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Prepare data based on coupon type
      const data: any = {
        code: formData.code.toUpperCase(),
        type: formData.type,
        description: formData.description,
        isActive: formData.isActive,
        usagePerCustomer: formData.usagePerCustomer,
      };

      // Add type-specific fields
      if (formData.type === 'percentage') {
        data.discountPercentage = formData.discountPercentage;
        if (formData.maxDiscount > 0) {
          data.maxDiscount = formData.maxDiscount;
        }
      } else if (formData.type === 'fixed') {
        data.discountAmount = formData.discountAmount;
      }

      // Add optional fields
      if (formData.minOrderValue > 0) {
        data.minOrderValue = formData.minOrderValue;
      }
      if (formData.usageLimit > 0) {
        data.usageLimit = formData.usageLimit;
      }
      if (formData.startDate) {
        data.startDate = formData.startDate;
      }
      if (formData.endDate) {
        data.endDate = formData.endDate;
      }

      await api.post('/coupons', data);
      alert('Coupon created successfully!');
      navigate('/coupons');
    } catch (error: any) {
      console.error('Failed to create coupon:', error);
      alert(error.response?.data?.message || 'Failed to create coupon');
    } finally {
      setLoading(false);
    }
  };

  const getCouponPreview = () => {
    if (formData.type === 'percentage') {
      return `${formData.discountPercentage}% OFF${formData.maxDiscount > 0 ? ` (max ${formatPrice(formData.maxDiscount)})` : ''}`;
    } else if (formData.type === 'fixed') {
      return `${formatPrice(formData.discountAmount)} OFF`;
    } else {
      return 'FREE SHIPPING';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => navigate('/coupons')}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h2 className="text-2xl font-bold">Create Coupon</h2>
            <p className="text-muted-foreground">
              Create a new discount coupon for customers
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/coupons')}
          >
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            <Save className="mr-2 h-4 w-4" />
            {loading ? 'Creating...' : 'Create Coupon'}
          </Button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Coupon Code */}
          <Card>
            <CardHeader>
              <CardTitle>Coupon Code</CardTitle>
              <CardDescription>
                Create a unique code customers will use at checkout
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Coupon Code *</Label>
                <div className="flex gap-2 mt-2">
                  <Input
                    required
                    value={formData.code}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        code: e.target.value.toUpperCase(),
                      }))
                    }
                    placeholder="e.g., SUMMER2024"
                    className="font-mono text-lg"
                    maxLength={50}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={generateCode}
                  >
                    <Sparkles className="h-4 w-4 mr-2" />
                    Generate
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  3-50 characters, letters and numbers only
                </p>
              </div>

              <div>
                <Label>Description (Optional)</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  placeholder="e.g., Summer sale - 20% off all products"
                  rows={3}
                  maxLength={500}
                  className="mt-2"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Internal description for admin reference
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Discount Type & Value */}
          <Card>
            <CardHeader>
              <CardTitle>Discount Settings</CardTitle>
              <CardDescription>
                Choose the type and value of the discount
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Discount Type *</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value: any) =>
                    setFormData((prev) => ({ ...prev, type: value }))
                  }
                >
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percentage">
                      <div className="flex items-center gap-2">
                        <Percent className="h-4 w-4" />
                        Percentage Discount
                      </div>
                    </SelectItem>
                    <SelectItem value="fixed">
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4" />
                        Fixed Amount
                      </div>
                    </SelectItem>
                    <SelectItem value="free_shipping">
                      <div className="flex items-center gap-2">
                        <Truck className="h-4 w-4" />
                        Free Shipping
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {formData.type === 'percentage' && (
                <>
                  <div>
                    <Label>Discount Percentage *</Label>
                    <div className="flex items-center gap-2 mt-2">
                      <Input
                        type="number"
                        required
                        min="1"
                        max="100"
                        value={formData.discountPercentage}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            discountPercentage: Number(e.target.value),
                          }))
                        }
                      />
                      <span className="text-2xl font-bold text-muted-foreground">
                        %
                      </span>
                    </div>
                  </div>

                  <div>
                    <Label>Maximum Discount (Optional)</Label>
                    <Input
                      type="number"
                      min="0"
                      value={formData.maxDiscount || ''}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          maxDiscount: Number(e.target.value),
                        }))
                      }
                      placeholder="No limit"
                      className="mt-2"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Cap the maximum discount amount in DA
                    </p>
                  </div>
                </>
              )}

              {formData.type === 'fixed' && (
                <div>
                  <Label>Discount Amount (DA) *</Label>
                  <Input
                    type="number"
                    required
                    min="1"
                    value={formData.discountAmount || ''}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        discountAmount: Number(e.target.value),
                      }))
                    }
                    placeholder="e.g., 500"
                    className="mt-2"
                  />
                </div>
              )}

              {formData.type === 'free_shipping' && (
                <Alert>
                  <Truck className="h-4 w-4" />
                  <AlertTitle>Free Shipping Coupon</AlertTitle>
                  <AlertDescription>
                    This coupon will remove the shipping cost from the order.
                    No additional discount value is needed.
                  </AlertDescription>
                </Alert>
              )}

              <Separator />

              <div>
                <Label>Minimum Order Value (Optional)</Label>
                <Input
                  type="number"
                  min="0"
                  value={formData.minOrderValue || ''}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      minOrderValue: Number(e.target.value),
                    }))
                  }
                  placeholder="No minimum"
                  className="mt-2"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Minimum order subtotal required to use this coupon
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Usage Limits */}
          <Card>
            <CardHeader>
              <CardTitle>Usage Limits</CardTitle>
              <CardDescription>
                Control how many times the coupon can be used
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Total Usage Limit (Optional)</Label>
                <Input
                  type="number"
                  min="0"
                  value={formData.usageLimit || ''}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      usageLimit: Number(e.target.value),
                    }))
                  }
                  placeholder="Unlimited"
                  className="mt-2"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Total number of times this coupon can be used across all
                  customers. Leave empty for unlimited.
                </p>
              </div>

              <div>
                <Label>Usage Per Customer *</Label>
                <Input
                  type="number"
                  required
                  min="1"
                  value={formData.usagePerCustomer}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      usagePerCustomer: Number(e.target.value),
                    }))
                  }
                  className="mt-2"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Maximum times each customer can use this coupon
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Validity Period */}
          <Card>
            <CardHeader>
              <CardTitle>Validity Period</CardTitle>
              <CardDescription>
                Set when the coupon becomes active and expires
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label>Start Date (Optional)</Label>
                  <Input
                    type="datetime-local"
                    value={formData.startDate}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        startDate: e.target.value,
                      }))
                    }
                    className="mt-2"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Coupon becomes active from this date
                  </p>
                </div>

                <div>
                  <Label>End Date (Optional)</Label>
                  <Input
                    type="datetime-local"
                    value={formData.endDate}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        endDate: e.target.value,
                      }))
                    }
                    className="mt-2"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Coupon expires after this date
                  </p>
                </div>
              </div>

              {formData.startDate && formData.endDate && (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Validity Check</AlertTitle>
                  <AlertDescription>
                    {new Date(formData.endDate) > new Date(formData.startDate) ? (
                      <span className="text-green-600">
                        ✓ End date is after start date
                      </span>
                    ) : (
                      <span className="text-red-600">
                        ✗ End date must be after start date
                      </span>
                    )}
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar - Preview & Status */}
        <div className="space-y-6">
          {/* Coupon Preview */}
          <Card className="sticky top-4">
            <CardHeader>
              <CardTitle>Coupon Preview</CardTitle>
              <CardDescription>How customers will see it</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="border-2 border-dashed border-primary rounded-lg p-6 text-center space-y-4">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10">
                  {formData.type === 'percentage' && (
                    <Percent className="h-8 w-8 text-primary" />
                  )}
                  {formData.type === 'fixed' && (
                    <DollarSign className="h-8 w-8 text-primary" />
                  )}
                  {formData.type === 'free_shipping' && (
                    <Truck className="h-8 w-8 text-primary" />
                  )}
                </div>

                <div>
                  <div className="font-mono text-2xl font-bold text-primary mb-2">
                    {formData.code || 'COUPONCODE'}
                  </div>
                  <div className="text-lg font-semibold mb-1">
                    {getCouponPreview()}
                  </div>
                  {formData.description && (
                    <p className="text-sm text-muted-foreground">
                      {formData.description}
                    </p>
                  )}
                </div>

                <Separator />

                <div className="text-left space-y-2 text-sm">
                  {formData.minOrderValue > 0 && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Min. Order:</span>
                      <span className="font-medium">
                        {formatPrice(formData.minOrderValue)}
                      </span>
                    </div>
                  )}
                  {formData.usageLimit > 0 && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Total Uses:</span>
                      <span className="font-medium">{formData.usageLimit}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Per Customer:</span>
                    <span className="font-medium">
                      {formData.usagePerCustomer}
                    </span>
                  </div>
                  {formData.endDate && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Expires:</span>
                      <span className="font-medium">
                        {new Date(formData.endDate).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Status */}
          <Card>
            <CardHeader>
              <CardTitle>Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <Label>Active Status</Label>
                  <p className="text-sm text-muted-foreground">
                    Coupon can be used by customers
                  </p>
                </div>
                <Switch
                  checked={formData.isActive}
                  onCheckedChange={(checked) =>
                    setFormData((prev) => ({ ...prev, isActive: checked }))
                  }
                />
              </div>
            </CardContent>
          </Card>

          {/* Tips */}
          <Card className="bg-blue-50 border-blue-200">
            <CardHeader>
              <CardTitle className="text-sm">💡 Tips</CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-2">
              <p>• Use clear, memorable codes like SUMMER20</p>
              <p>• Set expiration dates for urgency</p>
              <p>• Limit uses to prevent abuse</p>
              <p>• Test coupons before launching</p>
              <p>• Monitor usage regularly</p>
            </CardContent>
          </Card>
        </div>
      </form>
    </div>
  );
};

export default CouponCreate;