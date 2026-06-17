'use client';

import { useState } from 'react';
import { useAppStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Shield, Lock, Eye, EyeOff, AlertTriangle } from 'lucide-react';

export default function AuthScreen() {
  const { login, register } = useAppStore();
  const [isLogin, setIsLogin] = useState(true);
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!loginId) { setError('Email is required'); return; }
    if (!password || password.length < 6) { setError('Password must be at least 6 characters'); return; }
    setLoading(true);
    try {
      await login(loginId, password);
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!fullName || !email || !phone) { setError('All fields are required'); return; }
    if (!password || password.length < 6) { setError('Password must be at least 6 characters'); return; }
    if (password !== confirmPassword) { setError('Passwords do not match'); return; }
    setLoading(true);
    try {
      await register(fullName, email, phone, password);
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-slate-950">

      {/* Left panel — dark brand panel */}
      <div className="hidden lg:flex lg:w-[45%] relative overflow-hidden flex-col justify-between p-12"
        style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)' }}>

        {/* Grid overlay */}
        <div className="absolute inset-0 opacity-[0.04]"
          style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

        {/* Glow accent */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 h-80 w-80 rounded-full blur-3xl opacity-10"
          style={{ background: 'radial-gradient(circle, #52b788, transparent)' }} />

        {/* Top logo */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center">
            <Shield className="h-5 w-5 text-white" />
          </div>
          <div>
            <p className="text-white font-bold text-sm leading-none">Flora Admin</p>
            <p className="text-slate-400 text-[10px] mt-0.5">Management Portal</p>
          </div>
        </div>

        {/* Center content */}
        <div className="relative z-10">
          <div className="h-16 w-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-8">
            <Lock className="h-8 w-8 text-slate-300" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-4 leading-tight">
            Internal<br />Management<br />System
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed mb-8 max-w-xs">
            Restricted access for authorized Flora Market administrators only. All sessions are monitored and logged.
          </p>
          <div className="space-y-3">
            {['Platform analytics & revenue', 'Seller verification & moderation', 'Order & user management'].map(item => (
              <div key={item} className="flex items-center gap-2.5">
                <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 flex-shrink-0" />
                <span className="text-slate-400 text-xs">{item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom badge */}
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20">
            <AlertTriangle className="h-3 w-3 text-amber-400" />
            <span className="text-amber-400 text-[10px] font-medium">Authorized Personnel Only</span>
          </div>
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12 bg-slate-900">
        <div className="w-full max-w-sm">

          {/* Mobile header */}
          <div className="lg:hidden flex flex-col items-center mb-8">
            <div className="h-12 w-12 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center mb-3">
              <Shield className="h-6 w-6 text-slate-300" />
            </div>
            <p className="text-white font-bold text-lg">Flora Admin Portal</p>
            <div className="flex items-center gap-1.5 mt-1.5 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/20">
              <AlertTriangle className="h-3 w-3 text-amber-400" />
              <span className="text-amber-400 text-[10px] font-medium">Authorized Personnel Only</span>
            </div>
          </div>

          {/* Form header */}
          <div className="mb-7">
            <h2 className="text-xl font-bold text-white">
              {isLogin ? 'Sign in to Admin Portal' : 'Create Admin Account'}
            </h2>
            <p className="text-slate-400 text-sm mt-1">
              {isLogin ? 'Enter your admin credentials to continue' : 'Admin accounts require super_admin approval'}
            </p>
          </div>

          {error && (
            <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 text-red-400 text-sm p-3 rounded-lg mb-5">
              <AlertTriangle className="h-4 w-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="space-y-4">
            {!isLogin && (
              <div>
                <label className="text-xs font-medium text-slate-300 mb-1.5 block">Full Name</label>
                <Input
                  value={fullName}
                  onChange={e => { setFullName(e.target.value); setError(''); }}
                  placeholder="Your full name"
                  className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 focus-visible:ring-slate-500 h-10"
                />
              </div>
            )}

            {isLogin ? (
              <div>
                <label className="text-xs font-medium text-slate-300 mb-1.5 block">Email Address</label>
                <Input
                  type="email"
                  value={loginId}
                  onChange={e => { setLoginId(e.target.value); setError(''); }}
                  placeholder="admin@flora.com"
                  className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 focus-visible:ring-slate-500 h-10"
                />
              </div>
            ) : (
              <>
                <div>
                  <label className="text-xs font-medium text-slate-300 mb-1.5 block">Email</label>
                  <Input
                    type="email"
                    value={email}
                    onChange={e => { setEmail(e.target.value); setError(''); }}
                    placeholder="admin@flora.com"
                    className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 focus-visible:ring-slate-500 h-10"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-300 mb-1.5 block">Phone</label>
                  <Input
                    value={phone}
                    onChange={e => { setPhone(e.target.value); setError(''); }}
                    placeholder="+855 9X XXX XXX"
                    className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 focus-visible:ring-slate-500 h-10"
                  />
                </div>
              </>
            )}

            <div>
              <label className="text-xs font-medium text-slate-300 mb-1.5 block">Password</label>
              <div className="relative">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => { setPassword(e.target.value); setError(''); }}
                  placeholder="••••••••"
                  className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 focus-visible:ring-slate-500 h-10 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(s => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {!isLogin && (
              <div>
                <label className="text-xs font-medium text-slate-300 mb-1.5 block">Confirm Password</label>
                <Input
                  type="password"
                  value={confirmPassword}
                  onChange={e => { setConfirmPassword(e.target.value); setError(''); }}
                  placeholder="••••••••"
                  className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 focus-visible:ring-slate-500 h-10"
                />
              </div>
            )}

            <Button
              className="w-full h-10 bg-white text-slate-900 hover:bg-slate-100 font-semibold mt-1 disabled:opacity-50"
              onClick={isLogin ? handleLogin : handleRegister}
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                  </svg>
                  Authenticating...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Lock className="h-4 w-4" />
                  {isLogin ? 'Sign In' : 'Create Account'}
                </span>
              )}
            </Button>
          </div>

          <div className="text-center mt-5">
            <button
              onClick={() => { setIsLogin(!isLogin); setError(''); }}
              className="text-xs text-slate-400 hover:text-slate-200 transition-colors"
            >
              {isLogin ? "Don't have an admin account? Register" : 'Already have an account? Sign in'}
            </button>
          </div>

          <p className="text-center text-[10px] text-slate-600 mt-6">
            Flora Market · Admin Portal · All access is logged
          </p>
        </div>
      </div>
    </div>
  );
}
