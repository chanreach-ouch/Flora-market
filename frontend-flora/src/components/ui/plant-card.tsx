'use client';

import { useAppStore } from '@/lib/store';
import { t } from '@/lib/i18n';
import type { MockPlant, MockSeller } from '@/lib/data';
import { PlantImage, categoryStyles, DEFAULT_STYLE } from '@/components/ui/plant-image';
import { triggerFly } from '@/lib/fly-animation';
import { showToast } from '@/components/ui/toast-custom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Heart, ShoppingCart, Star, MapPin } from 'lucide-react';

// ─── Difficulty indicator ────────────────────────────────────────────────────
function DifficultyDot({ difficulty }: { difficulty: string }) {
  const d = difficulty.toLowerCase();
  const isEasy = d.includes('easy') || d.includes('ងាយ');
  const isHard = d.includes('hard') || d.includes('ពិបាក');
  const cfg = isEasy
    ? { dot: 'bg-emerald-500', label: 'Easy' }
    : isHard
    ? { dot: 'bg-red-500',     label: 'Hard' }
    : { dot: 'bg-amber-500',   label: 'Medium' };

  return (
    <div className="flex items-center gap-1">
      <span className={`w-2 h-2 rounded-full shrink-0 ${cfg.dot}`} />
      <span className="text-[10px] text-muted-foreground">{cfg.label}</span>
    </div>
  );
}

// ─── Stock indicator ─────────────────────────────────────────────────────────
function StockLabel({ stock, locale }: { stock: number; locale: string }) {
  if (stock === 0) return null;
  if (stock <= 5) {
    return (
      <span className="text-[10px] font-semibold text-amber-500">
        {locale === 'kh' ? `នៅ ${stock} ទៀត!` : `Only ${stock} left!`}
      </span>
    );
  }
  return (
    <span className="text-[10px] text-muted-foreground">
      {locale === 'kh' ? `${stock} ក្នុងស្តុក` : `${stock} in stock`}
    </span>
  );
}

// ─── Shared PlantCard ────────────────────────────────────────────────────────
interface PlantCardProps {
  plant: MockPlant;
  seller?: MockSeller | null;
}

export function PlantCard({ plant, seller }: PlantCardProps) {
  const { locale, selectPlant, selectSeller, addToCart, addToWishlist, removeFromWishlist, isInWishlist } = useAppStore();
  const wishlisted = isInWishlist(plant.id);
  const outOfStock = plant.stock === 0;
  const { emoji, gradient } = categoryStyles[plant.category] || DEFAULT_STYLE;

  const handleAddToCart = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    if (outOfStock) return;
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
    <Card className="group card-shadow card-shadow-hover transition-flora overflow-hidden cursor-pointer rounded-2xl border-border/60">

      {/* ── Image area ────────────────────────────────── */}
      <div
        className="relative aspect-square overflow-hidden"
        onClick={() => selectPlant(plant.id)}
      >
        {/* Plant image — zooms on card hover */}
        <PlantImage
          images={plant.images}
          category={plant.category}
          alt={plant.nameEn}
          className="w-full h-full transition-transform duration-500 group-hover:scale-105"
          emojiSize="text-5xl sm:text-6xl"
        />

        {/* Bottom gradient fade into card */}
        <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/35 to-transparent pointer-events-none" />

        {/* Out-of-stock overlay */}
        {outOfStock && (
          <div className="absolute inset-0 bg-black/55 flex items-center justify-center">
            <span className="text-white text-xs font-bold tracking-widest uppercase px-3 py-1.5 rounded-full bg-black/50 border border-white/20">
              {locale === 'kh' ? 'អស់ស្តុក' : 'Sold Out'}
            </span>
          </div>
        )}

        {/* NEW badge — gold so it pops over the green image */}
        {plant.isNew && !outOfStock && (
          <span className="absolute top-2 left-2 text-[10px] font-bold tracking-wide text-white bg-[#c9a84c] px-2 py-0.5 rounded-full shadow-sm">
            ✦ NEW
          </span>
        )}

        {/* Wishlist button */}
        <button
          onClick={handleWishlist}
          className="absolute top-2 right-2 h-8 w-8 rounded-full bg-white/90 dark:bg-black/60 backdrop-blur-sm flex items-center justify-center shadow-md hover:scale-110 active:scale-95 transition-transform"
        >
          <Heart className={`h-4 w-4 transition-colors ${wishlisted ? 'fill-red-500 text-red-500' : 'text-muted-foreground'}`} />
        </button>
      </div>

      {/* ── Card body ─────────────────────────────────── */}
      <CardContent className="p-3 sm:p-4 space-y-2">

        {/* Category pill + Difficulty */}
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-muted text-muted-foreground leading-tight">
            {plant.category}
          </span>
          <DifficultyDot difficulty={plant.difficulty} />
        </div>

        {/* Plant name */}
        <h3
          className="font-semibold text-sm sm:text-base leading-snug line-clamp-1 hover:text-accent-green transition-colors"
          onClick={() => selectPlant(plant.id)}
        >
          {locale === 'kh' ? plant.nameKh : plant.nameEn}
        </h3>

        {/* Tagline */}
        <p className="text-[11px] text-muted-foreground line-clamp-1 leading-relaxed">
          {locale === 'kh' ? plant.taglineKh : plant.tagline}
        </p>

        {/* Seller */}
        {seller && (
          <button
            onClick={(e) => { e.stopPropagation(); selectSeller(seller.id); }}
            className="flex items-center gap-1 text-[11px] text-muted-foreground hover:text-accent-green transition-colors"
          >
            <MapPin className="h-3 w-3 shrink-0" />
            <span className="truncate">{seller.nurseryName}</span>
          </button>
        )}

        {/* Rating + Stock */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <Star className="h-3.5 w-3.5 fill-gold text-gold shrink-0" />
            <span className="text-xs font-medium">{plant.rating}</span>
            <span className="text-[10px] text-muted-foreground">({plant.reviewCount})</span>
          </div>
          <StockLabel stock={plant.stock} locale={locale} />
        </div>

        {/* Price + CTA */}
        <div className="flex items-center justify-between gap-2 pt-1">
          <div className="min-w-0">
            <span className="font-bold text-sm sm:text-base leading-none">
              ${plant.price.toFixed(2)}
            </span>
            <p className="text-[10px] text-muted-foreground mt-0.5">
              ៛{Math.round(plant.price * 4100).toLocaleString()}
            </p>
          </div>

          <Button
            size="sm"
            disabled={outOfStock}
            onClick={handleAddToCart}
            className="h-8 px-3 bg-accent-green hover:bg-forest-mid text-white shrink-0 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            <ShoppingCart className="h-3.5 w-3.5 sm:mr-1.5" />
            <span className="hidden sm:inline text-xs font-medium">
              {outOfStock
                ? (locale === 'kh' ? 'អស់ស្តុក' : 'Sold Out')
                : t(locale, 'addToCart')}
            </span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
