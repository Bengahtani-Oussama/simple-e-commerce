'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
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
import { Switch } from '../ui/switch';

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
  const t = useTranslations();
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
          title: t('common.save'),
          description: t('addresses.saveAddress'),
        });
      } else {
        await api.post('/users/addresses', formData);
        toast({
          title: t('common.add'),
          description: t('addresses.saveAddress'),
        });
      }
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      toast({
        title: t('common.error'),
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
            {address ? t('addresses.edit') : t('addresses.addNew')}
          </DialogTitle>
          <DialogDescription>
            {t('addresses.saveAddress')}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">{t('addresses.fullName')}</Label>
              <Input
                id="fullName"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                required
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">{t('addresses.phone')}</Label>
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
              <Label htmlFor="wilaya">{t('addresses.wilaya')}</Label>
              <Input
                id="wilaya"
                value={formData.wilaya}
                onChange={(e) => setFormData({ ...formData, wilaya: e.target.value })}
                required
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="commune">{t('addresses.commune')}</Label>
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
            <Label htmlFor="addressLine">{t('addresses.addressLine')}</Label>
            <Input
              id="addressLine"
              value={formData.addressLine}
              onChange={(e) => setFormData({ ...formData, addressLine: e.target.value })}
              required
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="postalCode">{t('addresses.postalCode')}</Label>
            <Input
              id="postalCode"
              value={formData.postalCode}
              onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
              disabled={loading}
            />
          </div>

          {/* Is default address logic */}
          <div className="flex items-center gap-4">
            <Label htmlFor="isDefault">{t('addresses.isDefault')}</Label>
            <Switch
              id="isDefault"
              checked={formData.isDefault}
              onCheckedChange={(checked) => setFormData({ ...formData, isDefault: checked })}
              disabled={loading}
            />
          </div>

          <div className="flex gap-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
              {t('common.cancel')}
            </Button>
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? t('common.loading') : t('common.save')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}