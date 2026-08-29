'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Shield, LogIn, Eye, EyeOff, AlertCircle, Leaf, Lock } from 'lucide-react';
import ThemeToggle from '@/components/ThemeToggle';

const ADMIN_CREDENTIALS = {
  email: 'admin@coop.org',
  password: 'Admin@2026',
};

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && sessionStorage.getItem('pacs_admin_auth') === 'true') {
      router.replace('/admin/dashboard');
    }
  }, [router]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password.trim()) {
      setError('Please enter administrative email and security passkey.');
      return;
    }

    setLoading(true);

    // Standard credential validation (isolated admin credentials)
    setTimeout(() => {
      if (
        email.trim().toLowerCase() === ADMIN_CREDENTIALS.email &&
        password === ADMIN_CREDENTIALS.password
      ) {
        sessionStorage.setItem('pacs_admin_auth', 'true');
        router.push('/admin/dashboard');
      } else {
        setError('Invalid administrative credentials. Access restricted.');
        setLoading(false);
      }
    }, 600);
  }

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 flex flex-col items-center justify-center p-4 relative">
      {/* Top Right Theme Toggle */}
      <div className="absolute top-4 right-4 z-20">
        <ThemeToggle />
      </div>
      {/* Brand Header */}
      <div className="flex items-center gap-2.5 mb-8">
        <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-600/20">
          <Leaf className="w-5 h-5" />
        </div>
        <div>
          <span className="font-black text-slate-900 dark:text-slate-100 text-2xl leading-none block">
            SahakarGig
          </span>
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            PACS Administration Portal
          </span>
        </div>
      </div>

      {/* Login Card */}
      <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-bold text-slate-900 dark:text-slate-100 text-lg">Administrative Console Login</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">District Cooperative Federation Security Desk</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="form-label">Administrator ID / Email</label>
            <input
              type="email"
              className="form-input"
              placeholder="e.g. admin@coop.org"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setError(''); }}
              autoComplete="username"
              required
              autoFocus
            />
          </div>

          <div>
            <label className="form-label">Security Passkey</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                className="form-input pr-10"
                placeholder="Enter password"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(''); }}
                autoComplete="current-password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 text-xs font-medium text-red-700 bg-red-50 border border-red-200 rounded-lg p-3">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            className="btn-primary w-full py-3 text-sm font-bold shadow-sm mt-2"
            disabled={loading}
          >
            {loading ? (
              <span className="inline-flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Authenticating Session…
              </span>
            ) : (
              <span className="inline-flex items-center gap-2">
                <LogIn className="w-4 h-4" /> Sign In to Governance Console
              </span>
            )}
          </button>
        </form>

        <div className="divider my-6" />

        <div className="text-center">
          <a href="/" className="text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
            ← Return to SahakarGig Public Marketplace
          </a>
        </div>
      </div>

      <div className="mt-8 text-center text-xs text-slate-400 dark:text-slate-500">
        PACS Society Administration System · High Security Isolated Environment
      </div>
    </div>
  );
}
