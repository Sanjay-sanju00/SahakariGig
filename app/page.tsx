'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  Leaf, Search, CalendarDays, Clock, MapPin, Star,
  Shield, CheckCircle, AlertCircle, Loader2,
  LogIn, UserPlus, X, CreditCard, ChevronRight,
  Sparkles, Wrench, Phone, Award, ThumbsUp, DollarSign,
  LogOut, Check, MessageSquare, MessageCircle, ChevronDown, ChevronUp
} from 'lucide-react';
import ThemeToggle from '@/components/ThemeToggle';
import dataService, { Service, Booking, WorkerProfile, User, Society } from '@/lib/dataService';
import { formatCurrency, formatDate, formatDateTime, getBadgeClass, getStatusReadableLabel } from '@/lib/utils';

// ─── Sign In Modal ─────────────────────────────────────────────────────────
interface SignInModalProps {
  onClose: () => void;
  onSuccess: (user: User) => void;
  onSwitchToSignUp: () => void;
}

function SignInModal({ onClose, onSuccess, onSwitchToSignUp }: SignInModalProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSignIn(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setError('Please enter your email and password.');
      return;
    }
    setError('');
    setLoading(true);

    try {
      const user = await dataService.login(email.trim().toLowerCase(), password.trim());
      if (!user) {
        setError('Invalid email or password. Please check your credentials.');
        setLoading(false);
        return;
      }
      onSuccess(user);
    } catch {
      setError('Failed to authenticate. Please try again.');
      setLoading(false);
    }
  }

  return (
    <div className="modal-backdrop" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-box">
        <div className="flex items-center justify-between p-5 border-b border-zinc-100 dark:border-zinc-800/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-zinc-950 dark:bg-zinc-100 flex items-center justify-center">
              <Leaf className="w-4 h-4 text-white dark:text-zinc-950" />
            </div>
            <div>
              <h2 className="font-bold text-zinc-900 dark:text-zinc-50 leading-tight tracking-tight">Sign In to SahakarGig</h2>
              <p className="text-xs text-zinc-500">Cooperative Community Marketplace</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <form onSubmit={handleSignIn} className="space-y-4">
            <div>
              <label className="form-label">Email Address</label>
              <input
                type="email"
                className="form-input"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError(''); }}
                required
                autoFocus
              />
            </div>

            <div>
              <label className="form-label">Password</label>
              <input
                type="password"
                className="form-input"
                placeholder="Enter your account password"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(''); }}
                required
              />
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-zinc-100 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <button type="submit" className="btn-primary w-full py-2.5 font-semibold" disabled={loading}>
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogIn className="w-4 h-4" />}
              <span>{loading ? 'Authenticating…' : 'Sign In'}</span>
            </button>
          </form>

          <div className="h-px bg-zinc-100 dark:bg-zinc-800/60 my-4" />

          <div className="text-center">
            <p className="text-xs text-zinc-500">
              New to SahakarGig?{' '}
              <button
                type="button"
                onClick={onSwitchToSignUp}
                className="text-zinc-900 dark:text-zinc-100 font-semibold hover:underline"
              >
                Create an Account
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Sign Up Modal ─────────────────────────────────────────────────────────
interface SignUpModalProps {
  onClose: () => void;
  onSuccess: (user: User) => void;
  onSwitchToSignIn: () => void;
}

