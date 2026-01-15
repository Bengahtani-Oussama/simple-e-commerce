import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(price: number, locale: string = 'ar'): string {
  const currency = locale === 'ar' ? 'د.ج' : 'DA';
  return `${price.toLocaleString(locale)} ${currency}`;
}

export function formatDate(date: string | Date, locale: string = 'ar'): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleDateString(locale === 'ar' ? 'ar-DZ' : 'en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function getImageUrl(url?: string): string {
  if (!url) return '/images/placeholder.png';
  return url;
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}