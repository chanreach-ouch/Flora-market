'use client';

import { useState } from 'react';
import { useAppStore } from '@/lib/store';
import { t } from '@/lib/i18n';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Eye, EyeOff } from 'lucide-react';

export default function AuthScreen() {
  const { locale, login, register } = useAppStore();
  const [isLogin, setIsLogin] = useState(true);
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<'buyer' | 'seller'>('buyer');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!loginId) { setError(t(locale, 'fieldRequired')); return; }
    if (!password || password.length < 6) { setError(t(locale, 'passwordMin')); return; }
    setLoading(true);
    try {
      await login(loginId, password, 'buyer');
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!fullName) { setError(t(locale, 'fieldRequired')); return; }
    if (!email) { setError(t(locale, 'fieldRequired')); return; }
    if (!phone) { setError(t(locale, 'fieldRequired')); return; }
    if (!password || password.length < 6) { setError(t(locale, 'passwordMin')); return; }
    if (password !== confirmPassword) { setError(t(locale, 'passwordMismatch')); return; }
    setLoading(true);
    try {
      await register(fullName, email, phone, password, role);
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const spinner = (
    <span className="flex items-center gap-2">
      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
      </svg>
      {locale === 'kh' ? 'កំពុងដំណើរការ...' : 'Please wait...'}
    </span>
  );

  return (
    <div className="min-h-screen flex">

      {/* Left panel — warm plant theme */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden flex-col justify-between p-14"
        style={{ background: 'linear-gradient(145deg, #1a3a2a 0%, #2d6a4f 60%, #40916c 100%)' }}>

        {/* Decorative plant blobs */}
        <div className="absolute inset-0">
          <div className="absolute -top-10 -right-10 h-72 w-72 rounded-full opacity-20"
            style={{ background: 'radial-gradient(circle, #52b788, transparent)' }} />
          <div className="absolute bottom-0 -left-10 h-96 w-96 rounded-full opacity-15"
            style={{ background: 'radial-gradient(circle, #95d5b2, transparent)' }} />
        </div>

        {/* Floating emojis */}
        <div className="absolute inset-0 select-none pointer-events-none">
          <span className="absolute top-16 left-16 text-7xl opacity-20">🌿</span>
          <span className="absolute top-1/3 right-16 text-6xl opacity-15">🌺</span>
          <span className="absolute bottom-24 left-24 text-5xl opacity-20">🌴</span>
          <span className="absolute top-1/2 left-1/3 text-4xl opacity-10">🪴</span>
          <span className="absolute bottom-1/3 right-24 text-5xl opacity-15">🌸</span>
        </div>

        {/* Top logo */}
        <div className="relative z-10 flex items-center gap-3">
          <span className="text-3xl">🌿</span>
          <div>
            <p className="text-white font-bold text-lg leading-none" style={{ fontFamily: 'Playfair Display, serif' }}>
              {locale === 'kh' ? 'ផ្សាររុក្ខជាតិ' : 'Flora Market'}
            </p>
            <p className="text-pale-green/60 text-[11px] mt-0.5">
              {locale === 'kh' ? 'ផ្សារពណ៌បៃតង' : "Cambodia's Green Marketplace"}
            </p>
          </div>
        </div>

        {/* Center content */}
        <div className="relative z-10">
          <h1 className="text-4xl font-bold text-white mb-4 leading-snug" style={{ fontFamily: 'Playfair Display, serif' }}>
            {locale === 'kh'
              ? 'ស្វែងរករុក្ខជាតិ\nល្អឥតខ្ចោះ'
              : 'Discover Beautiful\nPlants'}
          </h1>
          <p className="text-pale-green/70 text-sm leading-relaxed mb-8 max-w-xs">
            {locale === 'kh'
              ? 'ផ្សារបៃតងនៅកម្ពុជា ភ្ជាប់ទំនាក់ទំនងរវាងបន្លែ និងអ្នកស្រឡាញ់ធម្មជាតិ'
              : "Cambodia's trusted plant marketplace — connecting verified nurseries with plant lovers across the country."}
          </p>
          <div className="space-y-3">
            {[
              { emoji: '✅', en: 'Verified local nurseries', kh: 'ហាងបៃតងបានផ្ទៀងផ្ទាត់' },
              { emoji: '💳', en: 'ABA Pay & Wing Money', kh: 'ទូទាត់ ABA & Wing' },
              { emoji: '🚚', en: 'Delivery across Cambodia', kh: 'ដឹកជញ្ជូនទូទាំងប្រទេស' },
            ].map(item => (
              <div key={item.en} className="flex items-center gap-3">
                <span className="text-lg">{item.emoji}</span>
                <span className="text-pale-green/70 text-sm">{locale === 'kh' ? item.kh : item.en}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom stats */}
        <div className="relative z-10 flex gap-6">
          {[
            { value: '500+', label: locale === 'kh' ? 'រុក្ខជាតិ' : 'Plants' },
            { value: '38', label: locale === 'kh' ? 'អ្នកលក់' : 'Sellers' },
            { value: '1.2k', label: locale === 'kh' ? 'អ្នកប្រើ' : 'Users' },
          ].map(stat => (
            <div key={stat.label}>
              <p className="text-white text-xl font-bold">{stat.value}</p>
              <p className="text-pale-green/50 text-xs">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel — form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 bg-background">
        <div className="w-full max-w-md">

          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2 mb-8 justify-center">
            <span className="text-3xl">🌿</span>
            <h1 className="text-xl font-bold text-forest dark:text-pale-green" style={{ fontFamily: 'Playfair Display, serif' }}>
              {locale === 'kh' ? 'ផ្សាររុក្ខជាតិ' : 'Flora Market'}
            </h1>
          </div>

          <h2 className="text-2xl font-bold mb-1">
            {isLogin ? t(locale, 'welcomeBack') : t(locale, 'createAccount')}
          </h2>
          <p className="text-muted-foreground text-sm mb-6">
            {isLogin ? t(locale, 'loginSubtitle') : t(locale, 'registerSubtitle')}
          </p>

          {/* Role selector — register only */}
          {!isLogin && (
            <div className="grid grid-cols-2 gap-3 mb-5">
              <button
                onClick={() => setRole('buyer')}
                className={`p-3.5 rounded-xl border-2 transition-all text-center ${
                  role === 'buyer'
                    ? 'border-accent-green bg-pale-green/40 dark:bg-forest-mid/20'
                    : 'border-border hover:border-accent-green/40'
                }`}
              >
                <div className="text-2xl mb-1">🛒</div>
                <div className="font-semibold text-sm">{t(locale, 'registerAsBuyer')}</div>
                <div className="text-[11px] text-muted-foreground mt-0.5">{t(locale, 'buyerDescription')}</div>
              </button>
              <button
                onClick={() => setRole('seller')}
                className={`p-3.5 rounded-xl border-2 transition-all text-center ${
                  role === 'seller'
                    ? 'border-gold bg-cream/50 dark:bg-forest-mid/20'
                    : 'border-border hover:border-gold/40'
                }`}
              >
                <div className="text-2xl mb-1">🏪</div>
                <div className="font-semibold text-sm">{t(locale, 'registerAsSeller')}</div>
                <div className="text-[11px] text-muted-foreground mt-0.5">{t(locale, 'sellerDescription')}</div>
              </button>
            </div>
          )}

          {error && (
            <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-lg mb-4">{error}</div>
          )}

          <div className="space-y-4">
            {!isLogin && (
              <div>
                <label className="text-sm font-medium mb-1.5 block">{t(locale, 'fullName')}</label>
                <Input
                  value={fullName}
                  onChange={e => { setFullName(e.target.value); setError(''); }}
                  placeholder={locale === 'kh' ? 'ឈ្មោះពេញរបស់អ្នក' : 'Your full name'}
                  className="h-10"
                />
              </div>
            )}

            {isLogin ? (
              <div>
                <label className="text-sm font-medium mb-1.5 block">{t(locale, 'emailOrPhone')}</label>
                <Input
                  value={loginId}
                  onChange={e => { setLoginId(e.target.value); setError(''); }}
                  placeholder={locale === 'kh' ? 'អ៊ីមែល ឬ លេខទូរស័ព្ទ' : 'Email or phone number'}
                  className="h-10"
                />
              </div>
            ) : (
              <>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">{t(locale, 'email')}</label>
                  <Input
                    type="email"
                    value={email}
                    onChange={e => { setEmail(e.target.value); setError(''); }}
                    placeholder="you@example.com"
                    className="h-10"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">{t(locale, 'phone')}</label>
                  <Input
                    value={phone}
                    onChange={e => { setPhone(e.target.value); setError(''); }}
                    placeholder="+855 9X XXX XXX"
                    className="h-10"
                  />
                </div>
              </>
            )}

            <div>
              <label className="text-sm font-medium mb-1.5 block">{t(locale, 'password')}</label>
              <div className="relative">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => { setPassword(e.target.value); setError(''); }}
                  placeholder="••••••"
                  className="h-10 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(s => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {!isLogin && (
              <div>
                <label className="text-sm font-medium mb-1.5 block">{t(locale, 'confirmPassword')}</label>
                <Input
                  type="password"
                  value={confirmPassword}
                  onChange={e => { setConfirmPassword(e.target.value); setError(''); }}
                  placeholder="••••••"
                  className="h-10"
                />
              </div>
            )}

            <Button
              className="w-full h-11 bg-forest hover:bg-forest-mid text-white font-semibold text-sm"
              onClick={isLogin ? handleLogin : handleRegister}
              disabled={loading}
            >
              {loading ? spinner : (isLogin ? t(locale, 'loginButton') : t(locale, 'registerButton'))}
            </Button>
          </div>

          <div className="text-center mt-5">
            <button
              onClick={() => { setIsLogin(!isLogin); setError(''); }}
              className="text-sm text-accent-green hover:underline"
            >
              {isLogin ? t(locale, 'noAccount') : t(locale, 'hasAccount')}
            </button>
          </div>

          <p className="text-center text-[11px] text-muted-foreground mt-6">
            🌿 Flora Market · {locale === 'kh' ? 'ផ្សារបៃតងកម្ពុជា' : "Cambodia's Green Marketplace"}
          </p>
        </div>
      </div>
    </div>
  );
}
