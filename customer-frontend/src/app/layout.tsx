import type { Metadata } from 'next';
import { Cairo } from 'next/font/google';
import './globals.css';

const cairo = Cairo({
  subsets: ['latin', 'arabic'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Algeria E-Commerce',
  description: 'Shop the best products in Algeria',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${cairo.className} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}