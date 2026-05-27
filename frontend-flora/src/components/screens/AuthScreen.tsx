'use client';

import { useState } from 'react';
import { useAppStore } from '@/lib/store';
import { t } from '@/lib/i18n';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';

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
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showDemo, setShowDemo] = useState(false);

  const demoAccounts = [
    { label: '🛒 Buyer',  email: 'buyer@demo.com',  role: 'buyer'  as const, color: 'text-accent-green' },
    { label: '🏪 Seller', email: 'seller@demo.com', role: 'seller' as const, color: 'text-gold' },
    { label: '🛡️ Admin',  email: 'admin@demo.com',  role: 'admin'  as const, color: 'text-blue-500' },
  ];

  const fillDemo = (acc: typeof demoAccounts[number]) => {
    setLoginId(acc.email);
    setPassword('demo123');
    setRole(acc.role as 'buyer' | 'seller');
    setError('');
  };

  const handleLogin = async () => {
    if (!loginId) { setError(t(locale, 'fieldRequired')); return; }
    if (!password || password.length < 6) { setError(t(locale, 'passwordMin')); return; }
    setLoading(true);
    try {
      await login(loginId, password, role);
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

  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Decorative */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-forest via-forest-mid to-accent-green relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 text-9xl">🌿</div>
          <div className="absolute bottom-20 right-20 text-8xl">🌴</div>
          <div className="absolute top-1/2 left-1/3 text-7xl">🌺</div>
          <div className="absolute top-1/3 right-1/4 text-6xl">🪴</div>
        </div>
        <div className="relative z-10 flex flex-col justify-center px-16 text-white">
          <h1 className="text-5xl font-bold mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>
            {locale === 'kh' ? 'ផ្សាររុក្ខជាតិ' : 'Flora Market'}
          </h1>
          <p className="text-xl text-pale-green/80 mb-8">
            {locale === 'kh'
              ? 'ស្វែងរករុក្ខជាតិល្អឥតខ្ចោះថ្ងៃនេះ'
              : "Cambodia's trusted plant marketplace — connecting verified nurseries with plant lovers."}
          </p>
          <div className="space-y-4 text-pale-green/70">
            <div className="flex items-center gap-3">
              <span className="text-2xl">✓</span>
              <span>{locale === 'kh' ? 'តម្លៃថេរ គ្មានការចរចា' : 'Fixed prices, no negotiation'}</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-2xl">✓</span>
              <span>{locale === 'kh' ? 'អ្នកលក់បានផ្ទៀងផ្ទាត់' : 'Verified sellers'}</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-2xl">✓</span>
              <span>{locale === 'kh' ? 'ទូទាត់សុវត្ថិភាព' : 'Secure payments'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 bg-background">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center gap-2 mb-8 justify-center">
            <span className="text-4xl">🌿</span>
            <h1 className="text-2xl font-bold text-forest dark:text-pale-green">
              {locale === 'kh' ? 'ផ្សាររុក្ខជាតិ' : 'Flora Market'}
            </h1>
          </div>

          <h2 className="text-2xl font-bold mb-2">
            {isLogin ? t(locale, 'welcomeBack') : t(locale, 'createAccount')}
          </h2>
          <p className="text-muted-foreground mb-8">
            {isLogin ? t(locale, 'loginSubtitle') : t(locale, 'registerSubtitle')}
          </p>

          {/* Role Selector */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <button
              onClick={() => setRole('buyer')}
              className={`p-4 rounded-xl border-2 transition-flora text-center ${
                role === 'buyer'
                  ? 'border-accent-green bg-pale-green/50 dark:bg-forest-mid/30'
                  : 'border-border hover:border-accent-green/50'
              }`}
            >
              <div className="text-2xl mb-1">🛒</div>
              <div className="font-medium text-sm">{t(locale, 'registerAsBuyer')}</div>
              <div className="text-xs text-muted-foreground">{t(locale, 'buyerDescription')}</div>
            </button>
            <button
              onClick={() => setRole('seller')}
              className={`p-4 rounded-xl border-2 transition-flora text-center ${
                role === 'seller'
                  ? 'border-gold bg-cream/50 dark:bg-forest-mid/30'
                  : 'border-border hover:border-gold/50'
              }`}
            >
              <div className="text-2xl mb-1">🏪</div>
              <div className="font-medium text-sm">{t(locale, 'registerAsSeller')}</div>
              <div className="text-xs text-muted-foreground">{t(locale, 'sellerDescription')}</div>
            </button>
          </div>

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
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">{t(locale, 'phone')}</label>
                  <Input
                    value={phone}
                    onChange={e => { setPhone(e.target.value); setError(''); }}
                    placeholder="+855 9X XXX XXX"
                  />
                </div>
              </>
            )}

            <div>
              <label className="text-sm font-medium mb-1.5 block">{t(locale, 'password')}</label>
              <Input
                type="password"
                value={password}
                onChange={e => { setPassword(e.target.value); setError(''); }}
                placeholder="••••••"
              />
            </div>

            {!isLogin && (
              <div>
                <label className="text-sm font-medium mb-1.5 block">{t(locale, 'confirmPassword')}</label>
                <Input
                  type="password"
                  value={confirmPassword}
                  onChange={e => { setConfirmPassword(e.target.value); setError(''); }}
                  placeholder="••••••"
                />
              </div>
            )}

            <Button
              className="w-full h-11 bg-accent-green hover:bg-forest-mid text-white"
              onClick={isLogin ? handleLogin : handleRegister}
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                  </svg>
                  {locale === 'kh' ? 'កំពុងដំណើរការ...' : 'Please wait...'}
                </span>
              ) : (
                isLogin ? t(locale, 'loginButton') : t(locale, 'registerButton')
              )}
            </Button>
          </div>

          <div className="text-center mt-6">
            <button
              onClick={() => { setIsLogin(!isLogin); setError(''); }}
              className="text-sm text-accent-green hover:underline"
            >
              {isLogin ? t(locale, 'noAccount') : t(locale, 'hasAccount')}
            </button>
          </div>

          {/* Demo Accounts Panel */}
          {isLogin && (
            <div className="mt-6">
              <button
                onClick={() => setShowDemo(!showDemo)}
                className="w-full text-xs text-muted-foreground hover:text-foreground flex items-center justify-center gap-2 py-2"
              >
                <span>🚀</span>
                <span>{showDemo ? 'Hide' : 'Show'} Demo Accounts</span>
                <span>{showDemo ? '▲' : '▼'}</span>
              </button>
              {showDemo && (
                <div className="mt-2 p-4 bg-muted/50 rounded-xl border border-dashed">
                  <p className="text-xs text-muted-foreground mb-3 text-center">
                    Click to auto-fill credentials · Password: <code className="font-mono">demo123</code>
                  </p>
                  <div className="grid grid-cols-3 gap-2">
                    {demoAccounts.map(acc => (
                      <button
                        key={acc.email}
                        onClick={() => fillDemo(acc)}
                        className={`p-2 rounded-lg border hover:border-accent-green/50 bg-background text-xs font-medium transition-flora ${acc.color}`}
                      >
                        {acc.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
