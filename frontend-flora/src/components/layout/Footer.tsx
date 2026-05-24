'use client';

import { useAppStore } from '@/lib/store';
import { t } from '@/lib/i18n';

export default function Footer() {
  const { isAuthenticated, locale, setScreen } = useAppStore();

  if (!isAuthenticated) return null;

  return (
    <footer className="border-t border-border/40 bg-card mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-2xl">🌿</span>
              <span className="font-bold text-lg">{locale === 'kh' ? 'ផ្សាររុក្ខជាតិ' : 'Flora Market'}</span>
            </div>
            <p className="text-sm text-muted-foreground">
              {locale === 'kh'
                ? 'វេទិកាទីផ្សាររុក្ខជាតិដែលទុកចិត្តបានរបស់កម្ពុជា — ភ្ជាប់សំណាក់ចម្ការដែលបានផ្ទៀងផ្ទាត់ជាមួយអ្នកស្រឡាញ់រុក្ខជាតិ។'
                : "Cambodia's trusted plant marketplace — connecting verified nurseries with plant lovers."}
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-3">{locale === 'kh' ? 'តំណភ្លាម' : 'Quick Links'}</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <button onClick={() => setScreen('home')} className="text-muted-foreground hover:text-foreground transition-flora">
                  {t(locale, 'home')}
                </button>
              </li>
              <li>
                <button onClick={() => setScreen('browse')} className="text-muted-foreground hover:text-foreground transition-flora">
                  {t(locale, 'browse')}
                </button>
              </li>
              <li>
                <button onClick={() => setScreen('help-support')} className="text-muted-foreground hover:text-foreground transition-flora">
                  {t(locale, 'helpSupportTitle')}
                </button>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-semibold mb-3">{locale === 'kh' ? 'ច្បាប់' : 'Legal'}</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <button onClick={() => setScreen('privacy-policy')} className="text-muted-foreground hover:text-foreground transition-flora">
                  {t(locale, 'privacyPolicy')}
                </button>
              </li>
              <li>
                <button onClick={() => setScreen('terms-of-service')} className="text-muted-foreground hover:text-foreground transition-flora">
                  {t(locale, 'termsOfService')}
                </button>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold mb-3">{t(locale, 'contactUs')}</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>{t(locale, 'emailUs')}: support@floramarket.kh</li>
              <li>{t(locale, 'callUs')}: +855 23 456 789</li>
              <li>{t(locale, 'visitUs')}: Phnom Penh, Cambodia</li>
            </ul>
          </div>
        </div>

        <div className="border-t mt-8 pt-6 text-center text-sm text-muted-foreground">
          &copy; 2026 Flora Market · {locale === 'kh' ? 'ផ្សាររុក្ខជាតិ' : 'All rights reserved.'}
        </div>
      </div>
    </footer>
  );
}
