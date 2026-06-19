'use client';

import { cn } from '@/lib/utils';

interface FloraLogoProps {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'full' | 'icon';
  locale?: string;
  className?: string;
}

const SIZES = {
  sm: { markH: 30, flora: 17, market: 9,  gap: 9  },
  md: { markH: 40, flora: 22, market: 11, gap: 11 },
  lg: { markH: 56, flora: 30, market: 14, gap: 14 },
};

function SproutMark({ height }: { height: number }) {
  const w = Math.round(height * 0.75);
  return (
    <svg
      width={w}
      height={height}
      viewBox="0 0 24 32"
      fill="none"
      aria-hidden="true"
    >
      {/* Stem */}
      <line
        x1="12" y1="30" x2="12" y2="7"
        stroke="#52b788"
        strokeWidth="2.2"
        strokeLinecap="round"
      />

      {/* Left leaf */}
      <path
        d="M12 20 C9 18 1 14 3 11 C5 8 10 13 12 16 Z"
        fill="#52b788"
      />

      {/* Right leaf — slightly lighter for depth */}
      <path
        d="M12 20 C15 18 23 14 21 11 C19 8 14 13 12 16 Z"
        fill="#52b788"
        opacity="0.6"
      />

      {/* Bud at the top */}
      <circle cx="12" cy="5.5" r="3.8" fill="#52b788" />

      {/* Ground dots — subtle soil hint */}
      <circle cx="8"  cy="30.5" r="1.3" fill="#52b788" opacity="0.3" />
      <circle cx="12" cy="31.5" r="1.3" fill="#52b788" opacity="0.2" />
      <circle cx="16" cy="30.5" r="1.3" fill="#52b788" opacity="0.3" />
    </svg>
  );
}

export function FloraLogo({
  size = 'md',
  variant = 'full',
  locale,
  className,
}: FloraLogoProps) {
  const s = SIZES[size];

  const mark = <SproutMark height={s.markH} />;

  if (variant === 'icon') {
    return <div className={cn('inline-flex', className)}>{mark}</div>;
  }

  return (
    <div
      className={cn('inline-flex items-center', className)}
      style={{ gap: s.gap }}
    >
      {mark}

      <div className="flex flex-col leading-none">
        {/* Flora — Playfair Display */}
        <span
          className="font-bold text-forest dark:text-[#eaf4eb] tracking-tight"
          style={{ fontFamily: "'Playfair Display', serif", fontSize: s.flora }}
        >
          Flora
        </span>

        {/* Market / Khmer — Kantumruy Pro */}
        <span
          className="text-muted-foreground font-normal tracking-[0.14em] uppercase"
          style={{ fontFamily: "'Kantumruy Pro', sans-serif", fontSize: s.market, marginTop: 1 }}
        >
          {locale === 'kh' ? 'ផ្សាររុក្ខជាតិ' : 'Market'}
        </span>
      </div>
    </div>
  );
}
