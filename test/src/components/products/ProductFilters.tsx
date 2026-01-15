'use client';

import { useRouter, useSearchParams } from 'next/navigation';
// import { useTranslations, useLocale } from 'next-intl';
import { useState } from 'react';
import type { Category, Brand } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { X } from 'lucide-react';

interface ProductFiltersProps {
  categories: Category[];
  brands: Brand[];
}

export default function ProductFilters({ categories, brands }: ProductFiltersProps) {
  // const t = useTranslations();
  // const locale = useLocale();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [minPrice, setMinPrice] = useState(searchParams.get('minPrice') || '');
  const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || '');

  const updateFilters = (key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.push(`/products?${params.toString()}`);
    // router.push(`/${locale}/products?${params.toString()}`);
  };

  const clearAllFilters = () => {
    setMinPrice('');
    setMaxPrice('');
    router.push(`/products`);
    // router.push(`/${locale}/products`);
  };

  const applyPriceFilter = () => {
    const params = new URLSearchParams(searchParams.toString());
    if (minPrice) params.set('minPrice', minPrice);
    else params.delete('minPrice');
    if (maxPrice) params.set('maxPrice', maxPrice);
    else params.delete('maxPrice');
    router.push(`/products?${params.toString()}`);
    // router.push(`/${locale}/products?${params.toString()}`);
  };

  const selectedCategory = searchParams.get('category');
  const selectedBrand = searchParams.get('brand');
  const hasFilters = selectedCategory || selectedBrand || minPrice || maxPrice;

  return (
    <div className="space-y-6">
      {/* Clear Filters */}
      {hasFilters && (
        <Button
          variant="outline"
          size="sm"
          onClick={clearAllFilters}
          className="w-full gap-2"
        >
          <X className="h-4 w-4" />
          {('products.filters.clearAll')}
          {/* {t('products.filters.clearAll')} */}
        </Button>
      )}

      {/* Categories */}
      <div>
        <h3 className="font-semibold mb-3">{('products.filters.category')}</h3>
        {/* <h3 className="font-semibold mb-3">{t('products.filters.category')}</h3> */}
        <div className="space-y-2">
          <Button
            variant={!selectedCategory ? 'default' : 'ghost'}
            size="sm"
            onClick={() => updateFilters('category', null)}
            className="w-full justify-start"
          >
            {('products.viewAll')}
            {/* {t('products.viewAll')} */}
          </Button>
          {categories.map((category) => {
            const categoryName =  category.name.en;
            // const categoryName = category.name[locale as keyof typeof category.name] || category.name.en;
            return (
              <Button
                key={category._id}
                variant={selectedCategory === category._id ? 'default' : 'ghost'}
                size="sm"
                onClick={() => updateFilters('category', category._id)}
                className="w-full justify-start"
              >
                {categoryName}
              </Button>
            );
          })}
        </div>
      </div>

      <Separator />

      {/* Brands */}
      <div>
        <h3 className="font-semibold mb-3">{('products.filters.brand')}</h3>
        {/* <h3 className="font-semibold mb-3">{t('products.filters.brand')}</h3> */}
        <div className="space-y-2">
          <Button
            variant={!selectedBrand ? 'default' : 'ghost'}
            size="sm"
            onClick={() => updateFilters('brand', null)}
            className="w-full justify-start"
          >
            {('products.viewAll')}
            {/* {t('products.viewAll')} */}
          </Button>
          {brands.map((brand) => (
            <Button
              key={brand._id}
              variant={selectedBrand === brand._id ? 'default' : 'ghost'}
              size="sm"
              onClick={() => updateFilters('brand', brand._id)}
              className="w-full justify-start"
            >
              {brand.name}
            </Button>
          ))}
        </div>
      </div>

      <Separator />

      {/* Price Range */}
      <div>
        <h3 className="font-semibold mb-3">{('products.filters.priceRange')}</h3>
        {/* <h3 className="font-semibold mb-3">{t('products.filters.priceRange')}</h3> */}
        <div className="space-y-3">
          <div>
            <Label htmlFor="minPrice">{('products.filters.minPrice')}</Label>
            {/* <Label htmlFor="minPrice">{t('products.filters.minPrice')}</Label> */}
            <Input
              id="minPrice"
              type="number"
              placeholder="0"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="maxPrice">{('products.filters.maxPrice')}</Label>
            {/* <Label htmlFor="maxPrice">{t('products.filters.maxPrice')}</Label> */}
            <Input
              id="maxPrice"
              type="number"
              placeholder="10000"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
            />
          </div>
          <Button onClick={applyPriceFilter} className="w-full">
            {('common.submit')}
            {/* {t('common.submit')} */}
          </Button>
        </div>
      </div>
    </div>
  );
}