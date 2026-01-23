// admin-panel/src/pages/sections/SectionCreate.tsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, X, Search, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import api from '@/services/api';
import { generateSlug, formatPrice, getImageUrl } from '@/utils';
import type { SectionFormData, Product } from '@/types';

const SectionCreate = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [availableProducts, setAvailableProducts] = useState<Product[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<Product[]>([]);
  const [productSearch, setProductSearch] = useState('');
  const [searchLoading, setSearchLoading] = useState(false);

  const [formData, setFormData] = useState<SectionFormData>({
    name: { ar: '', en: '', fr: '' },
    description: { ar: '', en: '', fr: '' },
    products: [],
    isActive: true,
    order: 0,
    minProducts: 5,
    scheduling: {
      enabled: false,
      startDate: '',
      endDate: '',
      autoArchive: false,
    },
  });

  useEffect(() => {
    searchProducts('');
  }, []);

  const searchProducts = async (query: string) => {
    setSearchLoading(true);
    try {
      const response = await api.get('/products', {
        params: {
          search: query,
          active: true,
          limit: 50,
        },
      });
      setAvailableProducts(response.data.data || []);
    } catch (error) {
      console.error('Failed to search products:', error);
    } finally {
      setSearchLoading(false);
    }
  };

  const handleProductSearch = (value: string) => {
    setProductSearch(value);
    if (value.length >= 2 || value === '') {
      searchProducts(value);
    }
  };

  const toggleProductSelection = (product: Product) => {
    const isSelected = selectedProducts.some((p) => p._id === product._id);
    
    if (isSelected) {
      setSelectedProducts(selectedProducts.filter((p) => p._id !== product._id));
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

  const removeProduct = (productId: string) => {
    setSelectedProducts(selectedProducts.filter((p) => p._id !== productId));
    setFormData((prev) => ({
      ...prev,
      products: prev.products.filter((id) => id !== productId),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.name.en || !formData.name.ar || !formData.name.fr) {
      alert('Please provide section names in all languages');
      return;
    }

    if (formData.products.length < formData.minProducts) {
      alert(`Section must have at least ${formData.minProducts} products`);
      return;
    }

    if (formData?.scheduling?.enabled) {
      if (formData.scheduling.startDate && formData.scheduling.endDate) {
        const start = new Date(formData.scheduling.startDate);
        const end = new Date(formData.scheduling.endDate);
        if (end <= start) {
          alert('End date must be after start date');
          return;
        }
      }
    }

    setLoading(true);
    try {
      const response = await api.post('/sections', formData);
      alert('Section created successfully!');
      navigate(`/sections/${response.data.data._id}`);
    } catch (error: any) {
      console.error('Failed to create section:', error);
      alert(error.response?.data?.message || 'Failed to create section');
    } finally {
      setLoading(false);
    }
  };

  // Filter available products (exclude already selected)
  const filteredProducts = availableProducts.filter(
    (p) => !selectedProducts.some((sp) => sp._id === p._id)
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => navigate('/sections')}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h2 className="text-2xl font-bold">Create Section</h2>
            <p className="text-muted-foreground">
              Add a new product collection to your store
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/sections')}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? 'Creating...' : 'Create Section'}
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Section Name */}
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
                    placeholder="e.g., Summer Collection"
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
                    placeholder="مثال: مجموعة الصيف"
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
                    placeholder="ex: Collection d'été"
                  />
                </TabsContent>
              </Tabs>

              {/* Description */}
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
                    value={formData.description?.en || ''}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        description: {
                          ...prev.description,
                          en: e.target.value,
                        },
                      }))
                    }
                    placeholder="Optional section description"
                  />
                </TabsContent>
                <TabsContent value="ar" className="space-y-2">
                  <Label>Description (Arabic)</Label>
                  <Textarea
                    rows={3}
                    value={formData.description?.ar || ''}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        description: {
                          ...prev.description,
                          ar: e.target.value,
                        },
                      }))
                    }
                    placeholder="وصف اختياري للقسم"
                    dir="rtl"
                  />
                </TabsContent>
                <TabsContent value="fr" className="space-y-2">
                  <Label>Description (French)</Label>
                  <Textarea
                    rows={3}
                    value={formData.description?.fr || ''}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        description: {
                          ...prev.description,
                          fr: e.target.value,
                        },
                      }))
                    }
                    placeholder="Description optionnelle de la section"
                  />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* Product Selection */}
          <Card>
            <CardHeader>
              <CardTitle>
                Select Products ({selectedProducts.length} / {formData.minProducts} min)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Selected Products */}
              {selectedProducts.length > 0 && (
                <div className="border rounded-lg p-4">
                  <Label className="mb-2 block">Selected Products</Label>
                  <div className="space-y-2 max-h-[300px] overflow-y-auto">
                    {selectedProducts.map((product) => (
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
                          <p className="font-medium truncate">{product.name.en}</p>
                          <p className="text-sm text-muted-foreground">
                            {formatPrice(product.basePrice)}
                          </p>
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
                    ))}
                  </div>
                </div>
              )}

              {/* Product Search */}
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

              {/* Available Products */}
              <div className="border rounded-lg max-h-[400px] overflow-y-auto">
                {searchLoading ? (
                  <div className="p-8 text-center">
                    <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent"></div>
                    <p className="mt-2 text-sm text-muted-foreground">Searching...</p>
                  </div>
                ) : filteredProducts.length > 0 ? (
                  <div className="p-2 space-y-1">
                    {filteredProducts.map((product) => {
                      const hasStock = product.totalStock && product.totalStock > 0;
                      
                      return (
                        <div
                          key={product._id}
                          className="flex items-center gap-3 p-2 hover:bg-accent rounded-lg cursor-pointer transition-colors"
                          onClick={() => toggleProductSelection(product)}
                        >
                          <Checkbox
                            checked={selectedProducts.some((p) => p._id === product._id)}
                            onCheckedChange={() => toggleProductSelection(product)}
                          />
                          <img
                            src={getImageUrl(product.images[0])}
                            alt={product.name.en}
                            className="h-10 w-10 object-cover rounded"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">{product.name.en}</p>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <span>{formatPrice(product.basePrice)}</span>
                              <Badge variant={hasStock ? 'default' : 'destructive'}>
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
                      {productSearch ? 'No products found' : 'Start typing to search'}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Settings */}
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
                <p className="text-xs text-muted-foreground mt-1">
                  Lower numbers appear first
                </p>
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
                <p className="text-xs text-muted-foreground mt-1">
                  Section deactivates if below this number
                </p>
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

          {/* Scheduling */}
          <Card>
            <CardHeader>
              <CardTitle>Scheduling (Optional)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Enable Scheduling</Label>
                <Switch
                  checked={formData?.scheduling?.enabled}
                  onCheckedChange={(checked) =>
                    setFormData((prev: any) => ({
                      ...prev,
                      scheduling: { ...prev.scheduling, enabled: checked },
                    }))
                  }
                />
              </div>

              {formData?.scheduling?.enabled && (
                <>
                  <div>
                    <Label>Start Date</Label>
                    <Input
                      type="datetime-local"
                      value={formData.scheduling.startDate}
                      onChange={(e) =>
                        setFormData((prev: any) => ({
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
                        setFormData((prev: any) => ({
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
                        setFormData((prev: any) => ({
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

export default SectionCreate;