'use client';

import { useState } from 'react';
import { useAppStore } from '@/lib/store';
import { t } from '@/lib/i18n';
import { plants, categories, plantEmojis, getPlantById, getSellerById, getNewArrivals, getPlantsByCategory } from '@/lib/data';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Search, Heart, ShoppingCart, Star, MapPin } from 'lucide-react';

export default function HomeScreen() {
  const { locale, selectPlant, selectSeller, addToCart, addToWishlist, removeFromWishlist, isInWishlist, setScreen, realPlants } = useAppStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Use real data if available, otherwise fallback to mock data
  const dataToUse = realPlants && realPlants.length > 0 ? realPlants : plants;
  
  const filteredPlants = dataToUse.filter(p => {
    if (selectedCategory !== 'All' && p.category !== selectedCategory) return false;
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    const nameEn = p.name_en || p.nameEn || '';
    const nameKh = p.name_kh || p.nameKh || '';
    const tagline = p.tagline || '';
    return nameEn.toLowerCase().includes(q) || nameKh.includes(q) || (tagline && tagline.toLowerCase().includes(q));
  });

  const newArrivals = dataToUse.filter(p => p.is_new || p.isNew).slice(0, 4);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
      {/* Hero Section */}
      <div className="mb-8 sm:mb-12">
        <h1 className="text-3xl sm:text-4xl font-bold mb-2" style={{ fontFamily: 'Playfair Display, serif' }}>
          {t(locale, 'greeting')} 👋
        </h1>
        <p className="text-lg text-muted-foreground mb-6">{t(locale, 'headline')}</p>

        {/* Search Bar */}
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
        {categories.map(cat => (
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
        ))}
      </div>

      {/* New Arrivals */}
      {selectedCategory === 'All' && !searchQuery && newArrivals.length > 0 && (
        <div className="mb-10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">{t(locale, 'newArrivals')}</h2>
            <Button variant="ghost" size="sm" onClick={() => setSelectedCategory('All')}>
              {t(locale, 'viewAll')} →
            </Button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {newArrivals.map(plant => (
              <PlantCard key={plant.id} plant={plant} />
            ))}
          </div>
        </div>
      )}

      {/* All Plants */}
      <div>
        <h2 className="text-xl font-bold mb-4">{t(locale, 'allPlants')}</h2>
        {filteredPlants.length === 0 ? (
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

function PlantCard({ plant }: { plant: any }) {
  const { locale, selectPlant, selectSeller, addToCart, addToWishlist, removeFromWishlist, isInWishlist } = useAppStore();
  const sellerId = plant.seller_id || plant.sellerId;
  const seller = getSellerById(sellerId);
  const wishlisted = isInWishlist(plant.id);
  const nameEn = plant.name_en || plant.nameEn;
  const nameKh = plant.name_kh || plant.nameKh;

  return (
    <Card className="group card-shadow card-shadow-hover transition-flora overflow-hidden cursor-pointer">
      <div className="relative" onClick={() => selectPlant(plant.id)}>
        {/* Image Placeholder */}
        <div className="aspect-square bg-gradient-to-br from-pale-green to-cream dark:from-forest-mid/30 dark:to-forest/30 flex items-center justify-center">
          <span className="text-5xl sm:text-6xl opacity-80 group-hover:scale-110 transition-transform">
            {plantEmojis[plant.category] || '🌿'}
          </span>
        </div>

        {/* Wishlist Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            wishlisted ? removeFromWishlist(plant.id) : addToWishlist(plant.id);
          }}
          className="absolute top-2 right-2 h-8 w-8 rounded-full bg-white/80 dark:bg-forest/80 flex items-center justify-center shadow-sm hover:scale-110 transition-transform"
        >
          <Heart className={`h-4 w-4 ${wishlisted ? 'fill-red-500 text-red-500' : 'text-muted-foreground'}`} />
        </button>

        {/* New Badge */}
        {(plant.isNew || plant.is_new) && (
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
          {locale === 'kh' ? nameKh : nameEn}
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

        <div className="flex items-center justify-between">
          <div>
            <span className="font-bold text-sm sm:text-base">${plant.price.toFixed(2)}</span>
            <span className="text-xs text-muted-foreground ml-1">៛{Math.round(plant.price * 4100).toLocaleString()}</span>
          </div>
          <Button
            size="sm"
            className="h-8 px-3 bg-accent-green hover:bg-forest-mid text-white"
            onClick={(e) => { e.stopPropagation(); addToCart(plant.id); }}
          >
            <ShoppingCart className="h-3.5 w-3.5 sm:mr-1" />
            <span className="hidden sm:inline">{t(locale, 'addToCart')}</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
