'use client';

import { useAppStore } from '@/lib/store';
import { t } from '@/lib/i18n';
import { getPlantById, getSellerById, getReviewsByPlant, plantEmojis } from '@/lib/data';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Heart, ShoppingCart, Star, MapPin, Droplets, Sun, Thermometer, Gauge, Truck, Check, X as XIcon } from 'lucide-react';

export default function PlantDetailScreen() {
  const { selectedPlantId, locale, goBack, selectSeller, addToCart, addToWishlist, removeFromWishlist, isInWishlist } = useAppStore();
  const plant = getPlantById(selectedPlantId || 'plant-1');
  if (!plant) return null;

  const seller = getSellerById(plant.sellerId);
  const reviews = getReviewsByPlant(plant.id);
  const wishlisted = isInWishlist(plant.id);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
      {/* Back Button */}
      <Button variant="ghost" size="sm" onClick={goBack} className="gap-2 mb-6">
        <ArrowLeft className="h-4 w-4" />
        {locale === 'kh' ? 'ត្រឡប់' : 'Back'}
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
        {/* Left - Images */}
        <div>
          <div className="aspect-square rounded-2xl bg-gradient-to-br from-pale-green to-cream dark:from-forest-mid/30 dark:to-forest/30 flex items-center justify-center card-shadow">
            <span className="text-[120px] sm:text-[160px] opacity-70">
              {plantEmojis[plant.category] || '🌿'}
            </span>
          </div>
        </div>

        {/* Right - Details */}
        <div>
          <div className="flex items-start justify-between mb-2">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold mb-1">
                {locale === 'kh' ? plant.nameKh : plant.nameEn}
              </h1>
              <p className="text-muted-foreground">{locale === 'kh' ? plant.taglineKh : plant.tagline}</p>
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={() => wishlisted ? removeFromWishlist(plant.id) : addToWishlist(plant.id)}
              className="shrink-0"
            >
              <Heart className={`h-5 w-5 ${wishlisted ? 'fill-red-500 text-red-500' : ''}`} />
            </Button>
          </div>

          {/* Rating & Stats */}
          <div className="flex items-center gap-4 mb-6">
            <div className="flex items-center gap-1">
              <Star className="h-5 w-5 fill-gold text-gold" />
              <span className="font-semibold">{plant.rating}</span>
              <span className="text-sm text-muted-foreground">({plant.reviewCount} {t(locale, 'reviews').toLowerCase()})</span>
            </div>
            <Badge variant="secondary">{plant.totalSold} {t(locale, 'sold')}</Badge>
            {plant.isNew && <Badge className="bg-accent-green text-white">{t(locale, 'newArrivals')}</Badge>}
          </div>

          {/* Price */}
          <div className="mb-6">
            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-bold text-forest dark:text-accent-green">${plant.price.toFixed(2)}</span>
              <span className="text-lg text-muted-foreground">៛{Math.round(plant.price * 4100).toLocaleString()}</span>
            </div>
            <div className="flex items-center gap-2 mt-1 text-sm">
              <Badge variant="outline" className="text-accent-green border-accent-green">{t(locale, 'fixedPrice')}</Badge>
              <Badge variant="outline" className="text-accent-green border-accent-green">{t(locale, 'noNegotiation')}</Badge>
            </div>
          </div>

          {/* Stock */}
          <div className="mb-6">
            {plant.stock > 0 ? (
              <Badge variant="secondary" className="bg-accent-green/10 text-accent-green">
                {plant.stock} {t(locale, 'inStock')}
              </Badge>
            ) : (
              <Badge variant="destructive">{t(locale, 'outOfStock')}</Badge>
            )}
          </div>

          {/* Add to Cart */}
          <Button
            className="w-full h-12 text-base bg-accent-green hover:bg-forest-mid text-white mb-4"
            onClick={() => addToCart(plant.id)}
            disabled={plant.stock === 0}
          >
            <ShoppingCart className="h-5 w-5 mr-2" />
            {t(locale, 'addToCart')}
          </Button>

          {/* Delivery */}
          <Card className="mb-6">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <Truck className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-sm">{t(locale, 'delivery')}</p>
                  <p className="text-sm text-muted-foreground">{t(locale, 'deliveryNote')}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Seller Info */}
          {seller && (
            <Card className="mb-6 cursor-pointer hover:shadow-md transition-shadow" onClick={() => selectSeller(seller.id)}>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full bg-pale-green dark:bg-forest-mid flex items-center justify-center text-2xl">
                    🏪
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{seller.nurseryName}</span>
                      {seller.isVerified && (
                        <Badge variant="secondary" className="bg-accent-green/10 text-accent-green text-[10px]">✓ {t(locale, 'verified')}</Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1"><Star className="h-3 w-3 fill-gold text-gold" />{seller.rating}</span>
                      <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{seller.district}</span>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm">{t(locale, 'viewShop')} →</Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Pros & Cons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            <Card>
              <CardContent className="p-4">
                <h3 className="font-semibold mb-3 text-accent-green flex items-center gap-2">
                  <Check className="h-4 w-4" /> {t(locale, 'pros')}
                </h3>
                <ul className="space-y-2">
                  {(locale === 'kh' ? plant.prosKh : plant.pros).map((pro: string, i: number) => (
                    <li key={i} className="text-sm flex items-start gap-2">
                      <span className="text-accent-green shrink-0">+</span>
                      <span>{pro}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <h3 className="font-semibold mb-3 text-destructive flex items-center gap-2">
                  <XIcon className="h-4 w-4" /> {t(locale, 'cons')}
                </h3>
                <ul className="space-y-2">
                  {(locale === 'kh' ? plant.consKh : plant.cons).map((con: string, i: number) => (
                    <li key={i} className="text-sm flex items-start gap-2">
                      <span className="text-destructive shrink-0">-</span>
                      <span>{con}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* Care Guide */}
          <Card className="mb-6">
            <CardContent className="p-4">
              <h3 className="font-semibold mb-4">{t(locale, 'careGuide')}</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                    <Droplets className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">{t(locale, 'water')}</p>
                    <p className="text-sm font-medium">{locale === 'kh' ? plant.waterFreqKh : plant.waterFreq}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center">
                    <Sun className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">{t(locale, 'light')}</p>
                    <p className="text-sm font-medium">{locale === 'kh' ? plant.lightReqKh : plant.lightReq}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                    <Thermometer className="h-5 w-5 text-red-600 dark:text-red-400" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">{t(locale, 'temperature')}</p>
                    <p className="text-sm font-medium">{plant.tempRange}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                    <Gauge className="h-5 w-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">{t(locale, 'difficulty')}</p>
                    <p className="text-sm font-medium">{locale === 'kh' ? plant.difficultyKh : plant.difficulty}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Reviews */}
          {reviews.length > 0 && (
            <div>
              <h3 className="font-semibold mb-4">{t(locale, 'reviews')} ({reviews.length})</h3>
              <div className="space-y-3">
                {reviews.map(review => (
                  <Card key={review.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="h-8 w-8 rounded-full bg-pale-green dark:bg-forest-mid flex items-center justify-center text-sm">
                          {review.buyerName.charAt(0)}
                        </div>
                        <span className="font-medium text-sm">{review.buyerName}</span>
                        <div className="flex items-center gap-0.5 ml-auto">
                          {Array.from({ length: review.rating }).map((_, i) => (
                            <Star key={i} className="h-3 w-3 fill-gold text-gold" />
                          ))}
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground">{locale === 'kh' ? review.commentKh : review.comment}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
