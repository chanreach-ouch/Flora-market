'use client';

import { useAppStore } from '@/lib/store';
import { t } from '@/lib/i18n';
import { sellers } from '@/lib/data';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle, MapPin, Truck, ShoppingBag } from 'lucide-react';

export default function OrderConfirmationScreen() {
  const { locale, setScreen } = useAppStore();

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 sm:py-16 text-center">
      {/* Success Icon */}
      <div className="animate-scale-in mb-6">
        <div className="h-24 w-24 rounded-full bg-accent-green/10 dark:bg-accent-green/20 flex items-center justify-center mx-auto">
          <CheckCircle className="h-14 w-14 text-accent-green" />
        </div>
      </div>

      <h1 className="text-2xl sm:text-3xl font-bold mb-2">{t(locale, 'orderPlaced')}</h1>
      <p className="text-muted-foreground mb-8">
        {locale === 'kh'
          ? 'ការបញ្ជាទិញរបស់អ្នកត្រូវបានបញ្ជូនទៅអ្នកលក់ដោយជោគជ័យ'
          : 'Your order has been successfully sent to the seller'}
      </p>

      {/* Order Details Card */}
      <Card className="text-left mb-6">
        <CardContent className="p-6">
          <h2 className="font-semibold mb-4">{locale === 'kh' ? 'ព័ត៌មានការបញ្ជាទិញ' : 'Order Details'}</h2>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">{locale === 'kh' ? 'លេខកូដ' : 'Order ID'}</span>
              <span className="font-medium">ORD-{Date.now().toString().slice(-6)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">{locale === 'kh' ? 'ស្ថានភាព' : 'Status'}</span>
              <span className="font-medium text-gold">{t(locale, 'pending')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">{locale === 'kh' ? 'ការទូទាត់' : 'Payment'}</span>
              <span className="font-medium">{t(locale, 'securePayment')}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Delivery Info */}
      <Card className="text-left mb-6">
        <CardContent className="p-6">
          <div className="flex items-start gap-3 mb-4">
            <Truck className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-sm">{t(locale, 'delivery')}</h3>
              <p className="text-sm text-muted-foreground">{t(locale, 'deliveryNote')}</p>
            </div>
          </div>

          <div className="space-y-3">
            {sellers.map(seller => (
              <div key={seller.id} className="flex items-start gap-2 p-3 bg-muted/50 rounded-lg">
                <MapPin className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-sm">{seller.nurseryName}</p>
                  <p className="text-xs text-muted-foreground">{seller.location}, {seller.district}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Button onClick={() => setScreen('home')} className="bg-accent-green hover:bg-forest-mid text-white">
          <ShoppingBag className="h-4 w-4 mr-2" />
          {t(locale, 'continueShopping')}
        </Button>
        <Button variant="outline" onClick={() => setScreen('home')}>
          {t(locale, 'trackOrder')}
        </Button>
      </div>
    </div>
  );
}
