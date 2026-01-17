import { useEffect, useState } from 'react';
import { Plus, Edit, Trash2, Tag, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import api, { uploadFile } from '@/services/api';
import { generateSlug, getImageUrl } from '@/utils';
import type { Brand } from '@/types';

const BrandList = () => {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null);
  const [brandToDelete, setBrandToDelete] = useState<Brand | null>(null);
  const [uploading, setUploading] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    logo: '',
    description: { ar: '', en: '', fr: '' },
    isActive: true,
  });

  useEffect(() => {
    fetchBrands();
  }, []);

  const fetchBrands = async () => {
    try {
      const response = await api.get('/brands');
      setBrands(response.data.data || []);
    } catch (error) {
      console.error('Failed to fetch brands:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const uploaded = await uploadFile(file, 'brand');
      setFormData((prev) => ({ ...prev, logo: uploaded.url }));
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Failed to upload logo');
    } finally {
      setUploading(false);
    }
  };

  const handleOpenDialog = (brand?: Brand) => {
    if (brand) {
      setEditingBrand(brand);
      setFormData({
        name: brand.name,
        slug: brand.slug,
        logo: brand.logo || '',
        description: brand.description as { ar: string, en: string, fr: string } || { ar: '', en: '', fr: '' },
        isActive: brand.isActive,
      });
    } else {
      setEditingBrand(null);
      setFormData({
        name: '',
        slug: '',
        logo: '',
        description: { ar: '', en: '', fr: '' },
        isActive: true,
      });
    }
    setDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const slug = formData.slug || generateSlug(formData.name);
      const data = { ...formData, slug };

      if (editingBrand) {
        await api.put(`/brands/${editingBrand._id}`, data);
        alert('Brand updated successfully!');
      } else {
        await api.post('/brands', data);
        alert('Brand created successfully!');
      }

      setDialogOpen(false);
      fetchBrands();
    } catch (error: any) {
      console.error('Failed to save brand:', error);
      alert(error.response?.data?.message || 'Failed to save brand');
    }
  };

  const handleDelete = async () => {
    if (!brandToDelete) return;

    try {
      await api.delete(`/brands/${brandToDelete._id}`);
      alert('Brand deleted successfully!');
      setDeleteDialogOpen(false);
      setBrandToDelete(null);
      fetchBrands();
    } catch (error: any) {
      console.error('Failed to delete brand:', error);
      alert(error.response?.data?.message || 'Failed to delete brand');
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Brands</h2>
          <p className="text-muted-foreground">
            Manage product brands ({brands.length} brands)
          </p>
        </div>
        <Button onClick={() => handleOpenDialog()}>
          <Plus className="mr-2 h-4 w-4" />
          Add Brand
        </Button>
      </div>

      {/* Brands Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[80px]">Logo</TableHead>
                <TableHead>Brand Name</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <TableRow key={i}>
                    <TableCell colSpan={6}>
                      <div className="h-12 bg-muted animate-pulse rounded" />
                    </TableCell>
                  </TableRow>
                ))
              ) : brands.length > 0 ? (
                brands.map((brand) => (
                  <TableRow key={brand._id}>
                    <TableCell>
                      {brand.logo ? (
                        <img
                          src={getImageUrl(brand.logo)}
                          alt={brand.name}
                          className="h-12 w-12 rounded-lg object-contain bg-white border p-1"
                        />
                      ) : (
                        <div className="h-12 w-12 rounded-lg bg-muted flex items-center justify-center">
                          <Tag className="h-6 w-6 text-muted-foreground" />
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{brand.name}</div>
                    </TableCell>
                    <TableCell>
                      <code className="text-xs bg-muted px-2 py-1 rounded">
                        {brand.slug}
                      </code>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm text-muted-foreground max-w-md truncate">
                        {brand.description?.en || 'No description'}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={brand.isActive ? 'default' : 'secondary'}>
                        {brand.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleOpenDialog(brand)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setBrandToDelete(brand);
                            setDeleteDialogOpen(true);
                          }}
                        >
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    <Tag className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground">No brands found</p>
                    <Button variant="link" onClick={() => handleOpenDialog()} className="mt-2">
                      Create your first brand
                    </Button>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingBrand ? 'Edit Brand' : 'Create New Brand'}</DialogTitle>
            <DialogDescription>
              {editingBrand
                ? 'Update brand information'
                : 'Add a new brand to your product catalog'}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Brand Name */}
            <div>
              <Label>Brand Name *</Label>
              <Input
                required
                value={formData.name}
                onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., Nike, Adidas, Samsung"
              />
            </div>

            {/* Slug */}
            <div>
              <Label>Slug</Label>
              <Input
                value={formData.slug}
                onChange={(e) => setFormData((prev) => ({ ...prev, slug: e.target.value }))}
                placeholder="auto-generated"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Leave empty to auto-generate from brand name
              </p>
            </div>

            {/* Description (Multilingual) */}
            <div>
              <Label>Description (Optional)</Label>
              <Tabs defaultValue="en" className="mt-2">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="en">English</TabsTrigger>
                  <TabsTrigger value="ar">Arabic</TabsTrigger>
                  <TabsTrigger value="fr">French</TabsTrigger>
                </TabsList>
                <TabsContent value="en">
                  <Textarea
                    value={formData.description.en}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        description: { ...prev.description, en: e.target.value },
                      }))
                    }
                    rows={3}
                    placeholder="Brand description in English"
                  />
                </TabsContent>
                <TabsContent value="ar">
                  <Textarea
                    value={formData.description.ar}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        description: { ...prev.description, ar: e.target.value },
                      }))
                    }
                    rows={3}
                    placeholder="وصف العلامة التجارية بالعربية"
                    dir="rtl"
                  />
                </TabsContent>
                <TabsContent value="fr">
                  <Textarea
                    value={formData.description.fr}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        description: { ...prev.description, fr: e.target.value },
                      }))
                    }
                    rows={3}
                    placeholder="Description de la marque en français"
                  />
                </TabsContent>
              </Tabs>
            </div>

            {/* Logo Upload */}
            <div>
              <Label>Brand Logo</Label>
              <div className="mt-2">
                {formData.logo ? (
                  <div className="relative inline-block">
                    <img
                      src={formData.logo}
                      alt="Brand Logo"
                      className="h-32 w-32 object-contain bg-white border rounded-lg p-2"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 right-2 h-6 w-6"
                      onClick={() => setFormData((prev) => ({ ...prev, logo: '' }))}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center h-32 w-32 border-2 border-dashed rounded-lg cursor-pointer hover:bg-accent transition-colors">
                    <ImageIcon className="h-8 w-8 text-muted-foreground mb-2" />
                    <span className="text-xs text-muted-foreground">Upload Logo</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleLogoUpload}
                      disabled={uploading}
                    />
                  </label>
                )}
                {uploading && <p className="text-sm text-muted-foreground mt-2">Uploading...</p>}
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Recommended: Square logo, transparent background, PNG or SVG format
              </p>
            </div>

            {/* Active Status */}
            <div className="flex items-center justify-between border rounded-lg p-4">
              <div>
                <Label>Active Status</Label>
                <p className="text-sm text-muted-foreground">
                  Make this brand visible in the store
                </p>
              </div>
              <Switch
                checked={formData.isActive}
                onCheckedChange={(checked) =>
                  setFormData((prev) => ({ ...prev, isActive: checked }))
                }
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={uploading}>
                {editingBrand ? 'Update Brand' : 'Create Brand'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Brand?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{brandToDelete?.name}"? This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default BrandList;