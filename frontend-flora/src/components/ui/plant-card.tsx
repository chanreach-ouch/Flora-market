'use client';

import { useState } from 'react';
import { useAppStore } from '@/lib/store';
import { t } from '@/lib/i18n';
import type { MockPlant, MockSeller } from '@/lib/data';
import { categoryStyles, DEFAULT_STYLE } from '@/components/ui/plant-image';
import { triggerFly } from '@/lib/fly-animation';
import { showToast } from '@/components/ui/toast-custom';
import { Card, CardContent } from '@/components/ui/card';
import { Heart, Star, MapPin, Sun, Leaf, Zap, Check, ShoppingCart } from 'lucide-react';

// ─── Trait pills ─────────────────────────────────────────────────────────────
function CategoryPill({ category }: { category: string }) {
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300 whitespace-nowrap">
      <Leaf className="h-2.5 w-2.5 shrink-0" />
      {category}
    </span>
  );
}

function LightPill({ lightReq, lightReqKh, locale }: { lightReq: string; lightReqKh: string; locale: string }) {
  const raw = locale === 'kh' ? lightReqKh : lightReq;
  const label = raw.length > 14 ? raw.slice(0, 13) + '…' : raw;
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300 whitespace-nowrap">
      <Sun className="h-2.5 w-2.5 shrink-0" />
      {label}
    </span>
  );
}

