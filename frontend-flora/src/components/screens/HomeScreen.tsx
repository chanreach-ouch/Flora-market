'use client';

import { useState, useEffect } from 'react';
import { useAppStore } from '@/lib/store';
import { t } from '@/lib/i18n';
import { plants as mockPlants, plantEmojis, getSellerById } from '@/lib/data';
import type { MockPlant } from '@/lib/data';
import { apiFetchPlants, apiFetchSellerById } from '@/lib/api';
import { showToast } from '@/components/ui/toast-custom';
import { PlantImage, categoryStyles, DEFAULT_STYLE } from '@/components/ui/plant-image';
import { triggerFly } from '@/lib/fly-animation';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Search, Heart, ShoppingCart, Star, MapPin } from 'lucide-react';

function PlantCardSkeleton() {
  return (
    <div className="rounded-2xl overflow-hidden border bg-card">
      <Skeleton className="aspect-square w-full" />
      <div className="p-3 sm:p-4 space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
        <Skeleton className="h-3 w-1/3" />
        <div className="flex items-center justify-between pt-1">
          <Skeleton className="h-5 w-16" />
          <Skeleton className="h-8 w-20 rounded-lg" />
        </div>
      </div>
    </div>
  );
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

  // Dynamic categories from loaded plants
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
      {/* Hero Section */}
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
              <PlantCard key={plant.id} plant={plant} />
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
              <PlantCard key={plant.id} plant={plant} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function PlantCard({ plant }: { plant: MockPlant }) {
  const { locale, selectPlant, selectSeller, addToCart, addToWishlist, removeFromWishlist, isInWishlist } = useAppStore();
  const [seller, setSeller] = useState(getSellerById(plant.sellerId) || null);
  const wishlisted = isInWishlist(plant.id);

  useEffect(() => {
    if (!getSellerById(plant.sellerId)) {
      apiFetchSellerById(plant.sellerId).then(setSeller).catch(() => {});
    }
  }, [plant.sellerId]);

  const { emoji, gradient } = categoryStyles[plant.category] || DEFAULT_STYLE;

  const handleAddToCart = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    triggerFly(e.currentTarget, 'cart', emoji, gradient);
    addToCart(plant.id);
    showToast('success', locale === 'kh' ? 'បានបន្ថែមទៅរទោះ' : `${plant.nameEn} added to cart`);
  };

  const handleWishlist = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    if (!wishlisted) {
      triggerFly(e.currentTarget, 'wishlist', emoji, gradient);
      addToWishlist(plant.id);
    } else {
      removeFromWishlist(plant.id);
    }
  };

  return (
    <Card className="group card-shadow card-shadow-hover transition-flora overflow-hidden cursor-pointer">
      <div className="relative aspect-square overflow-hidden" onClick={() => selectPlant(plant.id)}>
        <PlantImage
          images={plant.images}
          category={plant.category}
          alt={plant.nameEn}
          className="w-full h-full"
          emojiSize="text-5xl sm:text-6xl"
        />

        <button
          onClick={handleWishlist}
          className="absolute top-2 right-2 h-8 w-8 rounded-full bg-white/80 dark:bg-forest/80 flex items-center justify-center shadow-sm hover:scale-110 transition-transform"
        >
          <Heart className={`h-4 w-4 ${wishlisted ? 'fill-red-500 text-red-500' : 'text-muted-foreground'}`} />
        </button>

        {plant.isNew && (
          <Badge className="absolute top-2 left-2 bg-accent-green text-white text-[10px]">
            {t(locale, 'newArrivals')}
          </Badge>
        )}
      </div>

      <CardContent className="p-3 sm:p-4">
        <h3
          className="font-semibold text-sm sm:text-base mb-1 line-clamp-1 cursor-pointer hover:text-accent-green transition-colors"
          onClick={() => selectPlant(plant.id)}
        >
          {locale === 'kh' ? plant.nameKh : plant.nameEn}
        </h3>

        <p className="text-xs text-muted-foreground mb-2 line-clamp-1">
          {locale === 'kh' ? plant.taglineKh : plant.tagline}
        </p>

        {seller && (
          <button
            onClick={() => selectSeller(seller.id)}
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-accent-green transition-colors mb-2"
          >
            <MapPin className="h-3 w-3" />
            <span className="truncate">{seller.nurseryName}</span>
          </button>
        )}

        <div className="flex items-center gap-1 mb-3">
          <Star className="h-3.5 w-3.5 fill-gold text-gold" />
          <span className="text-xs font-medium">{plant.rating}</span>
          <span className="text-xs text-muted-foreground">({plant.reviewCount})</span>
          <span className="text-xs text-muted-foreground ml-auto">
            {plant.stock > 0 ? `${plant.stock} ${t(locale, 'inStock')}` : t(locale, 'outOfStock')}
          </span>
        </div>

        <div className="flex items-center justify-between gap-3 w-full mt-1">
          <div className="flex flex-col min-w-0">
            <span className="font-bold text-sm sm:text-base leading-none">${plant.price.toFixed(2)}</span>
            <span className="text-xs text-muted-foreground mt-0.5">៛{Math.round(plant.price * 4100).toLocaleString()}</span>
          </div>
          <Button
            size="sm"
            className="h-8 px-3 bg-accent-green hover:bg-forest-mid text-white shrink-0"
            onClick={handleAddToCart}
          >
            <ShoppingCart className="h-3.5 w-3.5 sm:mr-1" />
            <span className="hidden sm:inline">{t(locale, 'addToCart')}</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
