'use client';

import { useState, useEffect } from 'react';
import { useAppStore } from '@/lib/store';
import { t } from '@/lib/i18n';
import { plants as mockPlants, getSellerById } from '@/lib/data';
import type { MockPlant, MockSeller } from '@/lib/data';
import { apiFetchPlants, apiFetchSellers } from '@/lib/api';
import { showToast } from '@/components/ui/toast-custom';
import { PlantImage, categoryStyles, DEFAULT_STYLE } from '@/components/ui/plant-image';
import { triggerFly } from '@/lib/fly-animation';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Search, Heart, ShoppingCart, Star, MapPin, SlidersHorizontal, X } from 'lucide-react';

function PlantCardSkeleton() {
  return (
    <div className="rounded-2xl overflow-hidden border bg-card">
      <Skeleton className="aspect-square w-full" />
      <div className="p-3 sm:p-4 space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
        <div className="flex items-center justify-between pt-2">
          <Skeleton className="h-5 w-16" />
          <Skeleton className="h-8 w-8 rounded-lg" />
        </div>
      </div>
    </div>
  );
}

export default function BrowseScreen() {
  const { locale, selectPlant, selectSeller, addToCart, addToWishlist, removeFromWishlist, isInWishlist } = useAppStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [priceRange, setPriceRange] = useState([0, 50]);
  const [sortBy, setSortBy] = useState<'name' | 'price-low' | 'price-high' | 'rating'>('name');
  const [showFilters, setShowFilters] = useState(false);
  const [allPlants, setAllPlants] = useState<MockPlant[]>(mockPlants);
  const [sellerMap, setSellerMap] = useState<Record<string, MockSeller>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    apiFetchPlants(selectedCategory !== 'All' ? selectedCategory : undefined)
      .then(setAllPlants)
      .catch(() => {
        setAllPlants(mockPlants);
        showToast('error', locale === 'kh' ? 'មិនអាចទាញទិន្នន័យ' : 'Could not load plants');
      })
      .finally(() => setLoading(false));
  }, [selectedCategory]);

  useEffect(() => {
    apiFetchSellers()
      .then(list => {
        const map: Record<string, MockSeller> = {};
        list.forEach(s => { map[s.id] = s; });
        setSellerMap(map);
      })
      .catch(() => {});
  }, []);

  // Dynamic categories from loaded plants
  const dynamicCategories = ['All', ...Array.from(new Set(allPlants.map(p => p.category))).sort()];
  const maxPrice = Math.max(50, ...allPlants.map(p => p.price));

  let filtered = allPlants
    .filter(p => selectedCategory === 'All' || p.category === selectedCategory)
    .filter(p => {
      if (!searchQuery) return true;
      const q = searchQuery.toLowerCase();
      return p.nameEn.toLowerCase().includes(q) || p.nameKh.includes(q);
    })
    .filter(p => p.price >= priceRange[0] && p.price <= priceRange[1]);

  if (sortBy === 'price-low') filtered = [...filtered].sort((a, b) => a.price - b.price);
  else if (sortBy === 'price-high') filtered = [...filtered].sort((a, b) => b.price - a.price);
  else if (sortBy === 'rating') filtered = [...filtered].sort((a, b) => b.rating - a.rating);

  const handleAddToCart = (e: React.MouseEvent<HTMLButtonElement>, plant: MockPlant) => {
    e.stopPropagation();
    const { emoji, gradient } = categoryStyles[plant.category] || DEFAULT_STYLE;
    triggerFly(e.currentTarget, 'cart', emoji, gradient);
    addToCart(plant.id);
    showToast('success', locale === 'kh' ? 'បានបន្ថែមទៅរទោះ' : `${plant.nameEn} added to cart`);
  };

  const handleWishlist = (e: React.MouseEvent<HTMLButtonElement>, plant: MockPlant, wishlisted: boolean) => {
    e.stopPropagation();
    if (!wishlisted) {
      const { emoji, gradient } = categoryStyles[plant.category] || DEFAULT_STYLE;
      triggerFly(e.currentTarget, 'wishlist', emoji, gradient);
      addToWishlist(plant.id);
    } else {
      removeFromWishlist(plant.id);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">{t(locale, 'browse')}</h1>
        <Button variant="outline" size="sm" onClick={() => setShowFilters(!showFilters)} className="gap-2">
          <SlidersHorizontal className="h-4 w-4" />
          {locale === 'kh' ? 'តម្រង' : 'Filters'}
          {showFilters && <X className="h-3 w-3" />}
        </Button>
      </div>

      <div className="flex gap-6">
        {/* Filters Sidebar */}
        <aside className={`${showFilters ? 'block' : 'hidden'} lg:block w-full lg:w-64 shrink-0 mb-6 lg:mb-0`}>
          <Card>
            <CardContent className="p-4 space-y-5">
              {/* Search */}
              <div>
                <label className="text-sm font-medium mb-2 block">{t(locale, 'search')}</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder={t(locale, 'searchPlaceholder')}
                    className="pl-9"
                  />
                </div>
              </div>

              {/* Price Range */}
              <div>
                <label className="text-sm font-medium mb-2 block">
                  {locale === 'kh' ? 'ជួរតម្លៃ' : 'Price Range'}: ${priceRange[0]} – ${priceRange[1]}
                </label>
                <Slider
                  min={0}
                  max={maxPrice}
                  step={1}
                  value={priceRange}
                  onValueChange={setPriceRange}
                  className="mt-2"
                />
              </div>

              {/* Sort */}
              <div>
                <label className="text-sm font-medium mb-2 block">{locale === 'kh' ? 'តម្រៀប' : 'Sort By'}</label>
                <div className="space-y-1">
                  {([
                    { value: 'name',       label: locale === 'kh' ? 'ឈ្មោះ' : 'Name' },
                    { value: 'price-low',  label: locale === 'kh' ? 'តម្លៃ ទាប→ខ្ពស់' : 'Price: Low → High' },
                    { value: 'price-high', label: locale === 'kh' ? 'តម្លៃ ខ្ពស់→ទាប' : 'Price: High → Low' },
                    { value: 'rating',     label: locale === 'kh' ? 'ការវាយតម្លៃ' : 'Top Rated' },
                  ] as const).map(opt => (
                    <button
                      key={opt.value}
                      onClick={() => setSortBy(opt.value)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors
                        ${sortBy === opt.value ? 'bg-forest text-white' : 'hover:bg-muted text-muted-foreground'}`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Reset */}
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => { setSearchQuery(''); setPriceRange([0, 50]); setSortBy('name'); setSelectedCategory('All'); }}
              >
                {locale === 'kh' ? 'កំណត់ឡើងវិញ' : 'Reset Filters'}
              </Button>
            </CardContent>
          </Card>
        </aside>

        {/* Main Content */}
        <div className="flex-1 min-w-0">
          {/* Category Pills */}
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-3 mb-5">
            {loading
              ? Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-8 w-20 rounded-full shrink-0" />)
              : dynamicCategories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`whitespace-nowrap px-4 py-1.5 rounded-full text-sm font-medium transition-colors shrink-0
                      ${selectedCategory === cat ? 'bg-forest text-white' : 'bg-muted text-muted-foreground hover:bg-muted/80'}`}
                  >
                    {cat === 'All' ? (locale === 'kh' ? 'ទាំងអស់' : 'All') : cat}
                  </button>
                ))
            }
          </div>

          {/* Count */}
          {!loading && (
            <p className="text-sm text-muted-foreground mb-4">
              {locale === 'kh' ? `${filtered.length} រុក្ខជាតិ` : `${filtered.length} plant${filtered.length !== 1 ? 's' : ''}`}
            </p>
          )}

          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {Array.from({ length: 8 }).map((_, i) => <PlantCardSkeleton key={i} />)}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">
              <p className="text-4xl mb-4">🔍</p>
              <p>{locale === 'kh' ? 'រកមិនឃើញរុក្ខជាតិ' : 'No plants found matching your filters'}</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filtered.map(plant => {
                const seller = getSellerById(plant.sellerId) || sellerMap[plant.sellerId];
                const wishlisted = isInWishlist(plant.id);
                return (
                  <Card key={plant.id} className="group card-shadow card-shadow-hover transition-flora overflow-hidden cursor-pointer">
                    <div className="relative aspect-square overflow-hidden" onClick={() => selectPlant(plant.id)}>
                      <PlantImage
                        images={plant.images}
                        category={plant.category}
                        alt={plant.nameEn}
                        className="w-full h-full"
                        emojiSize="text-5xl"
                      />
                      <button
                        onClick={(e: React.MouseEvent<HTMLButtonElement>) => handleWishlist(e, plant, wishlisted)}
                        className="absolute top-2 right-2 h-8 w-8 rounded-full bg-white/80 dark:bg-forest/80 flex items-center justify-center"
                      >
                        <Heart className={`h-4 w-4 ${wishlisted ? 'fill-red-500 text-red-500' : 'text-muted-foreground'}`} />
                      </button>
                    </div>
                    <CardContent className="p-3 sm:p-4">
                      <h3 className="font-semibold text-sm mb-1 line-clamp-1">{locale === 'kh' ? plant.nameKh : plant.nameEn}</h3>
                      {seller && (
                        <button onClick={() => selectSeller(seller.id)} className="text-xs text-muted-foreground hover:text-accent-green flex items-center gap-1 mb-2">
                          <MapPin className="h-3 w-3" />{seller.nurseryName}
                        </button>
                      )}
                      <div className="flex items-center gap-1 mb-2">
                        <Star className="h-3 w-3 fill-gold text-gold" />
                        <span className="text-xs">{plant.rating}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="font-bold text-sm">${plant.price.toFixed(2)}</span>
                          <p className="text-[10px] text-muted-foreground">៛{Math.round(plant.price * 4100).toLocaleString()}</p>
                        </div>
                        <Button size="sm" className="h-7 px-2 bg-accent-green hover:bg-forest-mid text-white" onClick={(e: React.MouseEvent<HTMLButtonElement>) => handleAddToCart(e, plant)}>
                          <ShoppingCart className="h-3 w-3" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
