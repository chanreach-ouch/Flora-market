'use client';

import { useEffect, useState } from 'react';
import { useAppStore } from '@/lib/store';
import { getAllOrders, updateOrderStatus } from '@/lib/api';
import { formatUSD } from '@/lib/i18n';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  ShoppingBag, Clock, CheckCircle2, XCircle, Search,
  MoreHorizontal, Download, TrendingUp, Loader2,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface OrderItem {
  id: string;
  plant_id: string;
  quantity: number;
  unit_price: number;
}

interface ApiOrder {
  id: string;
  buyer_id: string;
  seller_id: string;
  total_amount: number;
  status: string;
  created_at: string;
  items: OrderItem[];
}

type StatusFilter = 'all' | 'pending' | 'preparing' | 'completed' | 'cancelled';

const statusConfig: Record<string, { label: string; labelKh: string; color: string }> = {
  pending:   { label: 'Pending',   labelKh: 'រង់ចាំ',    color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' },
  preparing: { label: 'Preparing', labelKh: 'កំពុងរៀបចំ', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
  completed: { label: 'Completed', labelKh: 'បានបញ្ចប់',  color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' },
  cancelled: { label: 'Cancelled', labelKh: 'បានលុបចោល',  color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' },
};

const nextStatus: Record<string, string | null> = {
  pending: 'preparing',
  preparing: 'completed',
  completed: null,
  cancelled: null,
};

export default function OrdersScreen() {
  const { locale } = useAppStore();
  const [orders, setOrders] = useState<ApiOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');

  useEffect(() => {
    getAllOrders({ limit: 500 })
      .then(setOrders)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = orders.filter(o => {
    const matchSearch = !search || o.id.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || o.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const counts = {
    all: orders.length,
    pending: orders.filter(o => o.status === 'pending').length,
    preparing: orders.filter(o => o.status === 'preparing').length,
    completed: orders.filter(o => o.status === 'completed').length,
    cancelled: orders.filter(o => o.status === 'cancelled').length,
  };

  const totalRevenue = orders
    .filter(o => o.status === 'completed')
    .reduce((s, o) => s + o.total_amount, 0);
  const totalCommission = totalRevenue * 0.05;

  const advanceStatus = async (order: ApiOrder) => {
    const next = nextStatus[order.status];
    if (!next) return;
    try {
      await updateOrderStatus(order.id, next);
      setOrders(prev => prev.map(o => o.id === order.id ? { ...o, status: next } : o));
    } catch { /* ignore */ }
  };

  const cancelOrder = async (order: ApiOrder) => {
    try {
      await updateOrderStatus(order.id, 'cancelled');
      setOrders(prev => prev.map(o => o.id === order.id ? { ...o, status: 'cancelled' } : o));
    } catch { /* ignore */ }
  };

  const exportCsv = () => {
    const rows = [
      ['Order ID', 'Buyer ID', 'Seller ID', 'Items', 'Total', 'Commission', 'Status', 'Date'],
      ...filtered.map(o => [
        o.id,
        o.buyer_id.slice(0, 8),
        o.seller_id.slice(0, 8),
        o.items.length,
        o.total_amount.toFixed(2),
        (o.status === 'completed' ? o.total_amount * 0.05 : 0).toFixed(2),
        o.status,
        new Date(o.created_at).toLocaleDateString(),
      ]),
    ];
    const csv = rows.map(r => r.join(',')).join('\n');
    const a = document.createElement('a');
    a.href = 'data:text/csv,' + encodeURIComponent(csv);
    a.download = 'flora-orders.csv';
    a.click();
  };

  const statusTabs: StatusFilter[] = ['all', 'pending', 'preparing', 'completed', 'cancelled'];

  return (
    <div className="p-6 space-y-5 max-w-[1400px] mx-auto">

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-forest/10 flex items-center justify-center">
              <ShoppingBag className="h-4 w-4 text-forest dark:text-accent-green" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">{locale === 'kh' ? 'ការបញ្ជាទិញ' : 'Total Orders'}</p>
              <p className="text-xl font-bold">{orders.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-amber-100 dark:bg-amber-900/20 flex items-center justify-center">
              <Clock className="h-4 w-4 text-amber-600" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">{locale === 'kh' ? 'កំពុងដំណើរការ' : 'In Progress'}</p>
              <p className="text-xl font-bold">{counts.pending + counts.preparing}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
              <TrendingUp className="h-4 w-4 text-green-600" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">{locale === 'kh' ? 'ប្រាក់ចំណូល' : 'Revenue'}</p>
              <p className="text-xl font-bold">{formatUSD(totalRevenue)}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-gold/10 flex items-center justify-center">
              <CheckCircle2 className="h-4 w-4 text-gold" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">{locale === 'kh' ? 'កំរៃ (5%)' : 'Commission (5%)'}</p>
              <p className="text-xl font-bold">{formatUSD(totalCommission)}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <CardTitle className="text-sm font-semibold flex-1">
              {locale === 'kh' ? 'ការបញ្ជាទិញទាំងអស់' : 'All Orders'}
            </CardTitle>
            <div className="flex gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder={locale === 'kh' ? 'ស្វែងរក...' : 'Search by order ID...'}
                  className="pl-8 h-8 text-xs w-44"
                />
              </div>
              <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs" onClick={exportCsv}>
                <Download className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">CSV</span>
              </Button>
            </div>
          </div>

          {/* Status tabs */}
          <div className="flex gap-1 flex-wrap mt-2">
            {statusTabs.map(s => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors
                  ${statusFilter === s ? 'bg-forest text-white' : 'text-muted-foreground hover:bg-muted'}`}
              >
                {s === 'all' ? (locale === 'kh' ? 'ទាំងអស់' : 'All') : (statusConfig[s]?.label ?? s)}
                <span className={`ml-1.5 px-1.5 py-0.5 rounded-full text-[9px] font-bold
                  ${statusFilter === s ? 'bg-white/20 text-white' : 'bg-muted text-muted-foreground'}`}>
                  {counts[s]}
                </span>
              </button>
            ))}
          </div>
        </CardHeader>

        <CardContent className="pt-0 overflow-x-auto">
          {loading ? (
            <div className="py-12 flex items-center justify-center">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2.5 px-3 text-xs font-medium text-muted-foreground">Order</th>
                    <th className="text-left py-2.5 px-3 text-xs font-medium text-muted-foreground hidden md:table-cell">Items</th>
                    <th className="text-left py-2.5 px-3 text-xs font-medium text-muted-foreground hidden lg:table-cell">Date</th>
                    <th className="text-left py-2.5 px-3 text-xs font-medium text-muted-foreground">Status</th>
                    <th className="text-right py-2.5 px-3 text-xs font-medium text-muted-foreground">Total</th>
                    <th className="py-2.5 px-3" />
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(order => {
                    const s = statusConfig[order.status];
                    const next = nextStatus[order.status];
                    const commission = order.status === 'completed' ? order.total_amount * 0.05 : 0;
                    return (
                      <tr key={order.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                        <td className="py-3 px-3">
                          <div>
                            <span className="font-mono text-xs font-semibold">#{order.id.slice(0, 8)}</span>
                            <p className="text-[10px] text-muted-foreground mt-0.5">
                              Buyer: {order.buyer_id.slice(0, 8)}
                            </p>
                          </div>
                        </td>
                        <td className="py-3 px-3 hidden md:table-cell">
                          <div>
                            <p className="text-xs font-medium">
                              {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                            </p>
                            {order.items[0] && (
                              <p className="text-[10px] text-muted-foreground">
                                x{order.items[0].quantity} @ {formatUSD(order.items[0].unit_price)}
                              </p>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-3 hidden lg:table-cell">
                          <span className="text-xs text-muted-foreground">
                            {new Date(order.created_at).toLocaleDateString()}
                          </span>
                        </td>
                        <td className="py-3 px-3">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium ${s?.color ?? ''}`}>
                            {locale === 'kh' ? s?.labelKh : s?.label}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right">
                          <div>
                            <p className="text-xs font-semibold">{formatUSD(order.total_amount)}</p>
                            {commission > 0 && (
                              <p className="text-[10px] text-accent-green">+{formatUSD(commission)}</p>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-3">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-7 w-7">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-44">
                              {next && (
                                <DropdownMenuItem onClick={() => advanceStatus(order)}>
                                  <CheckCircle2 className="mr-2 h-3.5 w-3.5" />
                                  {locale === 'kh' ? 'ជំរុញទៅ' : 'Advance to'} {statusConfig[next]?.label}
                                </DropdownMenuItem>
                              )}
                              {order.status !== 'cancelled' && order.status !== 'completed' && (
                                <DropdownMenuItem
                                  onClick={() => cancelOrder(order)}
                                  className="text-destructive focus:text-destructive"
                                >
                                  <XCircle className="mr-2 h-3.5 w-3.5" />
                                  {locale === 'kh' ? 'លុបចោល' : 'Cancel Order'}
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {filtered.length === 0 && (
                <div className="py-12 text-center text-muted-foreground text-sm">
                  {locale === 'kh' ? 'រកមិនឃើញ' : 'No orders found'}
                </div>
              )}

              <div className="flex items-center justify-between pt-3 border-t mt-2">
                <p className="text-xs text-muted-foreground">
                  {locale === 'kh'
                    ? `បង្ហាញ ${filtered.length} / ${orders.length}`
                    : `Showing ${filtered.length} of ${orders.length} orders`}
                </p>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
