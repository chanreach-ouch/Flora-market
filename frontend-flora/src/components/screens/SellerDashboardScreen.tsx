'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAppStore } from '@/lib/store';
import { t } from '@/lib/i18n';
import { plantEmojis } from '@/lib/data';
import type { MockPlant, MockSeller, MockOrder } from '@/lib/data';
import { apiFetchMySeller, apiFetchPlantsBySeller, apiFetchSellerOrders, apiUpdateOrderStatus, apiCreatePlant } from '@/lib/api';
import { formatUSD } from '@/lib/i18n';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import {
  ShoppingBag, DollarSign, Leaf, Star, Plus, Search, Package,
  Clock, CheckCircle, Truck, AlertCircle, Edit, ToggleLeft, ToggleRight,
  TrendingUp, ChevronRight,
} from 'lucide-react';

// Revenue chart data - showing gross revenue and seller earnings separately
const revenueData = [
  { month: 'Jan', revenue: 480, earnings: 456 },
  { month: 'Feb', revenue: 320, earnings: 304 },
  { month: 'Mar', revenue: 750, earnings: 712.5 },
  { month: 'Apr', revenue: 590, earnings: 560.5 },
  { month: 'May', revenue: 1120, earnings: 1064 },
  { month: 'Jun', revenue: 870, earnings: 826.5 },
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
        <p className="font-medium text-sm mb-1">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} className="text-sm" style={{ color: entry.color }}>
            {entry.name}: {formatUSD(entry.value)}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

type OrderStatus = 'pending' | 'preparing' | 'completed';

const statusConfig: Record<OrderStatus, { label: string; labelKh: string; icon: any; color: string; bgColor: string; step: number }> = {
  pending: { label: 'Pending', labelKh: 'រង់ចាំ', icon: Clock, color: 'text-yellow-600', bgColor: 'bg-yellow-100 dark:bg-yellow-900/30', step: 1 },
  preparing: { label: 'Preparing', labelKh: 'កំពុងរៀបចំ', icon: Package, color: 'text-blue-600', bgColor: 'bg-blue-100 dark:bg-blue-900/30', step: 2 },
  completed: { label: 'Completed', labelKh: 'បានបញ្ចប់', icon: CheckCircle, color: 'text-green-600', bgColor: 'bg-green-100 dark:bg-green-900/30', step: 3 },
};

