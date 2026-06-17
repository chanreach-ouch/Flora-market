'use client';

import { useState, useEffect } from 'react';
import { useAppStore } from '@/lib/store';
import { t } from '@/lib/i18n';
import { getPlantById, getSellerById } from '@/lib/data';
import type { MockPlant } from '@/lib/data';
import { formatUSD, formatKHR } from '@/lib/i18n';
import { apiFetchPlantById, apiPlaceOrders } from '@/lib/api';
import { showToast } from '@/components/ui/toast-custom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Minus, Plus, Trash2, ShoppingBag, CreditCard, Shield } from 'lucide-react';

export default function CartScreen() {
  const { cartItems, removeFromCart, updateCartQuantity, clearCart, selectOrder, locale, setScreen } = useAppStore();
  const [promoCode, setPromoCode] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('aba');
  const [apiPlantCache, setApiPlantCache] = useState<Record<string, MockPlant>>({});
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);

  // For each cart item not found in mock data, fetch from API
  useEffect(() => {
    cartItems.forEach(({ plantId }) => {
      if (getPlantById(plantId) || apiPlantCache[plantId]) return;
      apiFetchPlantById(plantId)
        .then(p => setApiPlantCache(prev => ({ ...prev, [plantId]: p })))
        .catch(() => {});
    });
  }, [cartItems]);

  const resolvePlant = (plantId: string) => getPlantById(plantId) || apiPlantCache[plantId];

  const cartWithDetails = cartItems.map(item => {
    const plant = resolvePlant(item.plantId);
    const seller = plant ? (getSellerById(plant.sellerId) || null) : null;
    return { ...item, plant, seller };
  }).filter(item => item.plant);

  // Group by seller
  const groupedBySeller = cartWithDetails.reduce((acc, item) => {
    const sellerId = item.seller?.id || 'unknown';
    if (!acc[sellerId]) acc[sellerId] = { seller: item.seller, items: [] };
    acc[sellerId].items.push(item);
    return acc;
  }, {} as Record<string, { seller: any; items: typeof cartWithDetails }>);

  const subtotal = cartWithDetails.reduce((sum, item) => sum + (item.plant?.price || 0) * item.quantity, 0);
  const serviceFee = subtotal * 0.05;
  const total = subtotal + serviceFee;

  const handlePlaceOrder = async () => {
    setIsPlacingOrder(true);
    try {
      // Group cart items by seller for the backend (one order per seller)
      const grouped: Record<string, { sellerId: string; items: { plant_id: string; quantity: number }[] }> = {};
      for (const item of cartWithDetails) {
        if (!item.plant) continue;
        const sid = item.plant.sellerId;
        if (!grouped[sid]) grouped[sid] = { sellerId: sid, items: [] };
        grouped[sid].items.push({ plant_id: item.plantId, quantity: item.quantity });
      }
      const groups = Object.values(grouped);
      if (groups.length > 0) {
        const orders = await apiPlaceOrders(groups);
        clearCart();
        selectOrder(orders[0]?.id || 'ORD-' + Date.now());
      } else {
        clearCart();
        selectOrder('ORD-' + Date.now());
      }
    } catch {
      // If backend unavailable, still show confirmation (demo mode)
      clearCart();
      selectOrder('ORD-' + Date.now());
    } finally {
      setIsPlacingOrder(false);
    }
  };

  const paymentMethods = [
    { id: 'aba', name: t(locale, 'paymentMethods.aba'), icon: '🏦' },
    { id: 'acleda', name: t(locale, 'paymentMethods.acleda'), icon: '🏛️' },
    { id: 'wing', name: t(locale, 'paymentMethods.wing'), icon: '💰' },
    { id: 'bakong', name: t(locale, 'paymentMethods.bakong'), icon: '📱' },
  ];

  if (cartWithDetails.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16 text-center">
        <div className="text-6xl mb-4">🛒</div>
        <h2 className="text-xl font-bold mb-2">{locale === 'kh' ? 'រទោះរបស់អ្នកទទេ' : 'Your cart is empty'}</h2>
        <p className="text-muted-foreground mb-6">{locale === 'kh' ? 'បន្ថែមរុក្ខជាតិទៅរទោះរបស់អ្នក' : 'Add some plants to your cart'}</p>
        <Button onClick={() => setScreen('home')} className="bg-accent-green hover:bg-forest-mid text-white">
          <ShoppingBag className="h-4 w-4 mr-2" />
          {locale === 'kh' ? 'ទិញរុក្ខជាតិ' : 'Start Shopping'}
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
      <h1 className="text-2xl font-bold mb-6">{t(locale, 'myCart')}</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {Object.entries(groupedBySeller).map(([sellerId, group]) => (
            <Card key={sellerId}>
              <CardContent className="p-4 sm:p-6">
                {/* Seller Header */}
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-lg">🏪</span>
                  <span className="font-semibold text-sm">{group.seller?.nurseryName}</span>
                  <Badge variant="secondary" className="text-[10px]">
                    <Shield className="h-3 w-3 mr-1" />{t(locale, 'verified')}
                  </Badge>
                </div>

                {/* Items */}
                <div className="space-y-4">
                  {group.items.map(item => (
                    <div key={item.plantId} className="flex gap-4">
                      <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-xl bg-gradient-to-br from-pale-green to-cream dark:from-forest-mid/30 dark:to-forest/30 flex items-center justify-center shrink-0">
                        <span className="text-2xl sm:text-3xl">🌿</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-sm sm:text-base truncate">
                          {locale === 'kh' ? item.plant?.nameKh : item.plant?.nameEn}
                        </h3>
                        <p className="text-sm text-muted-foreground">{formatUSD(item.plant?.price || 0)}</p>
                        <div className="flex items-center gap-3 mt-2">
                          <div className="flex items-center gap-1 border rounded-lg">
                            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => updateCartQuantity(item.plantId, item.quantity - 1)}>
                              <Minus className="h-3 w-3" />
                            </Button>
                            <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => updateCartQuantity(item.plantId, item.quantity + 1)}>
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>
                          <span className="font-semibold text-sm">{formatUSD((item.plant?.price || 0) * item.quantity)}</span>
                          <Button variant="ghost" size="icon" className="h-7 w-7 ml-auto text-destructive" onClick={() => removeFromCart(item.plantId)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Nursery Address */}
                <div className="mt-4 p-3 bg-muted/50 rounded-lg text-xs text-muted-foreground">
                  <strong>{t(locale, 'nurseryAddress')}:</strong> {group.seller?.location}, {group.seller?.district}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Order Summary */}
        <div>
          <Card className="sticky top-24">
            <CardContent className="p-4 sm:p-6">
              <h2 className="font-semibold mb-4">{locale === 'kh' ? 'សេចក្តីសង្ខេបបញ្ជាទិញ' : 'Order Summary'}</h2>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t(locale, 'subtotal')}</span>
                  <span>{formatUSD(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t(locale, 'serviceFee')}</span>
                  <span>{formatUSD(serviceFee)}</span>
                </div>
                <p className="text-xs text-muted-foreground">{t(locale, 'serviceFeeNote')}</p>

                <Separator />

                {/* Promo Code */}
                <div className="flex gap-2">
                  <Input
                    value={promoCode}
                    onChange={e => setPromoCode(e.target.value)}
                    placeholder={t(locale, 'promoCode')}
                    className="text-sm"
                  />
                  <Button variant="outline" size="sm" className="shrink-0">{t(locale, 'apply')}</Button>
                </div>

                <Separator />

                <div className="flex justify-between font-semibold text-base">
                  <span>{t(locale, 'total')}</span>
                  <span>{formatUSD(total)}</span>
                </div>
                <div className="text-right text-xs text-muted-foreground">{formatKHR(total)}</div>
              </div>

              {/* Payment Method */}
              <div className="mt-6">
                <h3 className="font-medium text-sm mb-3">{locale === 'kh' ? 'វិធីសាស្ត្រទូទាត់' : 'Payment Method'}</h3>
                <div className="grid grid-cols-2 gap-2">
                  {paymentMethods.map(pm => (
                    <button
                      key={pm.id}
                      onClick={() => setPaymentMethod(pm.id)}
                      className={`p-3 rounded-lg border-2 text-left transition-flora ${
                        paymentMethod === pm.id ? 'border-accent-green bg-pale-green/50 dark:bg-forest-mid/20' : 'border-border hover:border-accent-green/50'
                      }`}
                    >
                      <span className="text-lg">{pm.icon}</span>
                      <p className="text-xs font-medium mt-1">{pm.name}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Place Order */}
              <Button
                className="w-full h-12 mt-6 bg-accent-green hover:bg-forest-mid text-white text-base disabled:opacity-60"
                onClick={handlePlaceOrder}
                disabled={isPlacingOrder}
              >
                <CreditCard className="h-5 w-5 mr-2" />
                {isPlacingOrder ? (locale === 'kh' ? 'កំពុងដំណើរការ...' : 'Processing...') : t(locale, 'placeOrder')}
              </Button>

              <div className="flex items-center justify-center gap-2 mt-3 text-xs text-muted-foreground">
                <Shield className="h-3 w-3" />
                {t(locale, 'securePayment')}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
