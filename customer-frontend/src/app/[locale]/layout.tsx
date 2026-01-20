import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { Cairo } from "next/font/google";
import { notFound } from "next/navigation";
// import { locales } from "@/i18n/request";
import { Toaster } from "@/components/ui/toaster";
import "./globals.css";
import { locales } from "../../i18n/request";

const cairo = Cairo({
  subsets: ["latin", "arabic"],
  display: "swap",
});

// export function generateStaticParams() {
//   return locales.map((locale) => ({ locale }));
// }

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
   params: { locale: string };
}) {

  const { locale } = params;

  // Validate locale
  if (!locales.includes(locale as any)) {
    notFound();
  }

  const messages = await getMessages();
  const direction = locale === "ar" ? "rtl" : "ltr";

  return (
    <html lang={locale} dir={direction}>
      <body className={cairo.className}>
        <NextIntlClientProvider messages={messages}>
          {children}
          <Toaster />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}

export function generateStaticParams() {
return [
  { locale: 'en' },
  { locale: 'fr' },
  { locale: 'ar' }
];
}