'use client';

import { useAppStore } from '@/lib/store';
import type { Screen } from '@/lib/store';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import {
  Sun, Moon, Globe, Bell, User, Settings, LogOut, ChevronDown,
  LayoutDashboard, Users, Store, ShoppingBag, Leaf, BarChart3,
} from 'lucide-react';

const screenMeta: Record<Screen, { label: string; labelKh: string; icon: React.ElementType }> = {
  auth: { label: 'Login', labelKh: 'ចូល', icon: User },
  dashboard: { label: 'Dashboard', labelKh: 'ផ្ទាំងគ្រប់គ្រង', icon: LayoutDashboard },
  users: { label: 'User Management', labelKh: 'គ្រប់គ្រងអ្នកប្រើ', icon: Users },
  sellers: { label: 'Seller Management', labelKh: 'គ្រប់គ្រងអ្នកលក់', icon: Store },
  orders: { label: 'Order Management', labelKh: 'គ្រប់គ្រងការបញ្ជាទិញ', icon: ShoppingBag },
  plants: { label: 'Plant Listings', labelKh: 'បញ្ជីរុក្ខជាតិ', icon: Leaf },
  analytics: { label: 'Analytics & Revenue', labelKh: 'ការវិភាគ & ប្រាក់ចំណូល', icon: BarChart3 },
  profile: { label: 'Profile', labelKh: 'ប្រវត្តិ', icon: User },
  'personal-info': { label: 'Personal Info', labelKh: 'ព័ត៌មានផ្ទាល់ខ្លួន', icon: User },
  notifications: { label: 'Notifications', labelKh: 'ការជូនដំណឹង', icon: Bell },
  'general-settings': { label: 'Settings', labelKh: 'ការកំណត់', icon: Settings },
  'help-support': { label: 'Help & Support', labelKh: 'ជំនួយ', icon: User },
  'privacy-policy': { label: 'Privacy Policy', labelKh: 'គោលការណ៍ឯកជន', icon: User },
  'terms-of-service': { label: 'Terms of Service', labelKh: 'លក្ខខណ្ឌ', icon: User },
};

export default function Header() {
  const {
    currentScreen, setScreen, locale, toggleLocale,
    darkMode, toggleDarkMode, logout, user, isAuthenticated,
  } = useAppStore();

  if (!isAuthenticated) return null;

  const meta = screenMeta[currentScreen] ?? screenMeta.dashboard;
  const Icon = meta.icon;

  return (
    <header className="h-14 border-b border-border/50 bg-card/50 backdrop-blur-sm flex items-center justify-between px-6 flex-shrink-0 lg:sticky top-0 z-40">
      {/* Page title */}
      <div className="flex items-center gap-2.5">
        <div className="h-7 w-7 rounded-lg bg-forest/10 flex items-center justify-center">
          <Icon className="h-4 w-4 text-forest dark:text-accent-green" />
        </div>
        <div>
          <h1 className="text-sm font-semibold leading-none">
            {locale === 'kh' ? meta.labelKh : meta.label}
          </h1>
          <p className="text-[10px] text-muted-foreground mt-0.5 hidden sm:block">
            Flora Market · Admin Portal
          </p>
        </div>
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-1">
        {/* Language toggle */}
        <Button variant="ghost" size="sm" onClick={toggleLocale} className="h-8 gap-1.5 text-xs hidden sm:flex">
          <Globe className="h-3.5 w-3.5" />
          <span className="font-medium">{locale === 'kh' ? 'EN' : 'KH'}</span>
        </Button>

        {/* Dark mode */}
        <Button variant="ghost" size="icon" onClick={toggleDarkMode} className="h-8 w-8">
          {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </Button>

        {/* Notifications */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setScreen('notifications')}
          className="h-8 w-8 relative hidden sm:flex"
        >
          <Bell className="h-4 w-4" />
          <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-accent-green border-2 border-card" />
        </Button>

        {/* User dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 gap-2 pl-2 pr-1">
              <div className="h-6 w-6 rounded-full bg-forest flex items-center justify-center">
                <span className="text-[10px] font-bold text-white">
                  {user?.name?.charAt(0)?.toUpperCase() ?? 'A'}
                </span>
              </div>
              <span className="text-xs font-medium hidden sm:block max-w-[80px] truncate">
                {user?.name ?? 'Admin'}
              </span>
              <ChevronDown className="h-3 w-3 text-muted-foreground" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-52">
            <div className="px-2 py-1.5">
              <p className="text-sm font-medium truncate">{user?.name}</p>
              <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
              <Badge variant="secondary" className="text-[9px] h-4 px-1.5 mt-1">
                {user?.role?.replace('_', ' ')}
              </Badge>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => setScreen('profile')}>
              <User className="mr-2 h-4 w-4" />
              {locale === 'kh' ? 'ប្រវត្តិ' : 'Profile'}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setScreen('general-settings')}>
              <Settings className="mr-2 h-4 w-4" />
              {locale === 'kh' ? 'ការកំណត់' : 'Settings'}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={logout} className="text-destructive focus:text-destructive">
              <LogOut className="mr-2 h-4 w-4" />
              {locale === 'kh' ? 'ចាកចេញ' : 'Sign Out'}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
