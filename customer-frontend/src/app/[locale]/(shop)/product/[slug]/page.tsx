'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useTranslations, useLocale } from 'next-intl';
import Image from 'next/image';
import api from '@/lib/api';
import type { Product, ProductVariant } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useCartStore } from '@/store/cartStore';
import { useAuthStore } from '@/store/authStore';
import { formatPrice, getImageUrl } from '@/lib/utils';
import { ShoppingCart, Minus, Plus } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';

export default function ProductDetailPage() {
  const t = useTranslations();
  const locale = useLocale();
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const { addToCart } = useCartStore();
  const { isAuthenticated } = useAuthStore();

  const [product, setProduct] = useState<Product | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    fetchProduct();
  }, [params.slug]);

  const fetchProduct = async () => {
    try {
      const response = await api.get(`/products/slug/${params.slug}`);
      const productData = response.data.data;
      setProduct(productData);
      
      // Select first available variant
      const firstVariant = productData.variants.find((v: ProductVariant) => v.isActive && v.stock > 0);
      if (firstVariant) {
        setSelectedVariant(firstVariant);
      }
    } catch (error) {
      console.error('Failed to fetch product:', error);
      toast({
        title: t('common.error'),
        description: t('common.tryAgain'),
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      router.push(`/${locale}/login`);
      return;
    }

    if (!selectedVariant) {
      toast({
        title: t('common.error'),
        description: t('products.selectVariant'),
        variant: 'destructive',
      });
      return;
    }

    setAdding(true);
    try {
      await addToCart(product!._id, selectedVariant._id, quantity);
      toast({
        title: t('cart.title'),
        description: t('products.addToCart'),
      });
    } catch (error) {
      toast({
        title: t('common.error'),
        description: t('common.tryAgain'),
        variant: 'destructive',
      });
    } finally {
      setAdding(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="grid gap-8 lg:grid-cols-2">
          <Skeleton className="h-[500px] w-full rounded-lg" />
          <div className="space-y-4">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-6 w-1/2" />
            <Skeleton className="h-32 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <h1 className="text-2xl font-bold">{t('products.noResults')}</h1>
      </div>
    );
  }

  const productName = product.name[locale as keyof typeof product.name] || product.name.en;
  const productDesc = product.description[locale as keyof typeof product.description] || product.description.en;
  const price = selectedVariant?.price || product.basePrice;
  const compareAtPrice = selectedVariant?.compareAtPrice || product.compareAtPrice;
  const discount = compareAtPrice ? Math.round(((compareAtPrice - price) / compareAtPrice) * 100) : 0;
  const images = selectedVariant?.images.length ? selectedVariant.images : product.images;
  const inStock = selectedVariant && selectedVariant.stock > 0;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid gap-8 lg:grid-cols-2">
        {/* Images */}
        <div className="space-y-4">
          <div className="relative aspect-square overflow-hidden rounded-lg border bg-muted">
            <Image
              src={getImageUrl(images[selectedImage])}
              alt={productName}
              fill
              className="object-cover"
            />
            {discount > 0 && (
              <Badge className="absolute top-4 left-4 bg-destructive">
                -{discount}%
              </Badge>
            )}
          </div>
          
          {images.length > 1 && (
            <div className="grid grid-cols-4 gap-2">
              {images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`relative aspect-square overflow-hidden rounded-lg border-2 ${
                    selectedImage === index ? 'border-primary' : 'border-transparent'
                  }`}
                >
                  <Image
                    src={getImageUrl(image)}
                    alt={`${productName} ${index + 1}`}
                    fill
                    className="object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">{productName}</h1>
            {product.brand && (
              <p className="text-muted-foreground">{product.brand.name}</p>
            )}
          </div>

          <div className="flex items-center gap-3">
            <span className="text-3xl font-bold text-primary">
              {formatPrice(price, locale)}
            </span>
            {compareAtPrice && (
              <span className="text-xl text-muted-foreground line-through">
                {formatPrice(compareAtPrice, locale)}
              </span>
            )}
          </div>

          {/* Variant Selection */}
          {product.variantOptions && (
            <div className="space-y-4">
              {product.variantOptions.sizes && product.variantOptions.sizes.length > 0 && (
                <div>
                  <Label className="mb-2">{t('products.size')}</Label>
                  <div className="flex flex-wrap gap-2">
                    {product.variantOptions.sizes.map((size) => {
                      const variant = product.variants.find(
                        (v) => v.size === size && v.isActive
                      );
                      const isSelected = selectedVariant?.size === size;
                      const isAvailable = variant && variant.stock > 0;

                      return (
                        <Button
                          key={size}
                          variant={isSelected ? 'default' : 'outline'}
                          size="sm"
                          disabled={!isAvailable}
                          onClick={() => variant && setSelectedVariant(variant)}
                        >
                          {size}
                        </Button>
                      );
                    })}
                  </div>
                </div>
              )}

              {product.variantOptions.colors && product.variantOptions.colors.length > 0 && (
                <div>
                  <Label className="mb-2">{t('products.color')}</Label>
                  <div className="flex flex-wrap gap-2">
                    {product.variantOptions.colors.map((color) => {
                      const variant = product.variants.find(
                        (v) => v.color === color && v.isActive
                      );
                      const isSelected = selectedVariant?.color === color;
                      const isAvailable = variant && variant.stock > 0;

                      return (
                        <Button
                          key={color}
                          variant={isSelected ? 'default' : 'outline'}
                          size="sm"
                          disabled={!isAvailable}
                          onClick={() => variant && setSelectedVariant(variant)}
                        >
                          {color}
                        </Button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Stock Status */}
          <div>
            {inStock ? (
              <Badge variant="outline" className="text-green-600 border-green-600">
                {t('products.availableStock', { stock: selectedVariant.stock })}
              </Badge>
            ) : (
              <Badge variant="outline" className="text-destructive border-destructive">
                {t('products.outOfStock')}
              </Badge>
            )}
          </div>

          {/* Quantity */}
          {inStock && (
            <div>
              <Label className="mb-2">{t('products.quantity')}</Label>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="w-12 text-center font-semibold">{quantity}</span>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setQuantity(Math.min(selectedVariant!.stock, quantity + 1))}
                  disabled={quantity >= selectedVariant!.stock}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Add to Cart */}
          <Button
            onClick={handleAddToCart}
            disabled={!inStock || adding}
            size="lg"
            className="w-full gap-2"
          >
            <ShoppingCart className="h-5 w-5" />
            {inStock ? t('products.addToCart') : t('products.outOfStock')}
          </Button>

          {/* Description Tabs */}
          <Tabs defaultValue="description" className="w-full">
            <TabsList className="w-full">
              <TabsTrigger value="description" className="flex-1">
                {t('products.description')}
              </TabsTrigger>
              <TabsTrigger value="specifications" className="flex-1">
                {t('products.specifications')}
              </TabsTrigger>
            </TabsList>
            <TabsContent value="description" className="space-y-4 pt-4">
              <p className="text-muted-foreground whitespace-pre-line">
                {productDesc}
              </p>
            </TabsContent>
            <TabsContent value="specifications" className="space-y-4 pt-4">
              {selectedVariant && (
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">SKU:</span>
                    <span className="font-medium">{selectedVariant.sku}</span>
                  </div>
                  {selectedVariant.size && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{t('products.size')}:</span>
                      <span className="font-medium">{selectedVariant.size}</span>
                    </div>
                  )}
                  {selectedVariant.color && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{t('products.color')}:</span>
                      <span className="font-medium">{selectedVariant.color}</span>
                    </div>
                  )}
                  {selectedVariant.material && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{t('products.material')}:</span>
                      <span className="font-medium">{selectedVariant.material}</span>
                    </div>
                  )}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}

function Label({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <label className={`text-sm font-medium ${className}`}>{children}</label>;
}