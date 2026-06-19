'use client';

import { useState, useEffect } from 'react';
import { useAppStore } from '@/lib/store';
import { t } from '@/lib/i18n';
import { plants as mockPlants, plantEmojis, getSellerById } from '@/lib/data';
import type { MockPlant, MockSeller } from '@/lib/data';
import { apiFetchPlants, apiFetchSellerById } from '@/lib/api';
import { showToast } from '@/components/ui/toast-custom';
import { PlantCard } from '@/components/ui/plant-card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

function PlantCardSkeleton() {
  return (
    <div className="rounded-2xl overflow-hidden border bg-card">
      <Skeleton className="aspect-square w-full" />
      <div className="p-3 sm:p-4 space-y-2">
        <div className="flex justify-between">
          <Skeleton className="h-4 w-20 rounded-full" />
          <Skeleton className="h-4 w-12" />
        </div>
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
        <Skeleton className="h-3 w-2/5" />
        <div className="flex items-center justify-between pt-1">
          <Skeleton className="h-5 w-16" />
          <Skeleton className="h-8 w-20 rounded-lg" />
        </div>
      </div>
    </div>
  );
}

// Thin wrapper: fetches seller then renders shared PlantCard
function PlantCardWithSeller({ plant }: { plant: MockPlant }) {
  const [seller, setSeller] = useState<MockSeller | null>(getSellerById(plant.sellerId) || null);

  useEffect(() => {
    if (!getSellerById(plant.sellerId)) {
      apiFetchSellerById(plant.sellerId).then(setSeller).catch(() => {});
    }
  }, [plant.sellerId]);

  return <PlantCard plant={plant} seller={seller} />;
}

export default function HomeScreen() {
  const { locale, setScreen } = useAppStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [allPlants, setAllPlants] = useState<MockPlant[]>(mockPlants);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    apiFetchPlants()
      .then(setAllPlants)
      .catch(() => {
        setAllPlants(mockPlants);
        showToast('error', locale === 'kh' ? 'មិនអាចភ្ជាប់ម៉ាស៊ីនមេ' : 'Could not load plants from server');
      })
      .finally(() => setLoading(false));
  }, []);

  const dynamicCategories = ['All', ...Array.from(new Set(allPlants.map(p => p.category))).sort()];

  const filteredPlants = allPlants
    .filter(p => selectedCategory === 'All' || p.category === selectedCategory)
    .filter(p => {
      if (!searchQuery) return true;
      const q = searchQuery.toLowerCase();
      return p.nameEn.toLowerCase().includes(q) || p.nameKh.includes(q) || p.tagline.toLowerCase().includes(q);
    });

  const newArrivals = allPlants.filter(p => p.isNew);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
      {/* Hero */}
      <div className="mb-8 sm:mb-12">
        <h1 className="text-3xl sm:text-4xl font-bold mb-2" style={{ fontFamily: 'Playfair Display, serif' }}>
          {t(locale, 'greeting')} 👋
        </h1>
        <p className="text-lg text-muted-foreground mb-6">{t(locale, 'headline')}</p>
        <div className="relative max-w-xl">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder={t(locale, 'searchPlaceholder')}
            className="pl-12 h-12 rounded-xl text-base"
          />
        </div>
      </div>

      {/* Categories */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2 mb-8">
        {loading
          ? Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-8 w-20 rounded-full shrink-0" />)
          : dynamicCategories.map(cat => (
              <Button
                key={cat}
                variant={selectedCategory === cat ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory(cat)}
                className="whitespace-nowrap rounded-full"
              >
                {plantEmojis[cat] && <span className="mr-1.5">{plantEmojis[cat]}</span>}
                {locale === 'kh' ? (t(locale, `categories.${cat.toLowerCase()}` as any) || cat) : cat}
              </Button>
            ))
        }
      </div>

      {/* New Arrivals */}
      {!loading && selectedCategory === 'All' && !searchQuery && newArrivals.length > 0 && (
        <div className="mb-10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">{t(locale, 'newArrivals')}</h2>
            <Button variant="ghost" size="sm" onClick={() => setScreen('browse')}>
              {t(locale, 'viewAll')} →
            </Button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {newArrivals.slice(0, 5).map(plant => (
              <PlantCardWithSeller key={plant.id} plant={plant} />
            ))}
          </div>
        </div>
      )}

      {/* All Plants */}
      <div>
        <h2 className="text-xl font-bold mb-4">{t(locale, 'allPlants')}</h2>
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {Array.from({ length: 10 }).map((_, i) => <PlantCardSkeleton key={i} />)}
          </div>
        ) : filteredPlants.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            {locale === 'kh' ? 'រកមិនឃើញរុក្ខជាតិ' : 'No plants found'}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {filteredPlants.map(plant => (
              <PlantCardWithSeller key={plant.id} plant={plant} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
