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
        localStorage.setItem('sahakar_admin_auth', JSON.stringify({ role: 'ADMIN', email: ADMIN_CREDENTIALS.email, name: 'PACS Society Administrator' }));
        router.push('/admin/dashboard');
      } else {
        setError('Invalid administrative credentials. Access restricted.');
        setLoading(false);
      }
    }, 600);
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex flex-col items-center justify-center p-4 relative">
      {/* Top Right Theme Toggle */}
      <div className="absolute top-4 right-4 z-20">
        <ThemeToggle />
      </div>
      {/* Brand Header */}
      <div className="flex items-center gap-2.5 mb-8">
        <div className="w-10 h-10 rounded-xl bg-zinc-950 dark:bg-zinc-100 flex items-center justify-center text-white dark:text-zinc-950 shadow-sm shrink-0">
          <Leaf className="w-5 h-5" />
        </div>
        <div className="flex flex-col justify-center">
          <span className="font-black text-zinc-900 dark:text-zinc-50 text-2xl tracking-tight leading-none block whitespace-nowrap">
            SahakarGig
          </span>
          <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mt-1 block">
            PACS Administration Portal
          </span>
        </div>
      </div>

      {/* Login Card */}
      <div className="w-full max-w-md bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700/60 rounded-2xl p-6 sm:p-8 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 flex items-center justify-center shrink-0">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-bold text-zinc-900 dark:text-zinc-50 text-lg leading-tight">Administrative Console Login</h1>
            <p className="text-xs text-zinc-500">District Cooperative Federation Security Desk</p>
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
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-slate-600 dark:hover:text-slate-300"
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
                Authenticating Session...
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
          <a href="/" className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-blue-400 transition-colors">
            ← Return to SahakarGig Public Marketplace
          </a>
        </div>
      </div>

      <div className="mt-8 text-center text-xs text-zinc-400 dark:text-zinc-500 space-y-1">
        <div>PACS Society Administration System · High Security Isolated Environment</div>
        <div className="text-[11px] font-mono text-zinc-500">Helpline: +91 1800-425-2667 (Toll Free)</div>
      </div>
    </div>
  );
}

