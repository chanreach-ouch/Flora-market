'use client';

import { useState } from 'react';
import { useAppStore } from '@/lib/store';
import { t } from '@/lib/i18n';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from '@/components/ui/sheet';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Home,
  Search,
  ShoppingCart,
  Heart,
  User,
  LayoutDashboard,
  Settings,
  LogOut,
  Menu,
  Sun,
  Moon,
  Globe,
  Shield,
  HelpCircle,
  Bell,
  ChevronDown,
} from 'lucide-react';

export default function Navbar() {
  const {
    currentScreen, setScreen, goBack,
    userRole, locale, toggleLocale,
    darkMode, toggleDarkMode,
    isAuthenticated, logout, getCartCount, wishlistItems,
  } = useAppStore();
  const [mobileOpen, setMobileOpen] = useState(false);

  if (!isAuthenticated) return null;

  const cartCount = getCartCount();
  const wishlistCount = wishlistItems.length;

  const buyerLinks = [
    { icon: Home, label: t(locale, 'home'), screen: 'home' as const },
    { icon: Search, label: t(locale, 'browse'), screen: 'browse' as const },
    { icon: ShoppingCart, label: t(locale, 'myCart'), screen: 'cart' as const, badge: cartCount },
    { icon: Heart, label: t(locale, 'wishlistTitle'), screen: 'wishlist' as const, badge: wishlistCount },
  ];

  const sellerLinks = [
    { icon: Home, label: t(locale, 'home'), screen: 'home' as const },
    { icon: Search, label: t(locale, 'browse'), screen: 'browse' as const },
    { icon: LayoutDashboard, label: t(locale, 'dashboard'), screen: 'seller-dashboard' as const },
    { icon: ShoppingCart, label: t(locale, 'myCart'), screen: 'cart' as const, badge: cartCount },
  ];

  const adminLinks = [
    { icon: Shield, label: 'Admin', screen: 'admin' as const },
    { icon: LayoutDashboard, label: t(locale, 'dashboard'), screen: 'seller-dashboard' as const },
  ];

  const navLinks = userRole === 'admin' ? adminLinks : userRole === 'seller' ? sellerLinks : buyerLinks;

  const handleNavClick = (screen: string) => {
    setScreen(screen as any);
    setMobileOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
      <div className="max-w-7xl mx-auto flex h-16 items-center justify-between px-4 sm:px-6">
        {/* Logo */}
        <button
          onClick={() => setScreen('home')}
          className="flex items-center gap-2 hover:opacity-80 transition-flora"
        >
          <span className="text-2xl">🌿</span>
          <div className="flex flex-col">
            <span className="font-bold text-lg leading-tight text-forest dark:text-pale-green">
              {locale === 'kh' ? 'ផ្សាររុក្ខជាតិ' : 'Flora Market'}
            </span>
            <span className="text-[10px] text-muted-foreground leading-tight hidden sm:block">
              {locale === 'kh' ? 'Flora Market' : 'ផ្សាររុក្ខជាតិ'}
            </span>
          </div>
        </button>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <Button
              key={link.label}
              variant={currentScreen === link.screen ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => handleNavClick(link.screen)}
              className="relative gap-2"
            >
              <link.icon className="h-4 w-4" />
              <span>{link.label}</span>
              {link.badge ? (
                <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-[10px] bg-accent-green text-white">
                  {link.badge}
                </Badge>
              ) : null}
            </Button>
          ))}
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-2">
          {/* Language Toggle */}
          <Button variant="ghost" size="icon" onClick={toggleLocale} className="h-9 w-9">
            <Globe className="h-4 w-4" />
            <span className="sr-only">Toggle language</span>
          </Button>

          {/* Dark Mode Toggle */}
          <Button variant="ghost" size="icon" onClick={toggleDarkMode} className="h-9 w-9">
            {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            <span className="sr-only">Toggle dark mode</span>
          </Button>

          {/* Notifications */}
          <Button variant="ghost" size="icon" onClick={() => setScreen('notifications')} className="h-9 w-9 hidden sm:flex">
            <Bell className="h-4 w-4" />
          </Button>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="gap-2">
                <div className="h-7 w-7 rounded-full bg-pale-green dark:bg-forest-mid flex items-center justify-center">
                  <User className="h-4 w-4 text-forest dark:text-pale-green" />
                </div>
                <ChevronDown className="h-3 w-3 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={() => setScreen('profile')}>
                <User className="mr-2 h-4 w-4" />
                {t(locale, 'profile')}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setScreen('general-settings')}>
                <Settings className="mr-2 h-4 w-4" />
                {t(locale, 'generalSettingsTitle')}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setScreen('help-support')}>
                <HelpCircle className="mr-2 h-4 w-4" />
                {t(locale, 'helpSupportTitle')}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={logout} className="text-destructive">
                <LogOut className="mr-2 h-4 w-4" />
                {locale === 'kh' ? 'ចាកចេញ' : 'Sign Out'}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Mobile Menu */}
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden h-9 w-9">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72">
              <SheetTitle className="flex items-center gap-2 mb-6">
                <span className="text-2xl">🌿</span>
                <span className="font-bold text-lg">{locale === 'kh' ? 'ផ្សាររុក្ខជាតិ' : 'Flora Market'}</span>
              </SheetTitle>
              <nav className="flex flex-col gap-1">
                {navLinks.map((link) => (
                  <Button
                    key={link.label}
                    variant={currentScreen === link.screen ? 'secondary' : 'ghost'}
                    className="justify-start gap-3 h-11"
                    onClick={() => handleNavClick(link.screen)}
                  >
                    <link.icon className="h-5 w-5" />
                    <span>{link.label}</span>
                    {link.badge ? (
                      <Badge className="ml-auto h-5 w-5 p-0 flex items-center justify-center text-[10px]">
                        {link.badge}
                      </Badge>
                    ) : null}
                  </Button>
                ))}
                <div className="border-t my-3" />
                <Button variant="ghost" className="justify-start gap-3 h-11" onClick={() => { setScreen('profile'); setMobileOpen(false); }}>
                  <User className="h-5 w-5" />
                  <span>{t(locale, 'profile')}</span>
                </Button>
                <Button variant="ghost" className="justify-start gap-3 h-11" onClick={() => { setScreen('general-settings'); setMobileOpen(false); }}>
                  <Settings className="h-5 w-5" />
                  <span>{t(locale, 'generalSettingsTitle')}</span>
                </Button>
                <Button variant="ghost" className="justify-start gap-3 h-11" onClick={() => { setScreen('help-support'); setMobileOpen(false); }}>
                  <HelpCircle className="h-5 w-5" />
                  <span>{t(locale, 'helpSupportTitle')}</span>
                </Button>
                <Button variant="ghost" className="justify-start gap-3 h-11 text-destructive" onClick={() => { logout(); setMobileOpen(false); }}>
                  <LogOut className="h-5 w-5" />
                  <span>{locale === 'kh' ? 'ចាកចេញ' : 'Sign Out'}</span>
                </Button>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
