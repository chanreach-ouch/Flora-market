export const flyTargets: Partial<Record<'cart' | 'wishlist', HTMLElement>> = {};

export interface FlyPayload {
  id: string;
  x: number; // source center X in viewport
  y: number; // source center Y in viewport
  emoji: string;
  gradient: string; // Tailwind gradient class string
  target: 'cart' | 'wishlist';
}

type FlyListener = (p: FlyPayload) => void;
type LandListener = (target: 'cart' | 'wishlist') => void;

const flyBus = new Set<FlyListener>();
const landBus = new Set<LandListener>();

export function subscribeFly(fn: FlyListener) {
  flyBus.add(fn);
  return () => flyBus.delete(fn);
}

export function subscribeLand(fn: LandListener) {
  landBus.add(fn);
  return () => landBus.delete(fn);
}

export function notifyLand(target: 'cart' | 'wishlist') {
  landBus.forEach(fn => fn(target));
}

export function triggerFly(
  sourceEl: HTMLElement,
  target: 'cart' | 'wishlist',
  emoji: string,
  gradient: string,
) {
  // Bounce the source button: squash → overshoot → settle
  sourceEl.animate(
    [
      { transform: 'scale(1)' },
      { transform: 'scale(1.38)', offset: 0.22 },
      { transform: 'scale(0.86)', offset: 0.58 },
      { transform: 'scale(1.08)', offset: 0.78 },
      { transform: 'scale(1)' },
    ],
    { duration: 420, easing: 'cubic-bezier(0.34, 1.56, 0.64, 1)' },
  );

  const r = sourceEl.getBoundingClientRect();
  const payload: FlyPayload = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
    x: r.left + r.width / 2,
    y: r.top + r.height / 2,
    emoji,
    gradient,
    target,
  };
  flyBus.forEach(fn => fn(payload));
}
