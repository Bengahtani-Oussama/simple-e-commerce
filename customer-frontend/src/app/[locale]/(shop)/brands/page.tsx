'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Brand } from '@/lib/types';
import { brandApi, handleApiError } from '@/lib/api';

export default function BrandsPage() {
  const t = useTranslations('brands');
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBrands = async () => {
      try {
        const response = await brandApi.getAll();
        setBrands(response.data || []);
      } catch (err) {
        setError(handleApiError(err));
      } finally {
        setLoading(false);
      }
    };

    fetchBrands();
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

      {brands.length === 0 ? (
        <div className="text-center">
          <p className="text-lg text-muted-foreground">{t('noBrands')}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {brands.map((brand) => (
            <Card key={brand._id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                {brand.logo && (
                  <div className="w-full h-48 mb-4 overflow-hidden rounded-lg flex items-center justify-center bg-gray-50">
                    <img
                      src={brand.logo}
                      alt={brand.name}
                      className="max-w-full max-h-full object-contain"
                    />
                  </div>
                )}
                <CardTitle className="text-xl font-semibold text-center">
                  {brand.name}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {brand.description?.en && (
                  <p className="text-muted-foreground text-center mb-4 line-clamp-2">
                    {brand.description.en}
                  </p>
                )}
                <div className="text-center">
                  <Button asChild>
                    <Link href={`/products?brand=${brand._id}`}>
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
