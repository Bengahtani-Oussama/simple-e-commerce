'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
// import { useTranslations, useLocale } from 'next-intl';
import Image from 'next/image';
import { useAuthStore } from '@/store/authStore';
import { useCartStore } from '@/store/cartStore';
import api, { handleApiError } from '@/lib/api';
import type { Address } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/components/ui/use-toast';
import { formatPrice, getImageUrl } from '@/lib/utils';
import { MapPin, Truck, CreditCard, Plus } from 'lucide-react';
import AddressDialog from '@/components/account/AddressDialog';

export default function CheckoutPage() {
  // const t = useTranslations();
  // const locale = useLocale();
  const router = useRouter();
  const { toast } = useToast();
  const { user, isAuthenticated } = useAuthStore();
  const { cart, clearCart } = useCartStore();

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<string>('');
  const [shippingMethod, setShippingMethod] = useState<'home_delivery' | 'office_pickup'>('home_delivery');
  const [shippingCost, setShippingCost] = useState(500);
  const [customerNote, setCustomerNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [showAddressDialog, setShowAddressDialog] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push(`/login`);
      // router.push(`/${locale}/login`);
      return;
    }
    if (!cart || cart.items.length === 0) {
      router.push(`/cart`);
      // router.push(`/${locale}/cart`);
      return;
    }
    fetchAddresses();
  }, [isAuthenticated, cart]);

  const fetchAddresses = async () => {
    try {
      const response = await api.get('/users/addresses');
      const addressList = response.data.data || [];
      setAddresses(addressList);
      
      const defaultAddress = addressList.find((addr: Address) => addr.isDefault);
      if (defaultAddress) {
        setSelectedAddress(defaultAddress._id!);
      }
    } catch (error) {
      console.error('Failed to fetch addresses:', error);
    }
  };

  const handlePlaceOrder = async () => {
    if (!selectedAddress) {
      toast({
        title: ('common.error'),
        description: ('checkout.required'),
        // title: t('common.error'),
        // description: t('checkout.required'),
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/orders', {
        shippingAddressId: selectedAddress,
        shippingMethod,
        shippingCost,
        customerNote,
      });

      const order = response.data.data;
      await clearCart();

      toast({
        title: ('orders.title'),
        description: `${('orders.orderNumber')}: ${order.orderNumber}`,
        // title: t('orders.title'),
        // description: `${t('orders.orderNumber')}: ${order.orderNumber}`,
      });

      router.push(`/account/orders/${order._id}`);
      // router.push(`/${locale}/account/orders/${order._id}`);
    } catch (error) {
      toast({
        title: ('common.error'),
        // title: t('common.error'),
        description: handleApiError(error),
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  if (!cart) return null;

  const total = cart.subtotal + shippingCost;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">{('checkout.title')}</h1>
      {/* <h1 className="text-3xl font-bold mb-6">{t('checkout.title')}</h1> */}

      <div className="grid gap-8 lg:grid-cols-[1fr_400px]">
        {/* Checkout Form */}
        <div className="space-y-6">
          {/* Shipping Address */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  {('checkout.shippingAddress')}
                  {/* {t('checkout.shippingAddress')} */}
                </CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowAddressDialog(true)}
                  className="gap-2"
                >
                  <Plus className="h-4 w-4" />
                  {('checkout.addNewAddress')}
                  {/* {t('checkout.addNewAddress')} */}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {addresses.length > 0 ? (
                <RadioGroup value={selectedAddress} onValueChange={setSelectedAddress}>
                  <div className="space-y-3">
                    {addresses.map((address) => (
                      <div key={address._id} className="flex items-start space-x-2 rtl:space-x-reverse">
                        <RadioGroupItem value={address._id!} id={address._id!} />
                        <Label htmlFor={address._id!} className="flex-1 cursor-pointer">
                          <div className="font-medium">{address.fullName}</div>
                          <div className="text-sm text-muted-foreground">
                            {address.addressLine}, {address.commune}, {address.wilaya}
                          </div>
                          <div className="text-sm text-muted-foreground">{address.phone}</div>
                        </Label>
                      </div>
                    ))}
                  </div>
                </RadioGroup>
              ) : (
                <div className="text-center py-6">
                  <p className="text-muted-foreground mb-4">{('addresses.noAddresses')}</p>
                  {/* <p className="text-muted-foreground mb-4">{t('addresses.noAddresses')}</p> */}
                  <Button onClick={() => setShowAddressDialog(true)}>
                    {('checkout.addNewAddress')}
                    {/* {t('checkout.addNewAddress')} */}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Shipping Method */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Truck className="h-5 w-5" />
                {('checkout.shippingMethod')}
                {/* {t('checkout.shippingMethod')} */}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <RadioGroup value={shippingMethod} onValueChange={(val: any) => setShippingMethod(val)}>
                <div className="space-y-3">
                  <div className="flex items-center justify-between border rounded-lg p-4">
                    <div className="flex items-center space-x-2 rtl:space-x-reverse">
                      <RadioGroupItem value="home_delivery" id="home_delivery" />
                      <Label htmlFor="home_delivery" className="cursor-pointer">
                        <div className="font-medium">{('checkout.homeDelivery')}</div>
                        {/* <div className="font-medium">{t('checkout.homeDelivery')}</div> */}
                      </Label>
                    </div>
                    <span className="font-medium">{formatPrice(500, "en")}</span>
                    {/* <span className="font-medium">{formatPrice(500, locale)}</span> */}
                  </div>

                  <div className="flex items-center justify-between border rounded-lg p-4">
                    <div className="flex items-center space-x-2 rtl:space-x-reverse">
                      <RadioGroupItem value="office_pickup" id="office_pickup" />
                      <Label htmlFor="office_pickup" className="cursor-pointer">
                        <div className="font-medium">{('checkout.officePickup')}</div>
                        {/* <div className="font-medium">{t('checkout.officePickup')}</div> */}
                      </Label>
                    </div>
                    <span className="font-medium">{formatPrice(300, "en")}</span>
                    {/* <span className="font-medium">{formatPrice(300, locale)}</span> */}
                  </div>
                </div>
              </RadioGroup>
            </CardContent>
          </Card>

          {/* Customer Note */}
          <Card>
            <CardHeader>
              <CardTitle>{('checkout.customerNote')}</CardTitle>
              {/* <CardTitle>{t('checkout.customerNote')}</CardTitle> */}
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder={('checkout.customerNote')}
                // placeholder={t('checkout.customerNote')}
                value={customerNote}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setCustomerNote(e.target.value)}
                rows={3}
              />
            </CardContent>
          </Card>
        </div>

        {/* Order Summary */}
        <Card className="h-fit sticky top-20">
          <CardHeader>
            <CardTitle>{('checkout.orderSummary')}</CardTitle>
            {/* <CardTitle>{t('checkout.orderSummary')}</CardTitle> */}
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Cart Items */}
            <div className="space-y-3">
              {cart.items.map((item) => {
                const itemName = item.name.en;
                // const itemName = item.name[locale as keyof typeof item.name] || item.name.en;
                return (
                  <div key={item._id} className="flex gap-3">
                    <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded border">
                      <Image
                        src={getImageUrl(item.image)}
                        alt={itemName}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium line-clamp-1">{itemName}</p>
                      <p className="text-sm text-muted-foreground">
                        {('products.quantity')}: {item.quantity}
                        {/* {t('products.quantity')}: {item.quantity} */}
                      </p>
                      <p className="text-sm font-medium text-primary">
                        {formatPrice(item.price * item.quantity, "en")}
                        {/* {formatPrice(item.price * item.quantity, locale)} */}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            <Separator />

            {/* Totals */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">{('cart.subtotal')}</span>
                {/* <span className="text-muted-foreground">{t('cart.subtotal')}</span> */}
                <span className="font-medium">{formatPrice(cart.subtotal, "en")}</span>
                {/* <span className="font-medium">{formatPrice(cart.subtotal, locale)}</span> */}
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">{('cart.shipping')}</span>
                {/* <span className="text-muted-foreground">{t('cart.shipping')}</span> */}
                <span className="font-medium">{formatPrice(shippingCost, "en")}</span>
                {/* <span className="font-medium">{formatPrice(shippingCost, locale)}</span> */}
              </div>
            </div>

            <Separator />

            <div className="flex justify-between text-lg font-bold">
              <span>{('cart.total')}</span>
              {/* <span>{t('cart.total')}</span> */}
              <span className="text-primary">{formatPrice(total, "en")}</span>
              {/* <span className="text-primary">{formatPrice(total, locale)}</span> */}
            </div>

            {/* Payment Method */}
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <CreditCard className="h-4 w-4" />
              <span>{('checkout.cashOnDelivery')}</span>
              {/* <span>{t('checkout.cashOnDelivery')}</span> */}
            </div>

            <Button
              onClick={handlePlaceOrder}
              disabled={loading || !selectedAddress}
              size="lg"
              className="w-full"
            >
              {loading ? ('common.loading') : ('checkout.placeOrder')}
              {/* {loading ? t('common.loading') : t('checkout.placeOrder')} */}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Address Dialog */}
      <AddressDialog
        open={showAddressDialog}
        onOpenChange={setShowAddressDialog}
        onSuccess={fetchAddresses}
      />
    </div>
  );
}