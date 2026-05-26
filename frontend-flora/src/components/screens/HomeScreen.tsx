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
  const { locale, selectPlant, selectSeller, addToCart, addToWishlist, removeFromWishlist, isInWishlist, setScreen } = useAppStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const filteredPlants = getPlantsByCategory(selectedCategory).filter(p => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return p.nameEn.toLowerCase().includes(q) || p.nameKh.includes(q) || p.tagline.toLowerCase().includes(q);
  });

  const newArrivals = getNewArrivals();

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
  const seller = getSellerById(plant.sellerId);
  const wishlisted = isInWishlist(plant.id);

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
          {/* Price Wrapper */}
          <div className="flex flex-col min-w-0">
            <span className="text-lg font-black text-[#0F3738] leading-none">${plant.price.toFixed(2)}</span>
            <span className="text-[11px] text-slate-400 font-bold mt-1">៛{Math.round(plant.price * 4100).toLocaleString()}</span>
          </div>

          {/* Symmetrical & Safe Button */}
          <button 
            className="bg-[#42AB7F] text-white font-extrabold px-3 py-2.5 sm:px-4 sm:py-3 rounded-2xl flex items-center justify-center gap-1.5 text-xs shrink-0 hover:bg-[#348e68] transition-colors"
            onClick={(e) => { e.stopPropagation(); addToCart(plant.id); }}
          >
            <ShoppingCart className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">{t(locale, 'addToCart')}</span>
          </button>
        </div>
      </CardContent>
    </Card>
  );
}
