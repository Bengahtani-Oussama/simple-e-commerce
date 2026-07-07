// import { useState, useEffect } from "react";
// import { useNavigate } from "react-router-dom";
// import { ArrowLeft, Plus, Trash2, Upload, X } from "lucide-react";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Textarea } from "@/components/ui/textarea";
// import { Label } from "@/components/ui/label";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
// import { Switch } from "@/components/ui/switch";
// import { Separator } from "@/components/ui/separator";
// import { Badge } from "@/components/ui/badge";
// import api, { uploadFile, uploadMultipleFiles } from "@/services/api";
// import { generateSlug } from "@/utils";
// import type { Category, Brand, ProductFormData } from "@/types";

// const ProductCreate = () => {
//   const navigate = useNavigate();
//   const [loading, setLoading] = useState(false);
//   const [categories, setCategories] = useState<Category[]>([]);
//   const [brands, setBrands] = useState<Brand[]>([]);
//   const [uploading, setUploading] = useState(false);

//   const [formData, setFormData] = useState<ProductFormData>({
//     name: { ar: "", en: "", fr: "" },
//     description: { ar: "", en: "", fr: "" },
//     category: "",
//     subcategory: "",
//     brand: "",
//     basePrice: 0,
//     compareAtPrice: 0,
//     images: [],
//     tags: [],
//     featured: false,
//     isActive: true,
//   });

//   const [variants, setVariants] = useState([
//     {
//       sku: "",
//       size: "",
//       color: "",
//       material: "",
//       price: 0,
//       stock: 0,
//       images: [],
//       isActive: true,
//     },
//   ]);

//   const [currentTag, setCurrentTag] = useState("");

//   useEffect(() => {
//     fetchCategories();
//     fetchBrands();
//   }, []);

//   const fetchCategories = async () => {
//     try {
//       const response = await api.get("/categories", {
//         params: { active: true },
//       });
//       setCategories(response.data.data || []);
//     } catch (error) {
//       console.error("Failed to fetch categories:", error);
//     }
//   };

//   const fetchBrands = async () => {
//     try {
//       const response = await api.get("/brands", { params: { active: true } });
//       setBrands(response.data.data || []);
//     } catch (error) {
//       console.error("Failed to fetch brands:", error);
//     }
//   };

//   const handleImageUpload = async (
//     e: React.ChangeEvent<HTMLInputElement>,
//     type: "product" | "variant",
//     index?: number,
//   ) => {
//     const files = e.target.files;
//     if (!files || files.length === 0) return;

//     setUploading(true);
//     try {
//       if (type === "product") {
//         const filesArray = Array.from(files);
//         const uploadedImages = await uploadMultipleFiles(filesArray);
//         setFormData((prev) => ({
//           ...prev,
//           images: [...prev.images, ...uploadedImages.map((img) => img.url)],
//         }));
//       } else if (type === "variant" && index !== undefined) {
//         const uploaded = await uploadFile(files[0], "product");
//         // setVariants((prev) =>
//         //   prev.map((v, i) =>
//         //     i === index ? { ...v, images: [...v.images, uploaded.url] } : v
//         //   )
//         // );
//         setVariants(
//           (
//             prev: {
//               sku: string;
//               size: string;
//               color: string;
//               material: string;
//               price: number;
//               stock: number;
//               images: never[];
//               isActive: boolean;
//             }[],
//           ) => {
//             return prev.map((v, i) =>
//               i === index
//                 ? { ...v, images: [...v.images, uploaded.url as never] }
//                 : v,
//             );
//           },
//         );
//       }
//     } catch (error) {
//       console.error("Upload failed:", error);
//       alert("Failed to upload image");
//     } finally {
//       setUploading(false);
//     }
//   };

//   const removeImage = (
//     type: "product" | "variant",
//     imageIndex: number,
//     variantIndex?: number,
//   ) => {
//     if (type === "product") {
//       setFormData((prev) => ({
//         ...prev,
//         images: prev.images.filter((_, i) => i !== imageIndex),
//       }));
//     } else if (variantIndex !== undefined) {
//       setVariants((prev) =>
//         prev.map((v, i) =>
//           i === variantIndex
//             ? { ...v, images: v.images.filter((_, idx) => idx !== imageIndex) }
//             : v,
//         ),
//       );
//     }
//   };

//   const addVariant = () => {
//     setVariants([
//       ...variants,
//       {
//         sku: "",
//         size: "",
//         color: "",
//         material: "",
//         price: 0,
//         stock: 0,
//         images: [],
//         isActive: true,
//       },
//     ]);
//   };

//   const removeVariant = (index: number) => {
//     setVariants(variants.filter((_, i) => i !== index));
//   };

//   const addTag = () => {
//     if (currentTag && !formData.tags?.includes(currentTag)) {
//       setFormData((prev) => ({
//         ...prev,
//         tags: [...(prev.tags || []), currentTag],
//       }));
//       setCurrentTag("");
//     }
//   };

//   const removeTag = (tag: string) => {
//     setFormData((prev) => ({
//       ...prev,
//       tags: prev.tags?.filter((t) => t !== tag) || [],
//     }));
//   };

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setLoading(true);

//     try {
//       // Generate slug from English name
//       const slug = generateSlug(formData.name.en);

