import { create } from 'zustand';
import { fetchApi } from './api';

export type Locale = 'kh' | 'en';
export type Screen =
  | 'auth'
  | 'dashboard'
  | 'users'
  | 'sellers'
  | 'orders'
  | 'plants'
  | 'analytics'
  | 'profile'
  | 'personal-info'
  | 'notifications'
  | 'general-settings'
  | 'help-support'
  | 'privacy-policy'
  | 'terms-of-service';

export type UserRole = 'buyer' | 'seller' | 'admin' | 'super_admin' | 'manager';

interface AuthUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
}

interface AppState {
  currentScreen: Screen;
  previousScreen: Screen | null;
  userRole: UserRole;
  isAdmin: boolean;
  locale: Locale;
  isAuthenticated: boolean;
  user: AuthUser | null;
  darkMode: boolean;

  setScreen: (screen: Screen) => void;
  goBack: () => void;
  setAdmin: (isAdmin: boolean) => void;
  toggleLocale: () => void;
  toggleDarkMode: () => void;
  login: (loginId: string, password: string) => Promise<void>;
  register: (name: string, email: string, phone: string, password: string) => Promise<void>;
  logout: () => void;
  updateUserProfile: (updates: Partial<AuthUser>) => void;
}

const STORAGE_KEY = 'flora-admin-state';

function loadState(): Partial<AppState> | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return {
      isAuthenticated: parsed.isAuthenticated ?? false,
      user: parsed.user ?? null,
      userRole: parsed.userRole ?? 'admin',
      locale: parsed.locale ?? 'en',
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
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      isAuthenticated: state.isAuthenticated,
      user: state.user,
      userRole: state.userRole,
      locale: state.locale,
      isAdmin: state.isAdmin,
      darkMode: state.darkMode,
    }));
  } catch {
    // ignore
  }
}

function parseLoginId(loginId: string): { email: string; phone: string } {
  if (loginId.includes('@')) return { email: loginId, phone: '' };
  const cleaned = loginId.replace(/[\s\-()]/g, '');
  let phone = cleaned;
  if (phone.startsWith('+855')) phone = phone.slice(4);
  else if (phone.startsWith('855')) phone = phone.slice(3);
  else if (phone.startsWith('0')) phone = phone.slice(1);
  return { email: '', phone };
}

function applyDarkMode(darkMode: boolean) {
  if (typeof window === 'undefined') return;
  document.documentElement.classList.toggle('dark', darkMode);
}

const persisted = loadState();
if (typeof window !== 'undefined' && persisted?.darkMode) applyDarkMode(true);

export const useAppStore = create<AppState>((set, get) => ({
  currentScreen: persisted?.isAuthenticated ? 'dashboard' : 'auth',
  previousScreen: null,
  userRole: (persisted?.userRole ?? 'admin') as UserRole,
  isAdmin: persisted?.isAdmin ?? false,
  locale: persisted?.locale ?? 'en',
  isAuthenticated: persisted?.isAuthenticated ?? false,
  user: persisted?.user ?? null,
  darkMode: persisted?.darkMode ?? false,

  setScreen: (screen) => set({ currentScreen: screen, previousScreen: get().currentScreen }),

  goBack: () => {
    const prev = get().previousScreen;
    set({ currentScreen: prev ?? 'dashboard', previousScreen: null });
  },

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

  login: async (loginId, password) => {
    const { email, phone } = parseLoginId(loginId);
    const data = await fetchApi('/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ username: email || phone, password }),
    });
    if (data.access_token) {
      localStorage.setItem('token', data.access_token);
    }
    const me = await fetchApi('/users/me');
    const adminRoles = ['admin', 'super_admin', 'manager'];
    if (!adminRoles.includes(me.role)) {
      localStorage.removeItem('token');
      throw new Error('Access denied: Admin accounts only');
    }
    const newState = {
      isAuthenticated: true,
      userRole: me.role as UserRole,
      isAdmin: true,
      user: {
        id: me.id.toString(),
        name: me.full_name || me.name || 'Admin',
        email: me.email || '',
        phone: me.phone || '',
        role: me.role as UserRole,
      },
      currentScreen: 'dashboard' as Screen,
    };
    set(newState);
    saveState({ ...get(), ...newState });
  },

  register: async (name, email, phone, password) => {
    await fetchApi('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, phone, password, full_name: name, role: 'admin' }),
    });
    await get().login(email || phone, password);
  },

  updateUserProfile: (updates) => {
    const current = get().user;
    if (!current) return;
    const updatedUser = { ...current, ...updates };
    set({ user: updatedUser });
    saveState({ ...get(), user: updatedUser });
  },

  logout: () => {
    const newState = {
      isAuthenticated: false,
      user: null,
      userRole: 'admin' as UserRole,
      isAdmin: false,
      currentScreen: 'auth' as Screen,
      previousScreen: null,
    };
    set(newState);
    try {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem('token');
    } catch {
      // ignore
    }
  },
}));
