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
import { LogIn } from 'lucide-react';

export default function LoginPage() {
  // const t = useTranslations();
  // const locale = useLocale();
  const router = useRouter();
  const { toast } = useToast();
  const { login } = useAuthStore();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await login(formData.email, formData.password);
      toast({
        title: ('auth.welcomeBack'),
        // title: t('auth.welcomeBack'),
        description: ('auth.login'),
        // description: t('auth.login'),
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
            {('auth.login')}
            {/* {t('auth.login')} */}
          </CardTitle>
          <CardDescription className="text-center">
            {('auth.welcomeBack')}
            {/* {t('auth.welcomeBack')} */}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
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
              <div className="flex items-center justify-between">
                <Label htmlFor="password">{('auth.password')}</Label>
                {/* <Label htmlFor="password">{t('auth.password')}</Label> */}
                <Link
                  href={`/forgot-password`}
                  // href={`/${locale}/forgot-password`}
                  className="text-sm text-primary hover:underline"
                >
                  {('auth.forgotPassword')}
                  {/* {t('auth.forgotPassword')} */}
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                placeholder={('auth.enterPassword')}
                // placeholder={t('auth.enterPassword')}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
                disabled={loading}
              />
            </div>

            <Button type="submit" className="w-full gap-2" disabled={loading}>
              <LogIn className="h-4 w-4" />
              {loading ? ('common.loading') : ('auth.login')}
              {/* {loading ? t('common.loading') : t('auth.login')} */}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm">
            <span className="text-muted-foreground">{('auth.noAccount')} </span>
            {/* <span className="text-muted-foreground">{t('auth.noAccount')} </span> */}
            <Link href={`/register`} className="text-primary font-medium hover:underline">
            {/* <Link href={`/${locale}/register`} className="text-primary font-medium hover:underline"> */}
              {('auth.signUp')}
              {/* {t('auth.signUp')} */}
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}