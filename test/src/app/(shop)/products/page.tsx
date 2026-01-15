'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
// import { useTranslations, useLocale } from 'next-intl';
import api from '@/lib/api';
import type { Product, Category, Brand } from '@/lib/types';
import ProductCard from '@/components/products/ProductCard';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import ProductFilters from '@/components/products/ProductFilters';

export default function ProductsPage() {
  // const t = useTranslations();
  // const locale = useLocale();
  const searchParams = useSearchParams();

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState('-createdAt');

  useEffect(() => {
    fetchProducts();
  }, [searchParams, page, sort]);

  useEffect(() => {
    fetchFilters();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params: any = {
        page,
        limit: 12,
        sort,
        active: true,
      };

      // Apply filters from URL
      if (searchParams.get('category')) params.category = searchParams.get('category');
      if (searchParams.get('brand')) params.brand = searchParams.get('brand');
      if (searchParams.get('search')) params.search = searchParams.get('search');
      if (searchParams.get('minPrice')) params.minPrice = searchParams.get('minPrice');
      if (searchParams.get('maxPrice')) params.maxPrice = searchParams.get('maxPrice');

      const response = await api.get('/products', { params });
      setProducts(response.data.data || []);
      setTotal(response.data.total || 0);
    } catch (error) {
      console.error('Failed to fetch products:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchFilters = async () => {
    try {
      const [categoriesRes, brandsRes] = await Promise.all([
        api.get('/categories', { params: { active: true } }),
        api.get('/brands', { params: { active: true } }),
      ]);
      setCategories(categoriesRes.data.data || []);
      setBrands(brandsRes.data.data || []);
    } catch (error) {
      console.error('Failed to fetch filters:', error);
    }
  };

  const totalPages = Math.ceil(total / 12);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">{('products.title')}</h1>
        {/* <h1 className="text-3xl font-bold mb-2">{t('products.title')}</h1> */}
        <p className="text-muted-foreground">
          showing { products.length}, {total }
          {/* {('products.showing', { count: products.length, total })} */}
          {/* {t('products.showing', { count: products.length, total })} */}
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-[250px_1fr]">
        {/* Filters Sidebar */}
        <aside className="space-y-6">
          <ProductFilters categories={categories} brands={brands} />
        </aside>

        {/* Products Grid */}
        <div className="space-y-6">
          {/* Sort */}
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {total} {('products.title')}
              {/* {total} {t('products.title')} */}
            </p>
            <Select value={sort} onValueChange={setSort}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder={('products.sort')} />
                {/* <SelectValue placeholder={t('products.sort')} /> */}
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="-createdAt">{('products.sortBy.newest')}</SelectItem>
                {/* <SelectItem value="-createdAt">{t('products.sortBy.newest')}</SelectItem> */}
                <SelectItem value="basePrice">{('products.sortBy.priceLowHigh')}</SelectItem>
                {/* <SelectItem value="basePrice">{t('products.sortBy.priceLowHigh')}</SelectItem> */}
                <SelectItem value="-basePrice">{('products.sortBy.priceHighLow')}</SelectItem>
                {/* <SelectItem value="-basePrice">{t('products.sortBy.priceHighLow')}</SelectItem> */}
                <SelectItem value="-soldCount">{('products.sortBy.popular')}</SelectItem>
                {/* <SelectItem value="-soldCount">{t('products.sortBy.popular')}</SelectItem> */}
              </SelectContent>
            </Select>
          </div>

          {/* Products */}
          {loading ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="space-y-3">
                  <Skeleton className="h-64 w-full rounded-lg" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              ))}
            </div>
          ) : products.length > 0 ? (
            <>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {products.map((product) => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center gap-2 mt-8">
                  <Button
                    variant="outline"
                    onClick={() => setPage(page - 1)}
                    disabled={page === 1}
                  >
                    {('common.back')}
                    {/* {t('common.back')} */}
                  </Button>
                  <div className="flex items-center gap-2">
                    {[...Array(totalPages)].map((_, i) => (
                      <Button
                        key={i}
                        variant={page === i + 1 ? 'default' : 'outline'}
                        onClick={() => setPage(i + 1)}
                        size="sm"
                      >
                        {i + 1}
                      </Button>
                    ))}
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => setPage(page + 1)}
                    disabled={page === totalPages}
                  >
                    {('common.next')}
                    {/* {t('common.next')} */}
                  </Button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12">
              <p className="text-lg text-muted-foreground">{('products.noResults')}</p>
              {/* <p className="text-lg text-muted-foreground">{t('products.noResults')}</p> */}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}