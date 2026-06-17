'use client';

import { useAppStore } from '@/lib/store';
import { platformStats, revenueData, adminOrders, categoryRevenue } from '@/lib/adminData';
import { formatUSD } from '@/lib/i18n';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import {
  DollarSign, ShoppingBag, Users, Store,
  TrendingUp, TrendingDown, ArrowRight, Clock, CheckCircle2, XCircle,
} from 'lucide-react';

const statusConfig = {
  pending:   { label: 'Pending',   labelKh: 'រង់ចាំ',    color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' },
  preparing: { label: 'Preparing', labelKh: 'កំពុងរៀបចំ', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
  completed: { label: 'Completed', labelKh: 'បានបញ្ចប់',  color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' },
  cancelled: { label: 'Cancelled', labelKh: 'បានលុបចោល',  color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' },
};

function StatCard({
  icon: Icon, label, labelKh, value, growth, positive, locale,
}: {
  icon: React.ElementType; label: string; labelKh: string;
  value: string; growth: number; positive: boolean; locale: string;
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
            <div className="flex items-center gap-1 mt-1.5">
              {positive
                ? <TrendingUp className="h-3 w-3 text-accent-green" />
                : <TrendingDown className="h-3 w-3 text-destructive" />}
              <span className={`text-xs font-medium ${positive ? 'text-accent-green' : 'text-destructive'}`}>
                {growth > 0 ? '+' : ''}{growth}%
              </span>
              <span className="text-xs text-muted-foreground">vs last month</span>
            </div>
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

  const recentOrders = adminOrders.slice(0, 6);
  const totalOrdersByStatus = {
    completed: adminOrders.filter(o => o.status === 'completed').length,
    pending: adminOrders.filter(o => o.status === 'pending').length,
    preparing: adminOrders.filter(o => o.status === 'preparing').length,
    cancelled: adminOrders.filter(o => o.status === 'cancelled').length,
  };

  return (
    <div className="p-6 space-y-6 max-w-[1400px] mx-auto">

      {/* KPI Cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          icon={DollarSign} label="Total Revenue" labelKh="ប្រាក់ចំណូលសរុប"
          value={formatUSD(platformStats.totalRevenue)} growth={platformStats.revenueGrowth}
          positive locale={locale}
        />
        <StatCard
          icon={ShoppingBag} label="Total Orders" labelKh="ការបញ្ជាទិញសរុប"
          value={platformStats.totalOrders.toLocaleString()} growth={platformStats.ordersGrowth}
          positive locale={locale}
        />
        <StatCard
          icon={Users} label="Total Users" labelKh="អ្នកប្រើសរុប"
          value={platformStats.totalUsers.toLocaleString()} growth={platformStats.usersGrowth}
          positive locale={locale}
        />
        <StatCard
          icon={Store} label="Active Sellers" labelKh="អ្នកលក់សកម្ម"
          value={String(platformStats.activeSellers)} growth={platformStats.sellersGrowth}
          positive locale={locale}
        />
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
              <AreaChart data={revenueData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
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
                  formatter={(v: number, name: string) => [`$${v.toFixed(0)}`, name]}
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
              <span className="text-lg font-bold text-green-600">{platformStats.completedOrders}</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-amber-50 dark:bg-amber-900/10">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-amber-600" />
                <span className="text-sm font-medium">{locale === 'kh' ? 'រង់ចាំ' : 'Pending'}</span>
              </div>
              <span className="text-lg font-bold text-amber-600">{platformStats.pendingOrders}</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-red-50 dark:bg-red-900/10">
              <div className="flex items-center gap-2">
                <XCircle className="h-4 w-4 text-red-500" />
                <span className="text-sm font-medium">{locale === 'kh' ? 'បានលុបចោល' : 'Cancelled'}</span>
              </div>
              <span className="text-lg font-bold text-red-500">{platformStats.cancelledOrders}</span>
            </div>

            <div className="pt-2 border-t">
              <p className="text-xs text-muted-foreground mb-1">{locale === 'kh' ? 'ប្រភេទ' : 'By Category'}</p>
              <ResponsiveContainer width="100%" height={130}>
                <PieChart>
                  <Pie data={categoryRevenue} cx="50%" cy="50%" innerRadius={35} outerRadius={55} dataKey="value" paddingAngle={3}>
                    {categoryRevenue.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8 }} formatter={(v: number) => [`${v}%`]} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-wrap gap-1.5">
                {categoryRevenue.map(c => (
                  <div key={c.name} className="flex items-center gap-1">
                    <span className="h-2 w-2 rounded-full flex-shrink-0" style={{ background: c.color }} />
                    <span className="text-[10px] text-muted-foreground">{c.name} {c.value}%</span>
                  </div>
                ))}
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
              <p className="text-3xl font-bold text-accent-green">{formatUSD(platformStats.totalCommission)}</p>
              <p className="text-xs text-muted-foreground mt-1">Total 5% commission earned</p>
            </div>
            <ResponsiveContainer width="100%" height={130}>
              <BarChart data={revenueData.slice(-6)} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="month" tick={{ fontSize: 9 }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 9 }} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8 }} formatter={(v: number) => [`$${v}`, 'Commission']} />
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
                  <th className="text-left py-2 px-2 text-xs font-medium text-muted-foreground hidden sm:table-cell">Buyer</th>
                  <th className="text-left py-2 px-2 text-xs font-medium text-muted-foreground hidden md:table-cell">Plant</th>
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
                        <span className="font-mono text-xs font-medium">{order.id}</span>
                      </td>
                      <td className="py-2.5 px-2 hidden sm:table-cell">
                        <span className="text-xs">{order.buyerName}</span>
                      </td>
                      <td className="py-2.5 px-2 hidden md:table-cell">
                        <span className="text-xs text-muted-foreground">{order.plantNameEn}</span>
                      </td>
                      <td className="py-2.5 px-2">
                        <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium ${s.color}`}>
                          {locale === 'kh' ? s.labelKh : s.label}
                        </span>
                      </td>
                      <td className="py-2.5 px-2 text-right font-medium text-xs">{formatUSD(order.total)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
