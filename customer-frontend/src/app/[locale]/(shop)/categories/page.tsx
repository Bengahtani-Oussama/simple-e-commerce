'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Category } from '@/lib/types';
import { categoryApi, handleApiError } from '@/lib/api';

export default function CategoriesPage() {
  const t = useTranslations('categories');
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await categoryApi.getAll();
        setCategories(response.data || []);
      } catch (err) {
        setError(handleApiError(err));
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <p className="text-lg">{t('loading')}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <p className="text-lg text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-4">{t('title')}</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          {t('subtitle')}
        </p>
        <p className="text-muted-foreground max-w-2xl mx-auto mt-2">
          {t('description')}
        </p>
      </div>

      {categories.length === 0 ? (
        <div className="text-center">
          <p className="text-lg text-muted-foreground">{t('noCategories')}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {categories.map((category) => (
            <Card key={category._id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                {category.image && (
                  <div className="w-full h-48 mb-4 overflow-hidden rounded-lg">
                    <img
                      src={category.image}
                      alt={category.name.en}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <CardTitle className="text-xl font-semibold text-center">
                  {category.name.en}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {category.description?.en && (
                  <p className="text-muted-foreground text-center mb-4 line-clamp-2">
                    {category.description.en}
                  </p>
                )}
                <div className="text-center">
                  <Button asChild>
                    <Link href={`/products?category=${category._id}`}>
                      {t('viewProducts')}
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