//       // Create product
//       const productResponse = await api.post("/products", {
//         ...formData,
//         slug,
//         variants: [], // We'll add variants after
//       });

//       const productId = productResponse.data.data._id;

//       // Add variants
//       for (const variant of variants) {
//         await api.post(`/products/${productId}/variants`, variant);
//       }

//       alert("Product created successfully!");
//       navigate("/products");
//     } catch (error: any) {
//       console.error("Failed to create product:", error);
//       alert(error.response?.data?.message || "Failed to create product");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <form onSubmit={handleSubmit} className="space-y-6">
//       {/* Header */}
//       <div className="flex items-center justify-between">
//         <div className="flex items-center gap-4">
//           <Button
//             type="button"
//             variant="ghost"
//             size="icon"
//             onClick={() => navigate("/products")}
//           >
//             <ArrowLeft className="h-5 w-5" />
//           </Button>
//           <div>
//             <h2 className="text-2xl font-bold">Create New Product</h2>
//             <p className="text-muted-foreground">
//               Add a new product to your inventory
//             </p>
//           </div>
//         </div>
//         <div className="flex gap-2">
//           <Button
//             type="button"
//             variant="outline"
//             onClick={() => navigate("/products")}
//           >
//             Cancel
//           </Button>
//           <Button type="submit" disabled={loading || uploading}>
//             {loading ? "Creating..." : "Create Product"}
//           </Button>
//         </div>
//       </div>

//       <div className="grid gap-6 lg:grid-cols-3">
//         {/* Main Content */}
//         <div className="lg:col-span-2 space-y-6">
//           {/* Basic Information */}
//           <Card>
//             <CardHeader>
//               <CardTitle>Basic Information</CardTitle>
//             </CardHeader>
//             <CardContent className="space-y-4">
//               {/* Product Name (Multilingual) */}
//               <Tabs defaultValue="en">
//                 <TabsList className="grid w-full grid-cols-3">
//                   <TabsTrigger value="en">English</TabsTrigger>
//                   <TabsTrigger value="ar">Arabic</TabsTrigger>
//                   <TabsTrigger value="fr">French</TabsTrigger>
//                 </TabsList>
//                 <TabsContent value="en" className="space-y-2">
//                   <Label>Product Name (English) *</Label>
//                   <Input
//                     required
//                     value={formData.name.en}
//                     onChange={(e) =>
//                       setFormData((prev) => ({
//                         ...prev,
//                         name: { ...prev.name, en: e.target.value },
//                       }))
//                     }
//                     placeholder="Enter product name in English"
//                   />
//                 </TabsContent>
//                 <TabsContent value="ar" className="space-y-2">
//                   <Label>Product Name (Arabic) *</Label>
//                   <Input
//                     required
//                     value={formData.name.ar}
//                     onChange={(e) =>
//                       setFormData((prev) => ({
//                         ...prev,
//                         name: { ...prev.name, ar: e.target.value },
//                       }))
//                     }
//                     placeholder="أدخل اسم المنتج بالعربية"
//                     dir="rtl"
//                   />
//                 </TabsContent>
//                 <TabsContent value="fr" className="space-y-2">
//                   <Label>Product Name (French) *</Label>
//                   <Input
//                     required
//                     value={formData.name.fr}
//                     onChange={(e) =>
//                       setFormData((prev) => ({
//                         ...prev,
//                         name: { ...prev.name, fr: e.target.value },
//                       }))
//                     }
//                     placeholder="Entrez le nom du produit en français"
//                   />
//                 </TabsContent>
//               </Tabs>

//               {/* Description */}
//               <Tabs defaultValue="en">
//                 <TabsList className="grid w-full grid-cols-3">
//                   <TabsTrigger value="en">English</TabsTrigger>
//                   <TabsTrigger value="ar">Arabic</TabsTrigger>
//                   <TabsTrigger value="fr">French</TabsTrigger>
//                 </TabsList>
//                 <TabsContent value="en" className="space-y-2">
//                   <Label>Description (English) *</Label>
//                   <Textarea
//                     required
//                     rows={4}
//                     value={formData.description.en}
//                     onChange={(e) =>
//                       setFormData((prev) => ({
//                         ...prev,
//                         description: {
//                           ...prev.description,
//                           en: e.target.value,
//                         },
//                       }))
//                     }
//                     placeholder="Product description in English"
//                   />
//                 </TabsContent>
//                 <TabsContent value="ar" className="space-y-2">
//                   <Label>Description (Arabic) *</Label>
//                   <Textarea
//                     required
//                     rows={4}
//                     value={formData.description.ar}
//                     onChange={(e) =>
//                       setFormData((prev) => ({
//                         ...prev,
//                         description: {
//                           ...prev.description,
//                           ar: e.target.value,
//                         },
//                       }))
//                     }
//                     placeholder="وصف المنتج بالعربية"
//                     dir="rtl"
//                   />
//                 </TabsContent>
//                 <TabsContent value="fr" className="space-y-2">
//                   <Label>Description (French) *</Label>
//                   <Textarea
//                     required
//                     rows={4}
//                     value={formData.description.fr}
//                     onChange={(e) =>
//                       setFormData((prev) => ({
//                         ...prev,
//                         description: {
//                           ...prev.description,
//                           fr: e.target.value,
//                         },
//                       }))
//                     }
//                     placeholder="Description du produit en français"
//                   />
//                 </TabsContent>
//               </Tabs>
//             </CardContent>
//           </Card>