function DifficultyPill({ difficulty }: { difficulty: string }) {
  const d = difficulty.toLowerCase();
  const isEasy = d.includes('easy') || d.includes('ងាយ');
  const isHard = d.includes('hard') || d.includes('ពិបាក');
  const cfg = isEasy
    ? { cls: 'bg-sky-100 text-sky-700 dark:bg-sky-500/20 dark:text-sky-300',            label: 'Easy care' }
    : isHard
    ? { cls: 'bg-red-100 text-red-600 dark:bg-red-500/20 dark:text-red-300',            label: 'Hard care' }
    : { cls: 'bg-violet-100 text-violet-700 dark:bg-violet-500/20 dark:text-violet-300', label: 'Med care' };
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium whitespace-nowrap ${cfg.cls}`}>
      <Zap className="h-2.5 w-2.5 shrink-0" />
      {cfg.label}
    </span>
  );
}

// ─── Stock progress bar ───────────────────────────────────────────────────────
function StockBar({ stock }: { stock: number }) {
  const max = Math.max(20, stock);
  const pct = stock === 0 ? 0 : Math.round((Math.min(stock, max) / max) * 100);
  const bar = stock === 0 ? 'bg-red-400' : stock <= 5 ? 'bg-amber-400' : 'bg-accent-green';
  return (
    <div className="space-y-1">
      {/* Explicitly 4px track */}
      <div className="w-full rounded-full bg-muted overflow-hidden" style={{ height: '4px' }}>
        <div className={`h-full rounded-full transition-all duration-500 ${bar}`} style={{ width: `${pct}%` }} />
      </div>
      <p className="text-[10px] text-muted-foreground">
        {stock === 0 ? 'Out of stock' : `${stock} of ${max} left`}
      </p>
    </div>
  );
}

// ─── Shared PlantCard ────────────────────────────────────────────────────────
interface PlantCardProps {
  plant: MockPlant;
  seller?: MockSeller | null;
}

export function PlantCard({ plant, seller }: PlantCardProps) {
  const { locale, selectPlant, selectSeller, addToCart, addToWishlist, removeFromWishlist, isInWishlist } = useAppStore();
  const [added, setAdded] = useState(false);
  const [imgFailed, setImgFailed] = useState(false);
  const wishlisted = isInWishlist(plant.id);
  const outOfStock = plant.stock === 0;
  const { emoji, gradient } = categoryStyles[plant.category] || DEFAULT_STYLE;

  const imageUrl = plant.images?.[0];
  const showRealImg = !!imageUrl && (imageUrl.startsWith('http://') || imageUrl.startsWith('https://') || imageUrl.startsWith('data:image/')) && !imgFailed;

  const handleAddToCart = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    if (outOfStock || added) return;
    triggerFly(e.currentTarget, 'cart', emoji, gradient);
    addToCart(plant.id);
    showToast('success', locale === 'kh' ? 'បានបន្ថែមទៅរទោះ' : `${plant.nameEn} added to cart`);
    setAdded(true);
    setTimeout(() => setAdded(false), 1600);
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
    // No shadow — thin 0.5px border only. Radius 20px. flex-col so CardContent can grow.
    <Card
      className="group overflow-hidden cursor-pointer bg-card transition-transform duration-200 ease-in-out hover:-translate-y-1 shadow-none flex flex-col"
      style={{ borderRadius: '20px', border: '0.5px solid color-mix(in srgb, var(--border) 50%, transparent)' }}
    >

      {/* ── Image area ─────────────────────────────────── */}
      <div
        className={`relative h-[200px] bg-gradient-to-br ${gradient} flex items-center justify-center overflow-hidden`}
        onClick={() => selectPlant(plant.id)}
      >
        {/* Circle backdrop — always present, slightly darker than bg */}
        <div
          className="absolute rounded-full bg-black/[0.06] dark:bg-black/[0.18]"
          style={{ width: '170px', height: '170px' }}
        />

        {showRealImg ? (
          <img
            src={imageUrl}
            alt={plant.nameEn}
            className="absolute inset-0 w-full h-full object-cover z-[1]"
            onError={() => setImgFailed(true)}
          />
        ) : (
          <span className="relative z-[1] text-6xl opacity-80 group-hover:scale-110 transition-transform duration-300 select-none">
            {emoji}
          </span>
        )}

        {/* Out-of-stock overlay */}
        {outOfStock && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-[2]">
            <span className="text-white text-xs font-bold tracking-widest uppercase px-3 py-1.5 rounded-full bg-black/50 border border-white/20">
              {locale === 'kh' ? 'អស់ស្តុក' : 'Sold Out'}
            </span>
          </div>
        )}

        {plant.isNew && !outOfStock && (
          <span className="absolute top-2.5 left-2.5 z-[2] text-[10px] font-semibold tracking-wide bg-gold text-white px-2.5 py-1 rounded-full shadow-sm">
            ✦ {locale === 'kh' ? 'ទើបមក' : 'New arrival'}
          </span>
        )}

        {/* Heart button — white bg always, only border + icon turn pink */}
        <button
          onClick={handleWishlist}
          className={`absolute top-2.5 right-2.5 z-[2] h-8 w-8 rounded-full flex items-center justify-center bg-white dark:bg-card hover:scale-110 active:scale-95 transition-transform border ${
            wishlisted ? 'border-pink-400' : 'border-border/70'
          }`}
        >
          <Heart
            className={`h-4 w-4 transition-colors ${
              wishlisted ? 'fill-pink-500 text-pink-500' : 'text-muted-foreground'
            }`}
          />
        </button>
      </div>

      {/* ── Card body — grows to fill row height, button always at bottom ── */}
      <CardContent className="p-4 flex-1 flex flex-col">

        {/* Upper content — expands to push button down */}
        <div className="flex-1">

        {/* Trait pills */}
        <div className="flex flex-wrap gap-1">
          <CategoryPill category={plant.category} />
          <LightPill lightReq={plant.lightReq} lightReqKh={plant.lightReqKh} locale={locale} />
          <DifficultyPill difficulty={plant.difficulty} />
        </div>

        {/* Plant name — extra gap above */}
        <h3
          className="mt-3 font-medium leading-snug line-clamp-1 hover:text-accent-green transition-colors"
          style={{ fontSize: '17px' }}
          onClick={() => selectPlant(plant.id)}
        >
          {locale === 'kh' ? plant.nameKh : plant.nameEn}
        </h3>

        {/* Tagline — italic muted */}
        <p className="mt-1 text-[11px] text-muted-foreground italic line-clamp-1 leading-relaxed">
          {locale === 'kh' ? plant.taglineKh : plant.tagline}
        </p>

        {/* Seller + nursery */}
        {seller && (
          <button
            onClick={(e) => { e.stopPropagation(); selectSeller(seller.id); }}
            className="mt-1.5 flex items-center gap-1 text-[11px] text-muted-foreground hover:text-accent-green transition-colors"
          >
            <MapPin className="h-3 w-3 shrink-0" />
            <span className="truncate">{seller.nurseryName}</span>
          </button>
        )}

        {/* Divider — extra gap above */}
        <hr className="mt-3 border-border/60" />

        {/* Rating + stock status pill */}
        <div className="mt-3 flex items-center justify-between gap-2">
          <div className="flex items-center gap-0.5">
            {[1, 2, 3, 4, 5].map(s => (
              <Star
                key={s}
                className={`h-3 w-3 ${
                  s <= Math.round(plant.rating)
                    ? 'fill-gold text-gold'
                    : 'fill-muted text-muted-foreground/30'
                }`}
              />
            ))}
            <span className="text-[10px] text-muted-foreground ml-1">({plant.reviewCount})</span>
          </div>
          {outOfStock ? (
            <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-red-100 text-red-500 dark:bg-red-500/20 dark:text-red-300 shrink-0">
              Sold out
            </span>
          ) : plant.stock <= 5 ? (
            <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-amber-100 text-amber-600 dark:bg-amber-500/20 dark:text-amber-300 shrink-0">
              {plant.stock} left
            </span>
          ) : (
            <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-300 shrink-0">
              In stock
            </span>
          )}
        </div>

        {/* Stock progress bar — 4px */}
        <div className="mt-2">
          <StockBar stock={plant.stock} />
        </div>

        {/* Price row */}
        <div className="mt-3 flex items-end justify-between gap-2">
          <div>
            <span className="font-bold text-base sm:text-lg leading-none">
              ${plant.price.toFixed(2)}
            </span>
            <p className="text-[10px] text-muted-foreground mt-0.5">
              ៛{Math.round(plant.price * 4100).toLocaleString()}
            </p>
          </div>
          <p className="text-[10px] text-muted-foreground text-right leading-snug pb-0.5 shrink-0">
            {locale === 'kh' ? 'ដឹកជញ្ជូនឥតគិតថ្លៃ\nលើ $50' : 'Free shipping\nover $50'}
          </p>
        </div>

        </div>{/* end upper content */}

        {/* Add to cart — full width, radius 10px, always at bottom */}
        <button
          disabled={outOfStock}
          onClick={handleAddToCart}
          className={`mt-3 w-full h-10 text-sm font-medium flex items-center justify-center gap-2 transition-all duration-200 ${
            outOfStock
              ? 'bg-muted/70 text-muted-foreground/60 cursor-not-allowed'
              : added
              ? 'bg-accent-green text-white'
              : 'bg-accent-green text-white hover:bg-forest-mid active:scale-[0.98]'
          }`}
          style={{ borderRadius: '10px' }}
        >
          {added ? (
            <>
              <Check className="h-4 w-4" />
              <span>{locale === 'kh' ? 'បានបន្ថែម!' : 'Added!'}</span>
            </>
          ) : outOfStock ? (
            <span>{locale === 'kh' ? 'អស់ស្តុក' : 'Out of stock'}</span>
          ) : (
            <>
              <ShoppingCart className="h-4 w-4" />
              <span>{t(locale, 'addToCart')}</span>
            </>
          )}
        </button>
      </CardContent>
    </Card>
  );
}
