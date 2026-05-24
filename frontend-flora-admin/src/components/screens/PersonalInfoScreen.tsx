'use client';

import { useState } from 'react';
import { useAppStore } from '@/lib/store';
import { t } from '@/lib/i18n';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Save } from 'lucide-react';

export default function PersonalInfoScreen() {
  const { locale, goBack, user, updateUserProfile } = useAppStore();
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');

  const handleSave = () => {
    updateUserProfile({ name, email, phone });
    goBack();
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
      <Button variant="ghost" size="sm" onClick={goBack} className="gap-2 mb-6">
        <ArrowLeft className="h-4 w-4" />
        {locale === 'kh' ? 'ត្រឡប់' : 'Back'}
      </Button>

      <h1 className="text-2xl font-bold mb-6">{t(locale, 'personalInfo')}</h1>

      <Card>
        <CardContent className="p-6 space-y-4">
          <div>
            <label className="text-sm font-medium mb-1.5 block">{t(locale, 'fullName')}</label>
            <Input value={name} onChange={e => setName(e.target.value)} />
          </div>
          <div>
            <label className="text-sm font-medium mb-1.5 block">{t(locale, 'email')}</label>
            <Input type="email" value={email} onChange={e => setEmail(e.target.value)} />
          </div>
          <div>
            <label className="text-sm font-medium mb-1.5 block">{t(locale, 'phone')}</label>
            <Input value={phone} onChange={e => setPhone(e.target.value)} />
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-3 mt-6">
        <Button onClick={handleSave} className="bg-accent-green hover:bg-forest-mid text-white gap-2">
          <Save className="h-4 w-4" /> {t(locale, 'save')}
        </Button>
        <Button variant="outline" onClick={goBack}>{t(locale, 'cancel')}</Button>
      </div>
    </div>
  );
}
