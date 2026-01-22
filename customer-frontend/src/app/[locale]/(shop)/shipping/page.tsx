import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function ShippingPage() {
  const t = useTranslations('shipping');
  const commonT = useTranslations('common');

  const shippingOptions = [
    {
      key: 'standard',
      icon: '📦',
    },
    {
      key: 'express',
      icon: '🚀',
    },
    {
      key: 'international',
      icon: '🌍',
    },
  ];

  const faqQuestions = t.raw('faq.questions');

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header Section */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">{t('title')}</h1>
        <p className="text-xl text-muted-foreground mb-2">{t('subtitle')}</p>
        <p className="text-lg text-muted-foreground">{t('description')}</p>
      </div>

      {/* Shipping Options */}
      <section className="mb-12">
        <h2 className="text-3xl font-semibold mb-8 text-center">{t('shippingOptions.title')}</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {shippingOptions.map((option) => (
            <Card key={option.key} className="h-full">
              <CardHeader className="text-center">
                <div className="text-4xl mb-4">{option.icon}</div>
                <CardTitle className="text-xl">{t(`shippingOptions.${option.key}.title`)}</CardTitle>
                <CardDescription className="text-base">
                  {t(`shippingOptions.${option.key}.description`)}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {t.raw(`shippingOptions.${option.key}.features`).map((feature: string, index: number) => (
                    <li key={index} className="flex items-center text-sm">
                      <span className="text-green-500 mr-2">✓</span>
                      {feature}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Shipping Policy */}
      <section className="mb-12">
        <h2 className="text-3xl font-semibold mb-8 text-center">{t('shippingPolicy.title')}</h2>
        <div className="grid md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">{t('shippingPolicy.processing.title')}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">{t('shippingPolicy.processing.description')}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">{t('shippingPolicy.tracking.title')}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">{t('shippingPolicy.tracking.description')}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">{t('shippingPolicy.delivery.title')}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">{t('shippingPolicy.delivery.description')}</p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Shipping Restrictions */}
      <section className="mb-12">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">{t('restrictions.title')}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">{t('restrictions.description')}</p>
          </CardContent>
        </Card>
      </section>

      {/* FAQ Section */}
      <section className="mb-12">
        <h2 className="text-3xl font-semibold mb-8 text-center">{t('faq.title')}</h2>
        <div className="space-y-4">
          {faqQuestions.map((faq: { question: string; answer: string }, index: number) => (
            <Card key={index}>
              <CardHeader>
                <CardTitle className="text-lg">{faq.question}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{faq.answer}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Contact Section */}
      <section className="text-center">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="text-2xl">{t('contact.title')}</CardTitle>
            <CardDescription className="text-lg">{t('contact.description')}</CardDescription>
          </CardHeader>
          <CardContent>
            <Link
              href="/contact"
              className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
            >
              {t('contact.contactUs')}
            </Link>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
