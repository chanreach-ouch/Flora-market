'use client';

import { useEffect, useState } from 'react';
import { useAppStore } from '@/lib/store';
import { getPlatformStats, getAllOrders } from '@/lib/api';
import { formatUSD } from '@/lib/i18n';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import {
  DollarSign, ShoppingBag, Users, Store,
  ArrowRight, Clock, CheckCircle2, XCircle, Loader2,
} from 'lucide-react';

const statusConfig: Record<string, { label: string; labelKh: string; color: string }> = {
  pending:   { label: 'Pending',   labelKh: 'រង់ចាំ',    color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' },
  preparing: { label: 'Preparing', labelKh: 'កំពុងរៀបចំ', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
  completed: { label: 'Completed', labelKh: 'បានបញ្ចប់',  color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' },
  cancelled: { label: 'Cancelled', labelKh: 'បានលុបចោល',  color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' },
};

interface MonthlyRevenue {
  month: string;
  revenue: number;
  commission: number;
  orders: number;
  new_users: number;
}

interface PlatformStats {
  total_users: number;
  active_sellers: number;
  total_plants: number;
  total_orders: number;
  total_revenue: number;
  total_commission: number;
  pending_orders: number;
  completed_orders: number;
  cancelled_orders: number;
  monthly_revenue: MonthlyRevenue[];
}

interface Order {
  id: string;
  buyer_id: string;
  seller_id: string;
  total_amount: number;
  status: string;
  created_at: string;
  items: { plant_id: string; quantity: number; unit_price: number }[];
}

function StatCard({ icon: Icon, label, labelKh, value, locale }: {
  icon: React.ElementType; label: string; labelKh: string; value: string; locale: string;
}) {
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs text-muted-foreground font-medium mb-1">
              {locale === 'kh' ? labelKh : label}
            </p>
            <p className="text-2xl font-bold tracking-tight">{value}</p>
          </div>
          <div className="h-10 w-10 rounded-xl bg-forest/10 flex items-center justify-center">
            <Icon className="h-5 w-5 text-forest dark:text-accent-green" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function AdminPanelScreen() {
  const { locale, setScreen } = useAppStore();
  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [s, o] = await Promise.all([
          getPlatformStats(),
          getAllOrders({ limit: 6 }),
        ]);
        setStats(s);
        setRecentOrders(o);
      } catch {
        // backend may be unavailable
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="p-6 text-center text-muted-foreground text-sm">
        Failed to load dashboard data. Make sure the backend is running.
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-[1400px] mx-auto">

      {/* KPI Cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard icon={DollarSign} label="Total Revenue" labelKh="ប្រាក់ចំណូលសរុប"
          value={formatUSD(stats.total_revenue)} locale={locale} />
        <StatCard icon={ShoppingBag} label="Total Orders" labelKh="ការបញ្ជាទិញសរុប"
          value={stats.total_orders.toLocaleString()} locale={locale} />
        <StatCard icon={Users} label="Total Users" labelKh="អ្នកប្រើសរុប"
          value={stats.total_users.toLocaleString()} locale={locale} />
        <StatCard icon={Store} label="Active Sellers" labelKh="អ្នកលក់សកម្ម"
          value={String(stats.active_sellers)} locale={locale} />
      </div>

      {/* Revenue Chart + Order Status */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <Card className="xl:col-span-2">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold">
                {locale === 'kh' ? 'ប្រាក់ចំណូល និងការបញ្ជាទិញ' : 'Revenue & Orders (12 months)'}
              </CardTitle>
              <Badge variant="secondary" className="text-[10px]">Last 12 months</Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={stats.monthly_revenue} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#52b788" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#52b788" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorCommission" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#c9a84c" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#c9a84c" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="month" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 10 }} tickLine={false} axisLine={false} tickFormatter={v => `$${v}`} />
                <Tooltip
                  contentStyle={{ fontSize: 11, borderRadius: 8, border: '1px solid var(--border)', background: 'var(--card)' }}
                  formatter={(v: unknown, name: unknown) => [`$${Number(v).toFixed(0)}`, String(name)]}
                />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Area type="monotone" dataKey="revenue" name="Revenue" stroke="#52b788" fill="url(#colorRevenue)" strokeWidth={2} dot={false} />
                <Area type="monotone" dataKey="commission" name="Commission" stroke="#c9a84c" fill="url(#colorCommission)" strokeWidth={2} dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">
              {locale === 'kh' ? 'ស្ថានភាពការបញ្ជាទិញ' : 'Order Status'}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0 space-y-3">
            <div className="flex items-center justify-between p-3 rounded-lg bg-green-50 dark:bg-green-900/10">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium">{locale === 'kh' ? 'បានបញ្ចប់' : 'Completed'}</span>
              </div>
              <span className="text-lg font-bold text-green-600">{stats.completed_orders}</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-amber-50 dark:bg-amber-900/10">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-amber-600" />
                <span className="text-sm font-medium">{locale === 'kh' ? 'រង់ចាំ' : 'Pending'}</span>
              </div>
              <span className="text-lg font-bold text-amber-600">{stats.pending_orders}</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-red-50 dark:bg-red-900/10">
              <div className="flex items-center gap-2">
                <XCircle className="h-4 w-4 text-red-500" />
                <span className="text-sm font-medium">{locale === 'kh' ? 'បានលុបចោល' : 'Cancelled'}</span>
              </div>
              <span className="text-lg font-bold text-red-500">{stats.cancelled_orders}</span>
            </div>
            <div className="pt-2 border-t space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">{locale === 'kh' ? 'រុក្ខជាតិសរុប' : 'Total Plants'}</span>
                <span className="text-sm font-semibold">{stats.total_plants}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">{locale === 'kh' ? 'កំរៃជើងសារ' : 'Commission Earned'}</span>
                <span className="text-sm font-semibold text-accent-green">{formatUSD(stats.total_commission)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Commission Summary + Recent Orders */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">
              {locale === 'kh' ? 'សង្ខេបកំរៃជើងសារ' : 'Commission Summary'}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0 space-y-4">
            <div className="text-center py-3">
              <p className="text-3xl font-bold text-accent-green">{formatUSD(stats.total_commission)}</p>
              <p className="text-xs text-muted-foreground mt-1">Total 5% commission earned</p>
            </div>
            <ResponsiveContainer width="100%" height={130}>
              <BarChart data={stats.monthly_revenue.slice(-6)} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="month" tick={{ fontSize: 9 }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 9 }} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8 }} formatter={(v: unknown) => [`$${Number(v).toFixed(2)}`, 'Commission']} />
                <Bar dataKey="commission" fill="#c9a84c" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="xl:col-span-2">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold">
                {locale === 'kh' ? 'ការបញ្ជាទិញចុងក្រោយ' : 'Recent Orders'}
              </CardTitle>
              <Button variant="ghost" size="sm" className="h-7 text-xs gap-1" onClick={() => setScreen('orders')}>
                {locale === 'kh' ? 'មើលទាំងអស់' : 'View all'} <ArrowRight className="h-3 w-3" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="pt-0 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 px-2 text-xs font-medium text-muted-foreground">Order</th>
                  <th className="text-left py-2 px-2 text-xs font-medium text-muted-foreground hidden sm:table-cell">Items</th>
                  <th className="text-left py-2 px-2 text-xs font-medium text-muted-foreground hidden md:table-cell">Date</th>
                  <th className="text-left py-2 px-2 text-xs font-medium text-muted-foreground">Status</th>
                  <th className="text-right py-2 px-2 text-xs font-medium text-muted-foreground">Total</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map(order => {
                  const s = statusConfig[order.status];
                  return (
                    <tr key={order.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                      <td className="py-2.5 px-2">
                        <span className="font-mono text-xs font-medium">#{order.id.slice(0, 8)}</span>
                      </td>
                      <td className="py-2.5 px-2 hidden sm:table-cell">
                        <span className="text-xs text-muted-foreground">
                          {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                        </span>
                      </td>
                      <td className="py-2.5 px-2 hidden md:table-cell">
                        <span className="text-xs text-muted-foreground">
                          {new Date(order.created_at).toLocaleDateString()}
                        </span>
                      </td>
                      <td className="py-2.5 px-2">
                        <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium ${s?.color ?? ''}`}>
                          {locale === 'kh' ? s?.labelKh : s?.label}
                        </span>
                      </td>
                      <td className="py-2.5 px-2 text-right font-medium text-xs">{formatUSD(order.total_amount)}</td>
                    </tr>
                  );
                })}
                {recentOrders.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-xs text-muted-foreground">
                      {locale === 'kh' ? 'មិនមានការបញ្ជាទិញ' : 'No orders yet'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
