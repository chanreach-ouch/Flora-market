'use client';

import { useState } from 'react';
import { useAppStore } from '@/lib/store';
import { t } from '@/lib/i18n';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, Bell, Tag, MessageSquare, Sparkles } from 'lucide-react';

export default function NotificationsScreen() {
  const { locale, userRole, goBack } = useAppStore();
  const [orderUpdates, setOrderUpdates] = useState(true);
  const [promoAlerts, setPromoAlerts] = useState(true);
  const [sellerMessages, setSellerMessages] = useState(true);
  const [newArrivals, setNewArrivals] = useState(true);

  const buyerToggles = [
    { icon: Bell, label: t(locale, 'orderUpdates'), desc: t(locale, 'orderUpdatesDesc'), value: orderUpdates, setter: setOrderUpdates },
    { icon: Tag, label: t(locale, 'promoAlerts'), desc: t(locale, 'promoAlertsDesc'), value: promoAlerts, setter: setPromoAlerts },
    { icon: MessageSquare, label: t(locale, 'sellerMessages'), desc: t(locale, 'sellerMessagesDesc'), value: sellerMessages, setter: setSellerMessages },
    { icon: Sparkles, label: t(locale, 'newArrivalsAlerts'), desc: t(locale, 'newArrivalsAlertsDesc'), value: newArrivals, setter: setNewArrivals },
  ];

  // Sellers do NOT see "Seller Messages" or "New Arrivals" toggles
  const sellerToggles = [
    { icon: Bell, label: t(locale, 'orderUpdates'), desc: t(locale, 'orderUpdatesDesc'), value: orderUpdates, setter: setOrderUpdates },
    { icon: Tag, label: t(locale, 'promoAlerts'), desc: t(locale, 'promoAlertsDesc'), value: promoAlerts, setter: setPromoAlerts },
  ];

  const toggles = userRole === 'seller' ? sellerToggles : buyerToggles;

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
      <Button variant="ghost" size="sm" onClick={goBack} className="gap-2 mb-6">
        <ArrowLeft className="h-4 w-4" />
        {locale === 'kh' ? 'ត្រឡប់' : 'Back'}
      </Button>

      <h1 className="text-2xl font-bold mb-6">{t(locale, 'notificationsTitle')}</h1>

      <Card>
        <CardContent className="p-2">
          {toggles.map((toggle, idx) => (
            <div key={idx} className="flex items-center gap-3 p-4 rounded-lg">
              <div className="h-10 w-10 rounded-xl bg-muted/50 flex items-center justify-center">
                <toggle.icon className="h-5 w-5 text-muted-foreground" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-sm">{toggle.label}</p>
                <p className="text-xs text-muted-foreground">{toggle.desc}</p>
              </div>
              <button
                onClick={() => toggle.setter(!toggle.value)}
                className={`relative w-11 h-6 rounded-full transition-colors ${
                  toggle.value ? 'bg-accent-green' : 'bg-muted'
                }`}
              >
                <span className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
                  toggle.value ? 'translate-x-5' : ''
                }`} />
              </button>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
