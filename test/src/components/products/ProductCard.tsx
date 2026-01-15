'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
// import { useTranslations, useLocale } from 'next-intl';
import { ShoppingCart, Heart } from 'lucide-react';
import type { Product } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { useCartStore } from '@/store/cartStore';
import { useAuthStore } from '@/store/authStore';
import { formatPrice, getImageUrl } from '@/lib/utils';
// import { useToast } from '@/components/ui/use-toast';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  // const t = useTranslations();
  // const locale = useLocale();
  // const { toast } = useToast();
  const { addToCart } = useCartStore();
  const { isAuthenticated } = useAuthStore();
  const [isAdding, setIsAdding] = useState(false);

  const productName = product.name.en;
  // const productName = product.name[locale as keyof typeof product.name] || product.name.en;
  const firstVariant = product.variants.find((v) => v.isActive && v.stock > 0);
  const price = firstVariant?.price || product.basePrice;
  const compareAtPrice = firstVariant?.compareAtPrice || product.compareAtPrice;
  const inStock = firstVariant && firstVariant.stock > 0;
  const discount = compareAtPrice ? Math.round(((compareAtPrice - price) / compareAtPrice) * 100) : 0;

  const handleQuickAdd = async (e: React.MouseEvent) => {
    e.preventDefault();

    if (!isAuthenticated) {
      window.location.href = `/login`;
      // window.location.href = `/${locale}/login`;
      return;
    }

    if (!firstVariant) {
      console.log('out of stock');
      // toast({
      //   title: t('common.error'),
      //   description: t('products.outOfStock'),
      //   variant: 'destructive',
      // });
      return;
    }

    setIsAdding(true);
    try {
      await addToCart(product._id, firstVariant._id, 1);
      console.log('product add to cart');
      // toast({
      //   title: t('cart.title'),
      //   description: `${productName} ${t('products.addToCart')}`,
      // });
    } catch (error) {
      console.log('try again');
      // toast({
      //   title: t('common.error'),
      //   description: t('common.tryAgain'),
      //   variant: 'destructive',
      // });
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <Link href={`/product/${product.slug}`}>
    {/* <Link href={`/${locale}/product/${product.slug}`}> */}
      <Card className="group overflow-hidden hover:shadow-lg transition-shadow">
        <div className="relative aspect-square overflow-hidden bg-muted">
          <Image
            src={getImageUrl(firstVariant?.images[0] || product.images[0])}
            alt={productName}
            fill
            className="object-cover transition-transform group-hover:scale-105"
          />
          {discount > 0 && (
            <Badge className="absolute top-2 left-2 bg-destructive">
              -{discount}%
            </Badge>
          )}
          {!inStock && (
            <Badge className="absolute top-2 right-2 bg-muted text-muted-foreground">
              {('products.outOfStock')}
              {/* {t('products.outOfStock')} */}
            </Badge>
          )}
        </div>

        <CardContent className="p-4">
          <h3 className="font-semibold mb-2 line-clamp-2 min-h-[3rem]">
            {productName}
          </h3>

          <div className="flex items-center gap-2 mb-3">
            <span className="text-lg font-bold text-primary">
              {formatPrice(price, "en")}
              {/* {formatPrice(price, locale)} */}
            </span>
            {compareAtPrice && (
              <span className="text-sm text-muted-foreground line-through">
                {formatPrice(compareAtPrice, "en")}
                {/* {formatPrice(compareAtPrice, locale)} */}
              </span>
            )}
          </div>

          <Button
            onClick={handleQuickAdd}
            disabled={!inStock || isAdding}
            className="w-full gap-2"
            size="sm"
          >
            <ShoppingCart className="h-4 w-4" />
            {inStock ? ('products.addToCart') : ('products.outOfStock')}
            {/* {inStock ? t('products.addToCart') : t('products.outOfStock')} */}
          </Button>
        </CardContent>
      </Card>
    </Link>
  );
}