//           {/* Product Images */}
//           <Card>
//             <CardHeader>
//               <CardTitle>Product Images</CardTitle>
//             </CardHeader>
//             <CardContent>
//               <div className="space-y-4">
//                 <div className="grid grid-cols-4 gap-4">
//                   {formData.images.map((image, index) => (
//                     <div key={index} className="relative aspect-square">
//                       <img
//                         src={image}
//                         alt={`Product ${index + 1}`}
//                         className="w-full h-full object-cover rounded-lg"
//                       />
//                       <Button
//                         type="button"
//                         variant="destructive"
//                         size="icon"
//                         className="absolute top-2 right-2 h-6 w-6"
//                         onClick={() => removeImage("product", index)}
//                       >
//                         <X className="h-3 w-3" />
//                       </Button>
//                     </div>
//                   ))}
//                   <label className="aspect-square border-2 border-dashed rounded-lg flex items-center justify-center cursor-pointer hover:bg-accent transition-colors">
//                     <div className="text-center">
//                       <Upload className="h-6 w-6 mx-auto mb-2 text-muted-foreground" />
//                       <span className="text-xs text-muted-foreground">
//                         Upload
//                       </span>
//                     </div>
//                     <input
//                       type="file"
//                       multiple
//                       accept="image/*"
//                       className="hidden"
//                       onChange={(e) => handleImageUpload(e, "product")}
//                       disabled={uploading}
//                     />
//                   </label>
//                 </div>
//                 {uploading && (
//                   <p className="text-sm text-muted-foreground">Uploading...</p>
//                 )}
//               </div>
//             </CardContent>
//           </Card>

//           {/* Variants */}
//           <Card>
//             <CardHeader>
//               <div className="flex items-center justify-between">
//                 <CardTitle>Product Variants</CardTitle>
//                 <Button
//                   type="button"
//                   variant="outline"
//                   size="sm"
//                   onClick={addVariant}
//                 >
//                   <Plus className="mr-2 h-4 w-4" />
//                   Add Variant
//                 </Button>
//               </div>
//             </CardHeader>
//             <CardContent className="space-y-6">
//               {variants.map((variant, index) => (
//                 <div key={index} className="border rounded-lg p-4 space-y-4">
//                   <div className="flex items-center justify-between">
//                     <h4 className="font-medium">Variant {index + 1}</h4>
//                     {variants.length > 1 && (
//                       <Button
//                         type="button"
//                         variant="ghost"
//                         size="sm"
//                         onClick={() => removeVariant(index)}
//                       >
//                         <Trash2 className="h-4 w-4 text-red-600" />
//                       </Button>
//                     )}
//                   </div>

//                   <div className="grid gap-4 md:grid-cols-2">
//                     <div>
//                       <Label>SKU *</Label>
//                       <Input
//                         required
//                         value={variant.sku}
//                         onChange={(e) =>
//                           setVariants((prev) =>
//                             prev.map((v, i) =>
//                               i === index ? { ...v, sku: e.target.value } : v,
//                             ),
//                           )
//                         }
//                         placeholder="e.g., TSHIRT-RED-M"
//                       />
//                     </div>
//                     <div>
//                       <Label>Size</Label>
//                       <Input
//                         value={variant.size}
//                         onChange={(e) =>
//                           setVariants((prev) =>
//                             prev.map((v, i) =>
//                               i === index ? { ...v, size: e.target.value } : v,
//                             ),
//                           )
//                         }
//                         placeholder="e.g., M, L, XL"
//                       />
//                     </div>
//                     <div>
//                       <Label>Color</Label>
//                       <Input
//                         value={variant.color}
//                         onChange={(e) =>
//                           setVariants((prev) =>
//                             prev.map((v, i) =>
//                               i === index ? { ...v, color: e.target.value } : v,
//                             ),
//                           )
//                         }
//                         placeholder="e.g., Red, Blue"
//                       />
//                     </div>
//                     <div>
//                       <Label>Material</Label>
//                       <Input
//                         value={variant.material}
//                         onChange={(e) =>
//                           setVariants((prev) =>
//                             prev.map((v, i) =>
//                               i === index
//                                 ? { ...v, material: e.target.value }
//                                 : v,
//                             ),
//                           )
//                         }
//                         placeholder="e.g., Cotton, Polyester"
//                       />
//                     </div>
//                     <div>
//                       <Label>Price (DA)</Label>
//                       <Input
//                         type="number"
//                         min="0"
//                         value={variant.price || ""}
//                         onChange={(e) =>
//                           setVariants((prev) =>
//                             prev.map((v, i) =>
//                               i === index
//                                 ? { ...v, price: Number(e.target.value) }
//                                 : v,
//                             ),
//                           )
//                         }
//                         placeholder="Leave empty to use base price"
//                       />
//                     </div>
//                     <div>
//                       <Label>Stock *</Label>
//                       <Input
//                         required
//                         type="number"
//                         min="0"
//                         value={variant.stock}
//                         onChange={(e) =>
//                           setVariants((prev) =>
//                             prev.map((v, i) =>
//                               i === index
//                                 ? { ...v, stock: Number(e.target.value) }
//                                 : v,
//                             ),
//                           )
//                         }
//                       />
//                     </div>
//                   </div>

