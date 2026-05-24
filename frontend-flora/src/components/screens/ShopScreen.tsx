'use client';

import { useState } from 'react';
import { useAppStore } from '@/lib/store';
import { t } from '@/lib/i18n';
import { getSellerById, getPlantsBySeller, getReviewsBySeller, plantEmojis } from '@/lib/data';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Star, MapPin, ShoppingCart, Heart, Calendar, CheckCircle, ArrowLeft } from 'lucide-react';

export default function ShopScreen() {
  const { selectedSellerId, locale, userRole, goBack, selectPlant, addToCart, addToWishlist, removeFromWishlist, isInWishlist } = useAppStore();
  const seller = getSellerById(selectedSellerId || 'seller-1');
  const [activeTab, setActiveTab] = useState<'plants' | 'reviews' | 'about'>('plants');

  if (!seller) return null;

  const sellerPlants = getPlantsBySeller(seller.id);
  const sellerReviews = getReviewsBySeller(seller.id);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
      <Button variant="ghost" size="sm" onClick={goBack} className="gap-2 mb-6">
        <ArrowLeft className="h-4 w-4" />
        {locale === 'kh' ? 'ត្រឡប់' : 'Back'}
      </Button>

      {/* Cover & Profile */}
      <div className="relative mb-6">
        <div className="h-48 sm:h-64 rounded-2xl bg-gradient-to-r from-forest via-forest-mid to-accent-green overflow-hidden">
          <div className="absolute inset-0 opacity-20 flex items-center justify-center">
            <span className="text-[120px]">🌳</span>
          </div>
        </div>
        <div className="absolute -bottom-8 left-6 flex items-end gap-4">
          <div className="h-20 w-20 sm:h-24 sm:w-24 rounded-2xl bg-white dark:bg-card border-4 border-background flex items-center justify-center text-4xl card-shadow">
            🏪
          </div>
          <div className="mb-2">
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold">{seller.nurseryName}</h1>
              {seller.isVerified && (
                <Badge className="bg-accent-green text-white gap-1">
                  <CheckCircle className="h-3 w-3" /> {t(locale, 'verified')}
                </Badge>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Stats Row */}
      <div className="flex flex-wrap gap-4 sm:gap-8 mt-12 sm:mt-10 mb-6">
        <div className="flex items-center gap-1.5">
          <Star className="h-4 w-4 fill-gold text-gold" />
          <span className="font-semibold">{seller.rating}</span>
          <span className="text-sm text-muted-foreground">{t(locale, 'rating')}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          <span className="font-semibold">{seller.totalOrders}</span>
          <span className="text-sm text-muted-foreground">{t(locale, 'orders')}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-sm">🌱</span>
          <span className="font-semibold">{seller.totalPlants}</span>
          <span className="text-sm text-muted-foreground">{t(locale, 'plants')}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">{t(locale, 'joined')} {seller.yearJoined}</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b mb-6">
        {(['plants', 'reviews', 'about'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-flora ${
              activeTab === tab
                ? 'border-accent-green text-foreground'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            {tab === 'plants' ? t(locale, 'plants') : tab === 'reviews' ? t(locale, 'reviews') : t(locale, 'about')}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'plants' && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {sellerPlants.map(plant => {
            const wishlisted = isInWishlist(plant.id);
            return (
              <Card key={plant.id} className="group card-shadow card-shadow-hover transition-flora overflow-hidden cursor-pointer">
                <div className="relative" onClick={() => selectPlant(plant.id)}>
                  <div className="aspect-square bg-gradient-to-br from-pale-green to-cream dark:from-forest-mid/30 dark:to-forest/30 flex items-center justify-center">
                    <span className="text-5xl opacity-80 group-hover:scale-110 transition-transform">
                      {plantEmojis[plant.category] || '🌿'}
                    </span>
                  </div>
                  {userRole !== 'seller' && (
                    <button
                      onClick={(e) => { e.stopPropagation(); wishlisted ? removeFromWishlist(plant.id) : addToWishlist(plant.id); }}
                      className="absolute top-2 right-2 h-8 w-8 rounded-full bg-white/80 dark:bg-forest/80 flex items-center justify-center"
                    >
                      <Heart className={`h-4 w-4 ${wishlisted ? 'fill-red-500 text-red-500' : 'text-muted-foreground'}`} />
                    </button>
                  )}
                </div>
                <CardContent className="p-3">
                  <h3 className="font-semibold text-sm line-clamp-1">{locale === 'kh' ? plant.nameKh : plant.nameEn}</h3>
                  <div className="flex items-center gap-1 my-1">
                    <Star className="h-3 w-3 fill-gold text-gold" />
                    <span className="text-xs">{plant.rating}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-bold">${plant.price.toFixed(2)}</span>
                    <Button size="sm" className="h-7 px-2 bg-accent-green hover:bg-forest-mid text-white" onClick={(e) => { e.stopPropagation(); addToCart(plant.id); }}>
                      <ShoppingCart className="h-3 w-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {activeTab === 'reviews' && (
        <div className="space-y-4 max-w-2xl">
          {sellerReviews.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">{locale === 'kh' ? 'មិនមានការពិនិត្យ' : 'No reviews yet'}</p>
          ) : sellerReviews.map(review => (
            <Card key={review.id}>
              <CardContent className="p-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="h-9 w-9 rounded-full bg-pale-green dark:bg-forest-mid flex items-center justify-center text-sm font-medium">
                    {review.buyerName.charAt(0)}
                  </div>
                  <div>
                    <p className="font-medium text-sm">{review.buyerName}</p>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: review.rating }).map((_, i) => (
                        <Star key={i} className="h-3 w-3 fill-gold text-gold" />
                      ))}
                    </div>
                  </div>
                  <span className="text-xs text-muted-foreground ml-auto">{review.date}</span>
                </div>
                <p className="text-sm text-muted-foreground">{locale === 'kh' ? review.commentKh : review.comment}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {activeTab === 'about' && (
        <div className="max-w-2xl space-y-6">
          <div>
            <h3 className="font-semibold mb-2">{t(locale, 'about')}</h3>
            <p className="text-muted-foreground">{locale === 'kh' ? seller.descriptionKh : seller.description}</p>
          </div>
          <div>
            <h3 className="font-semibold mb-2">{locale === 'kh' ? 'ទីតាំង' : 'Location'}</h3>
            <p className="text-muted-foreground flex items-center gap-2">
              <MapPin className="h-4 w-4" /> {seller.location}, {seller.district}, {seller.city}
            </p>
          </div>
          <div>
            <h3 className="font-semibold mb-2">{locale === 'kh' ? 'ជំនាញ' : 'Specialties'}</h3>
            <div className="flex flex-wrap gap-2">
              {(locale === 'kh' ? seller.specialtiesKh : seller.specialties).map((s: string, i: number) => (
                <Badge key={i} variant="secondary">{s}</Badge>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
