'use client';

import { useState } from 'react';
import { useAppStore } from '@/lib/store';
import { t } from '@/lib/i18n';
import { FloraLogo } from '@/components/ui/flora-logo';
import { Button } from '@/components/ui/button';
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
  User,
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
  LayoutDashboard,
} from 'lucide-react';

export default function Navbar() {
  const {
    currentScreen, setScreen,
    locale, toggleLocale,
    darkMode, toggleDarkMode,
    isAuthenticated, logout,
  } = useAppStore();
  const [mobileOpen, setMobileOpen] = useState(false);

  if (!isAuthenticated) return null;

  const navLinks = [
    { icon: Shield,          label: locale === 'kh' ? 'ផ្ទាំងអ្នកគ្រប់គ្រង' : 'Dashboard',     screen: 'admin' as const },
    { icon: LayoutDashboard, label: locale === 'kh' ? 'ការបញ្ជាទិញ'          : 'Orders',         screen: 'orders' as const },
    { icon: Bell,            label: locale === 'kh' ? 'ការជូនដំណឹង'         : 'Notifications',  screen: 'notifications' as const },
  ];

  const handleNavClick = (screen: string) => {
    setScreen(screen as any);
    setMobileOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
      <div className="max-w-7xl mx-auto flex h-16 items-center justify-between px-4 sm:px-6">

        {/* Logo */}
        <button
          onClick={() => setScreen('admin' as any)}
          className="hover:opacity-75 transition-flora"
        >
          <FloraLogo size="sm" locale={locale} />
        </button>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <Button
              key={link.screen}
              variant={currentScreen === link.screen ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => handleNavClick(link.screen)}
              className="gap-2"
            >
              <link.icon className="h-4 w-4" />
              <span>{link.label}</span>
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
              <DropdownMenuItem onClick={() => setScreen('profile' as any)}>
                <User className="mr-2 h-4 w-4" />
                {t(locale, 'profile')}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setScreen('general-settings' as any)}>
                <Settings className="mr-2 h-4 w-4" />
                {t(locale, 'generalSettingsTitle')}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setScreen('help-support' as any)}>
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
              <SheetTitle className="mb-6">
                <FloraLogo size="sm" locale={locale} />
              </SheetTitle>
              <nav className="flex flex-col gap-1">
                {navLinks.map((link) => (
                  <Button
                    key={link.screen}
                    variant={currentScreen === link.screen ? 'secondary' : 'ghost'}
                    className="justify-start gap-3 h-11"
                    onClick={() => handleNavClick(link.screen)}
                  >
                    <link.icon className="h-5 w-5" />
                    <span>{link.label}</span>
                  </Button>
                ))}
                <div className="border-t my-3" />
                <Button variant="ghost" className="justify-start gap-3 h-11" onClick={() => { setScreen('profile' as any); setMobileOpen(false); }}>
                  <User className="h-5 w-5" />
                  <span>{t(locale, 'profile')}</span>
                </Button>
                <Button variant="ghost" className="justify-start gap-3 h-11" onClick={() => { setScreen('general-settings' as any); setMobileOpen(false); }}>
                  <Settings className="h-5 w-5" />
                  <span>{t(locale, 'generalSettingsTitle')}</span>
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
