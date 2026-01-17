import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Plus, Trash2, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import api, { uploadFile, uploadMultipleFiles } from "@/services/api";
import { generateSlug } from "@/utils";
import type { Category, Brand, ProductFormData } from "@/types";

const ProductCreate = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [uploading, setUploading] = useState(false);

  const [formData, setFormData] = useState<ProductFormData>({
    name: { ar: "", en: "", fr: "" },
    description: { ar: "", en: "", fr: "" },
    category: "",
    subcategory: "",
    brand: "",
    basePrice: 0,
    compareAtPrice: 0,
    images: [],
    tags: [],
    featured: false,
    isActive: true,
  });

  const [variants, setVariants] = useState([
    {
      sku: "",
      size: "",
      color: "",
      material: "",
      price: 0,
      stock: 0,
      images: [],
      isActive: true,
    },
  ]);

  const [currentTag, setCurrentTag] = useState("");

  useEffect(() => {
    fetchCategories();
    fetchBrands();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await api.get("/categories", {
        params: { active: true },
      });
      setCategories(response.data.data || []);
    } catch (error) {
      console.error("Failed to fetch categories:", error);
    }
  };

  const fetchBrands = async () => {
    try {
      const response = await api.get("/brands", { params: { active: true } });
      setBrands(response.data.data || []);
    } catch (error) {
      console.error("Failed to fetch brands:", error);
    }
  };

  const handleImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    type: "product" | "variant",
    index?: number,
  ) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    try {
      if (type === "product") {
        const filesArray = Array.from(files);
        const uploadedImages = await uploadMultipleFiles(filesArray);
        setFormData((prev) => ({
          ...prev,
          images: [...prev.images, ...uploadedImages.map((img) => img.url)],
        }));
      } else if (type === "variant" && index !== undefined) {
        const uploaded = await uploadFile(files[0], "product");
        // setVariants((prev) =>
        //   prev.map((v, i) =>
        //     i === index ? { ...v, images: [...v.images, uploaded.url] } : v
        //   )
        // );
        setVariants(
          (
            prev: {
              sku: string;
              size: string;
              color: string;
              material: string;
              price: number;
              stock: number;
              images: never[];
              isActive: boolean;
            }[],
          ) => {
            return prev.map((v, i) =>
              i === index
                ? { ...v, images: [...v.images, uploaded.url as never] }
                : v,
            );
          },
        );
      }
    } catch (error) {
      console.error("Upload failed:", error);
      alert("Failed to upload image");
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (
    type: "product" | "variant",
    imageIndex: number,
    variantIndex?: number,
  ) => {
    if (type === "product") {
      setFormData((prev) => ({
        ...prev,
        images: prev.images.filter((_, i) => i !== imageIndex),
      }));
    } else if (variantIndex !== undefined) {
      setVariants((prev) =>
        prev.map((v, i) =>
          i === variantIndex
            ? { ...v, images: v.images.filter((_, idx) => idx !== imageIndex) }
            : v,
        ),
      );
    }
  };

  const addVariant = () => {
    setVariants([
      ...variants,
      {
        sku: "",
        size: "",
        color: "",
        material: "",
        price: 0,
        stock: 0,
        images: [],
        isActive: true,
      },
    ]);
  };

  const removeVariant = (index: number) => {
    setVariants(variants.filter((_, i) => i !== index));
  };

  const addTag = () => {
    if (currentTag && !formData.tags?.includes(currentTag)) {
      setFormData((prev) => ({
        ...prev,
        tags: [...(prev.tags || []), currentTag],
      }));
      setCurrentTag("");
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
    setLoading(true);

    try {
      // Generate slug from English name
      const slug = generateSlug(formData.name.en);

      // Create product
      const productResponse = await api.post("/products", {
        ...formData,
        slug,
        variants: [], // We'll add variants after
      });

      const productId = productResponse.data.data._id;

      // Add variants
      for (const variant of variants) {
        await api.post(`/products/${productId}/variants`, variant);
      }

      alert("Product created successfully!");
      navigate("/products");
    } catch (error: any) {
      console.error("Failed to create product:", error);
      alert(error.response?.data?.message || "Failed to create product");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => navigate("/products")}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h2 className="text-2xl font-bold">Create New Product</h2>
            <p className="text-muted-foreground">
              Add a new product to your inventory
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate("/products")}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={loading || uploading}>
            {loading ? "Creating..." : "Create Product"}
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
              {/* Product Name (Multilingual) */}
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
                    placeholder="Enter product name in English"
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
                    placeholder="أدخل اسم المنتج بالعربية"
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
                    placeholder="Entrez le nom du produit en français"
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
                  <Label>Description (English) *</Label>
                  <Textarea
                    required
                    rows={4}
                    value={formData.description.en}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        description: {
                          ...prev.description,
                          en: e.target.value,
                        },
                      }))
                    }
                    placeholder="Product description in English"
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
                        description: {
                          ...prev.description,
                          ar: e.target.value,
                        },
                      }))
                    }
                    placeholder="وصف المنتج بالعربية"
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
                        description: {
                          ...prev.description,
                          fr: e.target.value,
                        },
                      }))
                    }
                    placeholder="Description du produit en français"
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
              <div className="space-y-4">
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
                        onClick={() => removeImage("product", index)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                  <label className="aspect-square border-2 border-dashed rounded-lg flex items-center justify-center cursor-pointer hover:bg-accent transition-colors">
                    <div className="text-center">
                      <Upload className="h-6 w-6 mx-auto mb-2 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">
                        Upload
                      </span>
                    </div>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleImageUpload(e, "product")}
                      disabled={uploading}
                    />
                  </label>
                </div>
                {uploading && (
                  <p className="text-sm text-muted-foreground">Uploading...</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Variants */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Product Variants</CardTitle>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addVariant}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Variant
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {variants.map((variant, index) => (
                <div key={index} className="border rounded-lg p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">Variant {index + 1}</h4>
                    {variants.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeVariant(index)}
                      >
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </Button>
                    )}
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <Label>SKU *</Label>
                      <Input
                        required
                        value={variant.sku}
                        onChange={(e) =>
                          setVariants((prev) =>
                            prev.map((v, i) =>
                              i === index ? { ...v, sku: e.target.value } : v,
                            ),
                          )
                        }
                        placeholder="e.g., TSHIRT-RED-M"
                      />
                    </div>
                    <div>
                      <Label>Size</Label>
                      <Input
                        value={variant.size}
                        onChange={(e) =>
                          setVariants((prev) =>
                            prev.map((v, i) =>
                              i === index ? { ...v, size: e.target.value } : v,
                            ),
                          )
                        }
                        placeholder="e.g., M, L, XL"
                      />
                    </div>
                    <div>
                      <Label>Color</Label>
                      <Input
                        value={variant.color}
                        onChange={(e) =>
                          setVariants((prev) =>
                            prev.map((v, i) =>
                              i === index ? { ...v, color: e.target.value } : v,
                            ),
                          )
                        }
                        placeholder="e.g., Red, Blue"
                      />
                    </div>
                    <div>
                      <Label>Material</Label>
                      <Input
                        value={variant.material}
                        onChange={(e) =>
                          setVariants((prev) =>
                            prev.map((v, i) =>
                              i === index
                                ? { ...v, material: e.target.value }
                                : v,
                            ),
                          )
                        }
                        placeholder="e.g., Cotton, Polyester"
                      />
                    </div>
                    <div>
                      <Label>Price (DA)</Label>
                      <Input
                        type="number"
                        min="0"
                        value={variant.price || ""}
                        onChange={(e) =>
                          setVariants((prev) =>
                            prev.map((v, i) =>
                              i === index
                                ? { ...v, price: Number(e.target.value) }
                                : v,
                            ),
                          )
                        }
                        placeholder="Leave empty to use base price"
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
                              i === index
                                ? { ...v, stock: Number(e.target.value) }
                                : v,
                            ),
                          )
                        }
                      />
                    </div>
                  </div>

                  {/* Variant Images */}
                  <div>
                    <Label>Variant Images (Optional)</Label>
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
                            onClick={() =>
                              removeImage("variant", imgIndex, index)
                            }
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                      <label className="aspect-square border-2 border-dashed rounded flex items-center justify-center cursor-pointer hover:bg-accent transition-colors">
                        <Upload className="h-4 w-4 text-muted-foreground" />
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) =>
                            handleImageUpload(e, "variant", index)
                          }
                          disabled={uploading}
                        />
                      </label>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Pricing */}
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
                    setFormData((prev) => ({
                      ...prev,
                      basePrice: Number(e.target.value),
                    }))
                  }
                />
              </div>
              <div>
                <Label>Compare at Price (DA)</Label>
                <Input
                  type="number"
                  min="0"
                  value={formData.compareAtPrice || ""}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      compareAtPrice: Number(e.target.value),
                    }))
                  }
                  placeholder="Original price for discounts"
                />
              </div>
            </CardContent>
          </Card>

          {/* Organization */}
          <Card>
            <CardHeader>
              <CardTitle>Organization</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Category *</Label>
                <Select
                  required
                  value={formData.category}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, category: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
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
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, brand: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select brand" />
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
                    placeholder="Add tag"
                    onKeyPress={(e) =>
                      e.key === "Enter" && (e.preventDefault(), addTag())
                    }
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

          {/* Status */}
          <Card>
            <CardHeader>
              <CardTitle>Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Active</Label>
                  <p className="text-sm text-muted-foreground">
                    Product visible in store
                  </p>
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
                  <p className="text-sm text-muted-foreground">
                    Show on homepage
                  </p>
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
    </form>
  );
};

export default ProductCreate;