//                   {/* Variant Images */}
//                   <div>
//                     <Label>Variant Images (Optional)</Label>
//                     <div className="grid grid-cols-6 gap-2 mt-2">
//                       {variant.images.map((image, imgIndex) => (
//                         <div key={imgIndex} className="relative aspect-square">
//                           <img
//                             src={image}
//                             alt={`Variant ${imgIndex + 1}`}
//                             className="w-full h-full object-cover rounded"
//                           />
//                           <Button
//                             type="button"
//                             variant="destructive"
//                             size="icon"
//                             className="absolute top-1 right-1 h-5 w-5"
//                             onClick={() =>
//                               removeImage("variant", imgIndex, index)
//                             }
//                           >
//                             <X className="h-3 w-3" />
//                           </Button>
//                         </div>
//                       ))}
//                       <label className="aspect-square border-2 border-dashed rounded flex items-center justify-center cursor-pointer hover:bg-accent transition-colors">
//                         <Upload className="h-4 w-4 text-muted-foreground" />
//                         <input
//                           type="file"
//                           accept="image/*"
//                           className="hidden"
//                           onChange={(e) =>
//                             handleImageUpload(e, "variant", index)
//                           }
//                           disabled={uploading}
//                         />
//                       </label>
//                     </div>
//                   </div>
//                 </div>
//               ))}
//             </CardContent>
//           </Card>
//         </div>

//         {/* Sidebar */}
//         <div className="space-y-6">
//           {/* Pricing */}
//           <Card>
//             <CardHeader>
//               <CardTitle>Pricing</CardTitle>
//             </CardHeader>
//             <CardContent className="space-y-4">
//               <div>
//                 <Label>Base Price (DA) *</Label>
//                 <Input
//                   required
//                   type="number"
//                   min="0"
//                   value={formData.basePrice}
//                   onChange={(e) =>
//                     setFormData((prev) => ({
//                       ...prev,
//                       basePrice: Number(e.target.value),
//                     }))
//                   }
//                 />
//               </div>
//               <div>
//                 <Label>Compare at Price (DA)</Label>
//                 <Input
//                   type="number"
//                   min="0"
//                   value={formData.compareAtPrice || ""}
//                   onChange={(e) =>
//                     setFormData((prev) => ({
//                       ...prev,
//                       compareAtPrice: Number(e.target.value),
//                     }))
//                   }
//                   placeholder="Original price for discounts"
//                 />
//               </div>
//             </CardContent>
//           </Card>

//           {/* Organization */}
//           <Card>
//             <CardHeader>
//               <CardTitle>Organization</CardTitle>
//             </CardHeader>
//             <CardContent className="space-y-4">
//               <div>
//                 <Label>Category *</Label>
//                 <Select
//                   required
//                   value={formData.category}
//                   onValueChange={(value) =>
//                     setFormData((prev) => ({ ...prev, category: value }))
//                   }
//                 >
//                   <SelectTrigger>
//                     <SelectValue placeholder="Select category" />
//                   </SelectTrigger>
//                   <SelectContent>
//                     {categories.map((cat) => (
//                       <SelectItem key={cat._id} value={cat._id}>
//                         {cat.name.en}
//                       </SelectItem>
//                     ))}
//                   </SelectContent>
//                 </Select>
//               </div>

//               <div>
//                 <Label>Brand</Label>
//                 <Select
//                   value={formData.brand}
//                   onValueChange={(value) =>
//                     setFormData((prev) => ({ ...prev, brand: value }))
//                   }
//                 >
//                   <SelectTrigger>
//                     <SelectValue placeholder="Select brand" />
//                   </SelectTrigger>
//                   <SelectContent>
//                     {brands.map((brand) => (
//                       <SelectItem key={brand._id} value={brand._id}>
//                         {brand.name}
//                       </SelectItem>
//                     ))}
//                   </SelectContent>
//                 </Select>
//               </div>

//               <Separator />

//               <div>
//                 <Label>Tags</Label>
//                 <div className="flex gap-2 mt-2">
//                   <Input
//                     value={currentTag}
//                     onChange={(e) => setCurrentTag(e.target.value)}
//                     placeholder="Add tag"
//                     onKeyPress={(e) =>
//                       e.key === "Enter" && (e.preventDefault(), addTag())
//                     }
//                   />
//                   <Button type="button" variant="outline" onClick={addTag}>
//                     Add
//                   </Button>
//                 </div>
//                 <div className="flex flex-wrap gap-2 mt-2">
//                   {formData.tags?.map((tag) => (
//                     <Badge key={tag} variant="secondary">
//                       {tag}
//                       <button
//                         type="button"
//                         onClick={() => removeTag(tag)}
//                         className="ml-1 hover:text-destructive"
//                       >
//                         <X className="h-3 w-3" />
//                       </button>
//                     </Badge>
//                   ))}
//                 </div>
//               </div>
//             </CardContent>
//           </Card>

