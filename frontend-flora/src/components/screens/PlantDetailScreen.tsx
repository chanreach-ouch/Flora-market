'use client';

import { useState, useEffect } from 'react';
import { useAppStore } from '@/lib/store';
import { t } from '@/lib/i18n';
import { getPlantById, getSellerById, getReviewsByPlant } from '@/lib/data';
import type { MockPlant, MockSeller, MockReview } from '@/lib/data';
import { apiFetchPlantById, apiFetchSellerById, apiFetchReviewsByPlant, apiPostReview } from '@/lib/api';
import { categoryStyles, DEFAULT_STYLE } from '@/components/ui/plant-image';
import { triggerFly } from '@/lib/fly-animation';
import { showToast } from '@/components/ui/toast-custom';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
  ArrowLeft, Heart, ShoppingCart, Star, MapPin, Droplets, Sun, Thermometer,
  Gauge, Truck, Check, X as XIcon, Plus, Minus, ThumbsUp, ChevronRight,
} from 'lucide-react';

// ─── Helpers ─────────────────────────────────────────────────────────────────
const AVATAR_COLORS = [
  'bg-emerald-500', 'bg-blue-500', 'bg-violet-500',
  'bg-amber-500', 'bg-rose-500', 'bg-cyan-500', 'bg-orange-500',
];
function avatarBg(name: string) {
  return AVATAR_COLORS[(name.charCodeAt(0) || 0) % AVATAR_COLORS.length];
}
function getInitials(name: string) {
  return name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();
}
function fmtDate(d: string) {
  try { return new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }); }
  catch { return d; }
}

// ─── Inline image (bypasses PlantImage to allow circle backdrop) ──────────────
function DetailImage({ plant, gradient, emoji }: { plant: MockPlant; gradient: string; emoji: string }) {
  const [failed, setFailed] = useState(false);
  const url = plant.images?.[0];
  const showReal = !!url && (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:image/')) && !failed;

  return (
    <div className={`relative aspect-square rounded-[20px] overflow-hidden flex items-center justify-center bg-gradient-to-br ${gradient}`}
      style={{ border: '0.5px solid color-mix(in srgb, var(--border) 50%, transparent)' }}>
      <div className="absolute rounded-full bg-black/[0.06] dark:bg-black/[0.18]" style={{ width: 170, height: 170 }} />
      {showReal
        ? <img src={url} alt={plant.nameEn} className="absolute inset-0 w-full h-full object-cover z-[1]" onError={() => setFailed(true)} />
        : <span className="relative z-[1] select-none" style={{ fontSize: 120, lineHeight: 1, opacity: 0.85 }}>{emoji}</span>
      }
    </div>
  );
}

// ─── Rating summary bar row ────────────────────────────────────────────────────
function RatingBar({ star, count, total, animate }: { star: number; count: number; total: number; animate: boolean }) {
  const pct = total > 0 ? (count / total) * 100 : 0;
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-muted-foreground w-3 text-right shrink-0">{star}</span>
      <Star className="h-3 w-3 fill-gold text-gold shrink-0" />
      <div className="flex-1 rounded-full bg-muted overflow-hidden" style={{ height: 6 }}>
        <div
          className="h-full rounded-full bg-gold transition-all duration-700 ease-out"
          style={{ width: animate ? `${pct}%` : '0%' }}
        />
      </div>
      <span className="text-xs text-muted-foreground w-4 text-right shrink-0">{count}</span>
    </div>
  );
}

// ─── Star picker for review form ──────────────────────────────────────────────
function StarPicker({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map(s => (
        <button key={s} type="button"
          onMouseEnter={() => setHover(s)} onMouseLeave={() => setHover(0)}
          onClick={() => onChange(s)}
          className="p-0.5 transition-transform hover:scale-110 active:scale-95"
        >
          <Star className={`h-7 w-7 transition-colors ${s <= (hover || value) ? 'fill-gold text-gold' : 'text-muted-foreground/40'}`} />
        </button>
      ))}
    </div>
  );
}

