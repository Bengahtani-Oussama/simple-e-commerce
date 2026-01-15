'use client';

import { useEffect, useState } from 'react';
// import { useTranslations, useLocale } from 'next-intl';
import Link from 'next/link';
import Image from 'next/image';
import api from '@/lib/api';
import type { Category } from '@/lib/types';
import { Card, CardContent } from '@/components/ui/card';
import { getImageUrl } from '@/lib/utils';

export default function CategoriesGrid() {
  // const t = useTranslations();
  // const locale = useLocale();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await api.get('/categories', {
        params: {
          parent: 'null',
          active: true,
        },
      });
      setCategories(response.data.data?.slice(0, 6) || []);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <section className="container mx-auto px-4">
        <h2 className="text-3xl font-bold mb-6">{('home.categories')}</h2>
        {/* <h2 className="text-3xl font-bold mb-6">{t('home.categories')}</h2> */}
        <div className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-32 bg-muted animate-pulse rounded-lg" />
          ))}
        </div>
      </section>
    );
  }

  if (categories.length === 0) return null;

  return (
    <section className="container mx-auto px-4">
      <h2 className="text-3xl font-bold mb-6">{('home.categories')}</h2>
      {/* <h2 className="text-3xl font-bold mb-6">{t('home.categories')}</h2> */}
      
      <div className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
        {categories.map((category) => {
          const categoryName = category.name.en;
          // const categoryName = category.name[locale as keyof typeof category.name] || category.name.en;
          
          return (
            <Link
              key={category._id}
              href={`/products?category=${category._id}`}
              // href={`/${locale}/products?category=${category._id}`}
            >
              <Card className="group overflow-hidden hover:shadow-lg transition-all">
                <CardContent className="p-0">
                  <div className="relative aspect-square bg-muted">
                    {category.image && (
                      <Image
                        src={getImageUrl(category.image)}
                        alt={categoryName}
                        fill
                        className="object-cover transition-transform group-hover:scale-105"
                      />
                    )}
                  </div>
                  <div className="p-3 text-center">
                    <h3 className="font-semibold text-sm line-clamp-2">
                      {categoryName}
                    </h3>
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </section>
  );
}