'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations, useLocale } from 'next-intl';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { User, Package, MapPin, Settings } from 'lucide-react';

export default function AccountPage() {
  const t = useTranslations();
  const locale = useLocale();
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push(`/${locale}/login`);
    }
  }, [isAuthenticated]);

  if (!user) return null;

  const menuItems = [
    {
      title: t('account.profile'),
      description: t('account.editProfile'),
      icon: User,
      href: `/${locale}/account/profile`,
    },
    {
      title: t('account.orders'),
      description: t('orders.title'),
      icon: Package,
      href: `/${locale}/account/orders`,
    },
    {
      title: t('account.addresses'),
      description: t('addresses.title'),
      icon: MapPin,
      href: `/${locale}/account/addresses`,
    },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">{t('account.title')}</h1>
        <p className="text-muted-foreground">
          {t('auth.welcome')}, {user.firstName}!
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {menuItems.map((item) => (
          <Link key={item.href} href={item.href}>
            <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <item.icon className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>{item.title}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{item.description}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Quick Stats */}
      <div className="grid gap-6 md:grid-cols-3 mt-8">
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold text-primary">
              {user.addresses?.length || 0}
            </div>
            <p className="text-sm text-muted-foreground">{t('addresses.title')}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}