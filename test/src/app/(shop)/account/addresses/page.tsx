'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
// import { useTranslations, useLocale } from 'next-intl';
import { useAuthStore } from '@/store/authStore';
import api from '@/lib/api';
import type { Address } from '@/lib/types';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import AddressForm from '@/components/account/AddressForm';
import { MapPin, Plus, Trash2 } from 'lucide-react';

export default function AddressesPage() {
//   const t = useTranslations();
//   const locale = useLocale();
  const router = useRouter();
  const { toast } = useToast();
  const { isAuthenticated } = useAuthStore();
  const [addresses, setAddresses] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push(`/login`);
    //   router.push(`/${locale}/login`);
      return;
    }
    fetchAddresses();
  }, [isAuthenticated]);

  const fetchAddresses = async () => {
    try {
      const response = await api.get('/users/addresses');
      setAddresses(response.data.data || []);
    } catch (error) {
      console.error('Failed to fetch addresses:', error);
    }
  };

  const handleDelete = async (addressId: string) => {
    if (!confirm(('common.confirm'))) return;
    // if (!confirm(t('common.confirm'))) return;

    try {
      await api.delete(`/users/addresses/${addressId}`);
      toast({ title: ('common.delete'), description: ('addresses.delete') });
    //   toast({ title: t('common.delete'), description: t('addresses.delete') });
      fetchAddresses();
    } catch (error) {
      toast({ title: ('common.error'), variant: 'destructive' });
    //   toast({ title: t('common.error'), variant: 'destructive' });
    }
  };

  return (
    
      <>Address</> )
}