// ─── Individual review card ───────────────────────────────────────────────────
interface DisplayReview extends MockReview {
  isUserReview?: boolean;
}
function ReviewCard({
  review, isHighlighted, locale,
}: { review: DisplayReview; isHighlighted: boolean; locale: string }) {
  const [helpful, setHelpful] = useState(0);
  const [voted, setVoted] = useState(false);

  const toggleHelpful = () => {
    setHelpful(n => voted ? n - 1 : n + 1);
    setVoted(v => !v);
  };

  return (
    <Card
      className="transition-all duration-500 shadow-none"
      style={{
        borderRadius: 16,
        border: isHighlighted
          ? '1.5px solid var(--color-accent-green)'
          : '0.5px solid color-mix(in srgb, var(--border) 50%, transparent)',
      }}
    >
      <CardContent className="p-4">
        {/* Header */}
        <div className="flex items-center gap-3 mb-3">
          <div className={`h-9 w-9 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0 ${avatarBg(review.buyerName)}`}>
            {getInitials(review.buyerName)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium leading-none">{review.buyerName}</p>
            <p className="text-[10px] text-muted-foreground mt-0.5">{fmtDate(review.date)}</p>
          </div>
          <div className="flex items-center gap-0.5 shrink-0">
            {[1, 2, 3, 4, 5].map(s => (
              <Star key={s} className={`h-3 w-3 ${s <= review.rating ? 'fill-gold text-gold' : 'fill-muted text-muted-foreground/30'}`} />
            ))}
          </div>
        </div>

        {/* Body */}
        <p className="text-sm text-muted-foreground leading-relaxed">
          {locale === 'kh' ? review.commentKh : review.comment}
        </p>

        {/* Footer */}
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-border/50">
          <button
            onClick={toggleHelpful}
            className={`flex items-center gap-1.5 text-xs transition-colors ${voted ? 'text-accent-green' : 'text-muted-foreground hover:text-foreground'}`}
          >
            <ThumbsUp className={`h-3.5 w-3.5 ${voted ? 'fill-accent-green' : ''}`} />
            Helpful {helpful > 0 && `(${helpful})`}
          </button>
          {!review.isUserReview && (
            <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300">
              ✓ Verified Buyer
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Main screen ──────────────────────────────────────────────────────────────
export default function PlantDetailScreen() {
  const { selectedPlantId, locale, goBack, selectSeller, addToCart, addToWishlist, removeFromWishlist, isInWishlist } = useAppStore();

  const mockPlant = getPlantById(selectedPlantId || 'plant-1');
  const [plant, setPlant]     = useState<MockPlant | undefined>(mockPlant);
  const [seller, setSeller]   = useState<MockSeller | undefined>(mockPlant ? getSellerById(mockPlant.sellerId) : undefined);
  const [reviews, setReviews] = useState<DisplayReview[]>(mockPlant ? getReviewsByPlant(mockPlant.id) : []);
  const [loading, setLoading] = useState(!mockPlant);

  // Image thumbnails
  const [activeThumb, setActiveThumb] = useState(0);

  // Add to cart flash
  const [added, setAdded] = useState(false);

  // Quantity
  const [qty, setQty] = useState(1);

  // New review highlight
  const [newReviewId, setNewReviewId] = useState<string | null>(null);

  // Rating bars animate-in
  const [barsVisible, setBarsVisible] = useState(false);

  // Review form
  const [reviewStar, setReviewStar] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const MAX_CHARS = 300;

  useEffect(() => {
    if (!selectedPlantId) return;
    setLoading(true);
    setBarsVisible(false);
    setQty(1);
    setAdded(false);
    apiFetchPlantById(selectedPlantId)
      .then(p => {
        setPlant(p);
        apiFetchSellerById(p.sellerId).then(setSeller).catch(() => {});
        apiFetchReviewsByPlant(p.id).then(r => {
          setReviews(r);
          setTimeout(() => setBarsVisible(true), 200);
        }).catch(() => {});
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [selectedPlantId]);

  useEffect(() => {
    if (reviews.length > 0) setTimeout(() => setBarsVisible(true), 200);
  }, [reviews.length]);

  if (loading && !plant) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <Skeleton className="h-8 w-20 mb-6" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Skeleton className="aspect-square rounded-[20px]" />
          <div className="space-y-4">
            <Skeleton className="h-8 w-3/4" /><Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-10 w-32" /><Skeleton className="h-12 w-full" />
          </div>
        </div>
      </div>
    );
  }
  if (!plant) return null;

  const wishlisted = isInWishlist(plant.id);
  const outOfStock = plant.stock === 0;
  const { emoji, gradient } = categoryStyles[plant.category] || DEFAULT_STYLE;

  // Stock bar
  const stockMax = Math.max(20, plant.stock);
  const stockPct = outOfStock ? 0 : Math.round((Math.min(plant.stock, stockMax) / stockMax) * 100);

  // Thumbnails: show 4, repeating the same plant image
  const thumbCount = 4;

  // Rating distribution
  const ratingDist = [5, 4, 3, 2, 1].map(star => ({
    star,
    count: reviews.filter(r => r.rating === star).length,
  }));

  const handleAddToCart = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (outOfStock || added) return;
    triggerFly(e.currentTarget, 'cart', emoji, gradient);
    addToCart(plant.id);
    showToast('success', locale === 'kh' ? 'បានបន្ថែមទៅរទោះ' : `${plant.nameEn} added to cart`);
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
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

  const handleSubmitReview = () => {
    if (!reviewStar || !reviewText.trim()) return;
    // Capture before reset
    const star = reviewStar;
    const text = reviewText;
    // Optimistic: prepend immediately so the user sees it at once
    const tempId = `review-user-${Date.now()}`;
    const optimistic: DisplayReview = {
      id: tempId, buyerId: 'me', buyerName: 'You',
      buyerAvatar: '', sellerId: plant.sellerId,
      plantId: plant.id, plantNameKh: plant.nameKh, plantNameEn: plant.nameEn,
      rating: star, comment: text, commentKh: text,
      date: new Date().toISOString(), isUserReview: true,
    };
    setReviews(prev => [optimistic, ...prev]);
    setNewReviewId(tempId);
    setTimeout(() => setNewReviewId(null), 2500);
    setReviewStar(0);
    setReviewText('');
    // Fire API in background; keep optimistic card on failure
    apiPostReview({ plant_id: plant.id, seller_id: plant.sellerId, rating: star, comment: text })
      .catch(() => {/* optimistic card stays */});
  };

  const careItems = [
    { icon: Droplets,    bg: 'bg-blue-100 dark:bg-blue-500/20',   color: 'text-blue-600 dark:text-blue-300',   label: t(locale, 'water'),       value: locale === 'kh' ? plant.waterFreqKh : plant.waterFreq },
    { icon: Sun,         bg: 'bg-amber-100 dark:bg-amber-500/20', color: 'text-amber-600 dark:text-amber-300', label: t(locale, 'light'),       value: locale === 'kh' ? plant.lightReqKh : plant.lightReq },
    { icon: Thermometer, bg: 'bg-red-100 dark:bg-red-500/20',     color: 'text-red-500 dark:text-red-300',     label: t(locale, 'temperature'), value: plant.tempRange },
    { icon: Gauge,       bg: 'bg-emerald-100 dark:bg-emerald-500/20', color: 'text-emerald-600 dark:text-emerald-300', label: t(locale, 'difficulty'), value: locale === 'kh' ? plant.difficultyKh : plant.difficulty },
  ];

  const cardStyle = {
    borderRadius: 16,
    border: '0.5px solid color-mix(in srgb, var(--border) 50%, transparent)',
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">

      {/* Back */}
      <Button variant="ghost" size="sm" onClick={goBack} className="gap-2 mb-6 -ml-2">
        <ArrowLeft className="h-4 w-4" />
        {locale === 'kh' ? 'ត្រឡប់' : 'Back'}
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-14">

        {/* ── LEFT: image + thumbnails ─────────────────────────────── */}
        <div>
          <div className="relative">
            <DetailImage plant={plant} gradient={gradient} emoji={emoji} />

            {/* Wishlist button on image */}
            <button
              onClick={handleWishlist}
              className={`absolute top-3 right-3 z-10 h-9 w-9 rounded-full flex items-center justify-center bg-white dark:bg-card border hover:scale-110 active:scale-95 transition-transform shadow-sm ${
                wishlisted ? 'border-pink-400' : 'border-border/70'
              }`}
            >
              <Heart className={`h-4 w-4 transition-colors ${wishlisted ? 'fill-pink-500 text-pink-500' : 'text-muted-foreground'}`} />
            </button>

            {/* New badge */}
            {plant.isNew && (
              <span className="absolute top-3 left-3 z-10 text-[10px] font-semibold tracking-wide bg-gold text-white px-2.5 py-1 rounded-full shadow-sm">
                ✦ {locale === 'kh' ? 'ទើបមក' : 'New arrival'}
              </span>
            )}
          </div>

          {/* Thumbnails */}
          <div className="flex gap-2 mt-3">
            {Array.from({ length: thumbCount }).map((_, i) => (
              <button
                key={i}
                onClick={() => setActiveThumb(i)}
                className={`w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 flex items-center justify-center bg-gradient-to-br ${gradient} transition-all ${
                  i === activeThumb ? 'ring-2 ring-accent-green ring-offset-1' : 'ring-1 ring-border/40 opacity-60 hover:opacity-100'
                }`}
                style={{ border: 'none' }}
              >
                <span className="text-2xl select-none">{emoji}</span>
              </button>
            ))}
          </div>
        </div>

        {/* ── RIGHT: details ───────────────────────────────────────── */}
        <div>

          {/* Title + category pill */}
          <div className="flex items-start justify-between gap-3 mb-1">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300">
                  {plant.category}
                </span>
                {plant.isNew && <Badge className="bg-gold/15 text-gold border-gold/30 dark:bg-gold/20 dark:text-gold-light text-[10px] font-semibold">✦ New arrival</Badge>}
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold leading-tight">
                {locale === 'kh' ? plant.nameKh : plant.nameEn}
              </h1>
              <p className="text-muted-foreground italic mt-1 text-sm">
                {locale === 'kh' ? plant.taglineKh : plant.tagline}
              </p>
            </div>
          </div>

          {/* Rating & sold */}
          <div className="flex items-center gap-3 mt-3">
            <div className="flex items-center gap-1">
              {[1,2,3,4,5].map(s => (
                <Star key={s} className={`h-4 w-4 ${s <= Math.round(plant.rating) ? 'fill-gold text-gold' : 'fill-muted text-muted-foreground/30'}`} />
              ))}
              <span className="font-semibold text-sm ml-1">{plant.rating}</span>
              <span className="text-sm text-muted-foreground">({plant.reviewCount} {t(locale, 'reviews').toLowerCase()})</span>
            </div>
            <span className="text-muted-foreground/40">·</span>
            <span className="text-sm text-muted-foreground">{plant.totalSold} {t(locale, 'sold')}</span>
          </div>

          {/* Price */}
          <div className="mt-5">
            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-bold text-forest dark:text-accent-green">${plant.price.toFixed(2)}</span>
              <span className="text-lg text-muted-foreground">៛{Math.round(plant.price * 4100).toLocaleString()}</span>
            </div>
            <div className="flex items-center gap-2 mt-1.5">
              <Badge variant="outline" className="text-accent-green border-accent-green/50 text-[10px]">{t(locale, 'fixedPrice')}</Badge>
              <Badge variant="outline" className="text-accent-green border-accent-green/50 text-[10px]">{t(locale, 'noNegotiation')}</Badge>
            </div>
          </div>

          {/* Stock */}
          <div className="mt-5">
            <div className="flex items-center justify-between mb-1.5">
              <span className={`text-sm font-medium ${outOfStock ? 'text-destructive' : 'text-accent-green'}`}>
                {outOfStock ? t(locale, 'outOfStock') : `${plant.stock} ${t(locale, 'inStock')}`}
              </span>
              {!outOfStock && plant.stock <= 10 && (
                <span className="text-[11px] text-amber-600 font-medium">
                  {locale === 'kh' ? 'ស្តុកតិច!' : 'Low stock!'}
                </span>
              )}
            </div>
            <div className="w-full rounded-full bg-muted overflow-hidden" style={{ height: 4 }}>
              <div
                className={`h-full rounded-full ${outOfStock ? 'bg-red-400' : plant.stock <= 5 ? 'bg-amber-400' : 'bg-accent-green'}`}
                style={{ width: `${stockPct}%`, transition: 'width 0.5s ease' }}
              />
            </div>
          </div>

          <hr className="mt-5 border-border/50" />

          {/* Quantity selector */}
          <div className="mt-5 flex items-center justify-between">
            <span className="text-sm font-medium">{locale === 'kh' ? 'បរិមាណ' : 'Quantity'}</span>
            <div className="flex items-center gap-1 rounded-xl border border-border/60 overflow-hidden">
              <button
                onClick={() => setQty(q => Math.max(1, q - 1))}
                disabled={qty <= 1}
                className="h-9 w-9 flex items-center justify-center text-muted-foreground hover:bg-muted hover:text-foreground transition-colors disabled:opacity-30"
              >
                <Minus className="h-3.5 w-3.5" />
              </button>
              <span className="w-10 text-center text-sm font-semibold select-none">{qty}</span>
              <button
                onClick={() => setQty(q => Math.min(plant.stock, q + 1))}
                disabled={qty >= plant.stock || outOfStock}
                className="h-9 w-9 flex items-center justify-center text-muted-foreground hover:bg-muted hover:text-foreground transition-colors disabled:opacity-30"
              >
                <Plus className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {/* Add to Cart */}
          <button
            disabled={outOfStock}
            onClick={handleAddToCart}
            className={`mt-4 w-full h-12 text-sm font-semibold flex items-center justify-center gap-2 transition-all duration-200 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed ${
              added ? 'bg-accent-green text-white' : 'bg-forest text-pale-green hover:bg-forest-mid'
            }`}
            style={{ borderRadius: 12 }}
          >
            {added ? (
              <><Check className="h-5 w-5" /><span>{locale === 'kh' ? 'បានបន្ថែម!' : 'Added to Cart!'}</span></>
            ) : (
              <><ShoppingCart className="h-5 w-5" /><span>{t(locale, 'addToCart')}</span></>
            )}
          </button>

          {/* Care guide — 2×2 / 4-col compact cards */}
          <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-2">
            {careItems.map(item => (
              <div
                key={item.label}
                className="flex flex-col items-center gap-1.5 p-3 rounded-xl text-center"
                style={cardStyle}
              >
                <div className={`h-9 w-9 rounded-full flex items-center justify-center ${item.bg}`}>
                  <item.icon className={`h-4.5 w-4.5 ${item.color}`} style={{ height: 18, width: 18 }} />
                </div>
                <p className="text-[10px] text-muted-foreground leading-none">{item.label}</p>
                <p className="text-xs font-medium leading-snug">{item.value}</p>
              </div>
            ))}
          </div>

          {/* Delivery */}
          <Card className="mt-5 shadow-none" style={cardStyle}>
            <CardContent className="p-3 flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center shrink-0">
                <Truck className="h-4 w-4 text-muted-foreground" />
              </div>
              <div>
                <p className="text-xs font-medium">{t(locale, 'delivery')}</p>
                <p className="text-[11px] text-muted-foreground">{t(locale, 'deliveryNote')}</p>
              </div>
            </CardContent>
          </Card>

          {/* Seller card */}
          {seller && (
            <Card className="mt-4 cursor-pointer shadow-none" style={cardStyle} onClick={() => selectSeller(seller.id)}>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className={`h-11 w-11 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0 ${avatarBg(seller.nurseryName)}`}>
                    {getInitials(seller.nurseryName)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-semibold text-sm">{seller.nurseryName}</span>
                      {seller.isVerified && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-accent-green/15 text-accent-green font-medium">✓ {t(locale, 'verified')}</span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 mt-0.5 text-[11px] text-muted-foreground">
                      <span className="flex items-center gap-0.5"><Star className="h-3 w-3 fill-gold text-gold" />{seller.rating}</span>
                      <span>{seller.totalOrders} {locale === 'kh' ? 'ការបញ្ជាទិញ' : 'sales'}</span>
                      <span className="flex items-center gap-0.5"><MapPin className="h-3 w-3" />{seller.district}</span>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Pros & Cons */}
          <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Card className="shadow-none" style={cardStyle}>
              <CardContent className="p-4">
                <h4 className="font-semibold text-sm mb-3 text-accent-green flex items-center gap-1.5">
                  <span className="h-5 w-5 rounded-full bg-accent-green/15 flex items-center justify-center">
                    <Check className="h-3 w-3" />
                  </span>
                  {t(locale, 'pros')}
                </h4>
                <ul className="space-y-2">
                  {(locale === 'kh' ? plant.prosKh : plant.pros).map((pro, i) => (
                    <li key={i} className="text-xs flex items-start gap-2">
                      <Check className="h-3.5 w-3.5 text-accent-green shrink-0 mt-0.5" />
                      <span className="text-foreground/80">{pro}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
            <Card className="shadow-none" style={cardStyle}>
              <CardContent className="p-4">
                <h4 className="font-semibold text-sm mb-3 text-destructive flex items-center gap-1.5">
                  <span className="h-5 w-5 rounded-full bg-destructive/10 flex items-center justify-center">
                    <XIcon className="h-3 w-3 text-destructive" />
                  </span>
                  {t(locale, 'cons')}
                </h4>
                <ul className="space-y-2">
                  {(locale === 'kh' ? plant.consKh : plant.cons).map((con, i) => (
                    <li key={i} className="text-xs flex items-start gap-2">
                      <XIcon className="h-3.5 w-3.5 text-destructive shrink-0 mt-0.5" />
                      <span className="text-foreground/80">{con}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>

        </div>{/* end right column */}
      </div>

      {/* ══ Ratings & Reviews ═══════════════════════════════════════════════════ */}
      <section className="mt-14">
        <h2 className="text-xl font-bold mb-6">
          {locale === 'kh' ? 'ការវាយតម្លៃ និង មតិយោបល់' : 'Ratings & Reviews'}
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-6 mb-10">

          {/* Rating summary */}
          <Card className="shadow-none h-fit" style={cardStyle}>
            <CardContent className="p-5">
              <div className="flex items-end gap-3 mb-4">
                <span className="text-5xl font-bold leading-none">{plant.rating}</span>
                <div className="pb-1">
                  <div className="flex items-center gap-0.5 mb-1">
                    {[1,2,3,4,5].map(s => (
                      <Star key={s} className={`h-4 w-4 ${s <= Math.round(plant.rating) ? 'fill-gold text-gold' : 'fill-muted text-muted-foreground/30'}`} />
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground">{reviews.length} {t(locale, 'reviews').toLowerCase()}</p>
                </div>
              </div>
              <div className="space-y-2">
                {ratingDist.map(({ star, count }) => (
                  <RatingBar key={star} star={star} count={count} total={reviews.length} animate={barsVisible} />
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Write review form */}
          <div
            className="rounded-[16px] bg-accent-green/[0.05] dark:bg-accent-green/[0.08] p-5"
            style={{ border: '0.5px solid color-mix(in srgb, var(--color-accent-green) 25%, transparent)' }}
          >
            <h3 className="font-semibold text-base mb-4">
              {locale === 'kh' ? 'ចាកចោលការវាយតម្លៃ' : 'Leave a review'}
            </h3>

            {/* Star picker */}
            <StarPicker value={reviewStar} onChange={setReviewStar} />

            {/* Textarea */}
            <textarea
              value={reviewText}
              onChange={e => setReviewText(e.target.value.slice(0, MAX_CHARS))}
              placeholder={locale === 'kh'
                ? 'ចែករំលែកបទពិសោធន៍របស់អ្នកជាមួយរុក្ខជាតិនេះ...'
                : 'Share your experience with this plant...'}
              rows={4}
              className="mt-4 w-full rounded-xl border border-border/50 bg-card px-4 py-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-accent-green/40 placeholder:text-muted-foreground/50 transition-all"
            />

            {/* Footer: hint text left, button right */}
            <div className="mt-3 flex items-center justify-between gap-4">
              <span className={`text-sm transition-colors ${reviewStar ? 'text-gold font-medium' : 'text-muted-foreground'}`}>
                {reviewStar === 0 && (locale === 'kh' ? 'ជ្រើសរើសផ្កាយ...' : 'Select a star rating...')}
                {reviewStar === 1 && (locale === 'kh' ? 'មិនល្អ' : 'Poor')}
                {reviewStar === 2 && (locale === 'kh' ? 'ល្អបន្តិច' : 'Fair')}
                {reviewStar === 3 && (locale === 'kh' ? 'ល្អ' : 'Good')}
                {reviewStar === 4 && (locale === 'kh' ? 'ល្អខ្លាំង' : 'Very good')}
                {reviewStar === 5 && (locale === 'kh' ? 'ល្អឥតខ្ចោះ!' : 'Excellent!')}
              </span>
              <button
                onClick={handleSubmitReview}
                disabled={!reviewStar || !reviewText.trim()}
                className="h-9 px-5 rounded-xl text-sm font-medium bg-forest text-pale-green hover:bg-forest-mid transition-colors disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98] shrink-0"
              >
                {locale === 'kh' ? 'បង្ហោះ' : 'Post review'}
              </button>
            </div>
          </div>
        </div>

        {/* Review list */}
        {reviews.length > 0 ? (
          <div className="space-y-3">
            {reviews.map(review => (
              <ReviewCard
                key={review.id}
                review={review}
                isHighlighted={review.id === newReviewId}
                locale={locale}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            <p className="text-3xl mb-3">💬</p>
            <p className="text-sm">{locale === 'kh' ? 'មិនទាន់មានមតិ' : 'No reviews yet — be the first!'}</p>
          </div>
        )}
      </section>
    </div>
  );
}
