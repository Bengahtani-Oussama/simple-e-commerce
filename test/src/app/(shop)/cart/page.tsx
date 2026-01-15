'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
// import { useTranslations, useLocale } from 'next-intl';
import Link from 'next/link';
import Image from 'next/image';
import { useCartStore } from '@/store/cartStore';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { formatPrice, getImageUrl } from '@/lib/utils';
import { Minus, Plus, Trash2, ShoppingBag } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export default function CartPage() {
  // const t = useTranslations();
  // const locale = useLocale();
  const router = useRouter();
  const { cart, isLoading, fetchCart, updateQuantity, removeItem } = useCartStore();
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push(`/login`);
      // router.push(`/${locale}/login`);
      return;
    }
    fetchCart();
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Skeleton className="h-8 w-48 mb-6" />
        <div className="grid gap-8 lg:grid-cols-[1fr_350px]">
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-32 w-full" />
            ))}
          </div>
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <ShoppingBag className="h-24 w-24 mx-auto mb-4 text-muted-foreground" />
        <h1 className="text-2xl font-bold mb-2">{('cart.empty')}</h1>
        <p className="text-muted-foreground mb-6">{('cart.continueShopping')}</p>
        <Link href={`/products`}>
          <Button>{('home.hero.shopNow')}</Button>
        </Link>
        {/* <h1 className="text-2xl font-bold mb-2">{t('cart.empty')}</h1>
        <p className="text-muted-foreground mb-6">{t('cart.continueShopping')}</p>
        <Link href={`/${locale}/products`}>
          <Button>{t('home.hero.shopNow')}</Button>
        </Link> */}
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">{('cart.title')}</h1>
      {/* <h1 className="text-3xl font-bold mb-6">{t('cart.title')}</h1> */}

      <div className="grid gap-8 lg:grid-cols-[1fr_350px]">
        {/* Cart Items */}
        <div className="space-y-4">
          {cart.items.map((item) => {
            const itemName = item.name.en;
            // const itemName = item.name[locale as keyof typeof item.name] || item.name.en;
            
            return (
              <Card key={item._id}>
                <CardContent className="p-4">
                  <div className="flex gap-4">
                    <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-lg border">
                      <Image
                        src={getImageUrl(item.image)}
                        alt={itemName}
                        fill
                        className="object-cover"
                      />
                    </div>

                    <div className="flex flex-1 flex-col justify-between">
                      <div>
                        <h3 className="font-semibold">{itemName}</h3>
                        <div className="text-sm text-muted-foreground">
                          {item.variantDetails.size && (
                            <span>{('products.size')}: {item.variantDetails.size} </span>
                          )}
                          {item.variantDetails.color && (
                            <span>{('products.color')}: {item.variantDetails.color}</span>
                          )}
                          {/* {item.variantDetails.size && (
                            <span>{t('products.size')}: {item.variantDetails.size} </span>
                          )}
                          {item.variantDetails.color && (
                            <span>{t('products.color')}: {item.variantDetails.color}</span>
                          )} */}
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        {/* Quantity Controls */}
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => updateQuantity(item._id!, item.quantity - 1)}
                            disabled={item.quantity <= 1}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="w-8 text-center font-medium">{item.quantity}</span>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => updateQuantity(item._id!, item.quantity + 1)}
                            disabled={item.quantity >= item.stock}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>

                        <div className="flex items-center gap-4">
                          <span className="text-lg font-bold text-primary">
                            {formatPrice(item.price * item.quantity, "en")}
                            {/* {formatPrice(item.price * item.quantity, locale)} */}
                          </span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive"
                            onClick={() => removeItem(item._id!)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Order Summary */}
        <Card className="h-fit sticky top-20">
          <CardContent className="p-6 space-y-4">
            <h2 className="text-xl font-bold">{('checkout.orderSummary')}</h2>
            {/* <h2 className="text-xl font-bold">{t('checkout.orderSummary')}</h2> */}

            <Separator />

            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">{('cart.subtotal')}</span>
                {/* <span className="text-muted-foreground">{t('cart.subtotal')}</span> */}
                <span className="font-medium">{formatPrice(cart.subtotal, "en")}</span>
                {/* <span className="font-medium">{formatPrice(cart.subtotal, locale)}</span> */}
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">{('cart.shipping')}</span>
                {/* <span className="text-muted-foreground">{t('cart.shipping')}</span> */}
                <span className="text-muted-foreground">{('cart.shippingCalculated')}</span>
                {/* <span className="text-muted-foreground">{t('cart.shippingCalculated')}</span> */}
              </div>
            </div>

            <Separator />

            <div className="flex justify-between text-lg font-bold">
              <span>{('cart.total')}</span>
              <span className="text-primary">{formatPrice(cart.subtotal, "en")}</span>
              {/* <span>{t('cart.total')}</span>
              <span className="text-primary">{formatPrice(cart.subtotal, locale)}</span> */}
            </div>

            {/* <Link href={`/${locale}/checkout`}> */}
            <Link href={`/checkout`}>
              <Button size="lg" className="w-full">
                {('cart.checkout')}
                {/* {t('cart.checkout')} */}
              </Button>
            </Link>

            {/* <Link href={`/${locale}/products`}> */}
            <Link href={`/products`}>
              <Button variant="outline" size="lg" className="w-full">
                {('cart.continueShopping')}
                {/* {t('cart.continueShopping')} */}
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}