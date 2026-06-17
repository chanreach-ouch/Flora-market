'use client';

import { useState } from 'react';
import { useAppStore } from '@/lib/store';
import { revenueData, categoryRevenue, platformStats, adminOrders } from '@/lib/adminData';
import { sellers } from '@/lib/data';
import { formatUSD } from '@/lib/i18n';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  PieChart, Pie, Cell, RadialBarChart, RadialBar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import {
  TrendingUp, DollarSign, Users, ShoppingBag, Download, Star,
} from 'lucide-react';

type Period = '6m' | '12m';

export default function AnalyticsScreen() {
  const { locale } = useAppStore();
  const [period, setPeriod] = useState<Period>('12m');

  const displayData = period === '6m' ? revenueData.slice(-6) : revenueData;

  const totalRevenue = displayData.reduce((s, d) => s + d.revenue, 0);
  const totalCommission = displayData.reduce((s, d) => s + d.commission, 0);
  const totalOrders = displayData.reduce((s, d) => s + d.orders, 0);
  const totalNewUsers = displayData.reduce((s, d) => s + d.newUsers, 0);

  // Seller leaderboard from mock orders
  const sellerRevenue: Record<string, { name: string; revenue: number; orders: number; commission: number }> = {};
  adminOrders.filter(o => o.status === 'completed').forEach(o => {
    const seller = sellers.find(s => s.nurseryName === o.sellerName);
    if (!sellerRevenue[o.sellerName]) {
      sellerRevenue[o.sellerName] = { name: o.sellerName, revenue: 0, orders: 0, commission: 0 };
    }
    sellerRevenue[o.sellerName].revenue += o.total;
    sellerRevenue[o.sellerName].orders += 1;
    sellerRevenue[o.sellerName].commission += o.commission;
    void seller;
  });
  const leaderboard = Object.values(sellerRevenue).sort((a, b) => b.revenue - a.revenue);

  // Monthly new users bar data
  const userGrowthData = displayData.map(d => ({ month: d.month, users: d.newUsers }));

  const exportReport = () => {
    const rows = [
      ['Month', 'Revenue', 'Orders', 'Commission', 'New Users'],
      ...displayData.map(d => [d.month, d.revenue, d.orders, d.commission, d.newUsers]),
    ];
    const csv = rows.map(r => r.join(',')).join('\n');
    const a = document.createElement('a');
    a.href = 'data:text/csv,' + encodeURIComponent(csv);
    a.download = `flora-analytics-${period}.csv`;
    a.click();
  };

  return (
    <div className="p-6 space-y-5 max-w-[1400px] mx-auto">
      {/* Period selector + export */}
      <div className="flex items-center justify-between">
        <div className="flex gap-1 rounded-lg border overflow-hidden text-xs">
          {(['6m', '12m'] as Period[]).map(p => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-4 py-2 font-medium transition-colors
                ${period === p ? 'bg-forest text-white' : 'text-muted-foreground hover:bg-muted'}`}
            >
              {p === '6m' ? (locale === 'kh' ? '៦ ខែ' : 'Last 6 months') : (locale === 'kh' ? '១២ ខែ' : 'Last 12 months')}
            </button>
          ))}
        </div>
        <Button variant="outline" size="sm" className="gap-1.5 text-xs h-8" onClick={exportReport}>
          <Download className="h-3.5 w-3.5" />
          {locale === 'kh' ? 'នាំចេញ' : 'Export Report'}
        </Button>
      </div>

      {/* Summary KPIs */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {[
          { icon: DollarSign, label: 'Total Revenue', labelKh: 'ប្រាក់ចំណូលសរុប', value: formatUSD(totalRevenue), color: 'text-accent-green', bg: 'bg-forest/10' },
          { icon: TrendingUp, label: 'Commission Earned', labelKh: 'កំរៃជើងសារ', value: formatUSD(totalCommission), color: 'text-gold', bg: 'bg-gold/10' },
          { icon: ShoppingBag, label: 'Total Orders', labelKh: 'ការបញ្ជាទិញ', value: totalOrders.toString(), color: 'text-blue-600', bg: 'bg-blue-100 dark:bg-blue-900/20' },
          { icon: Users, label: 'New Users', labelKh: 'អ្នកប្រើថ្មី', value: totalNewUsers.toString(), color: 'text-purple-600', bg: 'bg-purple-100 dark:bg-purple-900/20' },
        ].map(({ icon: Icon, label, labelKh, value, color, bg }) => (
          <Card key={label}>
            <CardContent className="p-5 flex items-center gap-3">
              <div className={`h-10 w-10 rounded-xl ${bg} flex items-center justify-center flex-shrink-0`}>
                <Icon className={`h-5 w-5 ${color}`} />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{locale === 'kh' ? labelKh : label}</p>
                <p className="text-xl font-bold">{value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Revenue trend + Category pie */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <Card className="xl:col-span-2">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold">
                {locale === 'kh' ? 'ជំនឿនៃប្រាក់ចំណូល' : 'Revenue Trend'}
              </CardTitle>
              <Badge variant="secondary" className="text-[10px]">{period === '6m' ? '6 months' : '12 months'}</Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={displayData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="month" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 10 }} tickLine={false} axisLine={false} tickFormatter={v => `$${v}`} />
                <Tooltip
                  contentStyle={{ fontSize: 11, borderRadius: 8, border: '1px solid var(--border)', background: 'var(--card)' }}
                  formatter={(v: number, name: string) => [`$${v.toFixed(0)}`, name === 'revenue' ? 'Revenue' : 'Commission']}
                />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Line type="monotone" dataKey="revenue" name="Revenue" stroke="#52b788" strokeWidth={2.5} dot={{ r: 3 }} activeDot={{ r: 5 }} />
                <Line type="monotone" dataKey="commission" name="Commission" stroke="#c9a84c" strokeWidth={2} strokeDasharray="5 5" dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">
              {locale === 'kh' ? 'ប្រាក់ចំណូលតាមប្រភេទ' : 'Revenue by Category'}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie
                  data={categoryRevenue}
                  cx="50%" cy="50%"
                  innerRadius={45} outerRadius={70}
                  dataKey="value" paddingAngle={4}
                  label={({ name, value }) => `${value}%`}
                  labelLine={false}
                >
                  {categoryRevenue.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ fontSize: 11, borderRadius: 8 }}
                  formatter={(v: number) => [`${v}%`, 'Share']}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-1.5 mt-2">
              {categoryRevenue.map(cat => (
                <div key={cat.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-sm flex-shrink-0" style={{ background: cat.color }} />
                    <span className="text-xs">{cat.name}</span>
                  </div>
                  <span className="text-xs font-medium">{cat.value}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Orders bar + User growth + Seller leaderboard */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">
              {locale === 'kh' ? 'ការបញ្ជាទិញប្រចាំខែ' : 'Monthly Orders'}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={displayData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="month" tick={{ fontSize: 9 }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 9 }} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8 }} />
                <Bar dataKey="orders" name="Orders" fill="#52b788" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">
              {locale === 'kh' ? 'ការកើនឡើងអ្នកប្រើ' : 'User Growth'}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <ResponsiveContainer width="100%" height={180}>
              <AreaChart data={userGrowthData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="month" tick={{ fontSize: 9 }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 9 }} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8 }} />
                <Area type="monotone" dataKey="users" name="New Users" stroke="#6366f1" fill="url(#colorUsers)" strokeWidth={2} dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">
              {locale === 'kh' ? 'ចំណាត់ថ្នាក់អ្នកលក់' : 'Seller Leaderboard'}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0 space-y-2">
            {leaderboard.map((seller, idx) => (
              <div key={seller.name} className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-muted/40 transition-colors">
                <div className={`h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0
                  ${idx === 0 ? 'bg-gold/20 text-gold' : idx === 1 ? 'bg-muted text-muted-foreground' : 'bg-muted/50 text-muted-foreground'}`}>
                  {idx + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium truncate">{seller.name}</p>
                  <p className="text-[10px] text-muted-foreground">{seller.orders} orders</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-xs font-semibold text-accent-green">{formatUSD(seller.revenue)}</p>
                  <p className="text-[10px] text-muted-foreground">{formatUSD(seller.commission)} comm.</p>
                </div>
              </div>
            ))}

            {leaderboard.length === 0 && (
              <p className="text-xs text-muted-foreground text-center py-6">No data</p>
            )}

            <div className="pt-2 border-t mt-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Platform average rating</span>
                <div className="flex items-center gap-1">
                  <Star className="h-3 w-3 fill-gold text-gold" />
                  <span className="font-semibold">
                    {(sellers.reduce((s, seller) => s + seller.rating, 0) / sellers.length).toFixed(1)}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Commission breakdown table */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold">
            {locale === 'kh' ? 'ស្ថិតិ 5% កំរៃជើងសារ' : '5% Commission Breakdown'}
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2.5 px-3 text-xs font-medium text-muted-foreground">{locale === 'kh' ? 'ខែ' : 'Month'}</th>
                <th className="text-right py-2.5 px-3 text-xs font-medium text-muted-foreground">{locale === 'kh' ? 'ការបញ្ជាទិញ' : 'Orders'}</th>
                <th className="text-right py-2.5 px-3 text-xs font-medium text-muted-foreground">{locale === 'kh' ? 'ប្រាក់ចំណូល' : 'Revenue'}</th>
                <th className="text-right py-2.5 px-3 text-xs font-medium text-muted-foreground">{locale === 'kh' ? 'កំរៃ (5%)' : 'Commission (5%)'}</th>
                <th className="text-right py-2.5 px-3 text-xs font-medium text-muted-foreground hidden md:table-cell">{locale === 'kh' ? 'អ្នកប្រើថ្មី' : 'New Users'}</th>
              </tr>
            </thead>
            <tbody>
              {displayData.map(row => (
                <tr key={row.month} className="border-b last:border-0 hover:bg-muted/30">
                  <td className="py-2.5 px-3 text-xs font-medium">{row.month}</td>
                  <td className="py-2.5 px-3 text-xs text-right">{row.orders}</td>
                  <td className="py-2.5 px-3 text-xs text-right">{formatUSD(row.revenue)}</td>
                  <td className="py-2.5 px-3 text-xs text-right font-semibold text-accent-green">{formatUSD(row.commission)}</td>
                  <td className="py-2.5 px-3 text-xs text-right hidden md:table-cell">{row.newUsers}</td>
                </tr>
              ))}
              <tr className="font-bold bg-muted/30">
                <td className="py-2.5 px-3 text-xs">{locale === 'kh' ? 'សរុប' : 'Total'}</td>
                <td className="py-2.5 px-3 text-xs text-right">{totalOrders}</td>
                <td className="py-2.5 px-3 text-xs text-right">{formatUSD(totalRevenue)}</td>
                <td className="py-2.5 px-3 text-xs text-right text-accent-green">{formatUSD(totalCommission)}</td>
                <td className="py-2.5 px-3 text-xs text-right hidden md:table-cell">{totalNewUsers}</td>
              </tr>
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
