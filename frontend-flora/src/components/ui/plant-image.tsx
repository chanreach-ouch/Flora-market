'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';

export const categoryStyles: Record<string, { gradient: string; emoji: string }> = {
  'Indoor':        { gradient: 'from-emerald-100 via-teal-50 to-green-50 dark:from-emerald-900/40 dark:via-teal-900/20 dark:to-green-900/10',      emoji: '🪴' },
  'Outdoor':       { gradient: 'from-green-100 via-lime-50 to-yellow-50 dark:from-green-900/40 dark:via-lime-900/20 dark:to-yellow-900/10',        emoji: '🌳' },
  'Flowering':     { gradient: 'from-pink-100 via-rose-50 to-fuchsia-50 dark:from-pink-900/40 dark:via-rose-900/20 dark:to-fuchsia-900/10',        emoji: '🌸' },
  'Succulents':    { gradient: 'from-amber-100 via-yellow-50 to-orange-50 dark:from-amber-900/40 dark:via-yellow-900/20 dark:to-orange-900/10',    emoji: '🌵' },
  'Trees':         { gradient: 'from-green-100 via-emerald-50 to-teal-50 dark:from-green-900/40 dark:via-emerald-900/20 dark:to-teal-900/10',      emoji: '🌲' },
  'Rare':          { gradient: 'from-purple-100 via-violet-50 to-indigo-50 dark:from-purple-900/40 dark:via-violet-900/20 dark:to-indigo-900/10',  emoji: '✨' },
  'Air Purifying': { gradient: 'from-cyan-100 via-sky-50 to-blue-50 dark:from-cyan-900/40 dark:via-sky-900/20 dark:to-blue-900/10',               emoji: '🍃' },
  'Tropical':      { gradient: 'from-yellow-100 via-lime-50 to-green-50 dark:from-yellow-900/40 dark:via-lime-900/20 dark:to-green-900/10',        emoji: '🌴' },
  'Herbs':         { gradient: 'from-lime-100 via-green-50 to-emerald-50 dark:from-lime-900/40 dark:via-green-900/20 dark:to-emerald-900/10',      emoji: '🌿' },
  'Cactus':        { gradient: 'from-amber-100 via-yellow-50 to-lime-50 dark:from-amber-900/40 dark:via-yellow-900/20 dark:to-lime-900/10',        emoji: '🌵' },
};
export const DEFAULT_STYLE = { gradient: 'from-emerald-100 via-teal-50 to-green-50 dark:from-emerald-900/30 dark:via-teal-900/20 dark:to-green-900/10', emoji: '🌿' };

interface PlantImageProps {
  images?: string[];
  category?: string;
  className?: string;
  emojiSize?: string;
  alt?: string;
}

export function PlantImage({ images, category, className, emojiSize = 'text-5xl sm:text-6xl', alt }: PlantImageProps) {
  const [imgFailed, setImgFailed] = useState(false);
  const style = categoryStyles[category || ''] || DEFAULT_STYLE;

  const url = images?.[0];
  const isAbsolute = url && (url.startsWith('http://') || url.startsWith('https://'));
  const showImg = isAbsolute && !imgFailed;

  if (showImg) {
    return (
      <img
        src={url}
        alt={alt || category || 'Plant'}
        className={cn('object-cover w-full h-full', className)}
        onError={() => setImgFailed(true)}
      />
    );
  }

  return (
    <div className={cn(`bg-gradient-to-br ${style.gradient} flex items-center justify-center w-full h-full relative overflow-hidden`, className)}>
      {/* subtle pattern overlay */}
      <div className="absolute inset-0 opacity-[0.04] dark:opacity-[0.08]"
        style={{ backgroundImage: 'radial-gradient(circle, currentColor 1px, transparent 1px)', backgroundSize: '20px 20px' }}
      />
      <span className={cn('relative opacity-75 group-hover:scale-110 transition-transform duration-300', emojiSize)}>
        {style.emoji}
      </span>
    </div>
  );
}
