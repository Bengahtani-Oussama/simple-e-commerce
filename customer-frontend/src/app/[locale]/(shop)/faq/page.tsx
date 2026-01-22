import { useTranslations } from 'next-intl';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function FAQPage() {
  const t = useTranslations('faq');

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-4">{t('title')}</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          {t('subtitle')}
        </p>
      </div>

      <div className="max-w-4xl mx-auto space-y-4">
        {t.raw('questions').map((faq: { question: string; answer: string }, index: number) => (
          <Card key={index} className="shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-semibold text-left">
                {faq.question}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed">
                {faq.answer}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="text-center mt-12">
        <p className="text-muted-foreground">
          {t('stillHaveQuestions')} {t('contactUs')}
        </p>
      </div>
    </div>
  );
}
