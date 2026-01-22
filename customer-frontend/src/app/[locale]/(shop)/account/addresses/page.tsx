'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations, useLocale } from 'next-intl';
import { useAuthStore } from '@/store/authStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, MapPin, Edit, Trash2 } from 'lucide-react';
import AddressDialog from '@/components/account/AddressDialog';
import { useToast } from '@/hooks/use-toast';
import api from '@/lib/api';
import type { Address } from '@/lib/types';

export default function AddressesPage() {
  const t = useTranslations();
  const locale = useLocale();
  const router = useRouter();
  const { user, isAuthenticated, checkAuth } = useAuthStore();
  const { toast } = useToast();

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(false);
  const [isDefaultAddress, setDefaultAddress] = useState<Address | null>(null);
  
  useEffect(() => {
    if (!isAuthenticated) {
      router.push(`/${locale}/login`);
    } else if (user) {
      fetchAddresses();
    }
  }, [isAuthenticated, user, router, locale]);
   
  const fetchAddresses = async () => {
    try {
      const response = await api.get('/users/addresses');
      const addressList = response.data.data || [];
      setAddresses(addressList);
      
      const defaultAddress = addressList.find((addr: Address) => addr.isDefault);
      if (defaultAddress) {
        setDefaultAddress(defaultAddress._id!);
      }
    } catch (error) {
      console.error('Failed to fetch addresses:', error);
    }
  };


  const handleAddAddress = () => {
    setEditingAddress(undefined);
    setIsDialogOpen(true);
  };

  const handleEditAddress = (address: Address) => {
    setEditingAddress(address);
    setIsDialogOpen(true);
  };

  const handleDeleteAddress = async (addressId: string) => {
    if (!confirm(t('addresses.confirmDelete'))) return;

    setIsLoading(true);
    try {
      await api.delete(`/users/addresses/${addressId}`);

      // Update local state after successful API call
      const updatedAddresses = addresses.filter(addr => addr._id !== addressId);
      setAddresses(updatedAddresses);

      // Update user in store
      if (user) {
        user.addresses = updatedAddresses;
      }

      toast({
        title: t('addresses.deleted'),
        description: t('addresses.addressDeleted'),
      });
    } catch (error) {
      toast({
        title: t('common.error'),
        description: t('addresses.deleteFailed'),
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddressSaved = async () => {
    // Refetch user data to get updated addresses
    await checkAuth();
    setIsDialogOpen(false);
    setEditingAddress(undefined);
  };

  if (!user) return null;

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">{t('addresses.title')}</h1>
          <p className="text-muted-foreground">
            {t('addresses.manageAddresses')}
          </p>
        </div>
        <Button onClick={handleAddAddress} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          {t('addresses.addAddress')}
        </Button>
      </div>

      {addresses.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <MapPin className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">{t('addresses.noAddresses')}</h3>
            <p className="text-muted-foreground text-center mb-4">
              {t('addresses.noAddressesDescription')}
            </p>
            <Button onClick={handleAddAddress}>
              <Plus className="h-4 w-4 mr-2" />
              {t('addresses.addFirstAddress')}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {addresses.map((address) => (
            <Card key={address._id} className={`relative ${address.isDefault && 'border-2 border-primary' }`}>
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg">{address.fullName}</CardTitle>
                  {address.isDefault && (
                    <Badge variant="secondary">{t('addresses.default')}</Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <p className="font-medium">{address.phone}</p>
                  <p>{address.addressLine}</p>
                  <p>{address.commune}, {address.wilaya}</p>
                  {address.postalCode && <p>{t('addresses.postalCode')}: {address.postalCode}</p>}
                </div>

                <div className="flex gap-2 mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEditAddress(address)}
                    className="flex items-center gap-1"
                  >
                    <Edit className="h-3 w-3" />
                    {t('common.edit')}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteAddress(address._id!)}
                    disabled={isLoading}
                    className="flex items-center gap-1 text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-3 w-3" />
                    {t('common.delete')}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <AddressDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        address={editingAddress}
        onSuccess={handleAddressSaved}
      />
    </div>
  );
}