function SignUpModal({ onClose, onSuccess, onSwitchToSignIn }: SignUpModalProps) {
  const [role, setRole] = useState<'CUSTOMER' | 'WORKER'>('CUSTOMER');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [address, setAddress] = useState('');
  const [trade, setTrade] = useState('Electrical');
  const [kycDocName, setKycDocName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const TRADES = [
    'Electrical',
    'Plumbing',
    'Carpentry',
    'Appliance Fix',
    'Cleaning',
  ];

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      setKycDocName(file.name);
    }
  }

  async function handleSignUp(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !phone.trim() || !password.trim()) {
      setError('Please fill in all mandatory fields.');
      return;
    }
    const cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.length < 10) {
      setError('Please enter a valid 10-digit mobile number.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const newUser: User = {
        id: `usr-${Date.now()}`,
        name: name.trim(),
        email: email.trim().toLowerCase(),
        phone: cleanPhone,
        password: password.trim(),
        role,
        address: address.trim() || undefined,
        trade: role === 'WORKER' ? trade : undefined,
        kycDocName: role === 'WORKER' ? (kycDocName || 'identity_proof.pdf') : undefined,
        localSociety: 'Primary Cooperative Services Society',
        isVerified: true,
        createdAt: new Date().toISOString(),
      };

      const user = await dataService.register(newUser);
      onSuccess(user);
    } catch {
      setError('Failed to create account. Email may already be in use.');
      setLoading(false);
    }
  }

  return (
    <div className="modal-backdrop" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-box max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b border-zinc-100 dark:border-zinc-800/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-zinc-950 dark:bg-zinc-100 flex items-center justify-center">
              <Leaf className="w-4 h-4 text-white dark:text-zinc-950" />
            </div>
            <div>
              <h2 className="font-bold text-zinc-900 dark:text-zinc-50 leading-tight tracking-tight">Join SahakarGig</h2>
              <p className="text-xs text-zinc-500">Cooperative Services Network</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* Role Selection */}
          <div>
            <label className="form-label">I want to register as:</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setRole('CUSTOMER')}
                className={`p-3 rounded-xl border text-center transition-all text-sm ${
                  role === 'CUSTOMER'
                    ? 'border-zinc-900 dark:border-zinc-100 bg-zinc-950 dark:bg-zinc-50 text-white dark:text-zinc-950 font-bold'
                    : 'border-zinc-200 dark:border-zinc-700/60 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800'
                }`}
              >
                <div className="font-bold">Resident / Customer</div>
                <div className="text-[10px] opacity-75 mt-0.5">Book local verified services</div>
              </button>

              <button
                type="button"
                onClick={() => setRole('WORKER')}
                className={`p-3 rounded-xl border text-center transition-all text-sm ${
                  role === 'WORKER'
                    ? 'border-zinc-900 dark:border-zinc-100 bg-zinc-950 dark:bg-zinc-50 text-white dark:text-zinc-950 font-bold'
                    : 'border-zinc-200 dark:border-zinc-700/60 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800'
                }`}
              >
                <div className="font-bold">Artisan / Worker</div>
                <div className="text-[10px] opacity-75 mt-0.5">Offer trade services with PACS</div>
              </button>
            </div>
          </div>

          <form onSubmit={handleSignUp} className="space-y-3.5">
            <div>
              <label className="form-label">Full Name</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Ramesh Kumar"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="form-label">Email Address</label>
                <input
                  type="email"
                  className="form-input"
                  placeholder="ramesh@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="form-label">Mobile Number</label>
                <div className="flex rounded-lg overflow-hidden border border-zinc-200 dark:border-zinc-700/60 focus-within:border-zinc-600 focus-within:ring-2 focus-within:ring-zinc-900/10 dark:focus-within:ring-zinc-100/10 transition-all">
                  <div className="bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 px-2.5 py-2 text-xs font-semibold flex items-center border-r border-zinc-200 dark:border-zinc-700/60">
    <span>+91</span>
  </div>
                  <input
                    type="tel"
                    className="w-full px-3 py-2 text-sm bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-600 outline-none"
                    placeholder="9876543210"
                    maxLength={10}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="form-label">Password</label>
              <input
                type="password"
                className="form-input"
                placeholder="Create a secure password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="form-label">Village / Ward Address</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. House 42, North Cluster, Gram Panchayat"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
            </div>

            {role === 'WORKER' && (
              <div className="p-3 bg-zinc-50 dark:bg-zinc-900/60 rounded-xl border border-zinc-200 dark:border-zinc-700/60 space-y-3">
                <div>
                  <label className="form-label text-xs">Primary Trade</label>
                  <select
                    className="form-input text-xs"
                    value={trade}
                    onChange={(e) => setTrade(e.target.value)}
                  >
                    {TRADES.map((tr) => (
                      <option key={tr} value={tr}>{tr}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="form-label text-xs">Identity Document (Aadhaar / Voter ID)</label>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileSelect}
                    className="hidden"
                    accept=".pdf,.jpg,.jpeg,.png"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full py-2 px-3 border border-dashed border-zinc-300 dark:border-zinc-700 rounded-lg text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-left flex items-center justify-between transition-colors"
                  >
                    <span>{kycDocName || 'Upload ID Document (.pdf, .jpg)'}</span>
                    <span className="text-zinc-900 dark:text-zinc-100 font-bold">Browse</span>
                  </button>
                </div>
              </div>
            )}

            {error && (
              <div className="p-3 rounded-lg bg-zinc-100 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <button type="submit" className="btn-primary w-full py-2.5 font-semibold" disabled={loading}>
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
              <span>{loading ? 'Creating Account…' : 'Register & Sign In'}</span>
            </button>
          </form>

          <div className="text-center">
            <p className="text-xs text-zinc-500">
              Already have an account?{' '}
              <button
                type="button"
                onClick={onSwitchToSignIn}
                className="text-zinc-900 dark:text-zinc-100 font-semibold hover:underline"
              >
                Sign In
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Worker Booking Modal Component ─────────────────────────────────────────
interface WorkerBookingModalProps {
  worker: WorkerProfile;
  tradeBasePrice: number;
  user: User;
  onClose: () => void;
  onBookingSubmitted: (booking: Booking) => void;
}

function WorkerBookingModal({ worker, tradeBasePrice, user, onClose, onBookingSubmitted }: WorkerBookingModalProps) {
  const [date, setDate] = useState(new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString().slice(0, 16));
  const [address, setAddress] = useState(user.address || '');
  const [phone, setPhone] = useState(user.phone || '');
  const [problemDescription, setProblemDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fee = Math.round(tradeBasePrice * 0.05);

  async function handleBook(e: React.FormEvent) {
    e.preventDefault();
    if (!address.trim() || !phone.trim()) {
      setError('Please provide your service address and contact phone number.');
      return;
    }
    const cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.length < 10) {
      setError('Please enter a valid 10-digit phone number.');
      return;
    }

    setError('');
    setLoading(true);

    const newBooking: Booking = {
      id: `bk-${Date.now()}`,
      customerId: user.id,
      customerName: user.name,
      customerPhone: phone.trim(),
      customerAddress: address.trim(),
      workerId: worker.userId,
      workerName: worker.name,
      serviceId: `trade-${worker.trade.toLowerCase()}`,
      serviceName: `${worker.trade} Repair & Service`,
      problemDescription: problemDescription.trim(),
      status: 'PENDING_ACCEPTANCE',
      scheduledDate: new Date(date).toISOString(),
      address: address.trim(),
      basePrice: tradeBasePrice,
      extraCost: 0,
      subtotalAmount: tradeBasePrice,
      platformFee: fee,
      totalAmount: tradeBasePrice + fee,
      paymentStatus: 'PENDING',
      createdAt: new Date().toISOString(),
    };

    const added = dataService.addBooking(newBooking);
    setLoading(false);
    onBookingSubmitted(added);
  }

  return (
    <div className="modal-backdrop" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-box">
        <div className="flex items-center justify-between p-5 border-b border-zinc-100 dark:border-zinc-800/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-zinc-950 dark:bg-zinc-100 text-white dark:text-zinc-950 flex items-center justify-center font-black text-lg">
              {worker.name.charAt(0)}
            </div>
            <div>
              <h3 className="font-bold text-zinc-900 dark:text-zinc-50 tracking-tight">Book {worker.name}</h3>
              <p className="text-xs text-zinc-500">
                {worker.trade} · Standard Base Diagnostic Rate: {formatCurrency(tradeBasePrice)}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleBook} className="p-5 space-y-4">
          <div className="p-3 bg-zinc-50 dark:bg-zinc-900/60 rounded-xl border border-zinc-200 dark:border-zinc-700/60 text-xs text-zinc-700 dark:text-zinc-300 flex items-center gap-2">
            <Shield className="w-4 h-4 shrink-0 text-zinc-500" />
            <span>
              <strong className="text-zinc-900 dark:text-zinc-100">Zero Upfront Payment:</strong> You will only be billed after {worker.name} inspects or finishes the service.
            </span>
          </div>

          <div>
            <label className="form-label text-xs">Preferred Service Date & Time</label>
            <input
              type="datetime-local"
              className="form-input text-xs"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="form-label text-xs">Service Address</label>
            <input
              type="text"
              className="form-input text-xs"
              placeholder="House / Flat No, Street, Ward, Village"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="form-label text-xs">Your Contact Mobile Number</label>
            <div className="flex rounded-lg overflow-hidden border border-zinc-200 dark:border-zinc-700/60 focus-within:border-zinc-600 focus-within:ring-2 focus-within:ring-zinc-900/10 dark:focus-within:ring-zinc-100/10 transition-all">
              <div className="bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 px-2.5 py-2 text-xs font-semibold flex items-center border-r border-zinc-200 dark:border-zinc-700/60">
    <span>+91</span>
  </div>
              <input
                type="tel"
                className="w-full px-3 py-2 text-xs bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 outline-none font-bold"
                placeholder="9876543210"
                maxLength={10}
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />
            </div>
          </div>

          <div>
            <label className="form-label text-xs">Describe the Issue (Optional)</label>
            <textarea
              className="form-input text-xs"
              rows={2}
              placeholder="e.g. Main switchboard tripping or leaking kitchen tap..."
              value={problemDescription}
              onChange={(e) => setProblemDescription(e.target.value)}
            />
          </div>

          {/* Transparent 5% Platform Fee & Initial Estimate Breakdown */}
          <div className="p-3.5 bg-zinc-50 dark:bg-zinc-900/60 rounded-xl border border-zinc-200 dark:border-zinc-700/60 text-xs space-y-1.5">
            <div className="font-semibold text-zinc-900 dark:text-zinc-50 flex items-center justify-between">
              <span>Standard Base Diagnostic Rate:</span>
              <span className="tabular-nums font-bold">{formatCurrency(tradeBasePrice)}</span>
            </div>
            <div className="flex items-center justify-between text-zinc-600 dark:text-zinc-400">
              <span className="flex items-center gap-1">
                <span>PACS Community Platform Fee (5%):</span>
              </span>
              <span className="tabular-nums font-semibold">+{formatCurrency(fee)}</span>
            </div>
            <div className="pt-1.5 border-t border-zinc-200 dark:border-zinc-700/60 flex items-center justify-between font-bold text-zinc-900 dark:text-zinc-50">
              <span>Starting Diagnostic Total:</span>
              <span className="tabular-nums text-sm font-black">{formatCurrency(tradeBasePrice + fee)}</span>
            </div>
            <div className="text-[10px] text-zinc-500 pt-0.5 leading-relaxed">
              * 100% of labor & diagnostic fees go directly to {worker.name}. The 5% PACS fee funds the Primary Cooperative Society welfare and emergency pool.
            </div>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-zinc-100 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 text-xs font-semibold">
              {error}
            </div>
          )}

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-100 dark:border-zinc-800/60">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary text-xs py-2 px-4 font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary text-xs py-2.5 px-5 font-semibold flex items-center gap-1.5"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CalendarDays className="w-4 h-4" />}
              <span>Book {worker.name} (Pay After Work Done)</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Post-Service Digital Payment Modal ──────────────────────────────────────
interface PostServicePaymentModalProps {
  booking: Booking;
  onClose: () => void;
  onConfirm: () => Promise<void>;
}

function PostServicePaymentModal({ booking, onClose, onConfirm }: PostServicePaymentModalProps) {
  const [loading, setLoading] = useState(false);
  const base = booking.basePrice || 150;
  const extra = booking.extraCost || 0;
  const subtotal = booking.subtotalAmount || (base + extra);
  const platformFee = booking.platformFee || Math.round(subtotal * 0.05);
  const total = booking.totalAmount || (subtotal + platformFee);

  async function handlePay() {
    setLoading(true);
    await onConfirm();
    setLoading(false);
    onClose();
  }

  return (
    <div className="modal-backdrop" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-box p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800/60">
          <div className="flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-zinc-600 dark:text-zinc-400" />
            <h3 className="font-bold text-zinc-900 dark:text-zinc-50 text-sm tracking-tight">Post-Service Digital Settlement</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-4 bg-zinc-50 dark:bg-zinc-900/60 rounded-xl border border-zinc-200 dark:border-zinc-700/60 space-y-2 text-xs">
          <div className="font-bold text-zinc-900 dark:text-zinc-50 text-sm pb-1 border-b border-zinc-100 dark:border-zinc-800/60 tracking-tight">
            Final Itemized Bill ({booking.serviceName})
          </div>
          <div className="flex justify-between text-zinc-600 dark:text-zinc-400">
            <span>Base Diagnostic Rate:</span>
            <span className="font-semibold text-zinc-900 dark:text-zinc-100 tabular-nums">{formatCurrency(base)}</span>
          </div>

          {extra > 0 && (
            <div className="flex justify-between text-zinc-600 dark:text-zinc-400">
              <span>Extra Labor / Materials ({booking.extraCostReason || 'Parts'}):</span>
              <span className="font-semibold text-zinc-900 dark:text-zinc-100 tabular-nums">+{formatCurrency(extra)}</span>
            </div>
          )}

          <div className="flex justify-between font-bold text-zinc-900 dark:text-zinc-50 pt-1 border-t border-zinc-100 dark:border-zinc-800/60">
            <span>Artisan Fee (100% Payout):</span>
            <span className="tabular-nums">{formatCurrency(subtotal)}</span>
          </div>

          <div className="flex justify-between text-zinc-500 dark:text-zinc-400">
            <div>
              <span>PACS Community Platform Fee (5%):</span>
              <span className="text-[10px] text-zinc-400 block">Supports Cooperative Society & Artisan Welfare Pool</span>
            </div>
            <span className="tabular-nums font-semibold">+{formatCurrency(platformFee)}</span>
          </div>

          <div className="h-px bg-zinc-200 dark:bg-zinc-700/60 my-1" />

          <div className="flex justify-between font-black text-base text-zinc-900 dark:text-zinc-50">
            <span>Total Payable Amount:</span>
            <span className="tabular-nums">{formatCurrency(total)}</span>
          </div>
        </div>

        <div className="p-3 bg-zinc-50 dark:bg-zinc-900/60 rounded-xl border border-zinc-200 dark:border-zinc-700/60 text-xs text-zinc-600 dark:text-zinc-400">
          <div className="flex items-center gap-1.5 font-bold text-zinc-900 dark:text-zinc-100 mb-0.5">
            <Shield className="w-3.5 h-3.5 text-zinc-500" /> Direct Payout Guarantee
          </div>
          <p className="text-[11px] leading-relaxed">
            {formatCurrency(subtotal)} (100% of labor/parts) is transferred directly to {booking.workerName || 'the artisan'}. {formatCurrency(platformFee)} (5%) goes to the Primary Cooperative Society Welfare Reserve.
          </p>
        </div>

        <div className="flex items-center justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="btn-secondary text-xs py-2 px-4 font-semibold"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handlePay}
            disabled={loading}
            className="btn-primary text-xs py-2.5 px-6 font-semibold flex items-center gap-2"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
            <span>Confirm Payment of {formatCurrency(total)}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Mandatory 3-Factor Customer Review Survey ─────────────────────────────
interface CustomerReviewCardProps {
  booking: Booking;
  onReviewSubmitted: () => void;
}

function CustomerReviewCard({ booking, onReviewSubmitted }: CustomerReviewCardProps) {
  const [quality, setQuality] = useState(5);
  const [behavior, setBehavior] = useState(5);
  const [pricingRating, setPricingRating] = useState(5);
  const [reviewNote, setReviewNote] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const PRICING_SCALE_LABELS: Record<number, { label: string; color: string; desc: string }> = {
    1: { label: 'Highly Overcharged', color: 'text-zinc-600 dark:text-zinc-400', desc: 'Unreasonable & excessive charges' },
    2: { label: 'Somewhat Overpriced', color: 'text-zinc-600 dark:text-zinc-400', desc: 'Higher than expected scope' },
    3: { label: 'Average / Acceptable', color: 'text-zinc-600 dark:text-zinc-400', desc: 'Standard charges' },
    4: { label: 'Fair & Reasonable', color: 'text-zinc-700 dark:text-zinc-300', desc: 'Accurate and fair pricing' },
    5: { label: 'Very Fair & Genuine Value', color: 'text-zinc-900 dark:text-zinc-100', desc: '100% transparent & genuine PACS pricing' },
  };

  if (booking.qualityRating !== undefined || submitted) {
    return (
      <div className="p-3.5 rounded-xl bg-zinc-100 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/60 text-xs text-zinc-700 dark:text-zinc-300 flex items-center gap-2">
        <CheckCircle className="w-4 h-4 text-zinc-500 shrink-0" />
        <span>Thank you! Your 3-factor feedback has been recorded and verified for {booking.workerName}.</span>
      </div>
    );
  }

  function handleSubmitReview(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setTimeout(() => {
      dataService.submitThreeFactorReview(booking.id, quality, behavior, pricingRating, reviewNote);
      setSubmitting(false);
      setSubmitted(true);
      onReviewSubmitted();
    }, 300);
  }

  return (
    <form onSubmit={handleSubmitReview} className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-700/60 space-y-3.5">
      <div className="flex items-center gap-2 pb-1 border-b border-zinc-200 dark:border-zinc-700/60">
        <Award className="w-4 h-4 text-zinc-500" />
        <span className="font-bold text-zinc-900 dark:text-zinc-50 text-xs tracking-tight">
          Mandatory 3-Factor Performance & Pricing Survey for {booking.workerName}
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
        {/* Factor 1: Quality */}
        <div className="p-2.5 bg-white dark:bg-zinc-800/60 rounded-lg border border-zinc-200 dark:border-zinc-700/60 space-y-1.5 flex flex-col justify-between">
          <div>
            <label className="font-bold text-zinc-700 dark:text-zinc-300 block">
              1. Work Quality & Skill
            </label>
            <span className="text-[10px] text-zinc-400">Technical correctness</span>
          </div>
          <div className="flex items-center justify-between pt-1">
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((st) => (
                <button
                  type="button"
                  key={st}
                  onClick={() => setQuality(st)}
                  className={`p-0.5 rounded transition-transform active:scale-125 ${quality >= st ? 'text-zinc-700 dark:text-zinc-300' : 'text-zinc-300 dark:text-zinc-700'}`}
                >
                  <Star className="w-4 h-4 fill-current" />
                </button>
              ))}
            </div>
            <span className="font-bold text-zinc-800 dark:text-zinc-200 text-xs tabular-nums">{quality}/5</span>
          </div>
        </div>

        {/* Factor 2: Behavior */}
        <div className="p-2.5 bg-white dark:bg-zinc-800/60 rounded-lg border border-zinc-200 dark:border-zinc-700/60 space-y-1.5 flex flex-col justify-between">
          <div>
            <label className="font-bold text-zinc-700 dark:text-zinc-300 block">
              2. Behavior & Punctuality
            </label>
            <span className="text-[10px] text-zinc-400">Politeness & timeliness</span>
          </div>
          <div className="flex items-center justify-between pt-1">
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((st) => (
                <button
                  type="button"
                  key={st}
                  onClick={() => setBehavior(st)}
                  className={`p-0.5 rounded transition-transform active:scale-125 ${behavior >= st ? 'text-zinc-700 dark:text-zinc-300' : 'text-zinc-300 dark:text-zinc-700'}`}
                >
                  <Star className="w-4 h-4 fill-current" />
                </button>
              ))}
            </div>
            <span className="font-bold text-zinc-800 dark:text-zinc-200 text-xs tabular-nums">{behavior}/5</span>
          </div>
        </div>

        {/* Factor 3: Pricing Fairness & Overcharge Rating (1=Highly Overcharged, 5=Very Fair) */}
        <div className="p-2.5 bg-white dark:bg-zinc-800/60 rounded-lg border border-zinc-200 dark:border-zinc-700/60 space-y-1.5 flex flex-col justify-between">
          <div>
            <label className="font-bold text-zinc-700 dark:text-zinc-300 block">
              3. Pricing Fairness & Overcharge Rating
            </label>
            <span className={`text-[10px] font-bold block truncate ${PRICING_SCALE_LABELS[pricingRating].color}`}>
              {pricingRating} - {PRICING_SCALE_LABELS[pricingRating].label}
            </span>
          </div>
          <div className="flex items-center justify-between pt-1">
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((st) => (
                <button
                  type="button"
                  key={st}
                  onClick={() => setPricingRating(st)}
                  className={`p-0.5 rounded transition-transform active:scale-125 ${pricingRating >= st ? 'text-zinc-700 dark:text-zinc-300' : 'text-zinc-300 dark:text-zinc-700'}`}
                >
                  <Star className="w-4 h-4 fill-current" />
                </button>
              ))}
            </div>
            <span className="font-bold text-zinc-800 dark:text-zinc-200 text-xs tabular-nums">{pricingRating}/5</span>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between gap-3 pt-1">
        <input
          type="text"
          className="form-input text-xs flex-1 py-1.5"
          placeholder="Optional feedback comment for the cooperative committee…"
          value={reviewNote}
          onChange={(e) => setReviewNote(e.target.value)}
        />
        <button
          type="submit"
          disabled={submitting}
          className="btn-primary text-xs py-2 px-4 font-semibold shrink-0"
        >
          {submitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
          <span>Submit Review</span>
        </button>
      </div>
    </form>
  );
}

// ─── Worker Customer Reviews Modal ──────────────────────────────────────────
interface WorkerReviewsModalProps {
  worker: WorkerProfile;
  reviews: Booking[];
  onClose: () => void;
}

function WorkerReviewsModal({ worker, reviews, onClose }: WorkerReviewsModalProps) {
  return (
    <div className="modal-backdrop" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-box modal-box-lg p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-zinc-950 dark:bg-zinc-100 text-white dark:text-zinc-950 flex items-center justify-center font-black text-base shadow-sm">
              {worker.name.charAt(0)}
            </div>
            <div>
              <h3 className="font-black text-zinc-900 dark:text-zinc-50 text-base leading-tight tracking-tight">
                {worker.name} — Verified Resident Reviews
              </h3>
              <p className="text-xs text-zinc-500">
                {worker.trade} Artisan · {worker.localSociety || 'Primary Cooperative Society'}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 3-Factor Overall Summary */}
        <div className="grid grid-cols-3 gap-2 p-3 bg-zinc-50 dark:bg-zinc-900/60 rounded-xl border border-zinc-200 dark:border-zinc-700/60 text-center text-xs">
          <div>
            <span className="text-[10px] text-zinc-400 block font-semibold tracking-wide">Work Quality</span>
            <span className="font-bold text-zinc-900 dark:text-zinc-50 text-sm tabular-nums"> {(worker.qualityRating || 4.9).toFixed(1)} / 5</span>
          </div>
          <div>
            <span className="text-[10px] text-zinc-400 block font-semibold tracking-wide">Behavior</span>
            <span className="font-bold text-zinc-900 dark:text-zinc-50 text-sm tabular-nums"> {(worker.behaviorRating || 4.8).toFixed(1)} / 5</span>
          </div>
          <div>
            <span className="text-[10px] text-zinc-400 block font-semibold tracking-wide">Pricing Fairness</span>
            <span className="font-bold text-zinc-900 dark:text-zinc-50 text-sm tabular-nums"> {(worker.pricingRating || 4.9).toFixed(1)} / 5</span>
          </div>
        </div>

        {/* Reviews List */}
        <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
          {reviews.length === 0 ? (
            <div className="p-8 text-center text-xs text-zinc-400 space-y-2">
              <MessageSquare className="w-8 h-8 mx-auto text-zinc-300 dark:text-zinc-700" />
              <p className="font-semibold text-zinc-600 dark:text-zinc-400">No written reviews yet</p>
              <p className="text-[11px]">All performance ratings are verified by the PACS Cooperative Committee.</p>
            </div>
          ) : (
            reviews.map((r) => (
              <div key={r.id} className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-700/60 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-bold text-xs flex items-center justify-center">
                      {(r.customerName || 'R').charAt(0)}
                    </div>
                    <span className="font-bold text-zinc-900 dark:text-zinc-50 text-xs">
                      {r.customerName || 'Verified Resident'}
                    </span>
                  </div>
                  <span className="text-[10px] text-zinc-400">
                    {r.reviewedAt ? formatDate(r.reviewedAt) : 'Recent'}
                  </span>
                </div>

                <div className="flex flex-wrap gap-1.5 text-[10px]">
                  <span className="bg-white dark:bg-zinc-800/60 px-2 py-0.5 rounded-md border border-zinc-200 dark:border-zinc-700/60 text-zinc-600 dark:text-zinc-300 font-semibold">
                     Skill: {r.qualityRating || 5}/5
                  </span>
                  <span className="bg-white dark:bg-zinc-800/60 px-2 py-0.5 rounded-md border border-zinc-200 dark:border-zinc-700/60 text-zinc-600 dark:text-zinc-300 font-semibold">
                     Behavior: {r.behaviorRating || 5}/5
                  </span>
                  <span className="bg-white dark:bg-zinc-800/60 text-zinc-600 dark:text-zinc-300 px-2 py-0.5 rounded-md border border-zinc-200 dark:border-zinc-700/60 font-bold">
                     Pricing: {r.pricingRating || 5}/5
                  </span>
                </div>

                {r.reviewComment ? (
                  <p className="text-xs text-zinc-600 dark:text-zinc-400 italic leading-relaxed pt-0.5">
                    &ldquo;{r.reviewComment}&rdquo;
                  </p>
                ) : (
                  <p className="text-xs text-zinc-400 italic">
                    (Rating submitted with verified PACS completion)
                  </p>
                )}
              </div>
            ))
          )}
        </div>

        <div className="pt-2 flex justify-end">
          <button onClick={onClose} className="btn-secondary text-xs py-2 px-4 font-semibold">Close</button>
        </div>
      </div>
    </div>
  );
}


export default function MarketplacePage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [workers, setWorkers] = useState<WorkerProfile[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [society, setSociety] = useState<Society | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [activeTab, setActiveTab] = useState<'workers' | 'bookings'>('workers');
  const [selectedTrade, setSelectedTrade] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals & Expanded Reviews State
  const [authModal, setAuthModal] = useState<'signin' | 'signup' | null>(null);
  const [selectedWorkerForBooking, setSelectedWorkerForBooking] = useState<WorkerProfile | null>(null);
  const [activePaymentBooking, setActivePaymentBooking] = useState<Booking | null>(null);
  const [expandedWorkerId, setExpandedWorkerId] = useState<string | null>(null);
  const [selectedWorkerForReviewsModal, setSelectedWorkerForReviewsModal] = useState<WorkerProfile | null>(null);

  const TRADES_LIST = ['All', 'Electrical', 'Plumbing', 'Carpentry', 'Cleaning', 'Appliance Fix'];

  const refreshData = async (user?: User | null) => {
    await dataService.syncCloud();
    const wData = dataService.getWorkers();
    const sData = dataService.getServices();
    const soc = dataService.getSociety();

    setWorkers(wData);
    setServices(sData);
    setSociety(soc);

    if (user && user.role === 'CUSTOMER') {
      const allB = dataService.getBookings();
      setBookings(allB.filter((b) => b.customerId === user.id));
    }
  };

  useEffect(() => {
    const raw = typeof window !== 'undefined' ? localStorage.getItem('sahakargig_user') : null;
    if (raw) {
      try {
        const u = JSON.parse(raw);
        setCurrentUser(u);
        refreshData(u);
      } catch {
        refreshData(null);
      }
    } else {
      refreshData(null);
    }
  }, []);

  // Real-time Event Updates & Polling
  useEffect(() => {
    const handleStateUpdated = () => {
      refreshData(currentUser);
    };
    window.addEventListener('sahakar_state_updated', handleStateUpdated);

    const interval = setInterval(() => {
      refreshData(currentUser);
    }, 2500);

    return () => {
      window.removeEventListener('sahakar_state_updated', handleStateUpdated);
      clearInterval(interval);
    };
  }, [currentUser]);

  function handleSignOut() {
    localStorage.removeItem('sahakargig_user');
    setCurrentUser(null);
    setBookings([]);
    setActiveTab('workers');
  }

  function handleAuthSuccess(user: User) {
    localStorage.setItem('sahakargig_user', JSON.stringify(user));
    setCurrentUser(user);
    setAuthModal(null);
    if (user.role === 'WORKER') {
      router.push('/worker');
    } else {
      refreshData(user);
    }
  }

  function handleCancelBooking(bookingId: string) {
    if (!confirm('Are you sure you want to cancel this service request? This action is only allowed while the artisan has not yet accepted the job.')) {
      return;
    }
    const res = dataService.cancelBooking(bookingId, 'Cancelled by resident before acceptance');
    if (res.success) {
      refreshData(currentUser);
    } else {
      alert(res.error || 'Unable to cancel this request.');
    }
  }

  function getTradeBasePrice(tradeName: string): number {
    const found = services.find((s) => s.category.toLowerCase() === tradeName.toLowerCase() || s.name.toLowerCase().includes(tradeName.toLowerCase()));
    return found?.basePrice || found?.price || 150;
  }

  // Filter Active, Non-Suspended, KYC Verified Artisans
  const eligibleWorkers = workers.filter((w) => {
    const isSuspended = w.accountStatus === 'SUSPENDED_UNPAID_DUES' || (w.outstandingDues || 0) >= 300;
    if (isSuspended) return false;

    const matchesTrade = selectedTrade === 'All' || w.trade.toLowerCase() === selectedTrade.toLowerCase();
    const matchesSearch =
      !searchQuery ||
      w.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      w.trade.toLowerCase().includes(searchQuery.toLowerCase()) ||
      w.skills.some((sk) => sk.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesTrade && matchesSearch;
  });

  return (
    <div className="min-h-screen flex flex-col bg-zinc-50 dark:bg-zinc-950">
      {/* ─── Top Universal PACS Authority Helpline Banner ─── */}
      <div className="bg-zinc-950 dark:bg-black text-zinc-400 text-xs font-medium py-1.5 px-4 border-b border-zinc-800/60">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-1 text-center sm:text-left">
          <div className="flex items-center gap-1.5 text-zinc-300">
            <Shield className="w-3.5 h-3.5 text-zinc-500" />
            <span>Primary Cooperative Services Society Desk</span>
          </div>
          <div className="flex items-center gap-1 text-zinc-500 font-mono text-[11px]">
            <Phone className="w-3 h-3 text-zinc-600" />
            <span>Helpline: <strong className="text-zinc-300">+91 1800-425-2667</strong> (Toll Free)</span>
          </div>
        </div>
      </div>

      {/* ─── Top Header ──────────────────────────────────────────────────────── */}
      <header className="nav-sticky dark:border-zinc-800/60 border-zinc-200">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 shrink-0 min-w-0">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-zinc-950 dark:bg-zinc-100 flex items-center justify-center shadow-sm shrink-0">
              <Leaf className="w-4.5 h-4.5 sm:w-5 sm:h-5 text-white dark:text-zinc-950" />
            </div>
            <div className="flex flex-col justify-center min-w-0">
              <span className="font-black text-zinc-900 dark:text-zinc-50 text-lg sm:text-xl tracking-tight leading-none block whitespace-nowrap">
                SahakarGig
              </span>
              <span className="text-[10px] sm:text-[11px] font-medium text-zinc-500 leading-none block truncate max-w-[130px] xs:max-w-[200px] sm:max-w-none mt-1">
                Direct Cooperative Artisan Discovery
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {currentUser ? (
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="hidden md:block text-right">
                  <div className="text-xs font-bold text-zinc-900 dark:text-zinc-50">{currentUser.name}</div>
                  <div className="text-[10px] text-zinc-500 font-semibold">
                    {currentUser.role === 'WORKER' ? 'Artisan Partner' : 'Resident Customer'}
                  </div>
                </div>
                {currentUser.role === 'WORKER' && (
                  <button
                    onClick={() => router.push('/worker')}
                    className="btn-primary py-1.5 px-2.5 sm:px-3 text-xs font-semibold whitespace-nowrap"
                  >
                    Artisan Desk
                  </button>
                )}
                <button
                  onClick={handleSignOut}
                  className="btn-secondary py-1.5 px-2.5 sm:px-3 text-xs font-semibold whitespace-nowrap flex items-center gap-1"
                >
                  <LogOut className="w-3.5 h-3.5" /> <span className="hidden xs:inline">Sign Out</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 sm:gap-2">
                <button
                  onClick={() => setAuthModal('signin')}
                  className="btn-secondary text-xs py-1.5 px-2.5 sm:py-2 sm:px-3.5 font-semibold whitespace-nowrap flex items-center gap-1"
                >
                  <LogIn className="w-3.5 h-3.5" /> <span>Sign In</span>
                </button>
                <button
                  onClick={() => setAuthModal('signup')}
                  className="btn-primary text-xs py-1.5 px-2.5 sm:py-2 sm:px-4 font-semibold whitespace-nowrap flex items-center gap-1"
                >
                  <UserPlus className="w-3.5 h-3.5" /> <span className="hidden xs:inline">Get Started</span><span className="xs:hidden">Join</span>
                </button>
              </div>
            )}
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* ─── Main Content ────────────────────────────────────────────────────── */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-8 space-y-10">
        {!currentUser ? (
          /* ── Unauthenticated Landing Page Hero ── */
          <div className="space-y-12 animate-fadein">
            <section className="text-center py-10 sm:py-16 space-y-6">
              <h1 className="text-4xl sm:text-5xl font-black text-zinc-900 dark:text-zinc-50 tracking-tight max-w-3xl mx-auto leading-[1.1]">
                Book Certified Local Artisans.{' '}
                <span className="text-zinc-500 dark:text-zinc-400">Pay Only After Work is Done.</span>
              </h1>

              <p className="text-zinc-500 dark:text-zinc-400 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
                Connect directly with certified tradespeople operated by your Primary Cooperative Services Society. Zero pre-payment required — settle digitally or via cash on site after service completion.
              </p>

              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                <button
                  onClick={() => setAuthModal('signup')}
                  className="btn-primary py-3 px-8 text-sm font-semibold flex items-center gap-2"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Get Started Now</span>
                </button>
                <button
                  onClick={() => setAuthModal('signin')}
                  className="btn-secondary py-3 px-6 text-sm font-semibold flex items-center gap-2"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Member Sign In</span>
                </button>
              </div>
            </section>

            {/* Standard Cluster Services Matrix */}
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-black text-zinc-900 dark:text-zinc-50 tracking-tight">Standard Cluster Services</h2>
                  <p className="text-xs text-zinc-500">Fixed rate cooperative services approved for your local district</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {services.map((svc) => (
                  <div
                    key={svc.id}
                    onClick={() => setAuthModal('signin')}
                    className="card-hover p-5 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-start justify-between mb-3">
                        <div className="w-10 h-10 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center border border-zinc-200 dark:border-zinc-700/60 font-bold text-xs text-zinc-700 dark:text-zinc-300">
    <Wrench className="w-5 h-5 text-zinc-800 dark:text-zinc-200" />
  </div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded-full border border-zinc-200 dark:border-zinc-700/60">
                          {svc.category}
                        </span>
                      </div>
                      <h3 className="font-bold text-zinc-900 dark:text-zinc-50 text-base mb-1 tracking-tight">{svc.name}</h3>
                      <p className="text-xs text-zinc-500 leading-relaxed line-clamp-2">{svc.description}</p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800/60 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-zinc-400 block font-semibold uppercase tracking-wider">Cluster Base Rate</span>
                        <span className="text-base font-black text-zinc-900 dark:text-zinc-50 tabular-nums">{formatCurrency(svc.basePrice || svc.price)}</span>
                      </div>
                      <span className="text-xs font-semibold text-zinc-500 flex items-center gap-1">
                        Book Now <ChevronRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        ) : (
          /* ── Authenticated Customer Dashboard ── */
          <div className="space-y-6">
            {/* Worker Role Info Banner */}
            {currentUser?.role === 'WORKER' && (
              <div className="p-4 rounded-xl bg-zinc-100 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-700/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-fadein">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-zinc-950 dark:bg-zinc-100 text-white dark:text-zinc-950 flex items-center justify-center font-bold text-xs shrink-0">
                    <Wrench className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-bold text-zinc-900 dark:text-zinc-50 text-xs">
                      Artisan Account Active: {currentUser.name} ({currentUser.trade || 'Technician'})
                    </div>
                    <div className="text-[11px] text-zinc-500">
                      Service booking requests can only be placed from a Resident Customer account. To manage incoming jobs, use your Artisan Desk.
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => router.push('/worker')}
                  className="btn-primary text-xs py-2 px-4 font-semibold whitespace-nowrap self-start sm:self-auto"
                >
                  Go to Artisan Desk →
                </button>
              </div>
            )}

            {/* Navigation Tabs for Customers */}
            <div className="flex items-center justify-between pb-2 border-b border-zinc-200 dark:border-zinc-800/60">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setActiveTab('workers')}
                  className={`pb-2 text-sm font-semibold border-b-2 transition-all ${
                    activeTab === 'workers'
                      ? 'border-zinc-900 dark:border-zinc-50 text-zinc-900 dark:text-zinc-50'
                      : 'border-transparent text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200'
                  }`}
                >
                  Discover Verified Artisans
                </button>
                {currentUser?.role !== 'WORKER' && (
                  <button
                    onClick={() => setActiveTab('bookings')}
                    className={`pb-2 text-sm font-semibold border-b-2 transition-all flex items-center gap-1.5 ${
                      activeTab === 'bookings'
                        ? 'border-zinc-900 dark:border-zinc-50 text-zinc-900 dark:text-zinc-50'
                        : 'border-transparent text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200'
                    }`}
                  >
                    My Live Orders / History
                    {bookings.length > 0 && (
                      <span className="w-4 h-4 rounded-full bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-950 text-[10px] flex items-center justify-center font-bold tabular-nums">
                        {bookings.length}
                      </span>
                    )}
                  </button>
                )}
              </div>
            </div>

            {activeTab === 'workers' ? (
              <div className="space-y-6">
                {/* Search Bar and Trade Category Filters */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
                    <input
                      type="text"
                      className="form-input pl-10"
                      placeholder="Search electricians, plumbers, carpenters, technicians by name or skill…"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>

                  <div className="flex gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                    {TRADES_LIST.map((tr) => (
                      <button
                        key={tr}
                        onClick={() => setSelectedTrade(tr)}
                        className={`px-3 py-2 rounded-lg text-xs font-semibold border whitespace-nowrap transition-all ${
                          selectedTrade === tr
                            ? 'bg-zinc-950 dark:bg-zinc-50 text-white dark:text-zinc-950 border-zinc-950 dark:border-zinc-50'
                            : 'bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700/60 hover:bg-zinc-50 dark:hover:bg-zinc-800'
                        }`}
                      >
                        {tr}
                      </button>
                    ))}
                  </div>
                </div>
                {/* Trade Info & Base Rate Header */}
                {selectedTrade !== 'All' && (
                  <div className="p-4 rounded-xl bg-zinc-100 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-700/60 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-zinc-950 dark:bg-zinc-100 text-white dark:text-zinc-950 flex items-center justify-center font-bold text-sm">
                        <Wrench className="w-4 h-4" />
                      </div>
                      <div>
                        <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-50 tracking-tight">{selectedTrade} Trade Category</h2>
                        <p className="text-xs text-zinc-500">PACS Approved Diagnostic & Initial Work Rate</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] uppercase font-bold text-zinc-400 block tracking-wider">Standard Base Price</span>
                      <span className="text-lg font-black text-zinc-900 dark:text-zinc-50 tabular-nums">
                        {formatCurrency(getTradeBasePrice(selectedTrade))}
                      </span>
                    </div>
                  </div>
                )}

                {/* Artisans Discovery Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {eligibleWorkers.length === 0 ? (
                    <div className="col-span-full card p-12 text-center space-y-3">
                      <Wrench className="w-10 h-10 text-zinc-300 dark:text-zinc-700 mx-auto" />
                      <div className="font-bold text-zinc-700 dark:text-zinc-300 tracking-tight">No active verified artisans found</div>
                      <p className="text-xs text-zinc-400">Try selecting a different trade category or search query.</p>
                    </div>
                  ) : (
                    eligibleWorkers.map((w) => {
                      const basePrice = getTradeBasePrice(w.trade);
                      const qualityScore = (w.qualityRating || 4.9).toFixed(1);
                      const behaviorScore = (w.behaviorRating || 4.8).toFixed(1);
                      const fairPercentage = w.fairPricingPercentage || 96;

                      return (
                        <div key={w.id} className="card-hover p-5 flex flex-col justify-between space-y-4">
                          <div>
                            {/* Header with Avatar & Trade Badge */}
                            <div className="flex items-start justify-between gap-2 mb-3">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-zinc-950 dark:bg-zinc-100 text-white dark:text-zinc-950 flex items-center justify-center font-black text-base shadow-sm">
                                  {w.name.charAt(0)}
                                </div>
                                <div>
                                  <h3 className="font-black text-zinc-900 dark:text-zinc-50 text-base leading-tight tracking-tight">
                                    {w.name}
                                  </h3>
                                  <div className="text-xs font-medium text-zinc-500 flex items-center gap-1 mt-0.5">
                                    <MapPin className="w-3 h-3 text-zinc-400" />
                                    <span>{w.localSociety || 'Primary Cooperative Society'}</span>
                                  </div>
                                </div>
                              </div>

                              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded-full border border-zinc-200 dark:border-zinc-700/60 shrink-0">
                                {w.trade}
                              </span>
                            </div>

                            {/* Bio & Skills */}
                            <p className="text-xs text-zinc-500 leading-relaxed mb-3 line-clamp-2">
                              {w.bio}
                            </p>

                            <div className="flex flex-wrap gap-1 mb-4">
                              {w.skills.slice(0, 3).map((sk) => (
                                <span key={sk} className="text-[10px] bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 px-2 py-0.5 rounded-md font-medium">
                                  {sk}
                                </span>
                              ))}
                            </div>

                            {/* 3-Factor Trust & Performance Metrics Badges */}
                            <div className="p-3 bg-zinc-50 dark:bg-zinc-900/60 rounded-xl border border-zinc-200 dark:border-zinc-700/60 space-y-2 text-xs">
                              <div className="flex items-center justify-between">
                                <span className="text-zinc-500 flex items-center gap-1">
                                   Quality Score:
                                </span>
                                <span className="font-bold text-zinc-900 dark:text-zinc-50 tabular-nums">{qualityScore} / 5.0</span>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-zinc-500 flex items-center gap-1">
                                   Behavior & Punctuality:
                                </span>
                                <span className="font-bold text-zinc-900 dark:text-zinc-50 tabular-nums">{behaviorScore} / 5.0</span>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-zinc-500 flex items-center gap-1">
                                   Pricing Fairness:
                                </span>
                                <span className="font-bold text-zinc-900 dark:text-zinc-50 tabular-nums">
                                  {(w.pricingRating || 4.9).toFixed(1)} / 5.0 ({fairPercentage}%)
                                </span>
                              </div>
                            </div>

                            {/* Verified Resident Reviews Snippet & Expand Action */}
                            {(() => {
                              const workerReviews = dataService.getWorkerReviews(w.userId);
                              const topReview = workerReviews[0];
                              const isExpanded = expandedWorkerId === w.id;

                              return (
                                <div className="mt-3 p-3 bg-zinc-50 dark:bg-zinc-900/60 rounded-xl border border-zinc-200 dark:border-zinc-700/60 space-y-2 text-xs">
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-1.5 font-bold text-zinc-900 dark:text-zinc-50">
                                      <MessageSquare className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                                      <span>Resident Reviews</span>
                                      <span className="text-[10px] text-zinc-400 font-semibold">({workerReviews.length})</span>
                                    </div>

                                    {workerReviews.length > 0 && (
                                      <button
                                        type="button"
                                        onClick={() => setExpandedWorkerId(isExpanded ? null : w.id)}
                                        className="text-[11px] font-semibold text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 hover:underline flex items-center gap-0.5 transition-colors"
                                      >
                                        <span>{isExpanded ? 'Hide' : 'Expand'}</span>
                                        {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                                      </button>
                                    )}
                                  </div>

                                  {topReview ? (
                                    <div className="space-y-1">
                                      <p className="text-zinc-500 italic text-[11px] leading-relaxed line-clamp-2">
                                        &ldquo;{topReview.reviewComment || 'Great technical service and transparent PACS billing!'}&rdquo;
                                      </p>
                                      <div className="flex items-center justify-between text-[10px] text-zinc-400 pt-0.5 border-t border-zinc-200/50 dark:border-zinc-700/30">
                                        <span className="font-semibold text-zinc-500">
                                          — {topReview.customerName || 'Verified Resident'}
                                        </span>
                                        <button
                                          type="button"
                                          onClick={() => setSelectedWorkerForReviewsModal(w)}
                                          className="text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 font-semibold hover:underline transition-colors"
                                        >
                                          All Reviews ({workerReviews.length}) ↗
                                        </button>
                                      </div>
                                    </div>
                                  ) : (
                                    <div className="text-[11px] text-zinc-500 flex items-center justify-between">
                                      <span>PACS Verified Artisan</span>
                                      <span className="text-[10px] text-zinc-500 font-semibold">Quality Audited</span>
                                    </div>
                                  )}

                                  {/* Inline Expandable Full Typed Reviews List */}
                                  {isExpanded && workerReviews.length > 0 && (
                                    <div className="pt-2 mt-2 border-t border-zinc-200 dark:border-zinc-700/60 space-y-2 max-h-52 overflow-y-auto pr-1 animate-fadein">
                                      {workerReviews.map((r) => (
                                        <div key={r.id} className="p-2.5 rounded-lg bg-white dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/60 space-y-1 text-xs">
                                          <div className="flex items-center justify-between text-[10px]">
                                            <span className="font-bold text-zinc-800 dark:text-zinc-200">
                                              {r.customerName || 'Verified Resident'}
                                            </span>
                                            <span className="text-zinc-400">
                                              {r.reviewedAt ? formatDate(r.reviewedAt) : 'Recent'}
                                            </span>
                                          </div>
                                          <div className="flex flex-wrap gap-1 text-[9px]">
                                            <span className="bg-zinc-100 dark:bg-zinc-700/60 px-1.5 py-0.5 rounded text-zinc-600 dark:text-zinc-300 font-semibold">
                                               Skill: {r.qualityRating || 5}/5
                                            </span>
                                            <span className="bg-zinc-100 dark:bg-zinc-700/60 px-1.5 py-0.5 rounded text-zinc-600 dark:text-zinc-300 font-semibold">
                                               Behavior: {r.behaviorRating || 5}/5
                                            </span>
                                            <span className="bg-zinc-100 dark:bg-zinc-700/60 text-zinc-600 dark:text-zinc-300 px-1.5 py-0.5 rounded font-bold">
                                               Pricing: {r.pricingRating || 5}/5
                                            </span>
                                          </div>
                                          {r.reviewComment && (
                                            <p className="text-[11px] text-zinc-600 dark:text-zinc-400 italic pt-0.5">
                                              &ldquo;{r.reviewComment}&rdquo;
                                            </p>
                                          )}
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              );
                            })()}
                          </div>

                          {/* Base Rate & Booking Action */}
                          <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800/60 flex items-center justify-between">
                            <div>
                              <span className="text-[10px] text-zinc-400 block font-semibold uppercase tracking-wider">
                                Base Rate
                              </span>
                              <span className="text-base font-black text-zinc-900 dark:text-zinc-50 tabular-nums">
                                {formatCurrency(basePrice)}
                              </span>
                            </div>

                            {currentUser?.role === 'WORKER' ? (
                              <button
                                onClick={() => router.push('/worker')}
                                className="btn-secondary text-xs py-1.5 px-3 font-semibold"
                                title="Worker accounts cannot book services. Switch to customer account to book."
                              >
                                Artisan View
                              </button>
                            ) : (
                              <button
                                onClick={() => {
                                  if (!currentUser) {
                                    setAuthModal('signin');
                                  } else {
                                    setSelectedWorkerForBooking(w);
                                  }
                                }}
                                className="btn-primary text-xs py-2 px-4 font-semibold"
                              >
                                Book Worker
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            ) : (
              /* My Bookings View */
              <div className="space-y-4">
                {bookings.length === 0 ? (
                  <div className="card p-12 text-center space-y-3">
                    <CalendarDays className="w-10 h-10 text-zinc-300 dark:text-zinc-700 mx-auto" />
                    <div className="font-bold text-zinc-700 dark:text-zinc-300 tracking-tight">No active bookings</div>
                    <p className="text-xs text-zinc-400">Pick an artisan from the discovery tab to make a booking.</p>
                  </div>
                ) : (
                  bookings.map((bk) => {
                    const isCompleted = ['COMPLETED_PAID_DIGITALLY', 'COMPLETED_PAID_CASH', 'COMPLETED'].includes(bk.status);

                    return (
                      <div key={bk.id} className="card p-5 space-y-4">
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div>
                            <div className="font-bold text-zinc-900 dark:text-zinc-50 text-base tracking-tight">{bk.serviceName}</div>
                            <div className="text-xs text-zinc-500 mt-1 flex items-center gap-1.5">
                              <CalendarDays className="w-3.5 h-3.5" /> Scheduled: {formatDateTime(bk.scheduledDate)}
                            </div>
                            <div className="text-xs text-zinc-500 flex items-center gap-1.5 mt-0.5">
                              <MapPin className="w-3.5 h-3.5" /> Location: {bk.address}
                            </div>
                          </div>

                          <div className="text-right">
                            <span className={getBadgeClass(bk.status)}>
                              {getStatusReadableLabel(bk.status)}
                            </span>
                            <div className="text-sm font-black text-zinc-900 dark:text-zinc-50 mt-1 tabular-nums">
                              {formatCurrency(bk.totalAmount)}
                            </div>
                          </div>
                        </div>

                        {bk.problemDescription && (
                          <div className="p-3 bg-zinc-50 dark:bg-zinc-900/60 rounded-xl border border-zinc-200 dark:border-zinc-700/60 text-xs">
                            <div className="text-[10px] uppercase font-bold text-zinc-400 mb-0.5 tracking-wider">
                              Reported Problem Description
                            </div>
                            <p className="text-zinc-800 dark:text-zinc-200 leading-relaxed font-medium">
                              &quot;{bk.problemDescription}&quot;
                            </p>
                          </div>
                        )}

                        {/* Bill Breakdown with 5% PACS Platform Fee */}
                        <div className="p-3 bg-zinc-50 dark:bg-zinc-900/60 rounded-xl border border-zinc-200 dark:border-zinc-700/60 text-xs space-y-1">
                          <div className="flex justify-between text-zinc-600 dark:text-zinc-400">
                            <span>Artisan Labor & Diagnostic Subtotal:</span>
                            <span className="font-semibold text-zinc-900 dark:text-zinc-50 tabular-nums">
                              {formatCurrency(bk.subtotalAmount || bk.basePrice || 150)}
                            </span>
                          </div>
                          <div className="flex justify-between text-zinc-500 dark:text-zinc-400 text-[11px]">
                            <span>PACS Community Platform Fee (5%):</span>
                            <span className="tabular-nums font-medium">
                              +{formatCurrency(bk.platformFee || Math.round((bk.subtotalAmount || bk.basePrice || 150) * 0.05))}
                            </span>
                          </div>
                          <div className="flex justify-between font-bold text-zinc-900 dark:text-zinc-50 pt-1 border-t border-zinc-200 dark:border-zinc-700/60">
                            <span>Total Payable:</span>
                            <span className="tabular-nums font-black">{formatCurrency(bk.totalAmount)}</span>
                          </div>
                        </div>

                        {/* In-Progress Notification */}
                        {bk.status === 'IN_PROGRESS' && (
                          <div className="p-3.5 bg-zinc-100 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-700/60 rounded-xl text-xs text-zinc-700 dark:text-zinc-300 flex items-center gap-2">
                            <Clock className="w-4 h-4 text-zinc-500 shrink-0" />
                            <span>
                              Artisan <strong className="text-zinc-900 dark:text-zinc-50">{bk.workerName}</strong> has accepted your request and is performing the service. No payment is required until work is completed.
                            </span>
                          </div>
                        )}

                        {/* Post-Service Payment Card */}
                        {bk.status === 'AWAITING_PAYMENT' && (
                          <div className="p-4 rounded-xl bg-zinc-950 dark:bg-zinc-50 flex flex-col sm:flex-row items-center justify-between gap-3 animate-fadein">
                            <div className="text-xs text-zinc-300 dark:text-zinc-700">
                              <div className="font-bold text-sm flex items-center gap-1.5 text-white dark:text-zinc-950">
                                <CheckCircle className="w-4 h-4" />
                                Service Completed by {bk.workerName} • Pay {formatCurrency(bk.totalAmount)}
                              </div>
                              <div className="text-zinc-400 dark:text-zinc-600 mt-0.5 font-medium">
                                Pay securely online right now, or hand cash directly to the artisan on site.
                              </div>
                            </div>
                            <button
                              onClick={() => setActivePaymentBooking(bk)}
                              className="bg-white dark:bg-zinc-950 text-zinc-950 dark:text-zinc-50 border border-zinc-200 dark:border-zinc-700 text-xs py-2 px-5 font-semibold rounded-lg whitespace-nowrap hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors flex items-center gap-1.5"
                            >
                              <CreditCard className="w-3.5 h-3.5" /> Pay {formatCurrency(bk.totalAmount)} Online
                            </button>
                          </div>
                        )}

                        {/* Completed State: Customer Review Survey */}
                        {isCompleted && (
                          <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800/60">
                            <CustomerReviewCard
                              booking={bk}
                              onReviewSubmitted={() => refreshData(currentUser)}
                            />
                          </div>
                        )}

                        {/* Cancellation / Non-Cancellable Policy Action Bar */}
                        {bk.status === 'PENDING_ACCEPTANCE' && (
                          <div className="p-3 bg-zinc-50 dark:bg-zinc-900/60 rounded-xl border border-zinc-200 dark:border-zinc-700/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5">
                            <div className="text-xs text-zinc-600 dark:text-zinc-400 flex items-center gap-1.5">
                              <Clock className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                              <span>Waiting for artisan acceptance. You may cancel anytime before they confirm.</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleCancelBooking(bk.id)}
                              className="btn-secondary text-xs py-1.5 px-3 font-semibold text-red-600 dark:text-red-400 border-red-200 dark:border-red-900/60 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors flex items-center gap-1 shrink-0 self-end sm:self-auto"
                            >
                              <X className="w-3.5 h-3.5" /> Cancel Request
                            </button>
                          </div>
                        )}

                        {['IN_PROGRESS', 'AWAITING_PAYMENT'].includes(bk.status) && (
                          <div className="flex items-center justify-between text-[11px] text-zinc-500 pt-1 border-t border-zinc-100 dark:border-zinc-800/60">
                            <span className="flex items-center gap-1.5 font-medium">
                              <Shield className="w-3.5 h-3.5 text-zinc-500" />
                              Artisan Agreed & Dispatched
                            </span>
                            <span className="font-semibold text-zinc-400">
                              Non-Cancellable Policy Active
                            </span>
                          </div>
                        )}

                        {bk.status === 'CANCELLED' && (
                          <div className="p-3 bg-zinc-100 dark:bg-zinc-900/60 rounded-xl border border-zinc-200 dark:border-zinc-700/60 text-xs text-zinc-600 dark:text-zinc-400 flex items-center gap-2">
                            <X className="w-4 h-4 text-zinc-400 shrink-0" />
                            <span>This booking request was cancelled before artisan agreement. No charges incurred.</span>
                          </div>
                        )}

                        {/* Visual Progress Tracker with Distinct Phase Highlighting */}
                        {bk.status !== 'CANCELLED' && (
                          <div className="bg-zinc-50 dark:bg-zinc-900/60 rounded-xl p-3.5 border border-zinc-200 dark:border-zinc-700/60 space-y-2">
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-[11px]">
                              {/* Step 1: Requested */}
                              <div className={
                                bk.status === 'PENDING_ACCEPTANCE'
                                  ? 'step-box step-active'
                                  : 'step-box step-completed'
                              }>
                                <span className="font-bold">1. Requested</span>
                                <span className="text-[9px] opacity-80">{bk.status === 'PENDING_ACCEPTANCE' ? 'Waiting' : 'Accepted'}</span>
                              </div>

                              {/* Step 2: In Progress */}
                              <div className={
                                bk.status === 'PENDING_ACCEPTANCE'
                                  ? 'step-box step-pending'
                                  : bk.status === 'IN_PROGRESS'
                                  ? 'step-box step-active'
                                  : 'step-box step-completed'
                              }>
                                <span className="font-bold">2. In Progress</span>
                                <span className="text-[9px] opacity-80">
                                  {bk.status === 'PENDING_ACCEPTANCE' ? 'Pending' : bk.status === 'IN_PROGRESS' ? 'Active' : 'Finished'}
                                </span>
                              </div>

                              {/* Step 3: Work Done (Pay) */}
                              <div className={
                                ['PENDING_ACCEPTANCE', 'IN_PROGRESS'].includes(bk.status)
                                  ? 'step-box step-pending'
                                  : bk.status === 'AWAITING_PAYMENT'
                                  ? 'step-box step-awaiting'
                                  : 'step-box step-completed'
                              }>
                                <span className="font-bold">3. {isCompleted ? 'Settled' : 'Pay Bill'}</span>
                                <span className="text-[9px] opacity-80">
                                  {['PENDING_ACCEPTANCE', 'IN_PROGRESS'].includes(bk.status)
                                    ? 'Upcoming'
                                    : bk.status === 'AWAITING_PAYMENT'
                                    ? 'Pay Now'
                                    : 'Paid'}
                                </span>
                              </div>

                              {/* Step 4: Settled & Rated */}
                              <div className={
                                isCompleted
                                  ? 'step-box step-completed'
                                  : 'step-box step-pending'
                              }>
                                <span className="font-bold">4. Rated</span>
                                <span className="text-[9px] opacity-80">{isCompleted ? 'Closed' : 'Pending'}</span>
                              </div>
                            </div>

                            {bk.workerName && (
                              <div className="text-xs text-zinc-500 text-center pt-1">
                                Assigned Artisan: <strong className="text-zinc-900 dark:text-zinc-50">{bk.workerName}</strong>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            )}
          </div>
        )}
      </main>

      {/* ─── Modals ─────────────────────────────────────────────────────────── */}
      {authModal === 'signin' && (
        <SignInModal
          onClose={() => setAuthModal(null)}
          onSuccess={handleAuthSuccess}
          onSwitchToSignUp={() => setAuthModal('signup')}
        />
      )}

      {authModal === 'signup' && (
        <SignUpModal
          onClose={() => setAuthModal(null)}
          onSuccess={handleAuthSuccess}
          onSwitchToSignIn={() => setAuthModal('signin')}
        />
      )}

      {selectedWorkerForBooking && currentUser && (
        <WorkerBookingModal
          worker={selectedWorkerForBooking}
          tradeBasePrice={getTradeBasePrice(selectedWorkerForBooking.trade)}
          user={currentUser}
          onClose={() => setSelectedWorkerForBooking(null)}
          onBookingSubmitted={() => {
            setSelectedWorkerForBooking(null);
            setActiveTab('bookings');
            refreshData(currentUser);
          }}
        />
      )}

      {activePaymentBooking && (
        <PostServicePaymentModal
          booking={activePaymentBooking}
          onConfirm={async () => {
            dataService.settleDigitalPayment(activePaymentBooking.id);
            refreshData(currentUser);
          }}
          onClose={() => setActivePaymentBooking(null)}
        />
      )}

      {selectedWorkerForReviewsModal && (
        <WorkerReviewsModal
          worker={selectedWorkerForReviewsModal}
          reviews={dataService.getWorkerReviews(selectedWorkerForReviewsModal.userId)}
          onClose={() => setSelectedWorkerForReviewsModal(null)}
        />
      )}

      {/* ─── Footer ─────────────────────────────────────────────────────────── */}
      <footer className="bg-white border-t border-slate-200 py-6 mt-12">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <div>
            © 2026 <strong>SahakarGig</strong> — Primary Cooperative Services Platform.
          </div>
          {!currentUser && (
            <div>
              <a href="/admin/login" className="text-blue-600 dark:text-blue-400 font-semibold hover:underline flex items-center gap-1">
                <Shield className="w-3 h-3" /> PACS Administration Console
              </a>
            </div>
          )}
        </div>
      </footer>
    </div>
  );
}
