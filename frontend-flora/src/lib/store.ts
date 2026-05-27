import { create } from 'zustand';
import { fetchApi } from './api';

export type Locale = 'kh' | 'en';
export type Screen = 'auth' | 'home' | 'browse' | 'profile' | 'plant-detail' | 'shop' | 'cart' | 'order-confirmation' | 'seller-dashboard' | 'admin' | 'personal-info' | 'notifications' | 'wishlist' | 'general-settings' | 'help-support' | 'privacy-policy' | 'terms-of-service';
export type UserRole = 'buyer' | 'seller' | 'admin';

interface CartItem {
  plantId: string;
  quantity: number;
}

interface AuthUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
}

interface AppState {
  // Navigation
  currentScreen: Screen;
  previousScreen: Screen | null;
  selectedPlantId: string | null;
  selectedSellerId: string | null;
  selectedOrderId: string | null;

  // User
  userRole: UserRole;
  isAdmin: boolean;
  locale: Locale;
  isAuthenticated: boolean;
  user: AuthUser | null;
  darkMode: boolean;

  // Cart
  cartItems: CartItem[];

  // Wishlist
  wishlistItems: string[];

  // Actions
  setScreen: (screen: Screen) => void;
  goBack: () => void;
  selectPlant: (id: string) => void;
  selectSeller: (id: string) => void;
  selectOrder: (id: string) => void;
  setAdmin: (isAdmin: boolean) => void;
  toggleLocale: () => void;
  toggleDarkMode: () => void;
  login: (loginId: string, password: string, role?: 'buyer' | 'seller') => Promise<void>;
  register: (name: string, email: string, phone: string, password: string, role: 'buyer' | 'seller') => Promise<void>;
  logout: () => void;
  updateUserProfile: (updates: Partial<AuthUser>) => void;
  addToCart: (plantId: string) => void;
  removeFromCart: (plantId: string) => void;
  updateCartQuantity: (plantId: string, quantity: number) => void;
  clearCart: () => void;
  getCartCount: () => number;
  addToWishlist: (plantId: string) => void;
  removeFromWishlist: (plantId: string) => void;
  isInWishlist: (plantId: string) => boolean;
}

// localStorage persistence helpers
const STORAGE_KEY = 'flora-market-state';

function loadState(): Partial<AppState> | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return {
      isAuthenticated: parsed.isAuthenticated ?? false,
      user: parsed.user ?? null,
      userRole: parsed.userRole ?? 'buyer',
      locale: parsed.locale ?? 'kh',
      cartItems: parsed.cartItems ?? [],
      wishlistItems: parsed.wishlistItems ?? [],
      isAdmin: parsed.isAdmin ?? false,
      darkMode: parsed.darkMode ?? false,
    };
  } catch {
    return null;
  }
}

