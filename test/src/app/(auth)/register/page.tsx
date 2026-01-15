'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
// import { useTranslations, useLocale } from 'next-intl';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { handleApiError } from '@/lib/api';
import { UserPlus } from 'lucide-react';

export default function RegisterPage() {
  // const t = useTranslations();
  // const locale = useLocale();
  const router = useRouter();
  const { toast } = useToast();
  const { register } = useAuthStore();

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast({
        title: ('common.error'),
        // title: t('common.error'),
        description: ('validation.passwordMatch'),
        // description: t('validation.passwordMatch'),
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);

    try {
      await register({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
      });
      toast({
        title: ('auth.welcome'),
        // title: t('auth.welcome'),
        description: ('auth.createAccount'),
        // description: t('auth.createAccount'),
      });
      router.push(`/`);
      // router.push(`/${locale}`);
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

  return (
    <div className="container mx-auto px-4 py-16 flex items-center justify-center min-h-[calc(100vh-200px)]">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">
            {('auth.createAccount')}
            {/* {t('auth.createAccount')} */}
          </CardTitle>
          <CardDescription className="text-center">
            {('auth.welcome')}
            {/* {t('auth.welcome')} */}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">{('account.firstName')}</Label>
                {/* <Label htmlFor="firstName">{t('account.firstName')}</Label> */}
                <Input
                  id="firstName"
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  required
                  disabled={loading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">{('account.lastName')}</Label>
                {/* <Label htmlFor="lastName">{t('account.lastName')}</Label> */}
                <Input
                  id="lastName"
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  required
                  disabled={loading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">{('auth.email')}</Label>
              {/* <Label htmlFor="email">{t('auth.email')}</Label> */}
              <Input
                id="email"
                type="email"
                placeholder={('auth.enterEmail')}
                // placeholder={t('auth.enterEmail')}
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">{('account.phone')}</Label>
              {/* <Label htmlFor="phone">{t('account.phone')}</Label> */}
              <Input
                id="phone"
                type="tel"
                placeholder="0555123456"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">{('auth.password')}</Label>
              {/* <Label htmlFor="password">{t('auth.password')}</Label> */}
              <Input
                id="password"
                type="password"
                placeholder={('auth.enterPassword')}
                // placeholder={t('auth.enterPassword')}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
                disabled={loading}
                minLength={6}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">{('account.confirmPassword')}</Label>
              {/* <Label htmlFor="confirmPassword">{t('account.confirmPassword')}</Label> */}
              <Input
                id="confirmPassword"
                type="password"
                placeholder={('account.confirmPassword')}
                // placeholder={t('account.confirmPassword')}
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                required
                disabled={loading}
                minLength={6}
              />
            </div>

            <Button type="submit" className="w-full gap-2" disabled={loading}>
              <UserPlus className="h-4 w-4" />
              {loading ? ('common.loading') : ('auth.register')}
              {/* {loading ? t('common.loading') : t('auth.register')} */}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm">
            <span className="text-muted-foreground">{('auth.haveAccount')} </span>
            {/* <span className="text-muted-foreground">{t('auth.haveAccount')} </span> */}
            <Link href={`/login`} className="text-primary font-medium hover:underline">
            {/* <Link href={`/${locale}/login`} className="text-primary font-medium hover:underline"> */}
              {('auth.signIn')}
              {/* {t('auth.signIn')} */}
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}