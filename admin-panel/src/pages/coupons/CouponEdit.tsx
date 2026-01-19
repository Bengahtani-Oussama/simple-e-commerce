// admin-panel/src/pages/coupons/CouponEdit.tsx
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Save,
  Percent,
  DollarSign,
  Truck,
  AlertCircle,
  Trash2,
  TrendingUp,
  Lock,
  Info,
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
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import api from '@/services/api';
import { formatPrice, formatDate } from '@/utils';
import type { Coupon } from '@/types';

const CouponEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [coupon, setCoupon] = useState<Coupon | null>(null);
  const [usage, setUsage] = useState({ timesUsed: 0, totalDiscountGiven: 0 });

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

  useEffect(() => {
    fetchCoupon();
  }, [id]);

  const fetchCoupon = async () => {
    try {
      const response = await api.get(`/coupons/${id}`);
      const couponData = response.data.data.coupon;
      const usageData = response.data.data.usage;

      setCoupon(couponData);
      setUsage(usageData);

      setFormData({
        code: couponData.code,
        type: couponData.type,
        discountPercentage: couponData.discountPercentage || 10,
        discountAmount: couponData.discountAmount || 0,
        minOrderValue: couponData.minOrderValue || 0,
        maxDiscount: couponData.maxDiscount || 0,
        usageLimit: couponData.usageLimit || 0,
        usagePerCustomer: couponData.usagePerCustomer || 1,
        startDate: couponData.startDate
          ? new Date(couponData.startDate).toISOString().slice(0, 16)
          : '',
        endDate: couponData.endDate
          ? new Date(couponData.endDate).toISOString().slice(0, 16)
          : '',
        isActive: couponData.isActive,
        description: couponData.description || '',
      });
    } catch (error) {
      console.error('Failed to fetch coupon:', error);
      alert('Failed to load coupon');
      navigate('/coupons');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const data: any = {
        code: formData.code.toUpperCase(),
        description: formData.description,
        isActive: formData.isActive,
        usagePerCustomer: formData.usagePerCustomer,
      };

      // Only allow type change if not used
      if (usage.timesUsed === 0) {
        data.type = formData.type;
      }

      if (formData.type === 'percentage') {
        data.discountPercentage = formData.discountPercentage;
        if (formData.maxDiscount > 0) {
          data.maxDiscount = formData.maxDiscount;
        }
      } else if (formData.type === 'fixed') {
        data.discountAmount = formData.discountAmount;
      }

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

      await api.put(`/coupons/${id}`, data);
      alert('Coupon updated successfully!');
      navigate('/coupons');
    } catch (error: any) {
      console.error('Failed to update coupon:', error);
      alert(error.response?.data?.message || 'Failed to update coupon');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/coupons/${id}`);
      alert('Coupon deleted successfully!');
      navigate('/coupons');
    } catch (error: any) {
      console.error('Failed to delete coupon:', error);
      alert(error.response?.data?.message || 'Failed to delete coupon');
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

  const getCouponTypeIcon = (type: string) => {
    switch (type) {
      case 'percentage':
        return <Percent className="h-8 w-8 text-primary" />;
      case 'fixed':
        return <DollarSign className="h-8 w-8 text-primary" />;
      case 'free_shipping':
        return <Truck className="h-8 w-8 text-primary" />;
      default:
        return null;
    }
  };

  // Check if coupon has been used (locked fields)
  const isUsed = usage.timesUsed > 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="h-12 w-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading coupon...</p>
        </div>
      </div>
    );
  }

  if (!coupon) return null;

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
            <h2 className="text-2xl font-bold">Edit Coupon</h2>
            <p className="text-muted-foreground">
              Code: <span className="font-mono font-semibold">{coupon.code}</span>
              {isUsed && (
                <Badge variant="secondary" className="ml-2">
                  <Lock className="h-3 w-3 mr-1" />
                  Used {usage.timesUsed} times
                </Badge>
              )}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          {!isUsed && (
            <Button
              type="button"
              variant="destructive"
              onClick={() => setDeleteDialogOpen(true)}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </Button>
          )}
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/coupons')}
          >
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={saving}>
            <Save className="mr-2 h-4 w-4" />
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>

      {/* Usage Warning */}
      {isUsed && (
        <Alert variant="default" className="border-orange-200 bg-orange-50">
          <Info className="h-4 w-4 text-orange-600" />
          <AlertTitle className="text-orange-800">Editing Restrictions</AlertTitle>
          <AlertDescription className="text-orange-700">
            This coupon has been used {usage.timesUsed} time(s). The discount type and some
            core settings cannot be changed. You can deactivate it or adjust usage limits.
          </AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Usage Statistics */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Usage Statistics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="border rounded-lg p-4">
                  <div className="text-sm text-muted-foreground mb-1">Times Used</div>
                  <div className="text-2xl font-bold">{usage.timesUsed}</div>
                  {formData.usageLimit > 0 && (
                    <div className="text-xs text-muted-foreground mt-1">
                      of {formData.usageLimit} limit
                    </div>
                  )}
                </div>
                <div className="border rounded-lg p-4">
                  <div className="text-sm text-muted-foreground mb-1">
                    Total Discount Given
                  </div>
                  <div className="text-2xl font-bold">
                    {formatPrice(usage.totalDiscountGiven)}
                  </div>
                </div>
                <div className="border rounded-lg p-4">
                  <div className="text-sm text-muted-foreground mb-1">Created On</div>
                  <div className="text-sm font-medium">
                    {formatDate(coupon.createdAt)}
                  </div>
                  {coupon.createdBy && (
                    <div className="text-xs text-muted-foreground mt-1">
                      by {coupon.createdBy.name}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Coupon Code */}
          <Card>
            <CardHeader>
              <CardTitle>Coupon Code</CardTitle>
              <CardDescription>
                {isUsed ? 'Code cannot be changed once used' : 'Update coupon code'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Coupon Code *</Label>
                <Input
                  required
                  value={formData.code}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      code: e.target.value.toUpperCase(),
                    }))
                  }
                  className="font-mono text-lg mt-2"
                  maxLength={50}
                  disabled={isUsed}
                />
                {isUsed && (
                  <p className="text-xs text-orange-600 mt-1 flex items-center gap-1">
                    <Lock className="h-3 w-3" />
                    Locked - coupon has been used
                  </p>
                )}
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
                  rows={3}
                  maxLength={500}
                  className="mt-2"
                />
              </div>
            </CardContent>
          </Card>

          {/* Discount Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Discount Settings</CardTitle>
              <CardDescription>
                {isUsed
                  ? 'Discount type is locked after first use'
                  : 'Configure discount type and value'}
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
                  disabled={isUsed}
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
                {isUsed && (
                  <p className="text-xs text-orange-600 mt-1 flex items-center gap-1">
                    <Lock className="h-3 w-3" />
                    Type locked - cannot change after use
                  </p>
                )}
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
                        disabled={isUsed}
                      />
                      <span className="text-2xl font-bold text-muted-foreground">%</span>
                    </div>
                    {isUsed && (
                      <p className="text-xs text-orange-600 mt-1 flex items-center gap-1">
                        <Lock className="h-3 w-3" />
                        Percentage locked after use
                      </p>
                    )}
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
                      className="mt-2"
                    />
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
                    className="mt-2"
                    disabled={isUsed}
                  />
                  {isUsed && (
                    <p className="text-xs text-orange-600 mt-1 flex items-center gap-1">
                      <Lock className="h-3 w-3" />
                      Amount locked after use
                    </p>
                  )}
                </div>
              )}

              {formData.type === 'free_shipping' && (
                <Alert>
                  <Truck className="h-4 w-4" />
                  <AlertTitle>Free Shipping Coupon</AlertTitle>
                  <AlertDescription>
                    This coupon removes the shipping cost from orders.
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
                  className="mt-2"
                />
              </div>
            </CardContent>
          </Card>

          {/* Usage Limits */}
          <Card>
            <CardHeader>
              <CardTitle>Usage Limits</CardTitle>
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
                  className="mt-2"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Currently used {usage.timesUsed} times
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
              </div>
            </CardContent>
          </Card>

          {/* Validity Period */}
          <Card>
            <CardHeader>
              <CardTitle>Validity Period</CardTitle>
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
                </div>
              </div>

              {formData.startDate && formData.endDate && (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    {new Date(formData.endDate) > new Date(formData.startDate) ? (
                      <span className="text-green-600">✓ Valid date range</span>
                    ) : (
                      <span className="text-red-600">✗ End date must be after start date</span>
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
            </CardHeader>
            <CardContent>
              <div className="border-2 border-dashed border-primary rounded-lg p-6 text-center space-y-4">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10">
                  {getCouponTypeIcon(formData.type)}
                </div>

                <div>
                  <div className="font-mono text-2xl font-bold text-primary mb-2">
                    {formData.code}
                  </div>
                  <div className="text-lg font-semibold mb-1">{getCouponPreview()}</div>
                  {formData.description && (
                    <p className="text-sm text-muted-foreground">{formData.description}</p>
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
                      <span className="text-muted-foreground">Limit:</span>
                      <span className="font-medium">
                        {usage.timesUsed} / {formData.usageLimit}
                      </span>
                    </div>
                  )}
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
                    {isUsed
                      ? 'Deactivate to prevent further use'
                      : 'Coupon can be used by customers'}
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

          {/* Deletion Warning */}
          {isUsed && (
            <Card className="border-orange-200 bg-orange-50">
              <CardHeader>
                <CardTitle className="text-sm text-orange-800 flex items-center gap-2">
                  <Lock className="h-4 w-4" />
                  Deletion Restricted
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-orange-700">
                <p>
                  This coupon cannot be deleted because it has been used {usage.timesUsed}{' '}
                  time(s). You can deactivate it instead to prevent further use.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </form>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Coupon?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to permanently delete coupon "{coupon.code}"? This
              action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete Permanently
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default CouponEdit;