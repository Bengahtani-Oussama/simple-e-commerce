'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
// import { useTranslations, useLocale } from 'next-intl';
import {
  ShoppingCart,
  User,
  Search,
  Menu,
  X,
  Globe,
  LogOut,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useAuthStore } from '@/store/authStore';
import { useCartStore } from '@/store/cartStore';
import { Badge } from '@/components/ui/badge';

export default function Header() {
  // const t = useTranslations();
  // const locale = useLocale();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const { user, isAuthenticated, logout } = useAuthStore();
  const { itemCount } = useCartStore();

  const navLinks = [
    { href: `/`, label: ('nav.home') },
    { href: `/products`, label: ('nav.products') },
    { href: `/categories`, label: ('nav.categories') },
    { href: `/brands`, label: ('nav.brands') },
  ];
  // const navLinks = [
  //   { href: `/${locale}`, label: t('nav.home') },
  //   { href: `/${locale}/products`, label: t('nav.products') },
  //   { href: `/${locale}/categories`, label: t('nav.categories') },
  //   { href: `/${locale}/brands`, label: t('nav.brands') },
  // ];

  const languages = [
    { code: 'ar', name: 'العربية' },
    { code: 'en', name: 'English' },
    { code: 'fr', name: 'Français' },
  ];

  const switchLocale = (newLocale: string) => {
    const newPathname = pathname.replace(`/`, `/${newLocale}`);
    // const newPathname = pathname.replace(`/${locale}`, `/${newLocale}`);
    window.location.href = newPathname;
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/products?search=${encodeURIComponent(searchQuery)}`;
      // window.location.href = `/${locale}/products?search=${encodeURIComponent(searchQuery)}`;
    }
  };

  const handleLogout = async () => {
    await logout();
    window.location.href = `/`;
    // window.location.href = `/${locale}`;
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      {/* Top Bar */}
      <div className="border-b bg-primary/5">
        <div className="container mx-auto px-4">
          <div className="flex h-10 items-center justify-between text-sm">
            <p className="text-muted-foreground">
              {('home.hero.subtitle')}
              {/* {t('home.hero.subtitle')} */}
            </p>
            <div className="flex items-center gap-4">
              {/* Language Switcher */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="gap-2">
                    <Globe className="h-4 w-4" />
                    <span className="hidden sm:inline">
                      Arabic
                      {/* {languages.find((l) => l.code === locale)?.name} */}
                    </span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {/* {languages.map((lang) => (
                    <DropdownMenuItem
                      key={lang.code}
                      onClick={() => switchLocale(lang.code)}
                      className={locale === lang.code ? 'bg-accent' : ''}
                    >
                      {lang.name}
                    </DropdownMenuItem>
                  ))} */}
                    <DropdownMenuItem
                      // onClick={() => switchLocale(lang.code)}
                      // className={locale === lang.code ? 'bg-accent' : ''}
                    >
                      Arabic
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      // key={lang.code}
                      // onClick={() => switchLocale(lang.code)}
                      // className={locale === lang.code ? 'bg-accent' : ''}
                    >
                     english
                    </DropdownMenuItem>
                  
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between gap-4">
          {/* Logo */}
          <Link href={`/`} className="flex items-center gap-2">
          {/* <Link href={`/${locale}`} className="flex items-center gap-2"> */}
            <div className="h-8 w-8 rounded-lg bg-primary" />
            <span className="text-xl font-bold">Algeria Shop</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden items-center gap-6 md:flex">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-medium transition-colors hover:text-primary"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Search Bar - Desktop */}
          <form
            onSubmit={handleSearch}
            className="hidden flex-1 max-w-md lg:flex"
          >
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                placeholder={('common.search')}
                // placeholder={t('common.search')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10"
              />
            </div>
          </form>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {/* Cart */}
            <Link href={`/cart`}>
            {/* <Link href={`/${locale}/cart`}> */}
              <Button variant="ghost" size="icon" className="relative">
                <ShoppingCart className="h-5 w-5" />
                {itemCount > 0 && (
                  <Badge
                    variant="destructive"
                    className="absolute -right-1 -top-1 h-5 w-5 rounded-full p-0 text-xs"
                  >
                    {itemCount}
                  </Badge>
                )}
              </Button>
            </Link>

            {/* User Menu */}
            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <User className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem asChild>
                    <Link href={`/account`} className="cursor-pointer">
                      {('nav.account')}
                    </Link>
                    {/* <Link href={`/${locale}/account`} className="cursor-pointer">
                      {t('nav.account')}
                    </Link> */}
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href={`/account/orders`} className="cursor-pointer">
                      {('account.orders')}
                    </Link>
                    {/* <Link href={`/${locale}/account/orders`} className="cursor-pointer">
                      {t('account.orders')}
                    </Link> */}
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="cursor-pointer text-destructive"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    {('nav.logout')}
                    {/* {t('nav.logout')} */}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link href={`/login`}>
                <Button variant="ghost" size="sm">
                  {('nav.login')}
                </Button>
              </Link>
            )}
              {/* <Link href={`/${locale}/login`}>
                <Button variant="ghost" size="sm">
                  {t('nav.login')}
                </Button>
              </Link> */}

            {/* Mobile Menu */}
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild className="md:hidden">
                <Button variant="ghost" size="icon">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side={'left'}>
              {/* <SheetContent side={locale === 'ar' ? 'right' : 'left'}> */}
                <div className="flex flex-col gap-6 mt-8">
                  {/* Mobile Search */}
                  <form onSubmit={handleSearch}>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        type="search"
                        placeholder={('common.search')}
                        // placeholder={t('common.search')}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </form>

                  {/* Mobile Navigation */}
                  <nav className="flex flex-col gap-4">
                    {navLinks.map((link) => (
                      <Link
                        key={link.href}
                        href={link.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className="text-lg font-medium"
                      >
                        {link.label}
                      </Link>
                    ))}
                  </nav>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}