import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function ReturnsPage() {
  const t = useTranslations('returns');
  const commonT = useTranslations('common');

  const returnSteps = t.raw('howToReturn.steps');
  const faqQuestions = t.raw('faq.questions');

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header Section */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">{t('title')}</h1>
        <p className="text-xl text-muted-foreground mb-2">{t('subtitle')}</p>
        <p className="text-lg text-muted-foreground">{t('description')}</p>
      </div>

      {/* Return Policy */}
      <section className="mb-12">
        <h2 className="text-3xl font-semibold mb-8 text-center">{t('returnPolicy.title')}</h2>
        <Card className="mb-6">
          <CardContent className="pt-6">
            <p className="text-muted-foreground text-lg">{t('returnPolicy.description')}</p>
          </CardContent>
        </Card>
        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg text-green-600">{t('returnPolicy.eligibility.title')}</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {t.raw('returnPolicy.eligibility.items').map((item: string, index: number) => (
                  <li key={index} className="flex items-center text-sm">
                    <span className="text-green-500 mr-2">✓</span>
                    {item}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg text-red-600">{t('returnPolicy.nonReturnable.title')}</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {t.raw('returnPolicy.nonReturnable.items').map((item: string, index: number) => (
                  <li key={index} className="flex items-center text-sm">
                    <span className="text-red-500 mr-2">✗</span>
                    {item}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Exchange Policy */}
      <section className="mb-12">
        <h2 className="text-3xl font-semibold mb-8 text-center">{t('exchangePolicy.title')}</h2>
        <Card className="mb-6">
          <CardContent className="pt-6">
            <p className="text-muted-foreground text-lg">{t('exchangePolicy.description')}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{t('exchangePolicy.process.title')}</CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="space-y-3">
              {t.raw('exchangePolicy.process.steps').map((step: string, index: number) => (
                <li key={index} className="flex items-start">
                  <span className="flex-shrink-0 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium mr-3 mt-0.5">
                    {index + 1}
                  </span>
                  <span className="text-muted-foreground">{step}</span>
                </li>
              ))}
            </ol>
          </CardContent>
        </Card>
      </section>

      {/* How to Return */}
      <section className="mb-12">
        <h2 className="text-3xl font-semibold mb-8 text-center">{t('howToReturn.title')}</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {returnSteps.map((step: { title: string; description: string }, index: number) => (
            <Card key={index} className="h-full">
              <CardHeader className="text-center">
                <div className="w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
                  {index + 1}
                </div>
                <CardTitle className="text-lg">{step.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-center">{step.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Refunds */}
      <section className="mb-12">
        <h2 className="text-3xl font-semibold mb-8 text-center">{t('refunds.title')}</h2>
        <Card>
          <CardContent className="pt-6">
            <p className="text-muted-foreground text-lg mb-6">{t('refunds.description')}</p>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-muted rounded-lg">
                <h4 className="font-semibold mb-2">{t('refunds.methods.creditCard')}</h4>
                <p className="text-sm text-muted-foreground">Credit/Debit Card</p>
              </div>
              <div className="text-center p-4 bg-muted rounded-lg">
                <h4 className="font-semibold mb-2">{t('refunds.methods.paypal')}</h4>
                <p className="text-sm text-muted-foreground">PayPal</p>
              </div>
              <div className="text-center p-4 bg-muted rounded-lg">
                <h4 className="font-semibold mb-2">{t('refunds.methods.bankTransfer')}</h4>
                <p className="text-sm text-muted-foreground">Bank Transfer</p>
              </div>
            </div>
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
            <div className="text-sm text-muted-foreground space-y-2 mb-6">
              <p>{t('contact.email')}</p>
              <p>{t('contact.phone')}</p>
              <p>{t('contact.hours')}</p>
            </div>
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
