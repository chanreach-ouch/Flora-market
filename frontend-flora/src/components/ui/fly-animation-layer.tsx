'use client';

import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { subscribeFly, flyTargets, notifyLand, type FlyPayload } from '@/lib/fly-animation';

interface BurstItem {
  id: string;
  x: number;
  y: number;
  target: 'cart' | 'wishlist';
}

// Green palette for cart, pink/red for wishlist
const BURST_COLORS: Record<'cart' | 'wishlist', Array<{ color: string; size: number }>> = {
  cart: [
    { color: '#4ade80', size: 9 },
    { color: '#86efac', size: 7 },
    { color: '#a3e635', size: 8 },
    { color: '#fbbf24', size: 7 },
    { color: '#ffffff', size: 5 },
    { color: '#34d399', size: 8 },
    { color: '#d9f99d', size: 6 },
    { color: '#6ee7b7', size: 7 },
  ],
  wishlist: [
    { color: '#f87171', size: 9 },
    { color: '#fda4af', size: 7 },
    { color: '#fb7185', size: 8 },
    { color: '#fbbf24', size: 7 },
    { color: '#ffffff', size: 5 },
    { color: '#f472b6', size: 8 },
    { color: '#fecdd3', size: 6 },
    { color: '#e879f9', size: 7 },
  ],
};

export function FlyAnimationLayer() {
  const [items, setItems] = useState<FlyPayload[]>([]);
  const [bursts, setBursts] = useState<BurstItem[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return subscribeFly(item => setItems(prev => [...prev, item]));
  }, []);

  const removeItem = (id: string) => setItems(prev => prev.filter(i => i.id !== id));
  const removeBurst = (id: string) => setBursts(prev => prev.filter(b => b.id !== id));

  if (!mounted) return null;

  return createPortal(
    <>
      {items.map(item => (
        <FlyingDot
          key={item.id}
          item={item}
          onDone={(landPos) => {
            removeItem(item.id);
            notifyLand(item.target);
            if (landPos) {
              setBursts(prev => [
                ...prev,
                { id: item.id + '-burst', ...landPos, target: item.target },
              ]);
            }
          }}
        />
      ))}
      {bursts.map(burst => (
        <LandingBurst
          key={burst.id}
          x={burst.x}
          y={burst.y}
          target={burst.target}
          onDone={() => removeBurst(burst.id)}
        />
      ))}
    </>,
    document.body,
  );
}

function FlyingDot({
  item,
  onDone,
}: {
  item: FlyPayload;
  onDone: (landPos: { x: number; y: number } | null) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const targetEl = flyTargets[item.target];
    if (!targetEl) { onDone(null); return; }

    const tr = targetEl.getBoundingClientRect();
    const endX = tr.left + tr.width / 2;
    const endY = tr.top + tr.height / 2;

    const dx = endX - item.x;
    const dy = endY - item.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    const arc = Math.max(70, Math.min(280, dist * 0.5));
    const duration = Math.max(520, Math.min(920, dist * 0.95));

    const N = 48;
    const frames: Keyframe[] = Array.from({ length: N }, (_, i) => {
      const t = i / (N - 1);
      const kx = dx * t;
      const ky = dy * t - arc * 4 * t * (1 - t);

      // Scale: launch pop (0→18%) → cruise (18→72%) → arrive (72→100%)
      let scale: number;
      if (t < 0.18) {
        scale = 1 + (0.38 * t) / 0.18;           // 1.0 → 1.38  (pop up)
      } else if (t < 0.72) {
        scale = 1.38 - (0.78 * (t - 0.18)) / 0.54; // 1.38 → 0.60 (shrink in flight)
      } else {
        scale = 0.60 - (0.38 * (t - 0.72)) / 0.28; // 0.60 → 0.22 (arrive small)
      }

      // 720° spin — 2 full rotations over the whole flight
      const rotate = 720 * t;

      // Fade only in the final 18%
      const opacity = t < 0.82 ? 1 : 1 - (t - 0.82) / 0.18;

      return {
        transform: `translate(${kx.toFixed(1)}px, ${ky.toFixed(1)}px) rotate(${rotate.toFixed(1)}deg) scale(${scale.toFixed(3)})`,
        opacity: +opacity.toFixed(3),
        easing: 'linear',
      };
    });

    const anim = el.animate(frames, { duration, fill: 'forwards' });
    anim.onfinish = () => onDone({ x: endX, y: endY });
    return () => anim.cancel();
  }, []);

  const SIZE = 50;

  return (
    <div
      ref={ref}
      className="pointer-events-none fixed z-[9999]"
      style={{
        left: item.x - SIZE / 2,
        top: item.y - SIZE / 2,
        width: SIZE,
        height: SIZE,
        willChange: 'transform, opacity',
      }}
    >
      <div
        className={`w-full h-full rounded-2xl flex items-center justify-center bg-gradient-to-br ${item.gradient} shadow-xl ring-2 ring-white/60 dark:ring-white/30`}
      >
        <span className="text-xl select-none leading-none drop-shadow">{item.emoji}</span>
      </div>
    </div>
  );
}

function LandingBurst({
  x,
  y,
  target,
  onDone,
}: {
  x: number;
  y: number;
  target: 'cart' | 'wishlist';
  onDone: () => void;
}) {
  const particleRefs = useRef<(HTMLDivElement | null)[]>([]);
  const particles = BURST_COLORS[target];

  useEffect(() => {
    const anims: Animation[] = [];

    particles.forEach((p, i) => {
      const el = particleRefs.current[i];
      if (!el) return;

      // Spread evenly in a circle, starting from top, with slight randomness
      const baseAngle = (360 / particles.length) * i - 90;
      const jitter = (Math.random() - 0.5) * 28;
      const angle = ((baseAngle + jitter) * Math.PI) / 180;
      const dist = 40 + Math.random() * 30; // 40–70px

      const tx = Math.cos(angle) * dist;
      const ty = Math.sin(angle) * dist;

      const anim = el.animate(
        [
          { transform: 'translate(-50%, -50%) scale(0)', opacity: 0 },
          {
            transform: `translate(calc(-50% + ${tx * 0.28}px), calc(-50% + ${ty * 0.28}px)) scale(1.6)`,
            opacity: 1,
            offset: 0.18,
          },
          {
            transform: `translate(calc(-50% + ${tx}px), calc(-50% + ${ty}px)) scale(1.0)`,
            opacity: 0.85,
            offset: 0.55,
          },
          {
            transform: `translate(calc(-50% + ${tx * 1.22}px), calc(-50% + ${ty * 1.22}px)) scale(0)`,
            opacity: 0,
          },
        ],
        {
          duration: 580 + i * 18,
          easing: 'cubic-bezier(0.215, 0.61, 0.355, 1)',
          fill: 'forwards',
          delay: 15 + i * 10,
        },
      );

      anims.push(anim);
    });

    const timer = setTimeout(onDone, 900);
    return () => {
      clearTimeout(timer);
      anims.forEach(a => a.cancel());
    };
  }, []);

  return (
    <div
      className="pointer-events-none fixed z-[9998]"
      style={{ left: x, top: y }}
    >
      {particles.map((p, i) => (
        <div
          key={i}
          ref={el => { particleRefs.current[i] = el; }}
          className="absolute rounded-full"
          style={{
            width: p.size,
            height: p.size,
            backgroundColor: p.color,
            boxShadow: `0 0 ${p.size + 4}px ${p.color}99`,
            left: 0,
            top: 0,
          }}
        />
      ))}
    </div>
  );
}
