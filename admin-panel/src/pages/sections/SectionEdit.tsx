// admin-panel/src/pages/sections/SectionEdit.tsx
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Save, X, Search, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import api from "@/services/api";
import { formatPrice, getImageUrl } from "@/utils";
import type { Section, Product } from "@/types";
import { removeProductFromSection } from "@/services/sectionApi";

const SectionEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [section, setSection] = useState<Section | null>(null);
  const [availableProducts, setAvailableProducts] = useState<Product[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<Product[]>([]);
  const [productSearch, setProductSearch] = useState("");
  const [searchLoading, setSearchLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: { ar: "", en: "", fr: "" },
    description: { ar: "", en: "", fr: "" },
    products: [] as string[],
    isActive: true,
    order: 0,
    minProducts: 5,
    scheduling: {
      enabled: false,
      startDate: "",
      endDate: "",
      autoArchive: false,
    },
  });

  useEffect(() => {
    fetchSection();
    searchProducts("");
  }, [id]);

  const fetchSection = async () => {
    try {
      const response = await api.get(`/sections/${id}`);
      const sectionData = response.data.data;
      setSection(sectionData);

      // Populate form
      setFormData({
        name: sectionData.name,
        description: sectionData.description || { ar: "", en: "", fr: "" },
        products: sectionData.products.map((p: any) =>
          typeof p === "string" ? p : p._id,
        ),
        isActive: sectionData.isActive,
        order: sectionData.order,
        minProducts: sectionData.minProducts,
        scheduling: {
          enabled: sectionData.scheduling.enabled,
          startDate: sectionData.scheduling.startDate
            ? new Date(sectionData.scheduling.startDate)
                .toISOString()
                .slice(0, 16)
            : "",
          endDate: sectionData.scheduling.endDate
            ? new Date(sectionData.scheduling.endDate)
                .toISOString()
                .slice(0, 16)
            : "",
          autoArchive: sectionData.scheduling.autoArchive,
        },
      });

      // Set selected products (populated)
      const productsArray = Array.isArray(sectionData.products)
        ? sectionData.products
        : [];
      const productObjects = productsArray.filter(
        (p: any) => typeof p === "object",
      );
      setSelectedProducts(productObjects);
    } catch (error) {
      console.error("Failed to fetch section:", error);
      alert("Failed to load section");
      navigate("/sections");
    } finally {
      setLoading(false);
    }
  };

  const searchProducts = async (query: string) => {
    setSearchLoading(true);
    try {
      const response = await api.get("/products", {
        params: {
          search: query,
          active: true,
          limit: 50,
        },
      });
      setAvailableProducts(response.data.data || []);
    } catch (error) {
      console.error("Failed to search products:", error);
    } finally {
      setSearchLoading(false);
    }
  };

  const handleProductSearch = (value: string) => {
    setProductSearch(value);
    if (value.length >= 2 || value === "") {
      searchProducts(value);
    }
  };

  const toggleProductSelection = (product: Product) => {
    const isSelected = selectedProducts.some((p) => p._id === product._id);

    if (isSelected) {
      setSelectedProducts(
        selectedProducts.filter((p) => p._id !== product._id),
      );
      setFormData((prev) => ({
        ...prev,
        products: prev.products.filter((id) => id !== product._id),
      }));
    } else {
      setSelectedProducts([...selectedProducts, product]);
      setFormData((prev) => ({
        ...prev,
        products: [...prev.products, product._id],
      }));
    }
  };

  const removeProduct = async (productId: string) => {
    setSelectedProducts(selectedProducts.filter((p) => p._id !== productId));
    setFormData((prev) => ({
      ...prev,
      products: prev.products.filter((id) => id !== productId),
    }));
    await removeProductFromSection(id as string, productId);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.name.en || !formData.name.ar || !formData.name.fr) {
      alert("Please provide section names in all languages");
      return;
    }

    if (formData.products.length < formData.minProducts) {
      alert(`Section must have at least ${formData.minProducts} products`);
      return;
    }

    if (formData.scheduling.enabled) {
      if (formData.scheduling.startDate && formData.scheduling.endDate) {
        const start = new Date(formData.scheduling.startDate);
        const end = new Date(formData.scheduling.endDate);
        if (end <= start) {
          alert("End date must be after start date");
          return;
        }
      }
    }

    setSaving(true);
    try {
      await api.put(`/sections/${id}`, formData);
      alert("Section updated successfully!");
      navigate(`/sections/${id}`);
    } catch (error: any) {
      console.error("Failed to update section:", error);
      alert(error.response?.data?.message || "Failed to update section");
    } finally {
      setSaving(false);
    }
  };

  const filteredProducts = availableProducts.filter(
    (p) => !selectedProducts.some((sp) => sp._id === p._id),
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="h-12 w-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading section...</p>
        </div>
      </div>
    );
  }

  if (!section) return null;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => navigate("/sections")}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h2 className="text-2xl font-bold">Edit Section</h2>
            <p className="text-muted-foreground">{section.name.en}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate("/sections")}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={saving}>
            <Save className="mr-2 h-4 w-4" />
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content - Same as SectionCreate */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Tabs defaultValue="en">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="en">English</TabsTrigger>
                  <TabsTrigger value="ar">Arabic</TabsTrigger>
                  <TabsTrigger value="fr">French</TabsTrigger>
                </TabsList>
                <TabsContent value="en" className="space-y-2">
                  <Label>Section Name (English) *</Label>
                  <Input
                    required
                    value={formData.name.en}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        name: { ...prev.name, en: e.target.value },
                      }))
                    }
                  />
                </TabsContent>
                <TabsContent value="ar" className="space-y-2">
                  <Label>Section Name (Arabic) *</Label>
                  <Input
                    required
                    value={formData.name.ar}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        name: { ...prev.name, ar: e.target.value },
                      }))
                    }
                    dir="rtl"
                  />
                </TabsContent>
                <TabsContent value="fr" className="space-y-2">
                  <Label>Section Name (French) *</Label>
                  <Input
                    required
                    value={formData.name.fr}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        name: { ...prev.name, fr: e.target.value },
                      }))
                    }
                  />
                </TabsContent>
              </Tabs>

              <Tabs defaultValue="en">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="en">English</TabsTrigger>
                  <TabsTrigger value="ar">Arabic</TabsTrigger>
                  <TabsTrigger value="fr">French</TabsTrigger>
                </TabsList>
                <TabsContent value="en" className="space-y-2">
                  <Label>Description (English)</Label>
                  <Textarea
                    rows={3}
                    value={formData.description?.en || ""}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        description: {
                          ...prev.description,
                          en: e.target.value,
                        },
                      }))
                    }
                  />
                </TabsContent>
                <TabsContent value="ar" className="space-y-2">
                  <Label>Description (Arabic)</Label>
                  <Textarea
                    rows={3}
                    value={formData.description?.ar || ""}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        description: {
                          ...prev.description,
                          ar: e.target.value,
                        },
                      }))
                    }
                    dir="rtl"
                  />
                </TabsContent>
                <TabsContent value="fr" className="space-y-2">
                  <Label>Description (French)</Label>
                  <Textarea
                    rows={3}
                    value={formData.description?.fr || ""}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        description: {
                          ...prev.description,
                          fr: e.target.value,
                        },
                      }))
                    }
                  />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* Product Selection - Same as SectionCreate */}
          <Card>
            <CardHeader>
              <CardTitle>
                Select Products ({selectedProducts.length} /{" "}
                {formData.minProducts} min)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {selectedProducts.length > 0 && (
                <div className="border rounded-lg p-4">
                  <Label className="mb-2 block">Selected Products</Label>
                  <div className="space-y-2 max-h-[300px] overflow-y-auto">
                    {selectedProducts.map((product) => {
                      const hasStock =
                        product.totalStock && product.totalStock > 0;
                      return (
                        <div
                          key={product._id}
                          className="flex items-center gap-3 p-2 bg-muted rounded-lg"
                        >
                          <img
                            src={getImageUrl(product.images[0])}
                            alt={product.name.en}
                            className="h-12 w-12 object-cover rounded"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">
                              {product.name.en}
                            </p>
                            <div className="flex items-center gap-2">
                              <p className="text-sm text-muted-foreground">
                                {formatPrice(product.basePrice)}
                              </p>
                              <Badge
                                variant={hasStock ? "default" : "destructive"}
                              >
                                Stock: {product.totalStock || 0}
                              </Badge>
                            </div>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => removeProduct(product._id)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              <div>
                <Label>Add Products</Label>
                <div className="relative mt-2">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search products..."
                    value={productSearch}
                    onChange={(e) => handleProductSearch(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="border rounded-lg max-h-[400px] overflow-y-auto">
                {searchLoading ? (
                  <div className="p-8 text-center">
                    <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent"></div>
                    <p className="mt-2 text-sm text-muted-foreground">
                      Searching...
                    </p>
                  </div>
                ) : filteredProducts.length > 0 ? (
                  <div className="p-2 space-y-1">
                    {filteredProducts.map((product) => {
                      const hasStock =
                        product.totalStock && product.totalStock > 0;

                      return (
                        <div
                          key={product._id}
                          className="flex items-center gap-3 p-2 hover:bg-accent rounded-lg cursor-pointer"
                          onClick={() => toggleProductSelection(product)}
                        >
                          <Checkbox
                            checked={selectedProducts.some(
                              (p) => p._id === product._id,
                            )}
                            onCheckedChange={() =>
                              toggleProductSelection(product)
                            }
                          />
                          <img
                            src={getImageUrl(product.images[0])}
                            alt={product.name.en}
                            className="h-10 w-10 object-cover rounded"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">
                              {product.name.en}
                            </p>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <span>{formatPrice(product.basePrice)}</span>
                              <Badge
                                variant={hasStock ? "default" : "destructive"}
                              >
                                Stock: {product.totalStock || 0}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="p-8 text-center">
                    <Package className="h-12 w-12 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                      {productSearch
                        ? "No products found"
                        : "Start typing to search"}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar - Same as SectionCreate */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Display Order</Label>
                <Input
                  type="number"
                  min="0"
                  value={formData.order}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      order: Number(e.target.value),
                    }))
                  }
                />
              </div>

              <div>
                <Label>Minimum Products</Label>
                <Input
                  type="number"
                  min="1"
                  value={formData.minProducts}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      minProducts: Number(e.target.value),
                    }))
                  }
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <Label>Active</Label>
                  <p className="text-xs text-muted-foreground">
                    Show section on store
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

          <Card>
            <CardHeader>
              <CardTitle>Scheduling</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Enable Scheduling</Label>
                <Switch
                  checked={formData.scheduling.enabled}
                  onCheckedChange={(checked) =>
                    setFormData((prev) => ({
                      ...prev,
                      scheduling: { ...prev.scheduling, enabled: checked },
                    }))
                  }
                />
              </div>

              {formData.scheduling.enabled && (
                <>
                  <div>
                    <Label>Start Date</Label>
                    <Input
                      type="datetime-local"
                      value={formData.scheduling.startDate}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          scheduling: {
                            ...prev.scheduling,
                            startDate: e.target.value,
                          },
                        }))
                      }
                    />
                  </div>

                  <div>
                    <Label>End Date</Label>
                    <Input
                      type="datetime-local"
                      value={formData.scheduling.endDate}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          scheduling: {
                            ...prev.scheduling,
                            endDate: e.target.value,
                          },
                        }))
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Auto Archive</Label>
                      <p className="text-xs text-muted-foreground">
                        Auto-deactivate after end date
                      </p>
                    </div>
                    <Switch
                      checked={formData.scheduling.autoArchive}
                      onCheckedChange={(checked) =>
                        setFormData((prev) => ({
                          ...prev,
                          scheduling: {
                            ...prev.scheduling,
                            autoArchive: checked,
                          },
                        }))
                      }
                    />
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </form>
  );
};

export default SectionEdit;
