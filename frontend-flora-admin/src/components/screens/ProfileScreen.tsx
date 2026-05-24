'use client';

import { useAppStore } from '@/lib/store';
import { t } from '@/lib/i18n';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  User, ShoppingBag, Star, Heart, Bell, Settings, HelpCircle,
  LogOut, ChevronRight, Shield, MapPin, Leaf,
} from 'lucide-react';

export default function ProfileScreen() {
  const { locale, user, userRole, setScreen, logout } = useAppStore();

  const buyerMenuItems = [
    { icon: User, label: t(locale, 'personalInfo'), screen: 'personal-info' as const },
    { icon: Bell, label: t(locale, 'notificationsTitle'), screen: 'notifications' as const },
    { icon: Heart, label: t(locale, 'wishlistTitle'), screen: 'wishlist' as const },
    { icon: Settings, label: t(locale, 'generalSettingsTitle'), screen: 'general-settings' as const },
    { icon: HelpCircle, label: t(locale, 'helpSupportTitle'), screen: 'help-support' as const },
  ];

  const sellerMenuItems = [
    { icon: User, label: t(locale, 'personalInfo'), screen: 'personal-info' as const },
    { icon: Bell, label: t(locale, 'notificationsTitle'), screen: 'notifications' as const },
    // No Wishlist for sellers
    { icon: Settings, label: t(locale, 'generalSettingsTitle'), screen: 'general-settings' as const },
    { icon: HelpCircle, label: t(locale, 'helpSupportTitle'), screen: 'help-support' as const },
  ];

  const menuItems = userRole === 'seller' ? sellerMenuItems : buyerMenuItems;

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
      {/* User Card */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-2xl bg-gradient-to-br from-pale-green to-accent-green/30 dark:from-forest-mid dark:to-forest flex items-center justify-center">
              <span className="text-3xl sm:text-4xl">{userRole === 'seller' ? '🏪' : '🛒'}</span>
            </div>
            <div>
              <h2 className="text-xl font-bold">{user?.name || 'User'}</h2>
              <p className="text-sm text-muted-foreground">{user?.email || user?.phone || ''}</p>
              <Badge className={`mt-1 ${userRole === 'seller' ? 'bg-gold/10 text-gold' : 'bg-accent-green/10 text-accent-green'}`}>
                {userRole === 'seller' ? (locale === 'kh' ? 'អ្នកលក់' : 'Seller') : (locale === 'kh' ? 'អ្នកទិញ' : 'Buyer')}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <Card>
          <CardContent className="p-3 text-center">
            <ShoppingBag className="h-5 w-5 mx-auto mb-1 text-muted-foreground" />
            <p className="text-lg font-bold">12</p>
            <p className="text-xs text-muted-foreground">{t(locale, 'orders')}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 text-center">
            <Star className="h-5 w-5 mx-auto mb-1 text-gold" />
            <p className="text-lg font-bold">4.8</p>
            <p className="text-xs text-muted-foreground">{t(locale, 'rating')}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 text-center">
            <MapPin className="h-5 w-5 mx-auto mb-1 text-muted-foreground" />
            <p className="text-lg font-bold">PP</p>
            <p className="text-xs text-muted-foreground">{locale === 'kh' ? 'ទីក្រុង' : 'City'}</p>
          </CardContent>
        </Card>
      </div>

      {/* Account Menu */}
      <Card>
        <CardContent className="p-2">
          {menuItems.map((item, idx) => (
            <button
              key={idx}
              onClick={() => setScreen(item.screen)}
              className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-flora text-left"
            >
              <item.icon className="h-5 w-5 text-muted-foreground" />
              <span className="flex-1 text-sm font-medium">{item.label}</span>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </button>
          ))}
        </CardContent>
      </Card>

      {/* Admin Access */}
      <Card className="mt-4">
        <CardContent className="p-2">
          <button
            onClick={() => setScreen('admin')}
            className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-flora text-left"
          >
            <Shield className="h-5 w-5 text-muted-foreground" />
            <span className="flex-1 text-sm font-medium">{locale === 'kh' ? 'ផ្ទាំងអ្នកគ្រប់គ្រង' : 'Admin Panel'}</span>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </button>
        </CardContent>
      </Card>

      {/* Sign Out */}
      <Button
        variant="outline"
        className="w-full mt-4 text-destructive hover:text-destructive"
        onClick={logout}
      >
        <LogOut className="h-4 w-4 mr-2" />
        {locale === 'kh' ? 'ចាកចេញ' : 'Sign Out'}
      </Button>
    </div>
  );
}
