'use client';

import { useEffect } from 'react';
import { useAppStore } from '@/lib/store';
import { t } from '@/lib/i18n';
import { plantEmojis } from '@/lib/data';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Heart, ShoppingCart, Star, Trash2, ArrowLeft } from 'lucide-react';

export default function WishlistScreen() {
  const { wishlistItems, removeFromWishlist, addToCart, selectPlant, locale, goBack, realPlants, fetchPlants, realSellers, fetchSellers } = useAppStore();

  useEffect(() => {
    fetchPlants();
    fetchSellers();
  }, [fetchPlants, fetchSellers]);

  const mappedPlants = realPlants.map(p => ({
    id: p.id,
    nameEn: p.name_en,
    nameKh: p.name_kh,
    category: p.category,
    price: p.price,
    sellerId: p.seller_id,
    images: p.images || [],
    tagline: p.tagline || p.name_en,
    rating: 4.5
  }));

  const wishlistPlants = wishlistItems.map(id => mappedPlants.find(p => p.id === id)).filter(Boolean);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
      <Button variant="ghost" size="sm" onClick={goBack} className="gap-2 mb-6">
        <ArrowLeft className="h-4 w-4" />
        {locale === 'kh' ? 'ត្រឡប់' : 'Back'}
      </Button>

      <h1 className="text-2xl font-bold mb-6">{t(locale, 'wishlistTitle')}</h1>

      {wishlistPlants.length === 0 ? (
        <div className="text-center py-16">
          <Heart className="h-16 w-16 mx-auto mb-4 text-muted-foreground/30" />
          <h2 className="text-xl font-semibold mb-2">{t(locale, 'noWishlistYet')}</h2>
          <p className="text-muted-foreground">{t(locale, 'noWishlistDesc')}</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {wishlistPlants.map(plant => {
            if (!plant) return null;
            const seller = realSellers?.find(s => s.id === plant.sellerId);
            return (
              <Card key={plant.id} className="group card-shadow card-shadow-hover transition-flora overflow-hidden cursor-pointer">
                <div className="relative" onClick={() => selectPlant(plant.id)}>
                  <div className="aspect-square bg-gradient-to-br from-pale-green to-cream dark:from-forest-mid/30 dark:to-forest/30 flex items-center justify-center">
                    {plant.images?.[0] ? (
                      <img src={plant.images[0]} alt={locale === 'kh' ? plant.nameKh : plant.nameEn} className="w-full h-full object-cover mix-blend-multiply" />
                    ) : (
                      <span className="text-5xl opacity-80 group-hover:scale-110 transition-transform">
                        {plantEmojis[plant.category] || '🌿'}
                      </span>
                    )}
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); removeFromWishlist(plant.id); }}
                    className="absolute top-2 right-2 h-8 w-8 rounded-full bg-white/80 dark:bg-forest/80 flex items-center justify-center"
                  >
                    <Heart className="h-4 w-4 fill-red-500 text-red-500" />
                  </button>
                </div>
                <CardContent className="p-3 sm:p-4">
                  <h3 className="font-semibold text-sm line-clamp-1">{locale === 'kh' ? plant.nameKh : plant.nameEn}</h3>
                  <div className="flex items-center gap-1 my-1">
                    <Star className="h-3 w-3 fill-gold text-gold" />
                    <span className="text-xs">{plant.rating}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm">${plant.price.toFixed(2)}</span>
                    <div className="flex gap-1">
                      <Button size="sm" className="h-7 px-2 bg-accent-green hover:bg-forest-mid text-white" onClick={(e) => { e.stopPropagation(); addToCart(plant.id); }}>
                        <ShoppingCart className="h-3 w-3" />
                      </Button>
                      <Button variant="ghost" size="sm" className="h-7 px-2 text-destructive" onClick={(e) => { e.stopPropagation(); removeFromWishlist(plant.id); }}>
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
