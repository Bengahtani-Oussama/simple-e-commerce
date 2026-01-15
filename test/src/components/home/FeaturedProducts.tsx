'use client';

import { useEffect, useState } from 'react';
// import { useTranslations, useLocale } from 'next-intl';
import Link from 'next/link';
import api from '@/lib/api';
import type { Product } from '@/lib/types';
import ProductCard from '@/components/products/ProductCard';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

export default function FeaturedProducts() {
  // const t = useTranslations();
  // const locale = useLocale();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFeaturedProducts();
  }, []);

  const fetchFeaturedProducts = async () => {
    try {
      const response = await api.get('/products', {
        params: {
          featured: true,
          active: true,
          limit: 8,
        },
      });
      setProducts(response.data.data || []);
    } catch (error) {
      console.error('Failed to fetch featured products:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <section className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-3xl font-bold">{('home.featured')}</h2>
          {/* <h2 className="text-3xl font-bold">{t('home.featured')}</h2> */}
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-96 bg-muted animate-pulse rounded-lg" />
          ))}
        </div>
      </section>
    );
  }

  if (products.length === 0) return null;

  return (
    <section className="container mx-auto px-4">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-3xl font-bold">{('home.featured')}</h2>
        {/* <h2 className="text-3xl font-bold">{t('home.featured')}</h2> */}
        <Link href={`/products?featured=true`}>
        {/* <Link href={`/${locale}/products?featured=true`}> */}
          <Button variant="ghost" className="gap-2">
            {('products.viewAll')}
            {/* {t('products.viewAll')} */}
            <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {products.map((product) => (
          <ProductCard key={product._id} product={product} />
        ))}
      </div>
    </section>
  );
}