'use client';

import { useState, useEffect } from 'react';
import api, { handleApiError } from '@/lib/api';
import type { Address } from '@/lib/types';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';

interface AddressDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  address?: Address;
  onSuccess: () => void;
}

export default function AddressDialog({
  open,
  onOpenChange,
  address,
  onSuccess,
}: AddressDialogProps) {
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    wilaya: '',
    commune: '',
    addressLine: '',
    postalCode: '',
    isDefault: false,
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (address) {
      setFormData({
        fullName: address.fullName,
        phone: address.phone,
        wilaya: address.wilaya,
        commune: address.commune,
        addressLine: address.addressLine,
        postalCode: address.postalCode || '',
        isDefault: address.isDefault,
      });
    } else {
      setFormData({
        fullName: '',
        phone: '',
        wilaya: '',
        commune: '',
        addressLine: '',
        postalCode: '',
        isDefault: false,
      });
    }
  }, [address, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (address?._id) {
        await api.put(`/users/addresses/${address._id}`, formData);
        toast({
          title: ('common.save'),
          description: ('addresses.saveAddress'),
        });
      } else {
        await api.post('/users/addresses', formData);
        toast({
          title: ('common.add'),
          description: ('addresses.saveAddress'),
        });
      }
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      toast({
        title: ('common.error'),
        description: handleApiError(error),
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {address ? ('addresses.edit') : ('addresses.addNew')}
          </DialogTitle>
          <DialogDescription>
            {('addresses.saveAddress')}
            {/* {t('addresses.saveAddress')} */}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">{('addresses.fullName')}</Label>
              {/* <Label htmlFor="fullName">{t('addresses.fullName')}</Label> */}
              <Input
                id="fullName"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                required
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">{('addresses.phone')}</Label>
              {/* <Label htmlFor="phone">{t('addresses.phone')}</Label> */}
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                required
                disabled={loading}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="wilaya">{('addresses.wilaya')}</Label>
              {/* <Label htmlFor="wilaya">{t('addresses.wilaya')}</Label> */}
              <Input
                id="wilaya"
                value={formData.wilaya}
                onChange={(e) => setFormData({ ...formData, wilaya: e.target.value })}
                required
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="commune">{('addresses.commune')}</Label>
              {/* <Label htmlFor="commune">{t('addresses.commune')}</Label> */}
              <Input
                id="commune"
                value={formData.commune}
                onChange={(e) => setFormData({ ...formData, commune: e.target.value })}
                required
                disabled={loading}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="addressLine">{('addresses.addressLine')}</Label>
            {/* <Label htmlFor="addressLine">{t('addresses.addressLine')}</Label> */}
            <Input
              id="addressLine"
              value={formData.addressLine}
              onChange={(e) => setFormData({ ...formData, addressLine: e.target.value })}
              required
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="postalCode">{('addresses.postalCode')}</Label>
            {/* <Label htmlFor="postalCode">{t('addresses.postalCode')}</Label> */}
            <Input
              id="postalCode"
              value={formData.postalCode}
              onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
              disabled={loading}
            />
          </div>

          <div className="flex gap-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
              {('common.cancel')}
              {/* {t('common.cancel')} */}
            </Button>
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? ('common.loading') : ('common.save')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}