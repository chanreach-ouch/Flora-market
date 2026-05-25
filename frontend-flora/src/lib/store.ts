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

  // Real Database Data
  realPlants: any[];
  realSellers: any[];

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

  fetchPlants: () => Promise<void>;
  fetchSellers: () => Promise<void>;
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
  realPlants: [],
  realSellers: [],

  setScreen: (screen) => set({ currentScreen: screen, previousScreen: get().currentScreen }),
  goBack: () => {
    const prev = get().previousScreen;
    if (prev) {
      set({ currentScreen: prev, previousScreen: null });
    } else {
      // Default fallback
      const role = get().userRole;
      set({ currentScreen: role === 'seller' ? 'seller-dashboard' : 'home', previousScreen: null });
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
    
    // Call the API endpoint
    const data = await fetchApi('/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      // OAuth2 Password Request Form format
      body: new URLSearchParams({
        username: email || phone, // fastapi uses 'username' field
        password: password,
      }),
    });

    if (data.access_token) {
      localStorage.setItem('token', data.access_token);
    }
    
    // Set up user object from token/data. We might need a separate /users/me call or use the info if the token has it.
    // Assuming backend will provide user details or we fetch them:
    const me = await fetchApi('/users/me');

    const newState = {
      isAuthenticated: true,
      userRole: me.role,
      user: {
        id: me.id.toString(),
        name: me.name || me.full_name || 'User',
        email: me.email || '',
        phone: me.phone || '',
        role: me.role as UserRole,
      },
      currentScreen: (me.role === 'seller' ? 'seller-dashboard' : 'home') as Screen,
    };
    set(newState);
    saveState({ ...get(), ...newState });
  },

  register: async (name, email, phone, password, role) => {
    await fetchApi('/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        email,
        phone,
        password,
        full_name: name,
        role,
      }),
    });
    
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

  fetchPlants: async () => {
    try {
      const data = await fetchApi('/plants/');
      set({ realPlants: data });
    } catch (e) {
      console.error('Failed to fetch plants:', e);
    }
  },

  fetchSellers: async () => {
    try {
      const data = await fetchApi('/sellers/');
      set({ realSellers: data });
    } catch (e) {
      console.error('Failed to fetch sellers:', e);
    }
  },
}));
