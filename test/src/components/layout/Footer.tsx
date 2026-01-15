'use client';

import Link from 'next/link';
// import { useTranslations, useLocale } from 'next-intl';
import { Facebook, Instagram, Twitter, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function Footer() {
  // const t = useTranslations();
  // const locale = useLocale();

  const footerLinks = {
    company: [
      { label: ('footer.about'), href: `/about` },
      { label: ('footer.contact'), href: `/contact` },
    ],
    customer: [
      { label: ('footer.shipping'), href: `/shipping` },
      { label: ('footer.returns'), href: `/returns` },
      { label: ('footer.faq'), href: `/faq` },
    ],
    legal: [
      { label: ('footer.terms'), href: `/terms` },
      { label: ('footer.privacy'), href: `/privacy` },
    ],
  };
  // const footerLinks = {
  //   company: [
  //     { label: t('footer.about'), href: `/${locale}/about` },
  //     { label: t('footer.contact'), href: `/${locale}/contact` },
  //   ],
  //   customer: [
  //     { label: t('footer.shipping'), href: `/${locale}/shipping` },
  //     { label: t('footer.returns'), href: `/${locale}/returns` },
  //     { label: t('footer.faq'), href: `/${locale}/faq` },
  //   ],
  //   legal: [
  //     { label: t('footer.terms'), href: `/${locale}/terms` },
  //     { label: t('footer.privacy'), href: `/${locale}/privacy` },
  //   ],
  // };

  const socialLinks = [
    { icon: Facebook, href: '#', label: 'Facebook' },
    { icon: Instagram, href: '#', label: 'Instagram' },
    { icon: Twitter, href: '#', label: 'Twitter' },
  ];

  return (
    <footer className="border-t bg-muted/50">
      <div className="container mx-auto px-4 py-12">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="h-8 w-8 rounded-lg bg-primary" />
              <span className="text-lg font-bold">Algeria Shop</span>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              {('home.hero.subtitle')}
              {/* {t('home.hero.subtitle')} */}
            </p>
            <div className="flex gap-2">
              {socialLinks.map((social) => (
                <Link
                  key={social.label}
                  href={social.href}
                  className="flex h-9 w-9 items-center justify-center rounded-lg border bg-background hover:bg-accent transition-colors"
                >
                  <social.icon className="h-4 w-4" />
                </Link>
              ))}
            </div>
          </div>

          {/* Company Links */}
          <div>
            <h3 className="font-semibold mb-4">{('footer.about')}</h3>
            {/* <h3 className="font-semibold mb-4">{t('footer.about')}</h3> */}
            <ul className="space-y-2">
              {footerLinks.company.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h3 className="font-semibold mb-4">{('footer.contact')}</h3>
            {/* <h3 className="font-semibold mb-4">{t('footer.contact')}</h3> */}
            <ul className="space-y-2">
              {footerLinks.customer.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="font-semibold mb-4">{('footer.newsletter')}</h3>
            {/* <h3 className="font-semibold mb-4">{t('footer.newsletter')}</h3> */}
            <p className="text-sm text-muted-foreground mb-4">
              {('footer.enterEmail')}
              {/* {t('footer.enterEmail')} */}
            </p>
            <form className="flex gap-2">
              <Input
                type="email"
                placeholder={('footer.enterEmail')}
                // placeholder={t('footer.enterEmail')}
                className="flex-1"
              />
              <Button type="submit">{('footer.subscribe')}</Button>
              {/* <Button type="submit">{t('footer.subscribe')}</Button> */}
            </form>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} Algeria E-Commerce.{' '}
              {('footer.allRightsReserved')}.
              {/* {t('footer.allRightsReserved')}. */}
            </p>
            <div className="flex gap-4">
              {footerLinks.legal.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}