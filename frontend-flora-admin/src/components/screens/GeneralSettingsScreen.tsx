'use client';

import { useAppStore } from '@/lib/store';
import { t } from '@/lib/i18n';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Moon, Sun, DollarSign, Trash2, Shield, FileText, ChevronRight } from 'lucide-react';

export default function GeneralSettingsScreen() {
  const { locale, goBack, darkMode, toggleDarkMode, setScreen } = useAppStore();

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
      <Button variant="ghost" size="sm" onClick={goBack} className="gap-2 mb-6">
        <ArrowLeft className="h-4 w-4" />
        {locale === 'kh' ? 'ត្រឡប់' : 'Back'}
      </Button>

      <h1 className="text-2xl font-bold mb-6">{t(locale, 'generalSettingsTitle')}</h1>

      <Card>
        <CardContent className="p-2">
          {/* Dark Mode */}
          <div className="flex items-center gap-3 p-4">
            <div className="h-10 w-10 rounded-xl bg-muted/50 flex items-center justify-center">
              {darkMode ? <Moon className="h-5 w-5 text-accent-green" /> : <Sun className="h-5 w-5 text-muted-foreground" />}
            </div>
            <div className="flex-1">
              <p className="font-medium text-sm">{t(locale, 'darkMode')}</p>
              <p className="text-xs text-muted-foreground">{t(locale, 'darkModeDesc')}</p>
            </div>
            <button
              onClick={toggleDarkMode}
              className={`relative w-11 h-6 rounded-full transition-colors ${
                darkMode ? 'bg-accent-green' : 'bg-muted'
              }`}
            >
              <span className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
                darkMode ? 'translate-x-5' : ''
              }`} />
            </button>
          </div>

          {/* Currency */}
          <div className="flex items-center gap-3 p-4">
            <div className="h-10 w-10 rounded-xl bg-muted/50 flex items-center justify-center">
              <DollarSign className="h-5 w-5 text-muted-foreground" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-sm">{t(locale, 'currency')}</p>
              <p className="text-xs text-muted-foreground">{t(locale, 'currencyDesc')}</p>
            </div>
            <div className="flex gap-1">
              <Button variant="outline" size="sm" className="text-xs h-7 px-2">USD</Button>
              <Button variant="ghost" size="sm" className="text-xs h-7 px-2">KHR</Button>
            </div>
          </div>

          {/* Clear Cache */}
          <div className="flex items-center gap-3 p-4">
            <div className="h-10 w-10 rounded-xl bg-muted/50 flex items-center justify-center">
              <Trash2 className="h-5 w-5 text-muted-foreground" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-sm">{t(locale, 'clearCache')}</p>
              <p className="text-xs text-muted-foreground">{t(locale, 'clearCacheDesc')}</p>
            </div>
            <Button variant="outline" size="sm" className="text-xs">{t(locale, 'clearCache')}</Button>
          </div>

          {/* Privacy Policy */}
          <button
            onClick={() => setScreen('privacy-policy')}
            className="w-full flex items-center gap-3 p-4 rounded-lg hover:bg-muted/50 transition-flora"
          >
            <div className="h-10 w-10 rounded-xl bg-muted/50 flex items-center justify-center">
              <Shield className="h-5 w-5 text-muted-foreground" />
            </div>
            <div className="flex-1 text-left">
              <p className="font-medium text-sm">{t(locale, 'privacyPolicy')}</p>
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </button>

          {/* Terms of Service */}
          <button
            onClick={() => setScreen('terms-of-service')}
            className="w-full flex items-center gap-3 p-4 rounded-lg hover:bg-muted/50 transition-flora"
          >
            <div className="h-10 w-10 rounded-xl bg-muted/50 flex items-center justify-center">
              <FileText className="h-5 w-5 text-muted-foreground" />
            </div>
            <div className="flex-1 text-left">
              <p className="font-medium text-sm">{t(locale, 'termsOfService')}</p>
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </button>
        </CardContent>
      </Card>

      <p className="text-center text-xs text-muted-foreground mt-6">Flora Market v1.0.0</p>
    </div>
  );
}
