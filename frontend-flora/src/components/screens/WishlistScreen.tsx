'use client';

import { useAppStore } from '@/lib/store';
import { t } from '@/lib/i18n';
import { getPlantById, getSellerById, plantEmojis } from '@/lib/data';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Heart, ShoppingCart, Star, Trash2, ArrowLeft } from 'lucide-react';

export default function WishlistScreen() {
  const { locale, goBack, wishlistItems, removeFromWishlist, addToCart, selectPlant, userRole } = useAppStore();

  const wishlistPlants = wishlistItems.map(id => getPlantById(id)).filter(Boolean);

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
            const seller = getSellerById(plant.sellerId);
            return (
              <Card key={plant.id} className="group card-shadow card-shadow-hover transition-flora overflow-hidden cursor-pointer">
                <div className="relative" onClick={() => selectPlant(plant.id)}>
                  <div className="aspect-square bg-gradient-to-br from-pale-green to-cream dark:from-forest-mid/30 dark:to-forest/30 flex items-center justify-center">
                    <span className="text-5xl opacity-80 group-hover:scale-110 transition-transform">
                      {plantEmojis[plant.category] || '🌿'}
                    </span>
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
                  <div className="flex items-center justify-between gap-3 w-full mt-1">
                    <div className="flex flex-col min-w-0">
                      <span className="text-lg font-black text-[#0F3738] leading-none">${plant.price.toFixed(2)}</span>
                      <span className="text-[11px] text-slate-400 font-bold mt-1">៛{Math.round(plant.price * 4100).toLocaleString()}</span>
                    </div>
                    <div className="flex gap-1 shrink-0">
                      <button 
                        className="bg-[#42AB7F] text-white font-extrabold px-3 py-2.5 rounded-2xl flex items-center justify-center gap-1.5 text-xs hover:bg-[#348e68] transition-colors"
                        onClick={(e) => { e.stopPropagation(); addToCart(plant.id); }}
                      >
                        <ShoppingCart className="h-4 w-4" />
                        <span className="hidden sm:inline">{t(locale, 'addToCart')}</span>
                      </button>
                      <button 
                        className="bg-red-50 text-red-500 hover:bg-red-100 font-extrabold px-3 py-2.5 rounded-2xl flex items-center justify-center text-xs transition-colors"
                        onClick={(e) => { e.stopPropagation(); removeFromWishlist(plant.id); }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
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
