'use client';

import { useTranslations, useLocale } from 'next-intl';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

export default function HeroSection() {
  const t = useTranslations();
  const locale = useLocale();

  return (
    <section className="relative bg-gradient-to-br from-primary/10 via-background to-secondary/10 overflow-hidden">
      <div className="container mx-auto px-4 py-20 md:py-32">
        <div className="grid gap-8 lg:grid-cols-2 lg:gap-12 items-center">
          {/* Text Content */}
          <div className="flex flex-col gap-6">
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
              {t('home.hero.title')}
            </h1>
            <p className="text-lg text-muted-foreground md:text-xl">
              {t('home.hero.subtitle')}
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href={`/${locale}/products`}>
                <Button size="lg" className="gap-2">
                  {t('home.hero.shopNow')}
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>

          {/* Image/Visual */}
          <div className="relative aspect-square lg:aspect-auto lg:h-[500px]">
            <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-secondary/20 rounded-2xl" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="h-32 w-32 mx-auto mb-4 rounded-full bg-primary/20 flex items-center justify-center">
                  <div className="h-24 w-24 rounded-full bg-primary" />
                </div>
                <p className="text-xl font-semibold text-primary">
                  {t('home.featured')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}