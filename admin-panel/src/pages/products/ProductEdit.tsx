import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Plus, Trash2, Upload, X, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
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
import api, { uploadFile, uploadMultipleFiles } from '@/services/api';
import { generateSlug } from '@/utils';
import type { Product, Category, Brand, ProductVariant } from '@/types';

const ProductEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [variantToDelete, setVariantToDelete] = useState<{ index: number; id?: string } | null>(
    null
  );

  const [product, setProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState({
    name: { ar: '', en: '', fr: '' },
    description: { ar: '', en: '', fr: '' },
    category: '',
    subcategory: '',
    brand: '',
    basePrice: 0,
    compareAtPrice: 0,
    images: [] as string[],
    tags: [] as string[],
    featured: false,
    isActive: true,
  });

  const [variants, setVariants] = useState<ProductVariant[]>([]);
  const [currentTag, setCurrentTag] = useState('');

  useEffect(() => {
    fetchCategories();
    fetchBrands();
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    try {
      const response = await api.get(`/products/${id}`);
      const productData = response.data.data;
      setProduct(productData);

      setFormData({
        name: productData.name,
        description: productData.description,
        category: typeof productData.category === 'object' ? productData.category._id : productData.category,
        subcategory: productData.subcategory || '',
        brand: typeof productData.brand === 'object' ? productData.brand._id : productData.brand || '',
        basePrice: productData.basePrice,
        compareAtPrice: productData.compareAtPrice || 0,
        images: productData.images || [],
        tags: productData.tags || [],
        featured: productData.featured,
        isActive: productData.isActive,
      });

      setVariants(productData.variants || []);
    } catch (error) {
      console.error('Failed to fetch product:', error);
      alert('Failed to load product');
      navigate('/products');
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

  const fetchBrands = async () => {
    try {
      const response = await api.get('/brands', { params: { active: true } });
      setBrands(response.data.data || []);
    } catch (error) {
      console.error('Failed to fetch brands:', error);
    }
  };

  const handleImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    type: 'product' | 'variant',
    index?: number
  ) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    try {
      if (type === 'product') {
        const filesArray = Array.from(files);
        const uploadedImages = await uploadMultipleFiles(filesArray);
        setFormData((prev) => ({
          ...prev,
          images: [...prev.images, ...uploadedImages.map((img) => img.url)],
        }));
      } else if (type === 'variant' && index !== undefined) {
        const uploaded = await uploadFile(files[0], 'product');
        setVariants((prev) =>
          prev.map((v, i) =>
            i === index ? { ...v, images: [...v.images, uploaded.url] } : v
          )
        );
      }
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (
    type: 'product' | 'variant',
    imageIndex: number,
    variantIndex?: number
  ) => {
    if (type === 'product') {
      setFormData((prev) => ({
        ...prev,
        images: prev.images.filter((_, i) => i !== imageIndex),
      }));
    } else if (variantIndex !== undefined) {
      setVariants((prev) =>
        prev.map((v, i) =>
          i === variantIndex
            ? { ...v, images: v.images.filter((_, idx) => idx !== imageIndex) }
            : v
        )
      );
    }
  };

  const addVariant = () => {
    setVariants([
      ...variants,
      {
        sku: '',
        size: '',
        color: '',
        material: '',
        price: 0,
        stock: 0,
        images: [],
        isActive: true,
      } as ProductVariant,
    ]);
  };

  const handleDeleteVariant = async () => {
    if (!variantToDelete) return;

    try {
      // If variant has an ID, delete from server
      if (variantToDelete.id) {
        await api.delete(`/products/${id}/variants/${variantToDelete.id}`);
      }

      // Remove from local state
      setVariants(variants.filter((_, i) => i !== variantToDelete.index));
      setDeleteDialogOpen(false);
      setVariantToDelete(null);
    } catch (error) {
      console.error('Failed to delete variant:', error);
      alert('Failed to delete variant');
    }
  };

  const addTag = () => {
    if (currentTag && !formData.tags?.includes(currentTag)) {
      setFormData((prev) => ({
        ...prev,
        tags: [...(prev.tags || []), currentTag],
      }));
      setCurrentTag('');
    }
  };

  const removeTag = (tag: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags?.filter((t) => t !== tag) || [],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const slug = generateSlug(formData.name.en);

      // Update product basic info
      await api.put(`/products/${id}`, {
        ...formData,
        slug,
      });

      // Update or create variants
      for (const variant of variants) {
        if (variant._id) {
          // Update existing variant
          await api.put(`/products/${id}/variants/${variant._id}`, variant);
        } else {
          // Create new variant
          await api.post(`/products/${id}/variants`, variant);
        }
      }

      alert('Product updated successfully!');
      navigate('/products');
    } catch (error: any) {
      console.error('Failed to update product:', error);
      alert(error.response?.data?.message || 'Failed to update product');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="h-12 w-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading product...</p>
        </div>
      </div>
    );
  }

  if (!product) return null;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => navigate('/products')}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h2 className="text-2xl font-bold">Edit Product</h2>
            <p className="text-muted-foreground">{product.name.en}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button type="button" variant="outline" onClick={() => navigate('/products')}>
            Cancel
          </Button>
          <Button type="submit" disabled={saving || uploading}>
            <Save className="mr-2 h-4 w-4" />
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content - Same as ProductCreate but with pre-filled values */}
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
                  <Label>Product Name (English) *</Label>
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
                  <Label>Product Name (Arabic) *</Label>
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
                  <Label>Product Name (French) *</Label>
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
                  <Label>Description (English) *</Label>
                  <Textarea
                    required
                    rows={4}
                    value={formData.description.en}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        description: { ...prev.description, en: e.target.value },
                      }))
                    }
                  />
                </TabsContent>
                <TabsContent value="ar" className="space-y-2">
                  <Label>Description (Arabic) *</Label>
                  <Textarea
                    required
                    rows={4}
                    value={formData.description.ar}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        description: { ...prev.description, ar: e.target.value },
                      }))
                    }
                    dir="rtl"
                  />
                </TabsContent>
                <TabsContent value="fr" className="space-y-2">
                  <Label>Description (French) *</Label>
                  <Textarea
                    required
                    rows={4}
                    value={formData.description.fr}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        description: { ...prev.description, fr: e.target.value },
                      }))
                    }
                  />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* Product Images */}
          <Card>
            <CardHeader>
              <CardTitle>Product Images</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-4 gap-4">
                {formData.images.map((image, index) => (
                  <div key={index} className="relative aspect-square">
                    <img
                      src={image}
                      alt={`Product ${index + 1}`}
                      className="w-full h-full object-cover rounded-lg"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 right-2 h-6 w-6"
                      onClick={() => removeImage('product', index)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
                <label className="aspect-square border-2 border-dashed rounded-lg flex items-center justify-center cursor-pointer hover:bg-accent">
                  <div className="text-center">
                    <Upload className="h-6 w-6 mx-auto mb-2 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">Upload</span>
                  </div>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleImageUpload(e, 'product')}
                    disabled={uploading}
                  />
                </label>
              </div>
            </CardContent>
          </Card>

          {/* Variants */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Product Variants</CardTitle>
                <Button type="button" variant="outline" size="sm" onClick={addVariant}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Variant
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {variants.map((variant, index) => (
                <div key={index} className="border rounded-lg p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">
                      Variant {index + 1}
                      {variant._id && (
                        <Badge variant="secondary" className="ml-2">
                          ID: {variant._id.toString().slice(-6)}
                        </Badge>
                      )}
                    </h4>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setVariantToDelete({ index, id: variant._id?.toString() });
                        setDeleteDialogOpen(true);
                      }}
                    >
                      <Trash2 className="h-4 w-4 text-red-600" />
                    </Button>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <Label>SKU *</Label>
                      <Input
                        required
                        value={variant.sku}
                        onChange={(e) =>
                          setVariants((prev) =>
                            prev.map((v, i) => (i === index ? { ...v, sku: e.target.value } : v))
                          )
                        }
                      />
                    </div>
                    <div>
                      <Label>Size</Label>
                      <Input
                        value={variant.size || ''}
                        onChange={(e) =>
                          setVariants((prev) =>
                            prev.map((v, i) => (i === index ? { ...v, size: e.target.value } : v))
                          )
                        }
                      />
                    </div>
                    <div>
                      <Label>Color</Label>
                      <Input
                        value={variant.color || ''}
                        onChange={(e) =>
                          setVariants((prev) =>
                            prev.map((v, i) => (i === index ? { ...v, color: e.target.value } : v))
                          )
                        }
                      />
                    </div>
                    <div>
                      <Label>Material</Label>
                      <Input
                        value={variant.material || ''}
                        onChange={(e) =>
                          setVariants((prev) =>
                            prev.map((v, i) =>
                              i === index ? { ...v, material: e.target.value } : v
                            )
                          )
                        }
                      />
                    </div>
                    <div>
                      <Label>Price (DA)</Label>
                      <Input
                        type="number"
                        min="0"
                        value={variant.price || ''}
                        onChange={(e) =>
                          setVariants((prev) =>
                            prev.map((v, i) =>
                              i === index ? { ...v, price: Number(e.target.value) } : v
                            )
                          )
                        }
                      />
                    </div>
                    <div>
                      <Label>Stock *</Label>
                      <Input
                        required
                        type="number"
                        min="0"
                        value={variant.stock}
                        onChange={(e) =>
                          setVariants((prev) =>
                            prev.map((v, i) =>
                              i === index ? { ...v, stock: Number(e.target.value) } : v
                            )
                          )
                        }
                      />
                    </div>
                  </div>

                  {/* Variant Images */}
                  <div>
                    <Label>Variant Images</Label>
                    <div className="grid grid-cols-6 gap-2 mt-2">
                      {variant.images.map((image, imgIndex) => (
                        <div key={imgIndex} className="relative aspect-square">
                          <img
                            src={image}
                            alt={`Variant ${imgIndex + 1}`}
                            className="w-full h-full object-cover rounded"
                          />
                          <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            className="absolute top-1 right-1 h-5 w-5"
                            onClick={() => removeImage('variant', imgIndex, index)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                      <label className="aspect-square border-2 border-dashed rounded flex items-center justify-center cursor-pointer hover:bg-accent">
                        <Upload className="h-4 w-4 text-muted-foreground" />
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => handleImageUpload(e, 'variant', index)}
                          disabled={uploading}
                        />
                      </label>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Switch
                      checked={variant.isActive}
                      onCheckedChange={(checked) =>
                        setVariants((prev) =>
                          prev.map((v, i) => (i === index ? { ...v, isActive: checked } : v))
                        )
                      }
                    />
                    <Label>Active</Label>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar - Same as ProductCreate */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Pricing</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Base Price (DA) *</Label>
                <Input
                  required
                  type="number"
                  min="0"
                  value={formData.basePrice}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, basePrice: Number(e.target.value) }))
                  }
                />
              </div>
              <div>
                <Label>Compare at Price (DA)</Label>
                <Input
                  type="number"
                  min="0"
                  value={formData.compareAtPrice || ''}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      compareAtPrice: Number(e.target.value),
                    }))
                  }
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Organization</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Category *</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, category: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat._id} value={cat._id}>
                        {cat.name.en}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Brand</Label>
                <Select
                  value={formData.brand}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, brand: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {brands.map((brand) => (
                      <SelectItem key={brand._id} value={brand._id}>
                        {brand.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Separator />

              <div>
                <Label>Tags</Label>
                <div className="flex gap-2 mt-2">
                  <Input
                    value={currentTag}
                    onChange={(e) => setCurrentTag(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                  />
                  <Button type="button" variant="outline" onClick={addTag}>
                    Add
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.tags?.map((tag) => (
                    <Badge key={tag} variant="secondary">
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="ml-1 hover:text-destructive"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Active</Label>
                  <p className="text-sm text-muted-foreground">Product visible in store</p>
                </div>
                <Switch
                  checked={formData.isActive}
                  onCheckedChange={(checked) =>
                    setFormData((prev) => ({ ...prev, isActive: checked }))
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>Featured</Label>
                  <p className="text-sm text-muted-foreground">Show on homepage</p>
                </div>
                <Switch
                  checked={formData.featured}
                  onCheckedChange={(checked) =>
                    setFormData((prev) => ({ ...prev, featured: checked }))
                  }
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Delete Variant Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Variant?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this variant. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteVariant}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </form>
  );
};

export default ProductEdit;