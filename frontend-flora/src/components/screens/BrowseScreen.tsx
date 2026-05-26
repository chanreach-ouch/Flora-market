'use client';

import { useState } from 'react';
import { useAppStore } from '@/lib/store';
import { t } from '@/lib/i18n';
import { plants, categories, plantEmojis, getPlantsByCategory, getSellerById } from '@/lib/data';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Search, Heart, ShoppingCart, Star, MapPin, SlidersHorizontal, X } from 'lucide-react';

export default function BrowseScreen() {
  const { locale, selectPlant, selectSeller, addToCart, addToWishlist, removeFromWishlist, isInWishlist } = useAppStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [priceRange, setPriceRange] = useState([0, 50]);
  const [sortBy, setSortBy] = useState<'name' | 'price-low' | 'price-high' | 'rating'>('name');
  const [showFilters, setShowFilters] = useState(false);

  let filtered = getPlantsByCategory(selectedCategory).filter(p => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return p.nameEn.toLowerCase().includes(q) || p.nameKh.includes(q);
  }).filter(p => p.price >= priceRange[0] && p.price <= priceRange[1]);

  // Sort
  if (sortBy === 'price-low') filtered.sort((a, b) => a.price - b.price);
  else if (sortBy === 'price-high') filtered.sort((a, b) => b.price - a.price);
  else if (sortBy === 'rating') filtered.sort((a, b) => b.rating - a.rating);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">{t(locale, 'browse')}</h1>
        <Button variant="outline" size="sm" onClick={() => setShowFilters(!showFilters)} className="gap-2">
          <SlidersHorizontal className="h-4 w-4" />
          {locale === 'kh' ? 'តម្រង' : 'Filters'}
        </Button>
      </div>

      <div className="flex gap-6">
        {/* Filters Sidebar - Desktop */}
        <aside className={`${showFilters ? 'block' : 'hidden'} lg:block w-full lg:w-64 shrink-0 mb-6 lg:mb-0`}>
          <Card>
            <CardContent className="p-4 space-y-5">
              {/* Search */}
              <div>
                <label className="text-sm font-medium mb-2 block">{t(locale, 'searchPlaceholder')}</label>
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

              {/* Category */}
              <div>
                <label className="text-sm font-medium mb-2 block">{locale === 'kh' ? 'ប្រភេទ' : 'Category'}</label>
                <div className="flex flex-wrap gap-2">
                  {categories.map(cat => (
                    <Button
                      key={cat}
                      variant={selectedCategory === cat ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedCategory(cat)}
                      className="text-xs"
                    >
                      {plantEmojis[cat] && <span className="mr-1">{plantEmojis[cat]}</span>}
                      {locale === 'kh' ? cat : cat}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div>
                <label className="text-sm font-medium mb-2 block">
                  {locale === 'kh' ? 'តម្លៃ' : 'Price Range'}: ${priceRange[0]} - ${priceRange[1]}
                </label>
                <Slider
                  value={priceRange}
                  onValueChange={setPriceRange}
                  max={50}
                  step={1}
                  className="mt-2"
                />
              </div>

              {/* Sort */}
              <div>
                <label className="text-sm font-medium mb-2 block">{locale === 'kh' ? 'តម្រៀប' : 'Sort By'}</label>
                <div className="space-y-1">
                  {[
                    { value: 'name' as const, label: locale === 'kh' ? 'ឈ្មោះ' : 'Name' },
                    { value: 'price-low' as const, label: locale === 'kh' ? 'តម្លៃទាប' : 'Price: Low to High' },
                    { value: 'price-high' as const, label: locale === 'kh' ? 'តម្លៃខ្ពស់' : 'Price: High to Low' },
                    { value: 'rating' as const, label: locale === 'kh' ? 'ការវាយតម្លៃ' : 'Rating' },
                  ].map(opt => (
                    <button
                      key={opt.value}
                      onClick={() => setSortBy(opt.value)}
                      className={`w-full text-left text-sm px-3 py-1.5 rounded-md transition-flora ${
                        sortBy === opt.value ? 'bg-pale-green dark:bg-forest-mid font-medium' : 'hover:bg-muted'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </aside>

        {/* Product Grid */}
        <div className="flex-1">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm text-muted-foreground">
              {filtered.length} {locale === 'kh' ? 'រុក្ខជាតិ' : 'plants'}
            </span>
            {/* Active filters */}
            {(selectedCategory !== 'All' || searchQuery) && (
              <div className="flex gap-2">
                {selectedCategory !== 'All' && (
                  <Badge variant="secondary" className="gap-1">
                    {selectedCategory}
                    <X className="h-3 w-3 cursor-pointer" onClick={() => setSelectedCategory('All')} />
                  </Badge>
                )}
                {searchQuery && (
                  <Badge variant="secondary" className="gap-1">
                    &quot;{searchQuery}&quot;
                    <X className="h-3 w-3 cursor-pointer" onClick={() => setSearchQuery('')} />
                  </Badge>
                )}
              </div>
            )}
          </div>

          {filtered.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">
              <p className="text-4xl mb-4">🔍</p>
              <p>{locale === 'kh' ? 'រកមិនឃើញរុក្ខជាតិ' : 'No plants found matching your filters'}</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filtered.map(plant => {
                const seller = getSellerById(plant.sellerId);
                const wishlisted = isInWishlist(plant.id);
                return (
                  <Card key={plant.id} className="group card-shadow card-shadow-hover transition-flora overflow-hidden cursor-pointer">
                    <div className="relative" onClick={() => selectPlant(plant.id)}>
                      <div className="aspect-square bg-gradient-to-br from-pale-green to-cream dark:from-forest-mid/30 dark:to-forest/30 flex items-center justify-center">
                        <span className="text-5xl opacity-80 group-hover:scale-110 transition-transform">
                          {plantEmojis[plant.category] || '🌿'}
                        </span>
                      </div>
                      <button
                        onClick={(e) => { e.stopPropagation(); wishlisted ? removeFromWishlist(plant.id) : addToWishlist(plant.id); }}
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
                      <div className="flex items-center justify-between gap-3 w-full mt-1">
                        <div className="flex flex-col min-w-0">
                          <span className="text-lg font-black text-[#0F3738] leading-none">${plant.price.toFixed(2)}</span>
                          <span className="text-[11px] text-slate-400 font-bold mt-1">៛{Math.round(plant.price * 4100).toLocaleString()}</span>
                        </div>
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
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
