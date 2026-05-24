'use client';

import { useAppStore } from '@/lib/store';
import { t } from '@/lib/i18n';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Shield } from 'lucide-react';

export default function PrivacyPolicyScreen() {
  const { locale, goBack } = useAppStore();

  const content = locale === 'kh' ? [
    { title: 'ព័ត៌មានដែលយើងប្រមូល', body: 'យើងប្រមូលព័ត៌មានផ្ទាល់ខ្លួនដូចជាឈ្មោះ អាសយដ្ឋានអ៊ីមែល លេខទូរស័ព្ទ នៅពេលអ្នកចុះឈ្មោះ។ យើងក៏ប្រមូលទិន្នន័យប្រើប្រាស់ដូចជាទំព័រដែលអ្នកទស្សនា លំដាប់ការស្វែងរក និងព័ត៌មានឧបករណ៍។ ខុកឃីត្រូវបានប្រើដើម្បីបង្កើនបទពិសោធន៍អ្នកប្រើប្រាស់។' },
    { title: 'របៀបដែលយើងប្រើព័ត៌មានរបស់អ្នក', body: 'ព័ត៌មានរបស់អ្នកត្រូវបានប្រើដើម្បីដំណើរការការបញ្ជាទិញ ទំនាក់ទំនងអំពីស្ថានភាពបញ្ជាទិញ ផ្ញើការជូនដំណឹងបញ្ចុះតម្លៃ និងកែលម្អសេវាកម្មរបស់យើង។ យើងមិនលក់ព័ត៌មានផ្ទាល់ខ្លួនរបស់អ្នកដល់ភាគីទីបីឡើយ។' },
    { title: 'ការការពារទិន្នន័យ', body: 'យើងប្រើការអ៊ិនគ្រីប SSL/TLS ដើម្បីការពារទិន្នន័យក្នុងការផ្ទេរ។ ទិន្នន័យរក្សាទុកក្នុងសេវ៉ាយដែលមានសុវត្ថិភាព។ យើងអនុវត្តតាមច្បាប់ការពារទិន្នន័យរបស់កម្ពុជា។ ការចូលប្រើទិន្នន័យត្រូវបានកំណត់ដល់បុគ្គលិកដែលមានសិទ្ធិ។' },
    { title: 'សិទ្ធិរបស់អ្នក', body: 'អ្នកមានសិទ្ធិចូលមើល កែសម្រួល ឬលុបព័ត៌មានផ្ទាល់ខ្លួនរបស់អ្នក។ ដើម្បីធ្វើការសំណើ សូមទាក់ទង privacy@floramarket.kh។ យើងនឹងឆ្លើយតបក្នុងរយៈពេល 30 ថ្ងៃ។' },
    { title: 'ទំនាក់ទំនង', body: 'សម្រាប់សំណើទាក់ទងនឹងឯកជនភាព សូមទាក់ទង៖ privacy@floramarket.kh ឬ Flora Market, Street 240, Khan Chamkarmon, Phnom Penh, Cambodia.' },
  ] : [
    { title: 'Information We Collect', body: 'We collect personal information such as your name, email address, and phone number when you register. We also collect usage data including pages visited, search queries, and device information. Cookies are used to enhance your browsing experience and remember your preferences between sessions.' },
    { title: 'How We Use Your Information', body: 'Your information is used to process orders, communicate about order status, send promotional notifications (with your consent), and improve our services. We may use aggregated, anonymized data for analytics purposes. We never sell your personal information to third parties.' },
    { title: 'Data Protection', body: 'We use SSL/TLS encryption to protect data in transit. Stored data is kept on secure servers with restricted access. We comply with Cambodian data protection regulations. Access to personal data is limited to authorized personnel who need it to perform their duties.' },
    { title: 'Your Rights', body: 'You have the right to access, correct, or delete your personal information at any time. To make a request, contact privacy@floramarket.kh. We will respond within 30 days. You can also update your information directly in your account settings.' },
    { title: 'Contact', body: 'For privacy-related inquiries, contact: privacy@floramarket.kh or Flora Market, Street 240, Khan Chamkarmon, Phnom Penh, Cambodia.' },
  ];

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
      <Button variant="ghost" size="sm" onClick={goBack} className="gap-2 mb-6">
        <ArrowLeft className="h-4 w-4" />
        {locale === 'kh' ? 'ត្រឡប់' : 'Back'}
      </Button>

      <div className="flex items-center gap-3 mb-6">
        <div className="h-12 w-12 rounded-xl bg-pale-green dark:bg-forest-mid/30 flex items-center justify-center">
          <Shield className="h-6 w-6 text-forest dark:text-accent-green" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">{t(locale, 'privacyPolicy')}</h1>
          <p className="text-sm text-muted-foreground">Last updated: April 2026</p>
        </div>
      </div>

      <div className="space-y-4">
        {content.map((section, idx) => (
          <Card key={idx}>
            <CardContent className="p-5">
              <h2 className="font-semibold mb-2">{section.title}</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">{section.body}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
