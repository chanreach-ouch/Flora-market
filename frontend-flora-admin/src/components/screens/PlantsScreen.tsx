'use client';

import { useEffect, useState } from 'react';
import { useAppStore } from '@/lib/store';
import { getAllPlants, togglePlantStatus } from '@/lib/api';
import { formatUSD } from '@/lib/i18n';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Leaf, Star, Search, MoreHorizontal,
  EyeOff, Eye, Package, Loader2,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface ApiPlant {
  id: string;
  name_en: string;
  name_kh: string;
  seller_id: string;
  category: string;
  price: number;
  stock: number;
  is_active: boolean;
  is_new: boolean;
  rating: number;
  review_count: number;
  difficulty: string | null;
  total_sold: number;
}

const plantEmojis: Record<string, string> = {
  Indoor: '🪴', Outdoor: '🌳', Flowering: '🌸', Succulents: '🌵', Trees: '🎋',
};

const difficultyColors: Record<string, string> = {
  'Very Easy': 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400',
  'Easy':      'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400',
  'Moderate':  'bg-amber-100 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400',
  'Advanced':  'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400',
};

export default function PlantsScreen() {
  const { locale } = useAppStore();
  const [plants, setPlants] = useState<ApiPlant[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');

  useEffect(() => {
    getAllPlants({ limit: 500 })
      .then(setPlants)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const categories = ['All', ...Array.from(new Set(plants.map(p => p.category))).sort()];

  const filtered = plants.filter(p => {
    const matchSearch = !search || p.name_en.toLowerCase().includes(search.toLowerCase());
    const matchCategory = categoryFilter === 'All' || p.category === categoryFilter;
    const matchStatus = statusFilter === 'all' || (statusFilter === 'active' ? p.is_active : !p.is_active);
    return matchSearch && matchCategory && matchStatus;
  });

  const totalActive = plants.filter(p => p.is_active).length;
  const totalInactive = plants.filter(p => !p.is_active).length;
  const totalNew = plants.filter(p => p.is_new).length;

  const handleToggle = async (plant: ApiPlant) => {
    try {
      await togglePlantStatus(plant.id);
      setPlants(prev => prev.map(p => p.id === plant.id ? { ...p, is_active: !p.is_active } : p));
    } catch { /* ignore */ }
  };

  return (
    <div className="p-6 space-y-5 max-w-[1400px] mx-auto">

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-forest/10 flex items-center justify-center">
              <Leaf className="h-4 w-4 text-forest dark:text-accent-green" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">{locale === 'kh' ? 'សកម្ម' : 'Active Listings'}</p>
              <p className="text-xl font-bold">{totalActive}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-muted flex items-center justify-center">
              <EyeOff className="h-4 w-4 text-muted-foreground" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">{locale === 'kh' ? 'អសកម្ម' : 'Inactive'}</p>
              <p className="text-xl font-bold">{totalInactive}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
              <Package className="h-4 w-4 text-blue-600" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">{locale === 'kh' ? 'ថ្មី' : 'New Arrivals'}</p>
              <p className="text-xl font-bold">{totalNew}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <CardTitle className="text-sm font-semibold flex-1">
              {locale === 'kh' ? 'បញ្ជីរុក្ខជាតិ' : 'Plant Listings'}
            </CardTitle>
            <div className="flex gap-2 flex-wrap">
              <div className="flex rounded-lg border overflow-hidden text-xs">
                {(['all', 'active', 'inactive'] as const).map(s => (
                  <button
                    key={s}
                    onClick={() => setStatusFilter(s)}
                    className={`px-3 py-1.5 font-medium transition-colors capitalize
                      ${statusFilter === s ? 'bg-forest text-white' : 'hover:bg-muted text-muted-foreground'}`}
                  >
                    {s === 'all' ? (locale === 'kh' ? 'ទាំងអស់' : 'All') : s}
                  </button>
                ))}
              </div>
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder={locale === 'kh' ? 'ស្វែងរក...' : 'Search plants...'}
                  className="pl-8 h-8 text-xs w-44"
                />
              </div>
            </div>
          </div>

          {/* Category filter */}
          <div className="flex gap-1 flex-wrap mt-2">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors flex items-center gap-1
                  ${categoryFilter === cat ? 'bg-forest text-white' : 'text-muted-foreground hover:bg-muted'}`}
              >
                {cat !== 'All' && <span>{plantEmojis[cat] ?? '🌿'}</span>}
                {cat === 'All' ? (locale === 'kh' ? 'ទាំងអស់' : 'All') : cat}
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
                    <th className="text-left py-2.5 px-3 text-xs font-medium text-muted-foreground">
                      {locale === 'kh' ? 'រុក្ខជាតិ' : 'Plant'}
                    </th>
                    <th className="text-left py-2.5 px-3 text-xs font-medium text-muted-foreground hidden sm:table-cell">
                      {locale === 'kh' ? 'អ្នកលក់' : 'Seller'}
                    </th>
                    <th className="text-left py-2.5 px-3 text-xs font-medium text-muted-foreground hidden md:table-cell">
                      {locale === 'kh' ? 'ប្រភេទ' : 'Category'}
                    </th>
                    <th className="text-left py-2.5 px-3 text-xs font-medium text-muted-foreground">
                      {locale === 'kh' ? 'តម្លៃ' : 'Price'}
                    </th>
                    <th className="text-left py-2.5 px-3 text-xs font-medium text-muted-foreground hidden lg:table-cell">
                      {locale === 'kh' ? 'ស្តុក' : 'Stock'}
                    </th>
                    <th className="text-left py-2.5 px-3 text-xs font-medium text-muted-foreground hidden md:table-cell">
                      {locale === 'kh' ? 'ការវាយតម្លៃ' : 'Rating'}
                    </th>
                    <th className="text-left py-2.5 px-3 text-xs font-medium text-muted-foreground hidden lg:table-cell">
                      {locale === 'kh' ? 'ភាពស្មុគស្មាញ' : 'Level'}
                    </th>
                    <th className="text-left py-2.5 px-3 text-xs font-medium text-muted-foreground">
                      {locale === 'kh' ? 'ស្ថានភាព' : 'Status'}
                    </th>
                    <th className="py-2.5 px-3" />
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(plant => (
                    <tr key={plant.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2.5">
                          <span className="text-xl flex-shrink-0">{plantEmojis[plant.category] ?? '🌿'}</span>
                          <div>
                            <p className="font-medium text-xs">{plant.name_en}</p>
                            {plant.is_new && (
                              <Badge className="text-[9px] h-3.5 px-1 bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400 mt-0.5">
                                New
                              </Badge>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-3 hidden sm:table-cell">
                        <span className="text-xs text-muted-foreground font-mono">
                          {plant.seller_id.slice(0, 8)}
                        </span>
                      </td>
                      <td className="py-3 px-3 hidden md:table-cell">
                        <span className="text-xs">{plant.category}</span>
                      </td>
                      <td className="py-3 px-3">
                        <span className="text-xs font-semibold">{formatUSD(plant.price)}</span>
                      </td>
                      <td className="py-3 px-3 hidden lg:table-cell">
                        <span className={`text-xs font-medium ${
                          plant.stock <= 5 ? 'text-destructive' : plant.stock <= 15 ? 'text-amber-600' : 'text-foreground'
                        }`}>
                          {plant.stock}
                        </span>
                      </td>
                      <td className="py-3 px-3 hidden md:table-cell">
                        <div className="flex items-center gap-1">
                          <Star className="h-3 w-3 fill-gold text-gold" />
                          <span className="text-xs">{plant.rating.toFixed(1)}</span>
                          <span className="text-[10px] text-muted-foreground">({plant.review_count})</span>
                        </div>
                      </td>
                      <td className="py-3 px-3 hidden lg:table-cell">
                        {plant.difficulty && (
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium ${difficultyColors[plant.difficulty] ?? ''}`}>
                            {plant.difficulty}
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-3">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium
                          ${plant.is_active
                            ? 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400'
                            : 'bg-muted text-muted-foreground'
                          }`}>
                          <span className={`h-1.5 w-1.5 rounded-full ${plant.is_active ? 'bg-green-500' : 'bg-muted-foreground'}`} />
                          {plant.is_active
                            ? (locale === 'kh' ? 'សកម្ម' : 'Active')
                            : (locale === 'kh' ? 'អសកម្ម' : 'Inactive')}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-7 w-7">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-40">
                            <DropdownMenuItem onClick={() => handleToggle(plant)}>
                              {plant.is_active
                                ? <><EyeOff className="mr-2 h-3.5 w-3.5" />{locale === 'kh' ? 'លាក់' : 'Deactivate'}</>
                                : <><Eye className="mr-2 h-3.5 w-3.5" />{locale === 'kh' ? 'បង្ហាញ' : 'Activate'}</>
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
                  {locale === 'kh' ? 'រកមិនឃើញ' : 'No plants found'}
                </div>
              )}

              <div className="flex items-center justify-between pt-3 border-t mt-2">
                <p className="text-xs text-muted-foreground">
                  {locale === 'kh'
                    ? `បង្ហាញ ${filtered.length} / ${plants.length}`
                    : `Showing ${filtered.length} of ${plants.length} listings`}
                </p>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
