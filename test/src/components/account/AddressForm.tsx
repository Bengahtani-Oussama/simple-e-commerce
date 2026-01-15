'use client';

import { useState } from 'react';
// import { useTranslations } from 'next-intl';
import api, { handleApiError } from '@/lib/api';
import type { Address } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { Loader2 } from 'lucide-react';

interface AddressFormProps {
  address?: Address;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function AddressForm({ address, onSuccess, onCancel }: AddressFormProps) {
//   const t = useTranslations();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    fullName: address?.fullName || '',
    phone: address?.phone || '',
    wilaya: address?.wilaya || '',
    commune: address?.commune || '',
    addressLine: address?.addressLine || '',
    postalCode: address?.postalCode || '',
    isDefault: address?.isDefault || false,
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData({ ...formData, [e.target.name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (address?._id) {
        await api.put(`/users/addresses/${address._id}`, formData);
        toast({
          title: ('common.save'),
        //   title: t('common.save'),
          description: ('addresses.saveAddress'),
        //   description: t('addresses.saveAddress'),
        });
      } else {
        await api.post('/users/addresses', formData);
        toast({
          title: ('common.add'),
        //   title: t('common.add'),
          description: ('addresses.addNew'),
        //   description: t('addresses.addNew'),
        });
      }
      onSuccess();
    } catch (error: any) {
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

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4 border rounded-lg">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="fullName">{('addresses.fullName')}</Label>
          {/* <Label htmlFor="fullName">{t('addresses.fullName')}</Label> */}
          <Input
            id="fullName"
            name="fullName"
            value={formData.fullName}
            onChange={handleChange}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">{('addresses.phone')}</Label>
          {/* <Label htmlFor="phone">{t('addresses.phone')}</Label> */}
          <Input
            id="phone"
            name="phone"
            type="tel"
            value={formData.phone}
            onChange={handleChange}
            required
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="wilaya">{('addresses.wilaya')}</Label>
          {/* <Label htmlFor="wilaya">{t('addresses.wilaya')}</Label> */}
          <Input
            id="wilaya"
            name="wilaya"
            value={formData.wilaya}
            onChange={handleChange}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="commune">{('addresses.commune')}</Label>
          {/* <Label htmlFor="commune">{t('addresses.commune')}</Label> */}
          <Input
            id="commune"
            name="commune"
            value={formData.commune}
            onChange={handleChange}
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="addressLine">{('addresses.addressLine')}</Label>
        {/* <Label htmlFor="addressLine">{t('addresses.addressLine')}</Label> */}
        <Input
          id="addressLine"
          name="addressLine"
          value={formData.addressLine}
          onChange={handleChange}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="postalCode">{('addresses.postalCode')}</Label>
        {/* <Label htmlFor="postalCode">{t('addresses.postalCode')}</Label> */}
        <Input
          id="postalCode"
          name="postalCode"
          value={formData.postalCode}
          onChange={handleChange}
        />
      </div>

      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          id="isDefault"
          name="isDefault"
          checked={formData.isDefault}
          onChange={handleChange}
          className="h-4 w-4"
        />
        <Label htmlFor="isDefault" className="cursor-pointer">
          {('addresses.setDefault')}
          {/* {t('addresses.setDefault')} */}
        </Label>
      </div>

      <div className="flex gap-2">
        <Button type="submit" disabled={loading} className="flex-1">
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {('addresses.saveAddress')}
          {/* {t('addresses.saveAddress')} */}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          {('common.cancel')}
          {/* {t('common.cancel')} */}
        </Button>
      </div>
    </form>
  );
}