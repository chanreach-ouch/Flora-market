'use client';

import { useState } from 'react';
import { useAppStore } from '@/lib/store';
import { t } from '@/lib/i18n';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function AuthScreen() {
  const { locale, login, register } = useAppStore();
  const [isLogin, setIsLogin] = useState(true);
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
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
      await register(fullName, email, phone, password, 'buyer');
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
      {/* Left Panel */}
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
              : "Cambodia's trusted plant marketplace — buy and sell with ease."}
          </p>
          <div className="space-y-4 text-pale-green/70">
            <div className="flex items-center gap-3"><span className="text-2xl">✓</span><span>{locale === 'kh' ? 'ទិញ និងលក់ក្នុងគណនីតែមួយ' : 'Buy and sell with one account'}</span></div>
            <div className="flex items-center gap-3"><span className="text-2xl">✓</span><span>{locale === 'kh' ? 'អ្នកលក់បានផ្ទៀងផ្ទាត់' : 'Verified sellers'}</span></div>
            <div className="flex items-center gap-3"><span className="text-2xl">✓</span><span>{locale === 'kh' ? 'ទូទាត់សុវត្ថិភាព' : 'Secure payments'}</span></div>
          </div>
        </div>
      </div>

      {/* Right Panel */}
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
              {loading ? spinner : (isLogin ? t(locale, 'loginButton') : t(locale, 'registerButton'))}
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
        </div>
      </div>
    </div>
  );
}
