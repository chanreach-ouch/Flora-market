'use client';

import { useState } from 'react';
import { useAppStore } from '@/lib/store';
import type { Screen } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import {
  LayoutDashboard, Users, Store, ShoppingBag, Leaf,
  BarChart3, Settings, LogOut, Menu, ChevronLeft, ChevronRight,
  Shield,
} from 'lucide-react';

const navItems: { icon: React.ElementType; label: string; labelKh: string; screen: Screen }[] = [
  { icon: LayoutDashboard, label: 'Dashboard', labelKh: 'ផ្ទាំងគ្រប់គ្រង', screen: 'dashboard' },
  { icon: Users, label: 'Users', labelKh: 'អ្នកប្រើ', screen: 'users' },
  { icon: Store, label: 'Sellers', labelKh: 'អ្នកលក់', screen: 'sellers' },
  { icon: ShoppingBag, label: 'Orders', labelKh: 'ការបញ្ជាទិញ', screen: 'orders' },
  { icon: Leaf, label: 'Plants', labelKh: 'រុក្ខជាតិ', screen: 'plants' },
  { icon: BarChart3, label: 'Analytics', labelKh: 'ការវិភាគ', screen: 'analytics' },
];

const bottomItems: { icon: React.ElementType; label: string; labelKh: string; screen: Screen }[] = [
  { icon: Settings, label: 'Settings', labelKh: 'ការកំណត់', screen: 'general-settings' },
];

function SidebarContent({ collapsed, onNavigate }: { collapsed: boolean; onNavigate?: () => void }) {
  const { currentScreen, setScreen, logout, locale, user } = useAppStore();

  const handleNav = (screen: Screen) => {
    setScreen(screen);
    onNavigate?.();
  };

  return (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className={`flex items-center gap-3 px-4 py-5 border-b border-border/50 ${collapsed ? 'justify-center' : ''}`}>
        <div className="h-9 w-9 rounded-xl bg-forest flex items-center justify-center flex-shrink-0">
          <Shield className="h-5 w-5 text-white" />
        </div>
        {!collapsed && (
          <div className="min-w-0">
            <p className="font-bold text-sm leading-tight text-forest dark:text-pale-green truncate">
              Flora Admin
            </p>
            <p className="text-[10px] text-muted-foreground truncate">Management Portal</p>
          </div>
        )}
      </div>

      {/* Main Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {!collapsed && (
          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider px-3 mb-2">
            {locale === 'kh' ? 'ម៉ឺនុយ' : 'Menu'}
          </p>
        )}
        {navItems.map(({ icon: Icon, label, labelKh, screen }) => {
          const active = currentScreen === screen;
          return (
            <button
              key={screen}
              onClick={() => handleNav(screen)}
              title={collapsed ? (locale === 'kh' ? labelKh : label) : undefined}
              className={`
                w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150
                ${active
                  ? 'bg-forest text-white shadow-sm'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                }
                ${collapsed ? 'justify-center' : ''}
              `}
            >
              <Icon className="h-4 w-4 flex-shrink-0" />
              {!collapsed && <span className="truncate">{locale === 'kh' ? labelKh : label}</span>}
            </button>
          );
        })}
      </nav>

      {/* Bottom section */}
      <div className="px-3 py-4 border-t border-border/50 space-y-1">
        {bottomItems.map(({ icon: Icon, label, labelKh, screen }) => {
          const active = currentScreen === screen;
          return (
            <button
              key={screen}
              onClick={() => handleNav(screen)}
              title={collapsed ? (locale === 'kh' ? labelKh : label) : undefined}
              className={`
                w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150
                ${active ? 'bg-forest text-white' : 'text-muted-foreground hover:bg-muted hover:text-foreground'}
                ${collapsed ? 'justify-center' : ''}
              `}
            >
              <Icon className="h-4 w-4 flex-shrink-0" />
              {!collapsed && <span className="truncate">{locale === 'kh' ? labelKh : label}</span>}
            </button>
          );
        })}

        {/* User info */}
        {!collapsed && user && (
          <div className="flex items-center gap-3 px-3 py-2 mt-2 rounded-lg bg-muted/50">
            <div className="h-8 w-8 rounded-full bg-forest/10 border border-forest/20 flex items-center justify-center flex-shrink-0">
              <span className="text-xs font-bold text-forest">
                {user.name.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold truncate">{user.name}</p>
              <Badge variant="secondary" className="text-[9px] h-4 px-1.5 mt-0.5">
                {user.role.replace('_', ' ')}
              </Badge>
            </div>
          </div>
        )}

        <button
          onClick={logout}
          title={collapsed ? 'Sign Out' : undefined}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-destructive hover:bg-destructive/10 transition-all duration-150 ${collapsed ? 'justify-center' : ''}`}
        >
          <LogOut className="h-4 w-4 flex-shrink-0" />
          {!collapsed && <span>{locale === 'kh' ? 'ចាកចេញ' : 'Sign Out'}</span>}
        </button>
      </div>
    </div>
  );
}

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { isAuthenticated } = useAppStore();

  if (!isAuthenticated) return null;

  return (
    <>
      {/* Desktop sidebar */}
      <aside
        className={`
          hidden lg:flex flex-col border-r border-border/50 bg-card relative transition-all duration-300
          ${collapsed ? 'w-[68px]' : 'w-[240px]'}
        `}
      >
        <SidebarContent collapsed={collapsed} />

        {/* Collapse toggle */}
        <button
          onClick={() => setCollapsed(c => !c)}
          className="absolute -right-3 top-20 h-6 w-6 rounded-full border border-border bg-card flex items-center justify-center shadow-sm hover:bg-muted transition-colors z-10"
        >
          {collapsed
            ? <ChevronRight className="h-3 w-3 text-muted-foreground" />
            : <ChevronLeft className="h-3 w-3 text-muted-foreground" />
          }
        </button>
      </aside>

      {/* Mobile top bar trigger */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 h-14 border-b border-border/50 bg-card/80 backdrop-blur-xl flex items-center px-4 gap-3">
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="h-9 w-9">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[240px] p-0">
            <SheetTitle className="sr-only">Navigation</SheetTitle>
            <SidebarContent collapsed={false} onNavigate={() => setMobileOpen(false)} />
          </SheetContent>
        </Sheet>
        <div className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-lg bg-forest flex items-center justify-center">
            <Shield className="h-4 w-4 text-white" />
          </div>
          <span className="font-bold text-sm text-forest dark:text-pale-green">Flora Admin</span>
        </div>
      </div>
    </>
  );
}
