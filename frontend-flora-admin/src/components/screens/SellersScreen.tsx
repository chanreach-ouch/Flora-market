'use client';

import { useState } from 'react';
import { useAppStore } from '@/lib/store';
import { sellers as mockSellers, type MockSeller } from '@/lib/data';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Store, CheckCircle, AlertCircle, Ban, Search,
  Star, ShoppingBag, Leaf, MoreHorizontal, Shield, ShieldOff,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';

interface SellerState extends MockSeller {
  suspended: boolean;
}

export default function SellersScreen() {
  const { locale } = useAppStore();
  const [search, setSearch] = useState('');
  const [sellers, setSellers] = useState<SellerState[]>(
    mockSellers.map(s => ({ ...s, suspended: false }))
  );
  const [selectedSeller, setSelectedSeller] = useState<SellerState | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const filtered = sellers.filter(s =>
    !search ||
    s.nurseryName.toLowerCase().includes(search.toLowerCase()) ||
    s.city.toLowerCase().includes(search.toLowerCase())
  );

  const totalVerified = sellers.filter(s => s.isVerified && !s.suspended).length;
  const totalPending = sellers.filter(s => !s.isVerified && !s.suspended).length;
  const totalSuspended = sellers.filter(s => s.suspended).length;

  const toggleVerify = (id: string) => {
    setSellers(prev => prev.map(s => s.id === id ? { ...s, isVerified: !s.isVerified } : s));
  };

  const toggleSuspend = (id: string) => {
    setSellers(prev => prev.map(s => s.id === id ? { ...s, suspended: !s.suspended, isVerified: s.suspended ? s.isVerified : false } : s));
  };

  const openDetail = (seller: SellerState) => {
    setSelectedSeller(seller);
    setDetailOpen(true);
  };

  return (
    <div className="p-6 space-y-5 max-w-[1400px] mx-auto">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
              <CheckCircle className="h-4 w-4 text-green-600" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">{locale === 'kh' ? 'បានផ្ទៀងផ្ទាត់' : 'Verified'}</p>
              <p className="text-xl font-bold">{totalVerified}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-amber-100 dark:bg-amber-900/20 flex items-center justify-center">
              <AlertCircle className="h-4 w-4 text-amber-600" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">{locale === 'kh' ? 'រង់ចាំ' : 'Pending'}</p>
              <p className="text-xl font-bold">{totalPending}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
              <Ban className="h-4 w-4 text-red-500" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">{locale === 'kh' ? 'ត្រូវបានផ្អាក' : 'Suspended'}</p>
              <p className="text-xl font-bold">{totalSuspended}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Table */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <CardTitle className="text-sm font-semibold flex-1">
              {locale === 'kh' ? 'អ្នកលក់ទាំងអស់' : 'All Sellers'}
            </CardTitle>
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder={locale === 'kh' ? 'ស្វែងរក...' : 'Search sellers...'}
                className="pl-8 h-8 text-xs w-52"
              />
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-0 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2.5 px-3 text-xs font-medium text-muted-foreground">
                  {locale === 'kh' ? 'ហាង' : 'Shop'}
                </th>
                <th className="text-left py-2.5 px-3 text-xs font-medium text-muted-foreground hidden sm:table-cell">
                  {locale === 'kh' ? 'ទីតាំង' : 'Location'}
                </th>
                <th className="text-left py-2.5 px-3 text-xs font-medium text-muted-foreground hidden md:table-cell">
                  {locale === 'kh' ? 'ការវាយតម្លៃ' : 'Rating'}
                </th>
                <th className="text-left py-2.5 px-3 text-xs font-medium text-muted-foreground hidden md:table-cell">
                  {locale === 'kh' ? 'ការបញ្ជាទិញ' : 'Orders'}
                </th>
                <th className="text-left py-2.5 px-3 text-xs font-medium text-muted-foreground hidden lg:table-cell">
                  {locale === 'kh' ? 'រុក្ខជាតិ' : 'Plants'}
                </th>
                <th className="text-left py-2.5 px-3 text-xs font-medium text-muted-foreground">
                  {locale === 'kh' ? 'ស្ថានភាព' : 'Status'}
                </th>
                <th className="py-2.5 px-3" />
              </tr>
            </thead>
            <tbody>
              {filtered.map(seller => (
                <tr key={seller.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-2.5">
                      <div className="h-8 w-8 rounded-lg bg-forest/10 flex items-center justify-center flex-shrink-0">
                        <Store className="h-4 w-4 text-forest dark:text-accent-green" />
                      </div>
                      <div>
                        <p className="font-medium text-xs">{seller.nurseryName}</p>
                        <p className="text-[10px] text-muted-foreground">
                          {locale === 'kh' ? 'ចូលក្នុងឆ្នាំ' : 'Since'} {seller.yearJoined}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-3 hidden sm:table-cell">
                    <p className="text-xs">{seller.city}</p>
                    <p className="text-[10px] text-muted-foreground">{seller.district}</p>
                  </td>
                  <td className="py-3 px-3 hidden md:table-cell">
                    <div className="flex items-center gap-1">
                      <Star className="h-3 w-3 fill-gold text-gold" />
                      <span className="text-xs font-medium">{seller.rating}</span>
                    </div>
                  </td>
                  <td className="py-3 px-3 hidden md:table-cell">
                    <div className="flex items-center gap-1">
                      <ShoppingBag className="h-3 w-3 text-muted-foreground" />
                      <span className="text-xs">{seller.totalOrders}</span>
                    </div>
                  </td>
                  <td className="py-3 px-3 hidden lg:table-cell">
                    <div className="flex items-center gap-1">
                      <Leaf className="h-3 w-3 text-muted-foreground" />
                      <span className="text-xs">{seller.totalPlants}</span>
                    </div>
                  </td>
                  <td className="py-3 px-3">
                    {seller.suspended ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-red-100 text-red-600 dark:bg-red-900/20 dark:text-red-400">
                        <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
                        {locale === 'kh' ? 'ផ្អាក' : 'Suspended'}
                      </span>
                    ) : seller.isVerified ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400">
                        <CheckCircle className="h-2.5 w-2.5" />
                        {locale === 'kh' ? 'បានផ្ទៀងផ្ទាត់' : 'Verified'}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-amber-100 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400">
                        <AlertCircle className="h-2.5 w-2.5" />
                        {locale === 'kh' ? 'រង់ចាំ' : 'Pending'}
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-3">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-7 w-7">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-44">
                        <DropdownMenuItem onClick={() => openDetail(seller)}>
                          <Store className="mr-2 h-3.5 w-3.5" />
                          {locale === 'kh' ? 'មើលព័ត៌មាន' : 'View Details'}
                        </DropdownMenuItem>
                        {!seller.suspended && (
                          <DropdownMenuItem onClick={() => toggleVerify(seller.id)}>
                            {seller.isVerified
                              ? <><ShieldOff className="mr-2 h-3.5 w-3.5" />{locale === 'kh' ? 'លុបការផ្ទៀងផ្ទាត់' : 'Unverify'}</>
                              : <><Shield className="mr-2 h-3.5 w-3.5" />{locale === 'kh' ? 'ផ្ទៀងផ្ទាត់' : 'Verify'}</>
                            }
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => toggleSuspend(seller.id)} className={seller.suspended ? '' : 'text-destructive focus:text-destructive'}>
                          <Ban className="mr-2 h-3.5 w-3.5" />
                          {seller.suspended
                            ? (locale === 'kh' ? 'ដំណើរការឡើងវិញ' : 'Reinstate')
                            : (locale === 'kh' ? 'ផ្អាក' : 'Suspend')
                          }
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filtered.length === 0 && (
            <div className="py-12 text-center text-muted-foreground text-sm">
              {locale === 'kh' ? 'រកមិនឃើញ' : 'No sellers found'}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Detail Dialog */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Store className="h-4 w-4" />
              {selectedSeller?.nurseryName}
            </DialogTitle>
          </DialogHeader>
          {selectedSeller && (
            <div className="space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-lg bg-muted/50">
                  <p className="text-xs text-muted-foreground mb-0.5">Rating</p>
                  <div className="flex items-center gap-1">
                    <Star className="h-3.5 w-3.5 fill-gold text-gold" />
                    <span className="font-semibold">{selectedSeller.rating}</span>
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-muted/50">
                  <p className="text-xs text-muted-foreground mb-0.5">Orders</p>
                  <p className="font-semibold">{selectedSeller.totalOrders}</p>
                </div>
                <div className="p-3 rounded-lg bg-muted/50">
                  <p className="text-xs text-muted-foreground mb-0.5">Plants</p>
                  <p className="font-semibold">{selectedSeller.totalPlants}</p>
                </div>
                <div className="p-3 rounded-lg bg-muted/50">
                  <p className="text-xs text-muted-foreground mb-0.5">Since</p>
                  <p className="font-semibold">{selectedSeller.yearJoined}</p>
                </div>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Location</p>
                <p>{selectedSeller.location}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Description</p>
                <p className="text-xs text-muted-foreground leading-relaxed">{selectedSeller.description}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1.5">Specialties</p>
                <div className="flex flex-wrap gap-1">
                  {selectedSeller.specialties.map(s => (
                    <Badge key={s} variant="secondary" className="text-[10px]">{s}</Badge>
                  ))}
                </div>
              </div>
            </div>
          )}
          <DialogFooter className="gap-2">
            {selectedSeller && !selectedSeller.suspended && !selectedSeller.isVerified && (
              <Button size="sm" className="bg-forest hover:bg-forest/90" onClick={() => { toggleVerify(selectedSeller.id); setDetailOpen(false); }}>
                <Shield className="h-3.5 w-3.5 mr-1" /> Verify Seller
              </Button>
            )}
            <Button variant="outline" size="sm" onClick={() => setDetailOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