//           {/* Status */}
//           <Card>
//             <CardHeader>
//               <CardTitle>Status</CardTitle>
//             </CardHeader>
//             <CardContent className="space-y-4">
//               <div className="flex items-center justify-between">
//                 <div>
//                   <Label>Active</Label>
//                   <p className="text-sm text-muted-foreground">
//                     Product visible in store
//                   </p>
//                 </div>
//                 <Switch
//                   checked={formData.isActive}
//                   onCheckedChange={(checked) =>
//                     setFormData((prev) => ({ ...prev, isActive: checked }))
//                   }
//                 />
//               </div>
//               <div className="flex items-center justify-between">
//                 <div>
//                   <Label>Featured</Label>
//                   <p className="text-sm text-muted-foreground">
//                     Show on homepage
//                   </p>
//                 </div>
//                 <Switch
//                   checked={formData.featured}
//                   onCheckedChange={(checked) =>
//                     setFormData((prev) => ({ ...prev, featured: checked }))
//                   }
//                 />
//               </div>
//             </CardContent>
//           </Card>
//         </div>
//       </div>
//     </form>
//   );
// };

// export default ProductCreate;

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Save,
  Plus,
  X,
  Upload,
  Trash2,
  Tag,
  Package,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import api, { uploadMultipleFiles, uploadFile } from "@/services/api";
import { generateSlug, formatPrice } from "@/utils";
import type { Category, Brand, ProductVariant } from "@/types";

/**
 * ProductCreate Component
 *
 * Matches backend Product model EXACTLY:
 * - Basic product info (name, description, slug)
 * - Category, subcategory, brand
 * - Base pricing (basePrice, compareAtPrice)
 * - Main product images
 * - Tags
 * - Variant Options (sizes, colors, materials, customFields)
 * - Featured/Active status
 * - Weight & dimensions
 *
 * Variants are added AFTER product creation via separate API calls
 */