export default function SellerDashboardScreen() {
  const { locale, user } = useAppStore();
  const [orders, setOrders] = useState<MockOrder[]>([]);
  const [sellerPlants, setSellerPlants] = useState<MockPlant[]>([]);
  const [seller, setSeller] = useState<MockSeller | undefined>(undefined);
  const [orderFilter, setOrderFilter] = useState<'all' | OrderStatus>('all');
  const [searchPlants, setSearchPlants] = useState('');
  const [addPlantOpen, setAddPlantOpen] = useState(false);
  const [addPlantSuccess, setAddPlantSuccess] = useState(false);
  const [newPlant, setNewPlant] = useState({ nameEn: '', nameKh: '', category: '', price: '', stock: '', difficulty: '' });

  const loadDashboard = useCallback(async () => {
    try {
      const s = await apiFetchMySeller();
      setSeller(s);
      const [plants, apiOrders] = await Promise.all([
        apiFetchPlantsBySeller(s.id),
        apiFetchSellerOrders(),
      ]);
      setSellerPlants(plants);
      setOrders(apiOrders);
    } catch {
      // Backend unavailable
    }
  }, []);

  useEffect(() => { loadDashboard(); }, [loadDashboard]);

  const filteredPlants = sellerPlants.filter(p =>
    !searchPlants || p.nameEn.toLowerCase().includes(searchPlants.toLowerCase()) || p.nameKh.includes(searchPlants)
  );
  const sellerOrders = orders.filter(o => seller ? o.sellerId === seller.id : true);
  const filteredOrders = sellerOrders.filter(o => orderFilter === 'all' || o.status === orderFilter);

  const todayOrders = sellerOrders.filter(o => o.status === 'pending').length;
  const totalRevenue = sellerOrders.filter(o => o.status === 'completed').reduce((s, o) => s + o.total, 0);
  const activeListings = sellerPlants.filter(p => p.isActive).length;

  const advanceOrderStatus = async (orderId: string) => {
    const order = orders.find(o => o.id === orderId);
    if (!order) return;
    const nextStatus: Record<OrderStatus, OrderStatus | null> = {
      pending: 'preparing', preparing: 'completed', completed: null,
    };
    const next = nextStatus[order.status];
    if (!next) return;
    // Optimistic update
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: next } : o));
    try {
      await apiUpdateOrderStatus(orderId, next);
    } catch {
      // Revert on failure
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: order.status } : o));
    }
  };

  const handleAddPlant = async () => {
    if (!newPlant.nameEn || !newPlant.price || !seller) return;
    try {
      await apiCreatePlant({
        name_en: newPlant.nameEn,
        name_kh: newPlant.nameKh || undefined,
        category: newPlant.category || 'Indoor',
        price: parseFloat(newPlant.price),
        stock: parseInt(newPlant.stock) || 0,
        difficulty: newPlant.difficulty || undefined,
      });
      setAddPlantSuccess(true);
      const refreshed = await apiFetchPlantsBySeller(seller.id);
      setSellerPlants(refreshed);
      setTimeout(() => {
        setAddPlantOpen(false);
        setAddPlantSuccess(false);
        setNewPlant({ nameEn: '', nameKh: '', category: '', price: '', stock: '', difficulty: '' });
      }, 1500);
    } catch { /* ignore */ }
  };

  const getNextAction = (status: OrderStatus) => {
    const actions: Record<OrderStatus, { label: string; labelKh: string } | null> = {
      pending: { label: 'Start Preparing', labelKh: 'ចាប់ផ្តើមរៀបចំ' },
      preparing: { label: 'Complete Order', labelKh: 'បញ្ចប់ការបញ្ជាទិញ' },
      completed: null,
    };
    return actions[status];
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
      {/* Welcome Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold">
          {locale === 'kh' ? `សួស្តី ${user?.name || 'អ្នកលក់'}` : `Hello, ${user?.name || 'Seller'}`} 👋
        </h1>
        <p className="text-muted-foreground">{t(locale, 'dashboard')}</p>
      </div>

      <Tabs defaultValue="dashboard" className="space-y-6">
        <TabsList className="w-full sm:w-auto">
          <TabsTrigger value="dashboard" className="gap-2">
            <TrendingUp className="h-4 w-4" /> {t(locale, 'dashboard')}
          </TabsTrigger>
          <TabsTrigger value="plants" className="gap-2">
            <Leaf className="h-4 w-4" /> {t(locale, 'myPlants')}
          </TabsTrigger>
          <TabsTrigger value="orders" className="gap-2">
            <Package className="h-4 w-4" /> {t(locale, 'sellerOrders')}
          </TabsTrigger>
        </TabsList>

        {/* Dashboard Tab */}
        <TabsContent value="dashboard" className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center">
                    <ShoppingBag className="h-5 w-5 sm:h-6 sm:w-6 text-yellow-600" />
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm text-muted-foreground">{t(locale, 'todayOrders')}</p>
                    <p className="text-xl sm:text-2xl font-bold">{todayOrders}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                    <DollarSign className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm text-muted-foreground">{t(locale, 'revenue')}</p>
                    <p className="text-xl sm:text-2xl font-bold">{formatUSD(totalRevenue)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                    <Leaf className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm text-muted-foreground">{t(locale, 'activeListings')}</p>
                    <p className="text-xl sm:text-2xl font-bold">{activeListings}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                    <Star className="h-5 w-5 sm:h-6 sm:w-6 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm text-muted-foreground">{t(locale, 'avgRating')}</p>
                    <p className="text-xl sm:text-2xl font-bold">{seller?.rating || '4.8'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Revenue Chart - FIXED with different values */}
          <Card>
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold">{locale === 'kh' ? 'រូបគំនូនប្រាក់ចំណូល' : 'Revenue Summary'}</h2>
                <Badge variant="secondary" className="text-xs">
                  {locale === 'kh' ? '6 ខែចុងក្រោយ' : 'Last 6 months'}
                </Badge>
              </div>
              <div className="h-64 sm:h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={revenueData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.5} />
                    <XAxis
                      dataKey="month"
                      tick={{ fontSize: 12, fill: 'var(--muted-foreground)' }}
                      axisLine={{ stroke: 'var(--border)' }}
                    />
                    <YAxis
                      tick={{ fontSize: 12, fill: 'var(--muted-foreground)' }}
                      axisLine={{ stroke: 'var(--border)' }}
                      tickFormatter={(v) => `$${v}`}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Bar dataKey="revenue" name={locale === 'kh' ? 'ប្រាក់ចំណូលសរុប' : 'Gross Revenue'} fill="#2d6a4f" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="earnings" name={locale === 'kh' ? 'ប្រាក់ចំណេញ' : 'Your Earnings'} fill="#52b788" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <p className="text-xs text-muted-foreground mt-2 text-center">
                {locale === 'kh' ? 'ថ្លៃសេវាវេទិកា 5% កាត់ពីអ្នកលក់' : '5% platform fee is deducted from seller earnings'}
              </p>
            </CardContent>
          </Card>

          {/* Recent Orders */}
          <Card>
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold">{t(locale, 'recentOrders')}</h2>
                <Button variant="ghost" size="sm" className="gap-1 text-accent-green">
                  {t(locale, 'viewAll')} <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
              <div className="space-y-3">
                {sellerOrders.slice(0, 3).map(order => {
                  const config = statusConfig[order.status];
                  const StatusIcon = config.icon;
                  return (
                    <div key={order.id} className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                      <div className={`h-9 w-9 rounded-lg ${config.bgColor} flex items-center justify-center`}>
                        <StatusIcon className={`h-4 w-4 ${config.color}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{locale === 'kh' ? order.plantNameKh : order.plantNameEn}</p>
                        <p className="text-xs text-muted-foreground">{order.buyerName} · x{order.quantity}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold">{formatUSD(order.total)}</p>
                        <p className="text-xs text-muted-foreground">{locale === 'kh' ? config.labelKh : config.label}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setAddPlantOpen(true)}>
              <CardContent className="p-4 sm:p-6 flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-accent-green/10 flex items-center justify-center">
                  <Plus className="h-5 w-5 text-accent-green" />
                </div>
                <div>
                  <p className="font-semibold text-sm">{t(locale, 'addPlant')}</p>
                  <p className="text-xs text-muted-foreground">{t(locale, 'addNewPlant')}</p>
                </div>
              </CardContent>
            </Card>
            <Card className="cursor-pointer hover:shadow-md transition-shadow">
              <CardContent className="p-4 sm:p-6 flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                  <Package className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="font-semibold text-sm">{t(locale, 'sellerOrders')}</p>
                  <p className="text-xs text-muted-foreground">{todayOrders} {t(locale, 'pending').toLowerCase()}</p>
                </div>
              </CardContent>
            </Card>
            <Card className="cursor-pointer hover:shadow-md transition-shadow">
              <CardContent className="p-4 sm:p-6 flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                  <Leaf className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="font-semibold text-sm">{t(locale, 'myPlants')}</p>
                  <p className="text-xs text-muted-foreground">{sellerPlants.length} {t(locale, 'plants').toLowerCase()}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* My Plants Tab */}
        <TabsContent value="plants" className="space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="relative flex-1 w-full sm:max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={searchPlants}
                onChange={e => setSearchPlants(e.target.value)}
                placeholder={t(locale, 'searchMyPlants')}
                className="pl-9"
              />
            </div>
            <Dialog open={addPlantOpen} onOpenChange={setAddPlantOpen}>
              <DialogTrigger asChild>
                <Button className="bg-accent-green hover:bg-forest-mid text-white gap-2">
                  <Plus className="h-4 w-4" /> {t(locale, 'addPlant')}
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle>{t(locale, 'addNewPlant')}</DialogTitle>
                 </DialogHeader>
                  {addPlantSuccess ? (
                    <div className="flex flex-col items-center justify-center py-6 text-center">
                      <div className="h-14 w-14 rounded-full bg-accent-green/10 flex items-center justify-center mb-3">
                        <CheckCircle className="h-7 w-7 text-accent-green" />
                      </div>
                      <p className="font-semibold text-accent-green">
                        {locale === 'kh' ? 'បានបន្ថែមរុក្ខជាតិដោយជោគជ័យ!' : 'Plant added successfully!'}
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4 py-4">
                      <div>
                        <label className="text-sm font-medium mb-1.5 block">{t(locale, 'fullName')} (EN) <span className="text-destructive">*</span></label>
                        <Input
                          placeholder="Plant name in English"
                          value={newPlant.nameEn}
                          onChange={e => setNewPlant(p => ({ ...p, nameEn: e.target.value }))}
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-1.5 block">{t(locale, 'fullName')} (KH)</label>
                        <Input
                          placeholder="ឈ្មោះរុក្ខជាតិជាខ្មែរ"
                          value={newPlant.nameKh}
                          onChange={e => setNewPlant(p => ({ ...p, nameKh: e.target.value }))}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium mb-1.5 block">{locale === 'kh' ? 'ប្រភេទ' : 'Category'}</label>
                          <Input
                            placeholder="Indoor, Outdoor..."
                            value={newPlant.category}
                            onChange={e => setNewPlant(p => ({ ...p, category: e.target.value }))}
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium mb-1.5 block">{locale === 'kh' ? 'តម្លៃ (USD)' : 'Price (USD)'} <span className="text-destructive">*</span></label>
                          <Input
                            type="number"
                            placeholder="0.00"
                            value={newPlant.price}
                            onChange={e => setNewPlant(p => ({ ...p, price: e.target.value }))}
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium mb-1.5 block">{t(locale, 'stock')}</label>
                          <Input
                            type="number"
                            placeholder="0"
                            value={newPlant.stock}
                            onChange={e => setNewPlant(p => ({ ...p, stock: e.target.value }))}
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium mb-1.5 block">{t(locale, 'difficulty')}</label>
                          <Input
                            placeholder="Easy, Moderate..."
                            value={newPlant.difficulty}
                            onChange={e => setNewPlant(p => ({ ...p, difficulty: e.target.value }))}
                          />
                        </div>
                      </div>
                      <Button
                        className="w-full bg-accent-green hover:bg-forest-mid text-white"
                        onClick={handleAddPlant}
                        disabled={!newPlant.nameEn || !newPlant.price}
                      >
                        {t(locale, 'addPlant')}
                      </Button>
                    </div>
                  )}
              </DialogContent>
            </Dialog>
          </div>

          {/* Plant Stats */}
          <div className="grid grid-cols-3 gap-3">
            <Card>
              <CardContent className="p-3 text-center">
                <p className="text-xl font-bold">{sellerPlants.length}</p>
                <p className="text-xs text-muted-foreground">{t(locale, 'totalPlants')}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-3 text-center">
                <p className="text-xl font-bold text-accent-green">{activeListings}</p>
                <p className="text-xs text-muted-foreground">{t(locale, 'activePlants')}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-3 text-center">
                <p className="text-xl font-bold text-destructive">{sellerPlants.filter(p => p.stock < 10).length}</p>
                <p className="text-xs text-muted-foreground">{t(locale, 'lowStock')}</p>
              </CardContent>
            </Card>
          </div>

          {/* Plants Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredPlants.map(plant => (
              <Card key={plant.id} className="card-shadow-hover transition-shadow">
                <CardContent className="p-4">
                  <div className="flex gap-3">
                    <div className="h-16 w-16 rounded-xl bg-gradient-to-br from-pale-green to-cream dark:from-forest-mid/30 dark:to-forest/30 flex items-center justify-center shrink-0">
                      <span className="text-3xl">{plantEmojis[plant.category] || '🌿'}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-sm truncate">{locale === 'kh' ? plant.nameKh : plant.nameEn}</h3>
                      <p className="text-sm font-bold text-accent-green">{formatUSD(plant.price)}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant={plant.stock > 10 ? 'secondary' : 'destructive'} className="text-[10px]">
                          {plant.stock > 10 ? t(locale, 'inStock') : t(locale, 'lowStock')} ({plant.stock})
                        </Badge>
                        {plant.isActive ? (
                          <Badge className="text-[10px] bg-accent-green/10 text-accent-green">{t(locale, 'active')}</Badge>
                        ) : (
                          <Badge variant="secondary" className="text-[10px]">{t(locale, 'inactive')}</Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mt-3 pt-3 border-t">
                    <Button variant="ghost" size="sm" className="gap-1 text-xs flex-1">
                      <Edit className="h-3 w-3" /> {t(locale, 'edit')}
                    </Button>
                    <Button variant="ghost" size="sm" className="gap-1 text-xs">
                      {plant.isActive ? <ToggleRight className="h-4 w-4 text-accent-green" /> : <ToggleLeft className="h-4 w-4" />}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Orders Tab - SIMPLIFIED */}
        <TabsContent value="orders" className="space-y-4">
          {/* Order Filter Tabs */}
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
            {(['all', 'pending', 'preparing', 'completed'] as const).map(filter => {
              const config = filter !== 'all' ? statusConfig[filter] : null;
              const count = filter === 'all' ? orders.length : orders.filter(o => o.status === filter).length;
              return (
                <Button
                  key={filter}
                  variant={orderFilter === filter ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setOrderFilter(filter)}
                  className="whitespace-nowrap gap-1.5"
                >
                  {filter === 'all' ? (locale === 'kh' ? 'ទាំងអស់' : 'All') : locale === 'kh' ? config?.labelKh : config?.label}
                  <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-[10px]">{count}</Badge>
                </Button>
              );
            })}
          </div>

          {/* Order Cards */}
          {filteredOrders.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Package className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>{t(locale, 'noOrdersFound')}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredOrders.map(order => {
                const config = statusConfig[order.status];
                const StatusIcon = config.icon;
                const nextAction = getNextAction(order.status);

                return (
                  <Card key={order.id} className="card-shadow">
                    <CardContent className="p-4 sm:p-5">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                        {/* Order Info */}
                        <div className="flex items-center gap-3 flex-1">
                          <div className={`h-10 w-10 rounded-lg ${config.bgColor} flex items-center justify-center shrink-0`}>
                            <StatusIcon className={`h-5 w-5 ${config.color}`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-sm">{order.id}</span>
                              <Badge className={`text-[10px] ${config.bgColor} ${config.color}`}>
                                {locale === 'kh' ? config.labelKh : config.label}
                              </Badge>
                            </div>
                            <p className="text-sm truncate">{locale === 'kh' ? order.plantNameKh : order.plantNameEn} x{order.quantity}</p>
                            <p className="text-xs text-muted-foreground">{order.buyerName} · {order.timestamp}</p>
                          </div>
                        </div>

                        {/* Price & Action */}
                        <div className="flex items-center gap-3 sm:flex-col sm:items-end">
                          <span className="font-bold">{formatUSD(order.total)}</span>
                          {nextAction ? (
                            <Button
                              size="sm"
                              className="bg-accent-green hover:bg-forest-mid text-white text-xs whitespace-nowrap"
                              onClick={() => advanceOrderStatus(order.id)}
                            >
                              {locale === 'kh' ? nextAction.labelKh : nextAction.label}
                            </Button>
                          ) : (
                            <Badge className="bg-accent-green/10 text-accent-green text-xs">
                              <CheckCircle className="h-3 w-3 mr-1" /> {t(locale, 'orderCompleted')}
                            </Badge>
                          )}
                        </div>
                      </div>

                      {/* Progress Bar - Simplified 3-step */}
                      <div className="mt-4 pt-3 border-t">
                        <div className="flex items-center gap-1">
                          {(['pending', 'preparing', 'completed'] as OrderStatus[]).map((step, idx) => {
                            const stepConfig = statusConfig[step];
                            const isActive = config.step >= stepConfig.step;
                            const isCurrent = order.status === step;
                            return (
                              <div key={step} className="flex items-center flex-1">
                                <div className={`h-2 flex-1 rounded-full transition-all ${
                                  isActive ? 'bg-accent-green' : 'bg-muted'
                                } ${isCurrent ? 'ring-2 ring-accent-green/30' : ''}`} />
                              </div>
                            );
                          })}
                        </div>
                        <div className="flex justify-between mt-1">
                          {(['pending', 'preparing', 'completed'] as OrderStatus[]).map(step => (
                            <span key={step} className={`text-[10px] ${
                              config.step >= statusConfig[step].step ? 'text-accent-green font-medium' : 'text-muted-foreground'
                            }`}>
                              {locale === 'kh' ? statusConfig[step].labelKh : statusConfig[step].label}
                            </span>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