function saveState(state: Partial<AppState>) {
  if (typeof window === 'undefined') return;
  try {
    const toSave = {
      isAuthenticated: state.isAuthenticated,
      user: state.user,
      userRole: state.userRole,
      locale: state.locale,
      cartItems: state.cartItems,
      wishlistItems: state.wishlistItems,
      isAdmin: state.isAdmin,
      darkMode: state.darkMode,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
  } catch {
    // Silently fail if localStorage is full or unavailable
  }
}

// Helper to detect if loginId is email or phone
function parseLoginId(loginId: string): { email: string; phone: string } {
  if (loginId.includes('@')) {
    return { email: loginId, phone: '' };
  }
  // It's a phone number - clean it up
  const cleaned = loginId.replace(/[\s\-()]/g, '');
  let phone = cleaned;
  if (phone.startsWith('+855')) phone = phone.slice(4);
  else if (phone.startsWith('855')) phone = phone.slice(3);
  else if (phone.startsWith('0')) phone = phone.slice(1);
  return { email: '', phone: phone };
}

// Apply dark mode to DOM
function applyDarkMode(darkMode: boolean) {
  if (typeof window === 'undefined') return;
  if (darkMode) {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
}

// Load persisted state
const persisted = loadState();

// Apply dark mode on load
if (typeof window !== 'undefined' && persisted?.darkMode) {
  applyDarkMode(true);
}

export const useAppStore = create<AppState>((set, get) => ({
  currentScreen: persisted?.isAuthenticated ? 'home' : 'auth',
  previousScreen: null,
  selectedPlantId: null,
  selectedSellerId: null,
  selectedOrderId: null,
  userRole: persisted?.userRole ?? 'buyer',
  isAdmin: persisted?.isAdmin ?? false,
  locale: persisted?.locale ?? 'kh',
  isAuthenticated: persisted?.isAuthenticated ?? false,
  user: persisted?.user ?? null,
  darkMode: persisted?.darkMode ?? false,
  cartItems: persisted?.cartItems ?? [],
  wishlistItems: persisted?.wishlistItems ?? [],

  setScreen: (screen) => set({ currentScreen: screen, previousScreen: get().currentScreen }),
  goBack: () => {
    const prev = get().previousScreen;
    if (prev) {
      set({ currentScreen: prev, previousScreen: null });
    } else {
      // Default fallback
      set({ currentScreen: 'home', previousScreen: null });
    }
  },
  selectPlant: (id) => set({ selectedPlantId: id, previousScreen: get().currentScreen, currentScreen: 'plant-detail' }),
  selectSeller: (id) => set({ selectedSellerId: id, previousScreen: get().currentScreen, currentScreen: 'shop' }),
  selectOrder: (id) => set({ selectedOrderId: id, previousScreen: get().currentScreen, currentScreen: 'order-confirmation' }),
  setAdmin: (isAdmin) => {
    set({ isAdmin });
    saveState({ ...get(), isAdmin });
  },
  toggleLocale: () => {
    const newLocale = get().locale === 'kh' ? 'en' : 'kh';
    set({ locale: newLocale });
    saveState({ ...get(), locale: newLocale });
  },
  toggleDarkMode: () => {
    const newDarkMode = !get().darkMode;
    applyDarkMode(newDarkMode);
    set({ darkMode: newDarkMode });
    saveState({ ...get(), darkMode: newDarkMode });
  },

  login: async (loginId, password, role) => {
    const { email, phone } = parseLoginId(loginId);

    // ────────────────────────────────────────────────────────────
    // DEMO MODE — works without a running backend / database.
    // Demo accounts:
    //   buyer@demo.com   / demo123  → buyer
    //   seller@demo.com  / demo123  → seller
    //   admin@demo.com   / demo123  → admin
    // ────────────────────────────────────────────────────────────
    const DEMO_ACCOUNTS: Record<string, { role: UserRole; name: string }> = {
      'buyer@demo.com':  { role: 'buyer',  name: 'Demo Buyer' },
      'seller@demo.com': { role: 'seller', name: 'Demo Seller' },
      'admin@demo.com':  { role: 'admin',  name: 'Demo Admin' },
    };
    const loginKey = (email || phone).toLowerCase();
    if (DEMO_ACCOUNTS[loginKey] && password === 'demo123') {
      const demo = DEMO_ACCOUNTS[loginKey];
      const newState = {
        isAuthenticated: true,
        userRole: demo.role,
        isAdmin: demo.role === 'admin',
        user: { id: 'demo-user', name: demo.name, email: loginKey, phone: '', role: demo.role },
        currentScreen: (demo.role === 'seller' ? 'seller-dashboard' : demo.role === 'admin' ? 'admin' : 'home') as Screen,
      };
      set(newState);
      saveState({ ...get(), ...newState });
      return;
    }

    // ── Real backend login ──
    try {
      const data = await fetchApi('/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ username: email || phone, password }),
      });

      if (data.access_token) {
        localStorage.setItem('token', data.access_token);
      }

      // Fetch current user profile
      const me = await fetchApi('/users/me');

      // Map backend role → frontend UserRole
      const backendRole: string = me.role || 'customer';
      let mappedRole: UserRole = 'buyer';
      if (backendRole === 'seller') mappedRole = 'seller';
      else if (['admin', 'super_admin', 'manager'].includes(backendRole)) mappedRole = 'admin';
      else mappedRole = 'buyer';

      const isAdmin = ['admin', 'super_admin', 'manager'].includes(backendRole);

      const newState = {
        isAuthenticated: true,
        userRole: mappedRole,
        isAdmin,
        user: {
          id: String(me.id),
          name: me.full_name || me.email || 'User',
          email: me.email || '',
          phone: me.phone || '',
          role: mappedRole,
        },
        currentScreen: (mappedRole === 'seller' ? 'seller-dashboard' : mappedRole === 'admin' ? 'admin' : 'home') as Screen,
      };
      set(newState);
      saveState({ ...get(), ...newState });
    } catch (err: any) {
      // Re-throw with a clear message
      throw new Error(err?.message || 'Login failed. Please check your credentials.');
    }
  },

  register: async (name, email, phone, password, role) => {
    // Map frontend role ('buyer' → 'customer') for the backend
    const backendRole = role === 'buyer' ? 'customer' : role;
    
    try {
      await fetchApi('/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          email,
          phone: phone || null,
          password,
          full_name: name,
          role: backendRole,
        }),
      });
    } catch (err: any) {
      throw new Error(err?.message || 'Registration failed. Please try again.');
    }
    
    // Automatically log in after register
    await get().login(email || phone, password, role);
  },

  updateUserProfile: (updates) => {
    const currentUser = get().user;
    if (!currentUser) return;
    const updatedUser = { ...currentUser, ...updates };
    set({ user: updatedUser });
    saveState({ ...get(), user: updatedUser });
  },

  logout: () => {
    const newState = {
      isAuthenticated: false,
      user: null,
      cartItems: [],
      wishlistItems: [],
      userRole: 'buyer' as UserRole,
      isAdmin: false,
      currentScreen: 'auth' as Screen,
      previousScreen: null,
    };
    set(newState);
    try {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem('token');
    } catch {
      // Silently fail
    }
  },

  addToCart: (plantId) => {
    const existing = get().cartItems.find(i => i.plantId === plantId);
    let newCart: CartItem[];
    if (existing) {
      newCart = get().cartItems.map(i => i.plantId === plantId ? { ...i, quantity: i.quantity + 1 } : i);
    } else {
      newCart = [...get().cartItems, { plantId, quantity: 1 }];
    }
    set({ cartItems: newCart });
    saveState({ ...get(), cartItems: newCart });
  },

  removeFromCart: (plantId) => {
    const newCart = get().cartItems.filter(i => i.plantId !== plantId);
    set({ cartItems: newCart });
    saveState({ ...get(), cartItems: newCart });
  },

  updateCartQuantity: (plantId, quantity) => {
    const newCart = quantity <= 0
      ? get().cartItems.filter(i => i.plantId !== plantId)
      : get().cartItems.map(i => i.plantId === plantId ? { ...i, quantity } : i);
    set({ cartItems: newCart });
    saveState({ ...get(), cartItems: newCart });
  },

  clearCart: () => {
    set({ cartItems: [] });
    saveState({ ...get(), cartItems: [] });
  },
  getCartCount: () => get().cartItems.reduce((sum, i) => sum + i.quantity, 0),

  addToWishlist: (plantId) => {
    const current = get().wishlistItems;
    if (!current.includes(plantId)) {
      const newWishlist = [...current, plantId];
      set({ wishlistItems: newWishlist });
      saveState({ ...get(), wishlistItems: newWishlist });
    }
  },

  removeFromWishlist: (plantId) => {
    const newWishlist = get().wishlistItems.filter(id => id !== plantId);
    set({ wishlistItems: newWishlist });
    saveState({ ...get(), wishlistItems: newWishlist });
  },

  isInWishlist: (plantId) => get().wishlistItems.includes(plantId),
}));
