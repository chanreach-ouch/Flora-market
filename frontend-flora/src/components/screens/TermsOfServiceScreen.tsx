'use client';

import { useAppStore } from '@/lib/store';
import { t } from '@/lib/i18n';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, FileText } from 'lucide-react';

export default function TermsOfServiceScreen() {
  const { locale, goBack } = useAppStore();

  const content = locale === 'kh' ? [
    { title: 'ការទទួលយកលក្ខខណ្ឌ', body: 'ដោយប្រើ Flora Market អ្នកយល់ព្រមនឹងលក្ខខណ្ឌទាំងនេះ។ ប្រសិនបើអ្នកមិនយល់ព្រម សូមកុំប្រើសេវាកម្ម។ លក្ខខណ្ឌទាំងនេះគឺជាកិច្ចព្រមព្រៀងផ្លូវច្បាប់រវាងអ្នកនិង Flora Market។' },
    { title: 'គណនីអ្នកប្រើប្រាស់', body: 'អ្នកទិញទទួលខុសត្រូវក្នុងការផ្តល់ព័ត៌មានត្រឹមត្រូវនៅពេលចុះឈ្មោះ។ អ្នកលក់ទទួលខុសត្រូវក្នុងការរៀបចំបញ្ជីរុក្ខជាតិឱ្យត្រឹមត្រូវ រក្សាស្តុកឱ្យទាន់សម័យ និងឆ្លើយតបការបញ្ជាទិញទាន់កាល។ គណនីនីមួយៗអាចជាអ្នកទិញឬអ្នកលក់បានតែមួយ។' },
    { title: 'ថ្លៃសេវាវេទិកា', body: 'Flora Market គិតថ្លៃសេវា 5% ពីអ្នកលក់លើគ្រប់ការបញ្ជាទិញទាំងអស់។ ថ្លៃសេវានេះត្រូវបានកាត់ដោយស្វ័យប្រវត្តិពីប្រាក់ចំណូលរបស់អ្នកលក់។ អ្នកទិញមិនត្រូវបង់ថ្លៃសេវាឡើយ។' },
    { title: 'បញ្ជីរុក្ខជាតិនិងតម្លៃ', body: 'តម្លៃទាំងអស់គឺថេរ។ ការចរចាតម្លៃមិនត្រូវបានអនុញ្ញាតឡើយ។ អ្នកលក់ត្រូវបានផ្តន្ទាបើការពិពណ៌នាមិនត្រឹមត្រូវ។ រូបភាពត្រូវតែជារូបភាពពិតនៃរុក្ខជាតិ។' },
    { title: 'ការដឹកជញ្ជូននិងការយកដោយខ្លួនឯង', body: 'អ្នកទិញត្រូវរៀបចំការដឹកជញ្ជូនដោយខ្លួនឯងតាមរយៈសេវាកម្មដឹកជញ្ជូនណាមួយដែលអ្នកចូលចិត្ត ឬមកយកដោយខ្លួនឯងពីហាង។ Flora Market មិនទទួលខុសត្រូវលើការដឹកជញ្ជូនឡើយ។' },
    { title: 'វិធីសាស្ត្រការទូទាត់', body: 'យើងគាំទ្រ ABA Pay, ACLEDA Bank, Wing Money និង Bakong (NBC)។ ការទូទាត់ទាំងអស់ត្រូវបានដំណើរការដោយសុវត្ថិភាព។ ប្រាក់ត្រូវបានកាន់កាប់រហូតដល់ការបញ្ជាទិញបានបញ្ចប់។' },
    { title: 'ការដោះស្រាយជម្លោះ', body: 'សម្រាប់ការតវ៉ា ទាក់ទង support@floramarket.kh ក្នុងរយៈពេល 7 ថ្ងៃ។ យើងនឹងពិនិត្យនិងសម្រេចក្នុងរយៈពេល 14 ថ្ងៃ។ ការសម្រេចរបស់យើងគឺជាចុងក្រោយ។' },
    { title: 'កំណត់ការទទួលខុសត្រូវ', body: 'Flora Market គឺជាវេទិកាតែប៉ុណ្ណោះ មិនមែនជាអ្នកលក់ទេ។ យើងមិនទទួលខុសត្រូវលើគុណភាពរុក្ខជាតិឡើយ។ ការទទួលខុសត្រូវអតិបរមារបស់យើងមិនលើសពីថ្លៃសេវាដែលបានគិតឡើយ។' },
    { title: 'ទំនាក់ទំនង', body: 'សម្រាប់សំណើផ្លូវច្បាប់ ទាក់ទង៖ legal@floramarket.kh ឬ Flora Market, Street 240, Khan Chamkarmon, Phnom Penh, Cambodia.' },
  ] : [
    { title: 'Acceptance of Terms', body: 'By using Flora Market, you agree to these terms and conditions. If you do not agree, please do not use our services. These terms constitute a legally binding agreement between you and Flora Market.' },
    { title: 'User Accounts', body: 'Buyers are responsible for providing accurate information during registration. Sellers are responsible for maintaining accurate plant listings, keeping stock levels up to date, and responding to orders promptly. Each account can only be either a buyer or seller account.' },
    { title: 'Platform Fees', body: 'Flora Market charges a 5% service fee to sellers on all transactions. This fee is automatically deducted from the seller\'s earnings. Buyers are not charged any platform fees.' },
    { title: 'Listings and Pricing', body: 'All prices are fixed. Price negotiation is not permitted. Sellers may be penalized for inaccurate descriptions. Images must be actual photos of the plants being sold. Misleading listings will be removed.' },
    { title: 'Delivery and Pickup', body: 'Buyers arrange their own delivery via any delivery service you prefer or self-pickup from the shop. Flora Market is not responsible for delivery arrangements, costs, or issues that arise during transit.' },
    { title: 'Payment Methods', body: 'We support ABA Pay, ACLEDA Bank, Wing Money, and Bakong (NBC). All payments are processed securely. Funds are held in escrow until the order is completed, ensuring both buyer and seller protection.' },
    { title: 'Dispute Resolution', body: 'For disputes, contact support@floramarket.kh within 7 days of the issue. We will review and resolve disputes within 14 business days. Our decision is final and binding.' },
    { title: 'Limitation of Liability', body: 'Flora Market is a marketplace platform only, not a seller. We are not responsible for the quality of plants sold on our platform. Our maximum liability is limited to the service fees charged.' },
    { title: 'Contact', body: 'For legal inquiries, contact: legal@floramarket.kh or Flora Market, Street 240, Khan Chamkarmon, Phnom Penh, Cambodia.' },
  ];

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
      <Button variant="ghost" size="sm" onClick={goBack} className="gap-2 mb-6">
        <ArrowLeft className="h-4 w-4" />
        {locale === 'kh' ? 'ត្រឡប់' : 'Back'}
      </Button>

      <div className="flex items-center gap-3 mb-6">
        <div className="h-12 w-12 rounded-xl bg-pale-green dark:bg-forest-mid/30 flex items-center justify-center">
          <FileText className="h-6 w-6 text-forest dark:text-accent-green" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">{t(locale, 'termsOfService')}</h1>
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
