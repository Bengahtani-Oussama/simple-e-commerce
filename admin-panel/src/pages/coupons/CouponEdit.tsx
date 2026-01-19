// admin-panel/src/pages/coupons/CouponUpdate.tsx

import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Save,
  Percent,
  DollarSign,
  Truck,
  AlertCircle,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

import api from "@/services/api";
import { formatPrice } from "@/utils";

type CouponType = "percentage" | "fixed" | "free_shipping";

interface CouponFormState {
  code: string;
  type: CouponType;
  discountPercentage: number;
  discountAmount: number;
  minimumOrderValue: number;
  maximumDiscount: number;
  usageLimit: number;
  usagePerCustomer: number;
  startDate: string;
  endDate: string;
  isActive: boolean;
  description: string;
}

const CouponUpdate = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);

  const [formState, setFormState] = useState<CouponFormState>({
    code: "",
    type: "percentage",
    discountPercentage: 0,
    discountAmount: 0,
    minimumOrderValue: 0,
    maximumDiscount: 0,
    usageLimit: 0,
    usagePerCustomer: 1,
    startDate: "",
    endDate: "",
    isActive: true,
    description: "",
  });

  /* -------------------------------------------------------------------------- */
  /*                              Fetch Coupon Data                              */
  /* -------------------------------------------------------------------------- */
  useEffect(() => {
    const fetchCoupon = async () => {
      try {
        const response = await api.get(`/coupons/${id}`);
        const coupon = response.data.data.coupon;

        setFormState({
          code: coupon.code ?? "",
          type: coupon.type,
          discountPercentage: coupon.discountPercentage ?? 0,
          discountAmount: coupon.discountAmount ?? 0,
          minimumOrderValue: coupon.minOrderValue ?? 0,
          maximumDiscount: coupon.maxDiscount ?? 0,
          usageLimit: coupon.usageLimit ?? 0,
          usagePerCustomer: coupon.usagePerCustomer ?? 1,
          startDate: coupon.startDate ?? "",
          endDate: coupon.endDate ?? "",
          isActive: coupon.isActive ?? true,
          description: coupon.description ?? "",
        });
      } catch (error) {
        console.error("Failed to fetch coupon:", error);
        alert("Failed to load coupon");
        navigate("/coupons");
      } finally {
        setIsFetching(false);
      }
    };

    fetchCoupon();
  }, [id, navigate]);

  /* -------------------------------------------------------------------------- */
  /*                               Submit Update                                 */
  /* -------------------------------------------------------------------------- */
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsLoading(true);

    try {
      const payload: any = {
        code: formState.code.toUpperCase(),
        type: formState.type,
        description: formState.description,
        isActive: formState.isActive,
        usagePerCustomer: formState.usagePerCustomer,
      };

      if (formState.type === "percentage") {
        payload.discountPercentage = formState.discountPercentage;
        if (formState.maximumDiscount > 0) {
          payload.maxDiscount = formState.maximumDiscount;
        }
      }

      if (formState.type === "fixed") {
        payload.discountAmount = formState.discountAmount;
      }

      if (formState.minimumOrderValue > 0) {
        payload.minOrderValue = formState.minimumOrderValue;
      }

      if (formState.usageLimit > 0) {
        payload.usageLimit = formState.usageLimit;
      }

      if (formState.startDate) {
        payload.startDate = formState.startDate;
      }

      if (formState.endDate) {
        payload.endDate = formState.endDate;
      }

      await api.put(`/coupons/${id}`, payload);
      alert("Coupon updated successfully");
      navigate("/coupons");
    } catch (error: any) {
      console.error("Failed to update coupon:", error);
      alert(error.response?.data?.message || "Failed to update coupon");
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetching) {
    return (
       <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="h-12 w-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading coupons...</p>
        </div>
      </div>
    );
  }

  if(!formState) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-muted-foreground">Coupon not found</p>
        </div>
      </div>
    );
  }

   const getCouponPreview = () => {
    if (formState.type === 'percentage') {
      return `${formState.discountPercentage}% OFF${formState.maximumDiscount > 0 ? ` (max ${formatPrice(formState.maximumDiscount)})` : ''}`;
    } else if (formState.type === 'fixed') {
      return `${formatPrice(formState.discountAmount)} OFF`;
    } else {
      return 'FREE SHIPPING';
    }
  };

  /* -------------------------------------------------------------------------- */
  /*                                   Render                                    */
  /* -------------------------------------------------------------------------- */
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/coupons")}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h2 className="text-2xl font-bold">Update Coupon</h2>
            <p className="text-muted-foreground">
              Modify an existing discount coupon
            </p>
          </div>
        </div>
        <Button onClick={handleSubmit} disabled={isLoading}>
          <Save className="mr-2 h-4 w-4" />
          {isLoading ? "Updating..." : "Update Coupon"}
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Coupon Code */}
          <Card>
            <CardHeader>
              <CardTitle>Coupon Code</CardTitle>
              <CardDescription>
                Coupon code cannot be changed after creation
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Input value={formState.code} disabled className="font-mono" />
            </CardContent>
          </Card>

          {/* Discount Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Discount Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Label>Discount Type</Label>
              <Select value={formState.type} disabled>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="percentage">
                    <Percent className="inline mr-2 h-4 w-4" />
                    Percentage
                  </SelectItem>
                  <SelectItem value="fixed">
                    <DollarSign className="inline mr-2 h-4 w-4" />
                    Fixed Amount
                  </SelectItem>
                  <SelectItem value="free_shipping">
                    <Truck className="inline mr-2 h-4 w-4" />
                    Free Shipping
                  </SelectItem>
                </SelectContent>
              </Select>

              {formState.type === "percentage" && (
                <>
                  <Label>Discount Percentage</Label>
                  <Input
                    type="number"
                    min={1}
                    max={100}
                    value={formState.discountPercentage}
                    onChange={(e) =>
                      setFormState((previous) => ({
                        ...previous,
                        discountPercentage: Number(e.target.value),
                      }))
                    }
                  />

                  <Label>Maximum Discount</Label>
                  <Input
                    type="number"
                    value={formState.maximumDiscount || ""}
                    onChange={(e) =>
                      setFormState((previous) => ({
                        ...previous,
                        maximumDiscount: Number(e.target.value),
                      }))
                    }
                    placeholder="No limit"
                  />
                </>
              )}

              {formState.type === "fixed" && (
                <>
                  <Label>Discount Amount</Label>
                  <Input
                    type="number"
                    value={formState.discountAmount}
                    onChange={(e) =>
                      setFormState((previous) => ({
                        ...previous,
                        discountAmount: Number(e.target.value),
                      }))
                    }
                  />
                </>
              )}
            </CardContent>
          </Card>

          {/* Validity */}
          <Card>
            <CardHeader>
              <CardTitle>Validity Period</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <Input
                type="datetime-local"
                value={formState.startDate}
                onChange={(e) =>
                  setFormState((previous) => ({
                    ...previous,
                    startDate: e.target.value,
                  }))
                }
              />
              <Input
                type="datetime-local"
                value={formState.endDate}
                onChange={(e) =>
                  setFormState((previous) => ({
                    ...previous,
                    endDate: e.target.value,
                  }))
                }
              />
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card >
            <CardHeader>
              <CardTitle>Coupon Preview</CardTitle>
              <CardDescription>How customers will see it</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="border-2 border-dashed border-primary rounded-lg p-6 text-center space-y-4">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10">
                  {formState.type === "percentage" && (
                    <Percent className="h-8 w-8 text-primary" />
                  )}
                  {formState.type === "fixed" && (
                    <DollarSign className="h-8 w-8 text-primary" />
                  )}
                  {formState.type === "free_shipping" && (
                    <Truck className="h-8 w-8 text-primary" />
                  )}
                </div>

                <div>
                  <div className="font-mono text-2xl font-bold text-primary mb-2">
                    {formState.code || "COUPONCODE"}
                  </div>
                  <div className="text-lg font-semibold mb-1">
                    {getCouponPreview()}
                  </div>
                  {formState.description && (
                    <p className="text-sm text-muted-foreground">
                      {formState.description}
                    </p>
                  )}
                </div>

                <Separator />

                <div className="text-left space-y-2 text-sm">
                  {formState.minimumOrderValue > 0 && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Min. Order:</span>
                      <span className="font-medium">
                        {formatPrice(formState.minimumOrderValue)}
                      </span>
                    </div>
                  )}
                  {formState.usageLimit > 0 && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Total Uses:</span>
                      <span className="font-medium">{formState.usageLimit}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Per Customer:</span>
                    <span className="font-medium">
                      {formState.usagePerCustomer}
                    </span>
                  </div>
                  {formState.endDate && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Expires:</span>
                      <span className="font-medium">
                        {new Date(formState.endDate).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Status</CardTitle>
            </CardHeader>
            <CardContent className="flex justify-between items-center">
              <Label>Active</Label>
              <Switch
                checked={formState.isActive}
                onCheckedChange={(checked) =>
                  setFormState((previous) => ({
                    ...previous,
                    isActive: checked,
                  }))
                }
              />
            </CardContent>
          </Card>
        </div>
      </form>
    </div>
  );
};

export default CouponUpdate;
