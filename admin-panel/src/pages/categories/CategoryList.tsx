import React, { useEffect, useState } from 'react';
import { Plus, Edit, Trash2, FolderTree, Image as ImageIcon } from 'lucide-react';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
import type { Category } from '@/types';

const CategoryList = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [mainCategories, setMainCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);
  const [uploading, setUploading] = useState(false);

  const [formData, setFormData] = useState({
    name: { ar: '', en: '', fr: '' },
    description: { ar: '', en: '', fr: '' },
    slug: '',
    parent: null as string | null,
    image: '',
    order: 0,
    isActive: true,
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await api.get('/categories');
      setCategories(response.data.data || []);
      setMainCategories(
        response.data.data?.filter((cat: Category) => !cat.parent) || []
      );
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const uploaded = await uploadFile(file, 'category');
      setFormData((prev) => ({ ...prev, image: uploaded.url }));
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  const handleOpenDialog = (category?: Category) => {
    if (category) {
      setEditingCategory(category);
      setFormData({
        name: category.name,
        description: category.description as { ar: string, en: string, fr: string }  || { ar: '', en: '', fr: '' },
        slug: category.slug,
        parent: category.parent || null,
        image: category.image || '',
        order: category.order,
        isActive: category.isActive,
      });
    } else {
      setEditingCategory(null);
      setFormData({
        name: { ar: '', en: '', fr: '' },
        description: { ar: '', en: '', fr: '' },
        slug: '',
        parent: null,
        image: '',
        order: 0,
        isActive: true,
      });
    }
    setDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const slug = formData.slug || generateSlug(formData.name.en);
      const data = { ...formData, slug };

      if (editingCategory) {
        await api.put(`/categories/${editingCategory._id}`, data);
        alert('Category updated successfully!');
      } else {
        await api.post('/categories', data);
        alert('Category created successfully!');
      }

      setDialogOpen(false);
      fetchCategories();
    } catch (error: any) {
      console.error('Failed to save category:', error);
      alert(error.response?.data?.message || 'Failed to save category');
    }
  };

  const handleDelete = async () => {
    if (!categoryToDelete) return;

    try {
      await api.delete(`/categories/${categoryToDelete._id}`);
      alert('Category deleted successfully!');
      setDeleteDialogOpen(false);
      setCategoryToDelete(null);
      fetchCategories();
    } catch (error: any) {
      console.error('Failed to delete category:', error);
      alert(error.response?.data?.message || 'Failed to delete category');
    }
  };

  const getSubcategories = (parentId: string) => {
    return categories.filter((cat) => cat.parent === parentId);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Categories</h2>
          <p className="text-muted-foreground">
            Manage product categories and subcategories ({categories.length} total)
          </p>
        </div>
        <Button onClick={() => handleOpenDialog()}>
          <Plus className="mr-2 h-4 w-4" />
          Add Category
        </Button>
      </div>

      {/* Categories Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[80px]">Image</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead>Order</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <TableRow key={i}>
                    <TableCell colSpan={7}>
                      <div className="h-12 bg-muted animate-pulse rounded" />
                    </TableCell>
                  </TableRow>
                ))
              ) : mainCategories.length > 0 ? (
                <>
                  {mainCategories.map((category) => {
                    const subcategories = getSubcategories(category._id);
                    return (
                      <React.Fragment key={category._id}>
                        {/* Main Category */}
                        <TableRow>
                          <TableCell>
                            {category.image ? (
                              <img
                                src={getImageUrl(category.image)}
                                alt={category.name.en}
                                className="h-12 w-12 rounded-lg object-cover"
                              />
                            ) : (
                              <div className="h-12 w-12 rounded-lg bg-muted flex items-center justify-center">
                                <ImageIcon className="h-6 w-6 text-muted-foreground" />
                              </div>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="font-medium flex items-center gap-2">
                              <FolderTree className="h-4 w-4 text-primary" />
                              {category.name.en}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {category.name.ar}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge>Main Category</Badge>
                          </TableCell>
                          <TableCell>
                            <code className="text-xs bg-muted px-2 py-1 rounded">
                              {category.slug}
                            </code>
                          </TableCell>
                          <TableCell>{category.order}</TableCell>
                          <TableCell>
                            <Badge variant={category.isActive ? 'default' : 'secondary'}>
                              {category.isActive ? 'Active' : 'Inactive'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleOpenDialog(category)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => {
                                  setCategoryToDelete(category);
                                  setDeleteDialogOpen(true);
                                }}
                              >
                                <Trash2 className="h-4 w-4 text-red-600" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>

                        {/* Subcategories */}
                        {subcategories.map((subcategory) => (
                          <TableRow key={subcategory._id} className="bg-muted/30">
                            <TableCell>
                              {subcategory.image ? (
                                <img
                                  src={getImageUrl(subcategory.image)}
                                  alt={subcategory.name.en}
                                  className="h-10 w-10 rounded-lg object-cover ml-4"
                                />
                              ) : (
                                <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center ml-4">
                                  <ImageIcon className="h-5 w-5 text-muted-foreground" />
                                </div>
                              )}
                            </TableCell>
                            <TableCell>
                              <div className="font-medium ml-6 flex items-center gap-2">
                                <span className="text-muted-foreground">└─</span>
                                {subcategory.name.en}
                              </div>
                              <div className="text-xs text-muted-foreground ml-6">
                                {subcategory.name.ar}
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline">Subcategory</Badge>
                            </TableCell>
                            <TableCell>
                              <code className="text-xs bg-muted px-2 py-1 rounded">
                                {subcategory.slug}
                              </code>
                            </TableCell>
                            <TableCell>{subcategory.order}</TableCell>
                            <TableCell>
                              <Badge variant={subcategory.isActive ? 'default' : 'secondary'}>
                                {subcategory.isActive ? 'Active' : 'Inactive'}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-2">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleOpenDialog(subcategory)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => {
                                    setCategoryToDelete(subcategory);
                                    setDeleteDialogOpen(true);
                                  }}
                                >
                                  <Trash2 className="h-4 w-4 text-red-600" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </React.Fragment>
                    );
                  })}
                </>
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    <FolderTree className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground">No categories found</p>
                    <Button variant="link" onClick={() => handleOpenDialog()} className="mt-2">
                      Create your first category
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
            <DialogTitle>
              {editingCategory ? 'Edit Category' : 'Create New Category'}
            </DialogTitle>
            <DialogDescription>
              {editingCategory
                ? 'Update category information'
                : 'Add a new category to organize your products'}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name (Multilingual) */}
            <div>
              <Label>Category Name *</Label>
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
                    placeholder="Category name in English"
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
                    placeholder="اسم الفئة بالعربية"
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
                    placeholder="Nom de la catégorie en français"
                  />
                </TabsContent>
              </Tabs>
            </div>

            {/* Description */}
            <div>
              <Label>Description</Label>
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
                  />
                </TabsContent>
              </Tabs>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {/* Slug */}
              <div>
                <Label>Slug</Label>
                <Input
                  value={formData.slug}
                  onChange={(e) => setFormData((prev) => ({ ...prev, slug: e.target.value }))}
                  placeholder="auto-generated"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Leave empty to auto-generate from English name
                </p>
              </div>

              {/* Parent Category */}
              <div>
                <Label>Parent Category</Label>
                <Select
                  value={formData.parent || 'none'}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, parent: value === 'none' ? null : value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="None (Main Category)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None (Main Category)</SelectItem>
                    {mainCategories
                      .filter((cat) => cat._id !== editingCategory?._id)
                      .map((cat) => (
                        <SelectItem key={cat._id} value={cat._id}>
                          {cat.name.en}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Order */}
              <div>
                <Label>Display Order</Label>
                <Input
                  type="number"
                  min="0"
                  value={formData.order}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, order: Number(e.target.value) }))
                  }
                />
              </div>

              {/* Active Status */}
              <div className="flex items-center justify-between border rounded-lg p-3">
                <Label>Active Status</Label>
                <Switch
                  checked={formData.isActive}
                  onCheckedChange={(checked) =>
                    setFormData((prev) => ({ ...prev, isActive: checked }))
                  }
                />
              </div>
            </div>

            {/* Image Upload */}
            <div>
              <Label>Category Image</Label>
              <div className="mt-2">
                {formData.image ? (
                  <div className="relative inline-block">
                    <img
                      src={formData.image}
                      alt="Category"
                      className="h-32 w-32 object-cover rounded-lg"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 right-2 h-6 w-6"
                      onClick={() => setFormData((prev) => ({ ...prev, image: '' }))}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center h-32 w-32 border-2 border-dashed rounded-lg cursor-pointer hover:bg-accent transition-colors">
                    <ImageIcon className="h-8 w-8 text-muted-foreground mb-2" />
                    <span className="text-xs text-muted-foreground">Upload Image</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageUpload}
                      disabled={uploading}
                    />
                  </label>
                )}
                {uploading && <p className="text-sm text-muted-foreground mt-2">Uploading...</p>}
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={uploading}>
                {editingCategory ? 'Update Category' : 'Create Category'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Category?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{categoryToDelete?.name.en}"? This action cannot
              be undone.
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

export default CategoryList;