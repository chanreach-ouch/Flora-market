'use client';

import { useState, useEffect } from 'react';
import { useAppStore } from '@/lib/store';
import { t } from '@/lib/i18n';
import { sellers as mockSellers, mockOrders } from '@/lib/data';
import type { MockSeller } from '@/lib/data';
import { apiFetchSellers } from '@/lib/api';
import { formatUSD } from '@/lib/i18n';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Users, ShoppingBag, DollarSign, AlertTriangle, Shield,
  CheckCircle, XCircle, Ban, Download, Search,
} from 'lucide-react';

export default function AdminPanelScreen() {
  const { locale } = useAppStore();
  const [sellerSearch, setSellerSearch] = useState('');
  const [sellers, setSellers] = useState<MockSeller[]>(mockSellers);

  useEffect(() => {
    apiFetchSellers().then(setSellers).catch(() => setSellers(mockSellers));
  }, []);

  const totalSellers = sellers.length;
  const totalOrders = mockOrders.length;
  const totalCommission = mockOrders.filter(o => o.status === 'completed').reduce((s, o) => s + o.total * 0.05, 0);
  const flaggedDisputes = 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="h-10 w-10 rounded-xl bg-forest dark:bg-accent-green/20 flex items-center justify-center">
          <Shield className="h-5 w-5 text-white dark:text-accent-green" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">{locale === 'kh' ? 'ផ្ទាំងអ្នកគ្រប់គ្រង' : 'Admin Panel'}</h1>
          <p className="text-sm text-muted-foreground">{locale === 'kh' ? 'គ្រប់គ្រងវេទិកា' : 'Platform management'}</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Users className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm text-muted-foreground">{t(locale, 'totalSellers')}</p>
                <p className="text-xl font-bold">{totalSellers}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <ShoppingBag className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm text-muted-foreground">{t(locale, 'totalOrders')}</p>
                <p className="text-xl font-bold">{totalOrders}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <DollarSign className="h-5 w-5 text-gold" />
              <div>
                <p className="text-sm text-muted-foreground">{t(locale, 'commission')}</p>
                <p className="text-xl font-bold">{formatUSD(totalCommission)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              <div>
                <p className="text-sm text-muted-foreground">{t(locale, 'disputes')}</p>
                <p className="text-xl font-bold">{flaggedDisputes}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="sellers" className="space-y-4">
        <TabsList>
          <TabsTrigger value="sellers">{t(locale, 'seller')}</TabsTrigger>
          <TabsTrigger value="orders">{t(locale, 'sellerOrders')}</TabsTrigger>
          <TabsTrigger value="commission">{t(locale, 'commission')}</TabsTrigger>
        </TabsList>

        <TabsContent value="sellers">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold">{locale === 'kh' ? 'គ្រប់គ្រងអ្នកលក់' : 'Seller Management'}</h2>
                <div className="relative w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    value={sellerSearch}
                    onChange={e => setSellerSearch(e.target.value)}
                    placeholder={locale === 'kh' ? 'ស្វែងរកអ្នកលក់...' : 'Search sellers...'}
                    className="w-full pl-9 pr-3 py-2 rounded-lg border text-sm"
                  />
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-3 font-medium">{locale === 'kh' ? 'អ្នកលក់' : 'Seller'}</th>
                      <th className="text-left p-3 font-medium">{t(locale, 'rating')}</th>
                      <th className="text-left p-3 font-medium">{t(locale, 'orders')}</th>
                      <th className="text-left p-3 font-medium">{locale === 'kh' ? 'ស្ថានភាព' : 'Status'}</th>
                      <th className="text-left p-3 font-medium">{locale === 'kh' ? 'សកម្មភាព' : 'Actions'}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sellers.filter(s => !sellerSearch || s.nurseryName.toLowerCase().includes(sellerSearch.toLowerCase())).map(seller => (
                      <tr key={seller.id} className="border-b hover:bg-muted/50">
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            <span className="text-lg">🏪</span>
                            <div>
                              <p className="font-medium">{seller.nurseryName}</p>
                              <p className="text-xs text-muted-foreground">{seller.district}</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-3">
                          <div className="flex items-center gap-1">
                            <span className="text-gold">★</span>
                            <span>{seller.rating}</span>
                          </div>
                        </td>
                        <td className="p-3">{seller.totalOrders}</td>
                        <td className="p-3">
                          <Badge className="bg-accent-green/10 text-accent-green text-xs">
                            <CheckCircle className="h-3 w-3 mr-1" />{t(locale, 'verified')}
                          </Badge>
                        </td>
                        <td className="p-3">
                          <div className="flex gap-1">
                            <Button variant="ghost" size="sm" className="text-xs h-7">
                              <Ban className="h-3 w-3 mr-1" />{t(locale, 'suspend')}
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="orders">
          <Card>
            <CardContent className="p-4">
              <h2 className="font-semibold mb-4">{locale === 'kh' ? 'ត្រួតពិនិត្យការបញ្ជាទិញ' : 'Order Monitoring'}</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-3 font-medium">ID</th>
                      <th className="text-left p-3 font-medium">{locale === 'kh' ? 'អ្នកទិញ' : 'Buyer'}</th>
                      <th className="text-left p-3 font-medium">{t(locale, 'plants')}</th>
                      <th className="text-left p-3 font-medium">{locale === 'kh' ? 'ស្ថានភាព' : 'Status'}</th>
                      <th className="text-left p-3 font-medium">{t(locale, 'total')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mockOrders.map(order => (
                      <tr key={order.id} className="border-b hover:bg-muted/50">
                        <td className="p-3 font-medium">{order.id}</td>
                        <td className="p-3">{order.buyerName}</td>
                        <td className="p-3">{locale === 'kh' ? order.plantNameKh : order.plantNameEn}</td>
                        <td className="p-3">
                          <Badge variant="secondary" className="text-xs">{order.status.replace('_', ' ')}</Badge>
                        </td>
                        <td className="p-3 font-medium">{formatUSD(order.total)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="commission">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold">{locale === 'kh' ? 'ការតាមដានកំរៃជើងសារ' : 'Commission Tracker'}</h2>
                <Button variant="outline" size="sm" className="gap-2">
                  <Download className="h-4 w-4" /> {t(locale, 'exportCsv')}
                </Button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-3 font-medium">{t(locale, 'seller')}</th>
                      <th className="text-left p-3 font-medium">{t(locale, 'orders')}</th>
                      <th className="text-left p-3 font-medium">{locale === 'kh' ? 'ប្រាក់ចំណូលសរុប' : 'Gross Revenue'}</th>
                      <th className="text-left p-3 font-medium">{t(locale, 'commission')} (5%)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sellers.map(seller => {
                      const sellerOrders = mockOrders.filter(o => o.sellerId === seller.id);
                      const gross = sellerOrders.reduce((s, o) => s + o.total, 0);
                      const commission = gross * 0.05;
                      return (
                        <tr key={seller.id} className="border-b hover:bg-muted/50">
                          <td className="p-3 font-medium">{seller.nurseryName}</td>
                          <td className="p-3">{sellerOrders.length}</td>
                          <td className="p-3">{formatUSD(gross)}</td>
                          <td className="p-3 font-semibold text-accent-green">{formatUSD(commission)}</td>
                        </tr>
                      );
                    })}
                    <tr className="font-bold">
                      <td className="p-3">{locale === 'kh' ? 'សរុប' : 'Total'}</td>
                      <td className="p-3">{mockOrders.length}</td>
                      <td className="p-3">{formatUSD(mockOrders.reduce((s, o) => s + o.total, 0))}</td>
                      <td className="p-3 text-accent-green">{formatUSD(totalCommission)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