const ProductCreate = () => {
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);

  // Categories and Brands
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);

  // Product Form Data - MATCHES BACKEND EXACTLY
  const [formData, setFormData] = useState({
    name: { ar: "", en: "", fr: "" },
    description: { ar: "", en: "", fr: "" },
    slug: "",
    category: "",
    subcategory: "",
    brand: "",
    basePrice: 0,
    compareAtPrice: 0,
    images: [] as string[],
    tags: [] as string[],
    featured: false,
    isActive: true,
    weight: 0,
    dimensions: {
      length: 0,
      width: 0,
      height: 0,
    },
    // Variant Options - EXACTLY as in backend
    variantOptions: {
      sizes: [] as string[],
      colors: [] as string[],
      materials: [] as string[],
      customFields: [] as { name: string; values: string[] }[],
    },
  });

  // UI State for adding tags and variant options
  const [newTag, setNewTag] = useState("");
  const [newSize, setNewSize] = useState("");
  const [newColor, setNewColor] = useState("");
  const [newMaterial, setNewMaterial] = useState("");
  const [newCustomField, setNewCustomField] = useState({ name: "", value: "" });

  useEffect(() => {
    fetchCategories();
    fetchBrands();
  }, []);

  useEffect(() => {
    if (formData.category) {
      fetchSubcategories(formData.category);
    }
  }, [formData.category]);

  const fetchCategories = async () => {
    try {
      const response = await api.get("/categories", {
        params: { parent: "null", active: true },
      });
      setCategories(response.data.data || []);
    } catch (error) {
      console.error("Failed to fetch categories:", error);
    }
  };

  const fetchSubcategories = async (categoryId: string) => {
    try {
      const response = await api.get("/categories", {
        params: { parent: categoryId, active: true },
      });
      setSubcategories(response.data.data || []);
    } catch (error) {
      console.error("Failed to fetch subcategories:", error);
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

  // Image Upload
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setUploadingImages(true);
    try {
      const uploaded = await uploadMultipleFiles(files);
      setFormData((prev) => ({
        ...prev,
        images: [...prev.images, ...uploaded.map((img) => img.url)],
      }));
    } catch (error) {
      console.error("Upload failed:", error);
      alert("Failed to upload images");
    } finally {
      setUploadingImages(false);
    }
  };

  const removeImage = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  // Tags Management
  const addTag = () => {
    if (!newTag.trim()) return;
    if (formData.tags.includes(newTag.trim())) return;

    setFormData((prev) => ({
      ...prev,
      tags: [...prev.tags, newTag.trim()],
    }));
    setNewTag("");
  };

  const removeTag = (tag: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((t) => t !== tag),
    }));
  };

  // Variant Options Management
  const addSize = () => {
    if (!newSize.trim()) return;
    if (formData.variantOptions.sizes.includes(newSize.trim())) return;

    setFormData((prev) => ({
      ...prev,
      variantOptions: {
        ...prev.variantOptions,
        sizes: [...prev.variantOptions.sizes, newSize.trim()],
      },
    }));
    setNewSize("");
  };

  const removeSize = (size: string) => {
    setFormData((prev) => ({
      ...prev,
      variantOptions: {
        ...prev.variantOptions,
        sizes: prev.variantOptions.sizes.filter((s) => s !== size),
      },
    }));
  };

  const addColor = () => {
    if (!newColor.trim()) return;
    if (formData.variantOptions.colors.includes(newColor.trim())) return;

    setFormData((prev) => ({
      ...prev,
      variantOptions: {
        ...prev.variantOptions,
        colors: [...prev.variantOptions.colors, newColor.trim()],
      },
    }));
    setNewColor("");
  };

  const removeColor = (color: string) => {
    setFormData((prev) => ({
      ...prev,
      variantOptions: {
        ...prev.variantOptions,
        colors: prev.variantOptions.colors.filter((c) => c !== color),
      },
    }));
  };

  const addMaterial = () => {
    if (!newMaterial.trim()) return;
    if (formData.variantOptions.materials.includes(newMaterial.trim())) return;

    setFormData((prev) => ({
      ...prev,
      variantOptions: {
        ...prev.variantOptions,
        materials: [...prev.variantOptions.materials, newMaterial.trim()],
      },
    }));
    setNewMaterial("");
  };

  const removeMaterial = (material: string) => {
    setFormData((prev) => ({
      ...prev,
      variantOptions: {
        ...prev.variantOptions,
        materials: prev.variantOptions.materials.filter((m) => m !== material),
      },
    }));
  };

  const addCustomField = () => {
    if (!newCustomField.name.trim() || !newCustomField.value.trim()) return;

    const existingField = formData.variantOptions.customFields.find(
      (f) => f.name === newCustomField.name.trim(),
    );

    if (existingField) {
      // Add value to existing field
      if (existingField.values.includes(newCustomField.value.trim())) return;

      setFormData((prev) => ({
        ...prev,
        variantOptions: {
          ...prev.variantOptions,
          customFields: prev.variantOptions.customFields.map((f) =>
            f.name === newCustomField.name.trim()
              ? { ...f, values: [...f.values, newCustomField.value.trim()] }
              : f,
          ),
        },
      }));
    } else {
      // Create new field
      setFormData((prev) => ({
        ...prev,
        variantOptions: {
          ...prev.variantOptions,
          customFields: [
            ...prev.variantOptions.customFields,
            {
              name: newCustomField.name.trim(),
              values: [newCustomField.value.trim()],
            },
          ],
        },
      }));
    }

    setNewCustomField({ name: "", value: "" });
  };

  const removeCustomFieldValue = (fieldName: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      variantOptions: {
        ...prev.variantOptions,
        customFields: prev.variantOptions.customFields
          .map((f) =>
            f.name === fieldName
              ? { ...f, values: f.values.filter((v) => v !== value) }
              : f,
          )
          .filter((f) => f.values.length > 0), // Remove empty fields
      },
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.name.en.trim()) {
      alert("Please enter product name in English");
      return;
    }
    if (!formData.category) {
      alert("Please select a category");
      return;
    }
    if (formData.basePrice <= 0) {
      alert("Please enter a valid base price");
      return;
    }
    if (formData.images.length === 0) {
      alert("Please upload at least one product image");
      return;
    }

    setSaving(true);
    try {
      // Prepare data - EXACTLY as backend expects
      const slug = formData.slug || generateSlug(formData.name.en);

      const productData = {
        type: "simple",
        name: formData.name,
        slug,
        description: formData.description,
        category: formData.category,
        subcategory: formData.subcategory || undefined,
        brand: formData.brand || undefined,
        basePricing: {
          price: formData.basePrice,
          compareAtPrice: formData.compareAtPrice || undefined,
        },

        images: formData.images,
        tags: formData.tags,
        featured: formData.featured,
        isActive: formData.isActive,
        weight: formData.weight || undefined,
        dimensions: formData.weight ? formData.dimensions : undefined,
        variantOptions: formData.variantOptions,
        variants: [], // Empty array - variants added separately after creation
      };

      const response = await api.post("/products", productData);
      const createdProduct = response.data.data;

      alert("Product created successfully!");

      // Redirect to product edit page to add variants
      navigate(`/products/edit/${createdProduct._id}`);
    } catch (error: any) {
      console.error("Failed to create product:", error);
      alert(error.response?.data?.message || "Failed to create product");
    } finally {
      setSaving(false);
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
            onClick={() => navigate("/products")}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h2 className="text-2xl font-bold">Create New Product</h2>
            <p className="text-muted-foreground">
              Add a new product to your catalog
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
                <CardDescription>
                  Product name and description in multiple languages
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Product Name */}
                <div>
                  <Label>Product Name *</Label>
                  <Tabs defaultValue="en" className="mt-2">
                    <TabsList className="grid w-full grid-cols-3">
                      <TabsTrigger value="en">English</TabsTrigger>
                      <TabsTrigger value="ar">Arabic</TabsTrigger>
                      <TabsTrigger value="fr">French</TabsTrigger>
                    </TabsList>
                    <TabsContent value="en">
                      <Input
                        required
                        value={formData.name.en}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            name: { ...prev.name, en: e.target.value },
                          }))
                        }
                        placeholder="Product name in English"
                      />
                    </TabsContent>
                    <TabsContent value="ar">
                      <Input
                        required
                        value={formData.name.ar}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            name: { ...prev.name, ar: e.target.value },
                          }))
                        }
                        placeholder="اسم المنتج بالعربية"
                        dir="rtl"
                      />
                    </TabsContent>
                    <TabsContent value="fr">
                      <Input
                        required
                        value={formData.name.fr}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            name: { ...prev.name, fr: e.target.value },
                          }))
                        }
                        placeholder="Nom du produit en français"
                      />
                    </TabsContent>
                  </Tabs>
                </div>

                {/* Description */}
                <div>
                  <Label>Description *</Label>
                  <Tabs defaultValue="en" className="mt-2">
                    <TabsList className="grid w-full grid-cols-3">
                      <TabsTrigger value="en">English</TabsTrigger>
                      <TabsTrigger value="ar">Arabic</TabsTrigger>
                      <TabsTrigger value="fr">French</TabsTrigger>
                    </TabsList>
                    <TabsContent value="en">
                      <Textarea
                        required
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
                        rows={4}
                        placeholder="Product description in English"
                      />
                    </TabsContent>
                    <TabsContent value="ar">
                      <Textarea
                        required
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
                        rows={4}
                        placeholder="وصف المنتج بالعربية"
                        dir="rtl"
                      />
                    </TabsContent>
                    <TabsContent value="fr">
                      <Textarea
                        required
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
                        rows={4}
                        placeholder="Description du produit en français"
                      />
                    </TabsContent>
                  </Tabs>
                </div>

                {/* Slug */}
                <div>
                  <Label>URL Slug</Label>
                  <Input
                    value={formData.slug}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, slug: e.target.value }))
                    }
                    placeholder="auto-generated from English name"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Leave empty to auto-generate
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Product Images */}
            <Card>
              <CardHeader>
                <CardTitle>Product Images</CardTitle>
                <CardDescription>
                  Upload main product images (multiple allowed)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Image Upload */}
                  <div>
                    <label className="flex flex-col items-center justify-center h-32 border-2 border-dashed rounded-lg cursor-pointer hover:bg-accent transition-colors">
                      <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                      <span className="text-sm text-muted-foreground">
                        {uploadingImages
                          ? "Uploading..."
                          : "Click to upload images"}
                      </span>
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        className="hidden"
                        onChange={handleImageUpload}
                        disabled={uploadingImages}
                      />
                    </label>
                  </div>

                  {/* Image Preview */}
                  {formData.images.length > 0 && (
                    <div className="grid grid-cols-4 gap-4">
                      {formData.images.map((image, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={image}
                            alt={`Product ${index + 1}`}
                            className="w-full h-24 object-cover rounded-lg"
                          />
                          <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => removeImage(index)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                          {index === 0 && (
                            <Badge className="absolute bottom-1 left-1 text-xs">
                              Main
                            </Badge>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Variant Options */}
            <Card>
              <CardHeader>
                <CardTitle>Variant Options</CardTitle>
                <CardDescription>
                  Define available options for product variants (sizes, colors,
                  etc.)
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Sizes */}
                <div>
                  <Label>Sizes</Label>
                  <div className="flex gap-2 mt-2">
                    <Input
                      value={newSize}
                      onChange={(e) => setNewSize(e.target.value)}
                      onKeyDown={(e) =>
                        e.key === "Enter" && (e.preventDefault(), addSize())
                      }
                      placeholder="e.g., S, M, L, XL"
                    />
                    <Button type="button" onClick={addSize}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  {formData.variantOptions.sizes.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {formData.variantOptions.sizes.map((size) => (
                        <Badge key={size} variant="secondary" className="gap-1">
                          {size}
                          <X
                            className="h-3 w-3 cursor-pointer"
                            onClick={() => removeSize(size)}
                          />
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>

                {/* Colors */}
                <div>
                  <Label>Colors</Label>
                  <div className="flex gap-2 mt-2">
                    <Input
                      value={newColor}
                      onChange={(e) => setNewColor(e.target.value)}
                      onKeyDown={(e) =>
                        e.key === "Enter" && (e.preventDefault(), addColor())
                      }
                      placeholder="e.g., Red, Blue, Green"
                    />
                    <Button type="button" onClick={addColor}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  {formData.variantOptions.colors.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {formData.variantOptions.colors.map((color) => (
                        <Badge
                          key={color}
                          variant="secondary"
                          className="gap-1"
                        >
                          {color}
                          <X
                            className="h-3 w-3 cursor-pointer"
                            onClick={() => removeColor(color)}
                          />
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>

                {/* Materials */}
                <div>
                  <Label>Materials</Label>
                  <div className="flex gap-2 mt-2">
                    <Input
                      value={newMaterial}
                      onChange={(e) => setNewMaterial(e.target.value)}
                      onKeyDown={(e) =>
                        e.key === "Enter" && (e.preventDefault(), addMaterial())
                      }
                      placeholder="e.g., Cotton, Polyester, Blend"
                    />
                    <Button type="button" onClick={addMaterial}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  {formData.variantOptions.materials.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {formData.variantOptions.materials.map((material) => (
                        <Badge
                          key={material}
                          variant="secondary"
                          className="gap-1"
                        >
                          {material}
                          <X
                            className="h-3 w-3 cursor-pointer"
                            onClick={() => removeMaterial(material)}
                          />
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>

                <Separator />

                {/* Custom Fields */}
                <div>
                  <Label>Custom Attributes</Label>
                  <div className="grid grid-cols-3 gap-2 mt-2">
                    <Input
                      value={newCustomField.name}
                      onChange={(e) =>
                        setNewCustomField((prev) => ({
                          ...prev,
                          name: e.target.value,
                        }))
                      }
                      placeholder="Attribute name (e.g., Neck Style)"
                    />
                    <Input
                      value={newCustomField.value}
                      onChange={(e) =>
                        setNewCustomField((prev) => ({
                          ...prev,
                          value: e.target.value,
                        }))
                      }
                      onKeyDown={(e) =>
                        e.key === "Enter" &&
                        (e.preventDefault(), addCustomField())
                      }
                      placeholder="Value (e.g., V-Neck)"
                    />
                    <Button type="button" onClick={addCustomField}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add
                    </Button>
                  </div>

                  {formData.variantOptions.customFields.length > 0 && (
                    <div className="space-y-2 mt-3">
                      {formData.variantOptions.customFields.map((field) => (
                        <div key={field.name}>
                          <Label className="text-xs text-muted-foreground">
                            {field.name}
                          </Label>
                          <div className="flex flex-wrap gap-2 mt-1">
                            {field.values.map((value) => (
                              <Badge
                                key={value}
                                variant="secondary"
                                className="gap-1"
                              >
                                {value}
                                <X
                                  className="h-3 w-3 cursor-pointer"
                                  onClick={() =>
                                    removeCustomFieldValue(field.name, value)
                                  }
                                />
                              </Badge>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm">
                  <p className="text-blue-900">
                    <strong>Note:</strong> These options define what variants
                    can be created. After creating the product, you'll be able
                    to add specific variants with individual pricing, stock, and
                    images.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Tags & Shipping */}
            <Card>
              <CardHeader>
                <CardTitle>Additional Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Tags */}
                <div>
                  <Label>Tags</Label>
                  <div className="flex gap-2 mt-2">
                    <Input
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      onKeyDown={(e) =>
                        e.key === "Enter" && (e.preventDefault(), addTag())
                      }
                      placeholder="e.g., summer, sale, new-arrival"
                    />
                    <Button type="button" onClick={addTag}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  {formData.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {formData.tags.map((tag) => (
                        <Badge key={tag} variant="outline" className="gap-1">
                          <Tag className="h-3 w-3" />
                          {tag}
                          <X
                            className="h-3 w-3 cursor-pointer"
                            onClick={() => removeTag(tag)}
                          />
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>

                <Separator />

                {/* Shipping Weight & Dimensions */}
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label>Weight (grams)</Label>
                    <Input
                      type="number"
                      min="0"
                      value={formData.weight || ""}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          weight: Number(e.target.value),
                        }))
                      }
                      placeholder="0"
                    />
                  </div>
                </div>

                {formData.weight > 0 && (
                  <div className="grid gap-4 md:grid-cols-3">
                    <div>
                      <Label>Length (cm)</Label>
                      <Input
                        type="number"
                        min="0"
                        value={formData.dimensions.length || ""}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            dimensions: {
                              ...prev.dimensions,
                              length: Number(e.target.value),
                            },
                          }))
                        }
                      />
                    </div>
                    <div>
                      <Label>Width (cm)</Label>
                      <Input
                        type="number"
                        min="0"
                        value={formData.dimensions.width || ""}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            dimensions: {
                              ...prev.dimensions,
                              width: Number(e.target.value),
                            },
                          }))
                        }
                      />
                    </div>
                    <div>
                      <Label>Height (cm)</Label>
                      <Input
                        type="number"
                        min="0"
                        value={formData.dimensions.height || ""}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            dimensions: {
                              ...prev.dimensions,
                              height: Number(e.target.value),
                            },
                          }))
                        }
                      />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Organization */}
            <Card>
              <CardHeader>
                <CardTitle>Organization</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Category */}
                <div>
                  <Label>Category *</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) =>
                      setFormData((prev) => ({
                        ...prev,
                        category: value,
                        subcategory: "",
                      }))
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

                {/* Subcategory */}
                {subcategories.length > 0 && (
                  <div>
                    <Label>Subcategory</Label>
                    <Select
                      value={formData.subcategory}
                      onValueChange={(value) =>
                        setFormData((prev) => ({ ...prev, subcategory: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select subcategory" />
                      </SelectTrigger>
                      <SelectContent>
                        {subcategories.map((cat) => (
                          <SelectItem key={cat._id} value={cat._id}>
                            {cat.name.en}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {/* Brand */}
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
              </CardContent>
            </Card>

            {/* Pricing */}
            <Card>
              <CardHeader>
                <CardTitle>Pricing</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Base Price (DA) *</Label>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    required
                    value={formData.basePrice || ""}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        basePrice: Number(e.target.value),
                      }))
                    }
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <Label>Compare at Price (DA)</Label>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.compareAtPrice || ""}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        compareAtPrice: Number(e.target.value),
                      }))
                    }
                    placeholder="0.00"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Original price before discount
                  </p>
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
                    <p className="text-xs text-muted-foreground">
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
                    <p className="text-xs text-muted-foreground">
                      Show in featured section
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

            {/* Actions */}
            <div className="space-y-2">
              <Button
                type="submit"
                className="w-full"
                disabled={saving || uploadingImages}
              >
                <Save className="mr-2 h-4 w-4" />
                {saving ? "Creating..." : "Create Product"}
              </Button>
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => navigate("/products")}
              >
                Cancel
              </Button>
            </div>

            {/* Info Note */}
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm">
              <p className="text-amber-900">
                <strong>Next Step:</strong> After creating the product, you'll
                be redirected to add specific product variants with their own
                SKUs, pricing, stock levels, and images.
              </p>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default ProductCreate;
