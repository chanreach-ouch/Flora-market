'use client';

import { useAppStore } from '@/lib/store';
import { t } from '@/lib/i18n';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { ArrowLeft, Mail, Phone, MapPin } from 'lucide-react';

export default function HelpSupportScreen() {
  const { locale, goBack } = useAppStore();

  const faqs = [
    { q: t(locale, 'faqQ1'), a: t(locale, 'faqA1') },
    { q: t(locale, 'faqQ2'), a: t(locale, 'faqA2') },
    { q: t(locale, 'faqQ3'), a: t(locale, 'faqA3') },
    { q: t(locale, 'faqQ4'), a: t(locale, 'faqA4') },
    { q: t(locale, 'faqQ5'), a: t(locale, 'faqA5') },
  ];

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
      <Button variant="ghost" size="sm" onClick={goBack} className="gap-2 mb-6">
        <ArrowLeft className="h-4 w-4" />
        {locale === 'kh' ? 'ត្រឡប់' : 'Back'}
      </Button>

      <h1 className="text-2xl font-bold mb-6">{t(locale, 'helpSupportTitle')}</h1>

      {/* FAQ */}
      <div className="mb-8">
        <h2 className="font-semibold mb-4">{t(locale, 'faq')}</h2>
        <Card>
          <CardContent className="p-2">
            <Accordion type="single" collapsible>
              {faqs.map((faq, idx) => (
                <AccordionItem key={idx} value={`faq-${idx}`}>
                  <AccordionTrigger className="text-sm text-left px-3">{faq.q}</AccordionTrigger>
                  <AccordionContent className="text-sm text-muted-foreground px-3">{faq.a}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </Card>
      </div>

      {/* Contact */}
      <div>
        <h2 className="font-semibold mb-4">{t(locale, 'contactUs')}</h2>
        <div className="space-y-3">
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <Mail className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="font-medium text-sm">{t(locale, 'emailUs')}</p>
                <p className="text-sm text-muted-foreground">support@floramarket.kh</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <Phone className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="font-medium text-sm">{t(locale, 'callUs')}</p>
                <p className="text-sm text-muted-foreground">+855 23 456 789</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                <MapPin className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="font-medium text-sm">{t(locale, 'visitUs')}</p>
                <p className="text-sm text-muted-foreground">{locale === 'kh' ? 'រាជធានីភ្នំពេញ កម្ពុជា' : 'Phnom Penh, Cambodia'}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
