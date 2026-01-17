import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Plus,
  Search,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  Filter,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import { formatPrice, getImageUrl, debounce } from '@/utils';
import type { Product, Category, Brand } from '@/types';

const ProductList = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);

  // Filters
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [brandFilter, setBrandFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 10;

  useEffect(() => {
    fetchCategories();
    fetchBrands();
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [search, categoryFilter, brandFilter, statusFilter, page]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params: any = {
        page,
        limit,
      };

      if (search) params.search = search;
      if (categoryFilter && categoryFilter !== "all") params.category = categoryFilter;
      if (brandFilter && brandFilter !== "all") params.brand = brandFilter;
      if (statusFilter && statusFilter !== "all") params.active = statusFilter;

      const response = await api.get('/products', { params });
      setProducts(response.data.data || []);
      setTotal(response.data.total || 0);
    } catch (error) {
      console.error('Failed to fetch products:', error);
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

  const handleSearch = debounce((value: string) => {
    setSearch(value);
    setPage(1);
  }, 500);

  const handleDelete = async () => {
    if (!productToDelete) return;

    try {
      await api.delete(`/products/${productToDelete._id}`);
      setDeleteDialogOpen(false);
      setProductToDelete(null);
      fetchProducts();
    } catch (error) {
      console.error('Failed to delete product:', error);
    }
  };

  const clearFilters = () => {
    setSearch('');
    setCategoryFilter('all');
    setBrandFilter('all');
    setStatusFilter('all');
    setPage(1);
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Products</h2>
          <p className="text-muted-foreground">
            Manage your product inventory ({total} products)
          </p>
        </div>
        <Button onClick={() => navigate('/products/create')}>
          <Plus className="mr-2 h-4 w-4" />
          Add Product
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            {/* Search */}
            <div className="lg:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search products..."
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Category Filter */}
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat._id} value={cat._id}>
                    {cat.name.en}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Brand Filter */}
            <Select value={brandFilter} onValueChange={setBrandFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Brands" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Brands</SelectItem>
                {brands.map((brand) => (
                  <SelectItem key={brand._id} value={brand._id}>
                    {brand.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Status Filter */}
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="true">Active</SelectItem>
                <SelectItem value="false">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {(search || categoryFilter !== "all" || brandFilter !== "all" || statusFilter !== "all") && (
            <div className="mt-4">
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                Clear Filters
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Products Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[80px]">Image</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Brand</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[80px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <TableRow key={i}>
                    <TableCell colSpan={8}>
                      <div className="h-12 bg-muted animate-pulse rounded" />
                    </TableCell>
                  </TableRow>
                ))
              ) : products.length > 0 ? (
                products.map((product) => (
                  <TableRow key={product._id}>
                    <TableCell>
                      <img
                        src={getImageUrl(product.images[0])}
                        alt={product.name.en}
                        className="h-12 w-12 rounded-lg object-cover"
                      />
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{product.name.en}</div>
                      <div className="text-xs text-muted-foreground">
                        SKU: {product.variants[0]?.sku || 'N/A'}
                      </div>
                    </TableCell>
                    <TableCell>
                      {typeof product.category === 'object'
                        ? product.category.name.en
                        : 'N/A'}
                    </TableCell>
                    <TableCell>
                      {typeof product.brand === 'object' ? product.brand.name : 'N/A'}
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">
                        {formatPrice(product.basePrice)}
                      </div>
                      {product.compareAtPrice && (
                        <div className="text-xs text-muted-foreground line-through">
                          {formatPrice(product.compareAtPrice)}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          product.totalStock && product.totalStock > 0
                            ? 'default'
                            : 'destructive'
                        }
                      >
                        {product.totalStock || 0} units
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={product.isActive ? 'default' : 'secondary'}>
                        {product.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() =>
                              window.open(
                                `http://localhost:3000/en/product/${product.slug}`,
                                '_blank'
                              )
                            }
                          >
                            <Eye className="mr-2 h-4 w-4" />
                            View
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => navigate(`/products/edit/${product._id}`)}
                          >
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => {
                              setProductToDelete(product);
                              setDeleteDialogOpen(true);
                            }}
                            className="text-red-600"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
                    <p className="text-muted-foreground">No products found</p>
                    <Button
                      variant="link"
                      onClick={() => navigate('/products/create')}
                      className="mt-2"
                    >
                      Create your first product
                    </Button>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {(page - 1) * limit + 1} to {Math.min(page * limit, total)} of{' '}
            {total} products
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(page - 1)}
              disabled={page === 1}
            >
              Previous
            </Button>
            <div className="flex gap-1">
              {[...Array(Math.min(5, totalPages))].map((_, i) => {
                const pageNum = i + 1;
                return (
                  <Button
                    key={pageNum}
                    variant={page === pageNum ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setPage(pageNum)}
                  >
                    {pageNum}
                  </Button>
                );
              })}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(page + 1)}
              disabled={page === totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete "{productToDelete?.name.en}" and all its
              variants. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ProductList;