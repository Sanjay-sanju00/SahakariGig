'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  Leaf, LogIn, UserPlus, X, CheckCircle, ChevronRight, MapPin,
  CalendarDays, ShoppingBag, CreditCard, Loader2,
  Shield, Star, AlertCircle,
  IndianRupee, Clock, LogOut, Search,
  Phone, MessageSquare, Send, Banknote, Check, AlertTriangle,
  Coins, Wrench, FileText
} from 'lucide-react';
import ThemeToggle from '@/components/ThemeToggle';
import { Service, Booking, User } from '@/lib/store';
import { formatCurrency, formatDateTime, getBadgeClass, getStatusReadableLabel } from '@/lib/utils';

// ─── Session Helpers ───────────────────────────────────────────────────────
function getSessionUser(): User | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem('sahakargig_user');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function setSessionUser(user: User | null) {
  if (typeof window === 'undefined') return;
  if (user) {
    localStorage.setItem('sahakargig_user', JSON.stringify(user));
  } else {
    localStorage.removeItem('sahakargig_user');
  }
}

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
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          password: password.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to sign in. Please check your credentials.');
        setLoading(false);
        return;
      }

      onSuccess(data.user);
    } catch {
      setError('Network error. Please try again.');
      setLoading(false);
    }
  }

  return (
    <div className="modal-backdrop" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-box">
        <div className="flex items-center justify-between p-5 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white">
              <Leaf className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-bold text-slate-900 leading-tight">Sign In to SahakarGig</h2>
              <p className="text-xs text-slate-500">Cooperative Community Marketplace</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400">
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
              <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <button type="submit" className="btn-primary w-full py-2.5 font-bold" disabled={loading}>
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogIn className="w-4 h-4" />}
              {loading ? 'Authenticating…' : 'Sign In'}
            </button>
          </form>

          <div className="divider my-4" />

          <div className="text-center">
            <p className="text-xs text-slate-500">
              New to SahakarGig?{' '}
              <button
                type="button"
                onClick={onSwitchToSignUp}
                className="text-blue-600 font-semibold hover:underline"
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
  const [password, setPassword] = useState('');
  const [address, setAddress] = useState('');
  const [trade, setTrade] = useState('Plumbing');
  const [kycDocName, setKycDocName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const TRADES = [
    'Plumbing',
    'Electrical',
    'Carpentry',
    'Cleaning',
    'Appliance Fix',
  ];

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      setKycDocName(file.name);
    }
  }

  async function handleSignUp(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !password.trim() || !address.trim()) {
      setError('Please fill in all required fields.');
      return;
    }
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim().toLowerCase(),
          password: password.trim(),
          address: address.trim(),
          role,
          trade: role === 'WORKER' ? trade : undefined,
          kycDocName: role === 'WORKER' ? (kycDocName || 'artisan_id_card.pdf') : undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to create account.');
        setLoading(false);
        return;
      }

      onSuccess(data.user);
    } catch {
      setError('Network error. Please try again.');
      setLoading(false);
    }
  }

  return (
    <div className="modal-backdrop" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-box modal-box-lg">
        <div className="flex items-center justify-between p-5 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white">
              <UserPlus className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-bold text-slate-900 leading-tight">Create an Account</h2>
              <p className="text-xs text-slate-500">Join the SahakarGig Cooperative Network</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <form onSubmit={handleSignUp} className="space-y-4">
            {/* Role Selection */}
            <div>
              <label className="form-label mb-1.5">Account Role</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setRole('CUSTOMER')}
                  className={`p-3 rounded-xl border text-left flex items-start gap-2.5 transition-all ${
                    role === 'CUSTOMER'
                      ? 'border-blue-600 bg-blue-50/70 text-blue-900 shadow-sm'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <ShoppingBag className={`w-4 h-4 mt-0.5 ${role === 'CUSTOMER' ? 'text-blue-600' : 'text-slate-400'}`} />
                  <div>
                    <div className="text-xs font-bold">Customer</div>
                    <div className="text-[11px] text-slate-500">Book trusted local services</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setRole('WORKER')}
                  className={`p-3 rounded-xl border text-left flex items-start gap-2.5 transition-all ${
                    role === 'WORKER'
                      ? 'border-blue-600 bg-blue-50/70 text-blue-900 shadow-sm'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <div className="w-4 h-4 mt-0.5 text-blue-600 font-bold">🔧</div>
                  <div>
                    <div className="text-xs font-bold">Worker / Artisan</div>
                    <div className="text-[11px] text-slate-500">Earn with 0% commission</div>
                  </div>
                </button>
              </div>
            </div>

            {/* Shared Inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
              <div>
                <label className="form-label">Email Address</label>
                <input
                  type="email"
                  className="form-input"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="form-label">Create Password</label>
                <input
                  type="password"
                  className="form-input"
                  placeholder="Min 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="form-label">Address / Village Cluster</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Sector 4 Cluster, Block B"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Worker Specific */}
            {role === 'WORKER' && (
              <div className="space-y-3 pt-1 border-t border-slate-100">
                <div>
                  <label className="form-label">Primary Trade Category</label>
                  <select
                    className="form-input"
                    value={trade}
                    onChange={(e) => setTrade(e.target.value)}
                  >
                    {TRADES.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="form-label">Sample KYC Document Upload</label>
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border border-dashed border-blue-300 bg-blue-50/40 hover:bg-blue-50 rounded-xl p-3 text-center cursor-pointer transition-colors"
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      className="hidden"
                      onChange={handleFileSelect}
                    />
                    <div className="text-xs font-semibold text-blue-700">
                      <span>{kycDocName || 'Click to select sample ID card / certificate'}</span>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-0.5">Accepts PDF, JPG, PNG (Simulated Document)</p>
                  </div>
                </div>
              </div>
            )}

            {error && (
              <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <button type="submit" className="btn-primary w-full py-2.5 font-bold" disabled={loading}>
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
              {loading ? 'Registering Account…' : 'Register & Sign In'}
            </button>
          </form>

          <div className="divider my-4" />

          <div className="text-center">
            <p className="text-xs text-slate-500">
              Already have an account?{' '}
              <button
                type="button"
                onClick={onSwitchToSignIn}
                className="text-blue-600 font-semibold hover:underline"
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

// ─── Post-Service Digital Payment Modal ─────────────────────────────────────
interface PostServicePaymentModalProps {
  booking: Booking;
  onConfirm: () => Promise<void>;
  onClose: () => void;
}

function PostServicePaymentModal({ booking, onConfirm, onClose }: PostServicePaymentModalProps) {
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);

  async function handleDigitalPay() {
    setProcessing(true);
    await onConfirm();
    setProcessing(false);
    setSuccess(true);
    setTimeout(() => {
      onClose();
    }, 1000);
  }

  return (
    <div className="modal-backdrop">
      <div className="modal-box">
        <div className="flex items-center justify-between p-5 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-blue-600" />
            <h3 className="font-bold text-slate-900">Post-Service Digital Payment</h3>
          </div>
          {!processing && !success && (
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="p-5">
          {!success ? (
            <div className="space-y-4">
              <div className="rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 space-y-2">
                <div className="flex justify-between items-center text-xs text-slate-600 dark:text-slate-400">
                  <span>Completed Service</span>
                  <span className="font-bold text-slate-900 dark:text-slate-100">{booking.serviceName}</span>
                </div>
                <div className="flex justify-between items-center text-xs text-slate-600 dark:text-slate-400">
                  <span>Assigned Artisan</span>
                  <span className="font-bold text-slate-900 dark:text-slate-100">{booking.workerName || 'Assigned Artisan'}</span>
                </div>
                <div className="h-px bg-slate-200 dark:bg-slate-800 my-1" />
                <div className="flex justify-between items-center text-sm font-black text-slate-900 dark:text-slate-100">
                  <span>Total Service Fee</span>
                  <span className="text-blue-600 dark:text-blue-400 text-lg font-black">{formatCurrency(booking.totalAmount)}</span>
                </div>
              </div>

              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl border border-emerald-100 dark:border-emerald-800/80 text-xs text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
                <Shield className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>100% of this fee is credited directly to {booking.workerName}. Zero platform commission.</span>
              </div>

              <button
                onClick={handleDigitalPay}
                className="btn-primary w-full py-3 text-sm font-bold shadow-sm"
                disabled={processing}
              >
                {processing ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" /> Authorizing Digital Settlement…
                  </span>
                ) : (
                  <span>Confirm Digital Payment of {formatCurrency(booking.totalAmount)}</span>
                )}
              </button>
            </div>
          ) : (
            <div className="py-8 text-center space-y-3 animate-fadein">
              <div className="w-14 h-14 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-600 dark:text-emerald-300 flex items-center justify-center mx-auto">
                <CheckCircle className="w-8 h-8" />
              </div>
              <div className="font-bold text-slate-900 dark:text-slate-100 text-base">Digital Payment Settled!</div>
              <p className="text-xs text-slate-500 dark:text-slate-400">Thank you! Please share your feedback below.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Service Booking Modal (Zero Pre-Payment) ───────────────────────────────
interface ServiceBookingModalProps {
  service: Service;
  user: User;
  onClose: () => void;
  onBookingSubmitted: (booking: Booking) => void;
}

function ServiceBookingModal({ service, user, onClose, onBookingSubmitted }: ServiceBookingModalProps) {
  const [address, setAddress] = useState(user.address || '');
  const [date, setDate] = useState('');
  const [problemDescription, setProblemDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!address.trim() || !date) {
      setError('Please provide service location and preferred time.');
      return;
    }
    if (!problemDescription.trim()) {
      setError('Please provide a brief description of the issue or repair required.');
      return;
    }
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerId: user.id,
          customerName: user.name,
          customerPhone: user.phone || '9823011223',
          customerAddress: user.address,
          serviceId: service.id,
          serviceName: service.name,
          problemDescription: problemDescription.trim(),
          scheduledDate: new Date(date).toISOString(),
          address: address.trim(),
          totalAmount: service.price,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        onBookingSubmitted(data.booking);
      } else {
        setError(data.error || 'Failed to place booking.');
        setLoading(false);
      }
    } catch {
      setError('Network error. Please try again.');
      setLoading(false);
    }
  }

  return (
    <div className="modal-backdrop" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-box">
        <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{service.icon}</span>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-slate-100">{service.name}</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">{service.category} · Fixed Rate: {formatCurrency(service.price)}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 dark:text-slate-300">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="form-label">Service Address / Residence</label>
            <input
              type="text"
              className="form-input"
              placeholder="House/Flat No., Street, Sector Cluster"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="form-label">Preferred Date & Time</label>
            <input
              type="datetime-local"
              className="form-input"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              min={new Date().toISOString().slice(0, 16)}
              required
            />
          </div>

          <div>
            <label className="form-label">
              Describe the Problem / Issue Details <span className="text-blue-600 dark:text-blue-400">*</span>
            </label>
            <textarea
              rows={3}
              className="form-input text-xs"
              placeholder="Describe the issue (e.g., Kitchen tap is leaking from the pipe joint, or ceiling fan speed regulator makes a buzzing noise)..."
              value={problemDescription}
              onChange={(e) => setProblemDescription(e.target.value)}
              required
            />
            <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">This description will be shared with the assigned artisan before arrival.</p>
          </div>

          {/* Post-Service Zero Pre-Payment Guarantee Card */}
          <div className="rounded-xl bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/80 p-4 space-y-1.5 text-xs text-emerald-900 dark:text-emerald-200">
            <div className="flex justify-between font-bold">
              <span>Standard Fixed Price</span>
              <span className="text-blue-700 dark:text-blue-300 font-black">{formatCurrency(service.price)}</span>
            </div>
            <p className="text-[11px] text-emerald-800 dark:text-emerald-300 font-medium">
              🛡️ <strong>Zero Pre-Payment Model:</strong> You pay nothing right now. Payment is due only after the artisan arrives, finishes the physical service, and requests settlement.
            </p>
          </div>

          {error && (
            <div className="p-2.5 bg-red-50 dark:bg-red-950/50 text-red-700 dark:text-red-300 text-xs rounded-lg flex items-center gap-1.5 border border-red-200 dark:border-red-900">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <button type="submit" className="btn-primary w-full py-2.5 font-bold shadow-sm" disabled={loading}>
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShoppingBag className="w-4 h-4" />}
            {loading ? 'Submitting Request…' : 'Book Service (Pay After Work Done)'}
          </button>
        </form>
      </div>
    </div>
  );
}

// ─── Customer Review Card ───────────────────────────────────────────────────
function CustomerReviewCard({ booking, onReviewSubmitted }: { booking: Booking; onReviewSubmitted: () => void }) {
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(!!booking.reviewRating);

  async function handleReviewSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch('/api/bookings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: booking.id,
          action: 'SUBMIT_REVIEW',
          reviewRating: rating,
          reviewComment: comment.trim() || 'Service completed satisfactorily.',
        }),
      });

      if (res.ok) {
        setSubmitted(true);
        onReviewSubmitted();
      }
    } catch (err) {
      console.error('Review submit error:', err);
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted || booking.reviewRating) {
    return (
      <div className="p-4 bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/80 rounded-xl space-y-1.5">
        <div className="flex items-center gap-2 text-xs font-bold text-emerald-800 dark:text-emerald-300">
          <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          Review Submitted ({booking.reviewRating || rating} ★)
        </div>
        <p className="text-xs text-emerald-700 dark:text-emerald-300 italic font-medium">
          &quot;{booking.reviewComment || comment || 'Great service!'}&quot;
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleReviewSubmit} className="p-4 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Rate Service Quality ({booking.workerName || 'Artisan'})</span>
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              type="button"
              key={star}
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
              className="p-0.5 text-amber-400 hover:scale-110 transition-transform"
            >
              <Star
                className={`w-4 h-4 ${
                  (hoverRating || rating) >= star ? 'fill-amber-400 text-amber-400' : 'text-slate-300 dark:text-slate-600'
                }`}
              />
            </button>
          ))}
        </div>
      </div>

      <div className="flex gap-2">
        <input
          type="text"
          className="form-input text-xs py-1.5 flex-1"
          placeholder="Share feedback on work quality, punctuality, etc…"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
        />
        <button
          type="submit"
          className="btn-primary text-xs py-1.5 px-3 whitespace-nowrap font-bold"
          disabled={submitting}
        >
          {submitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
          Submit Review
        </button>
      </div>
    </form>
  );
}

// ─── Main Customer Portal ──────────────────────────────────────────────────
export default function CustomerPortal() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeBookingService, setActiveBookingService] = useState<Service | null>(null);
  const [activePaymentBooking, setActivePaymentBooking] = useState<Booking | null>(null);
  const [authModal, setAuthModal] = useState<'signin' | 'signup' | null>(null);
  const [activeTab, setActiveTab] = useState<'services' | 'bookings'>('services');

  // Real-time synchronization
  const refreshData = useCallback(async (user: User | null) => {
    try {
      const socRes = await fetch('/api/society');
      if (socRes.ok) {
        const data = await socRes.json();
        setServices(data.services || []);
      }

      if (user) {
        const bRes = await fetch(`/api/bookings?customerId=${user.id}`);
        if (bRes.ok) {
          const bData = await bRes.json();
          setBookings(bData.bookings || []);
        }
      }
    } catch (err) {
      console.error('Failed to sync customer state:', err);
    }
  }, []);

  useEffect(() => {
    const stored = getSessionUser();
    if (stored) {
      if (stored.role === 'WORKER') {
        router.replace('/worker');
        return;
      }
      setCurrentUser(stored);
      refreshData(stored);
    } else {
      refreshData(null);
    }
  }, [router, refreshData]);

  // Live polling (2.5s) for instant real-time synchronization
  useEffect(() => {
    if (!currentUser) return;
    const interval = setInterval(() => {
      refreshData(currentUser);
    }, 2500);
    return () => clearInterval(interval);
  }, [currentUser, refreshData]);

  function handleAuthSuccess(user: User) {
    setSessionUser(user);
    setAuthModal(null);
    if (user.role === 'WORKER') {
      router.push('/worker');
    } else {
      setCurrentUser(user);
      refreshData(user);
    }
  }

  function handleSignOut() {
    setSessionUser(null);
    setCurrentUser(null);
    setBookings([]);
  }

  // 1-Click Post-Service Digital Payment Confirmation
  async function handleConfirmDigitalPayment() {
    if (!activePaymentBooking) return;
    try {
      const res = await fetch('/api/bookings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: activePaymentBooking.id,
          action: 'PAY_DIGITALLY',
        }),
      });

      if (res.ok) {
        refreshData(currentUser);
      }
    } catch (err) {
      console.error('Error confirming digital payment:', err);
    }
  }

  const categories = ['All', ...Array.from(new Set(services.map((s) => s.category)))];
  const filteredServices = services.filter((s) => {
    const matchesCat = selectedCategory === 'All' || s.category === selectedCategory;
    const matchesSearch =
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      {/* ─── Top Header (Strict Customer Context — No Worker Buttons) ────────── */}
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
          <div
            className="flex items-center gap-2.5 cursor-pointer"
            onClick={() => setActiveTab('services')}
          >
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-600/20">
              <Leaf className="w-5 h-5" />
            </div>
            <div>
              <span className="font-black text-slate-900 text-xl tracking-tight leading-none block">
                SahakarGig
              </span>
              <span className="text-[11px] font-medium text-slate-500 leading-none">
                Primary Cooperative Services Network
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {currentUser ? (
              <div className="flex items-center gap-3">
                <div className="hidden sm:block text-right">
                  <div className="text-xs font-bold text-slate-900 dark:text-slate-100">{currentUser.name}</div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400">Resident Customer</div>
                </div>
                <button
                  onClick={handleSignOut}
                  className="btn-secondary py-1.5 px-3 text-xs font-bold"
                  title="Sign Out"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Sign Out</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setAuthModal('signin')}
                  className="btn-secondary text-xs py-2 px-3.5 font-bold"
                >
                  <LogIn className="w-3.5 h-3.5" /> Sign In
                </button>
                <button
                  onClick={() => setAuthModal('signup')}
                  className="btn-primary text-xs py-2 px-4 font-bold shadow-sm"
                >
                  <UserPlus className="w-3.5 h-3.5" /> Get Started
                </button>
              </div>
            )}
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* ─── Main Content ───────────────────────────────────────────────────── */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-8">
        {!currentUser ? (
          /* Unauthenticated Landing */
          <div className="space-y-12">
            <section className="text-center py-10 sm:py-16 space-y-6">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-bold uppercase tracking-wider">
                <Shield className="w-3.5 h-3.5" /> 100% Post-Service Payment Guarantee
              </div>

              <h1 className="text-4xl sm:text-5xl font-black text-slate-900 dark:text-slate-100 tracking-tight max-w-3xl mx-auto leading-[1.15]">
                Book Certified Local Artisans.{' '}
                <span className="text-blue-600 dark:text-blue-400">Pay Only After Work is Done.</span>
              </h1>

              <p className="text-slate-600 dark:text-slate-300 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
                Connect directly with certified tradespeople operated by your Primary Cooperative Services Society. Zero pre-payment required — settle digitally or via cash on site after service completion.
              </p>

              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                <button
                  onClick={() => setAuthModal('signup')}
                  className="btn-primary py-3 px-8 text-sm font-bold shadow-md"
                >
                  <UserPlus className="w-4 h-4" /> Get Started Now
                </button>
                <button
                  onClick={() => setAuthModal('signin')}
                  className="btn-secondary py-3 px-6 text-sm font-bold"
                >
                  <LogIn className="w-4 h-4" /> Member Sign In
                </button>
              </div>
            </section>

            {/* Service Directory */}
            <section className="space-y-4">
              <h2 className="text-xl font-black text-slate-900 dark:text-slate-100">Standard Cluster Services</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {services.map((svc) => (
                  <div
                    key={svc.id}
                    onClick={() => setAuthModal('signin')}
                    className="card-hover p-5 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-start justify-between mb-3">
                        <span className="text-3xl">{svc.icon}</span>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded-full border border-blue-100 dark:border-blue-800">
                          {svc.category}
                        </span>
                      </div>
                      <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base mb-1">{svc.name}</h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-2">{svc.description}</p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-slate-400 dark:text-slate-500 block font-semibold uppercase">Cluster Rate</span>
                        <span className="text-base font-black text-blue-600 dark:text-blue-400">{formatCurrency(svc.price)}</span>
                      </div>
                      <span className="text-xs font-bold text-blue-600 dark:text-blue-400 flex items-center gap-1">
                        Book Now <ChevronRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        ) : (
          /* Authenticated Customer View */
          <div className="space-y-6">
            {/* Tabs */}
            <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setActiveTab('services')}
                  className={`pb-2 text-sm font-bold border-b-2 transition-all ${
                    activeTab === 'services'
                      ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                      : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
                  }`}
                >
                  Browse Services
                </button>
                <button
                  onClick={() => setActiveTab('bookings')}
                  className={`pb-2 text-sm font-bold border-b-2 transition-all flex items-center gap-1.5 ${
                    activeTab === 'bookings'
                      ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                      : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
                  }`}
                >
                  My Live Orders / History
                  {bookings.length > 0 && (
                    <span className="w-4 h-4 rounded-full bg-blue-600 text-white text-[10px] flex items-center justify-center font-bold">
                      {bookings.length}
                    </span>
                  )}
                </button>
              </div>
            </div>

            {activeTab === 'services' ? (
              <div className="space-y-5">
                {/* Search & Categories */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      className="form-input pl-10"
                      placeholder="Search electrical, plumbing, carpentry, cleaning, repairs…"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>

                  <div className="flex gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                    {categories.map((cat) => (
                      <button
                        key={cat}
                        onClick={() => setSelectedCategory(cat)}
                        className={`px-3 py-2 rounded-lg text-xs font-bold border whitespace-nowrap transition-all ${
                          selectedCategory === cat
                            ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                            : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Service Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {filteredServices.map((svc) => (
                    <div
                      key={svc.id}
                      className="card-hover p-5 flex flex-col justify-between"
                      onClick={() => setActiveBookingService(svc)}
                    >
                      <div>
                        <div className="flex items-start justify-between mb-3">
                          <span className="text-3xl">{svc.icon}</span>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded-full border border-blue-100 dark:border-blue-800">
                            {svc.category}
                          </span>
                        </div>
                        <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base mb-1">{svc.name}</h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-4">{svc.description}</p>
                      </div>

                      <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                        <div>
                          <span className="text-[10px] text-slate-400 dark:text-slate-500 block font-semibold uppercase">Fixed Rate</span>
                          <span className="text-base font-black text-blue-600 dark:text-blue-400">{formatCurrency(svc.price)}</span>
                        </div>
                        <button className="btn-primary text-xs py-1.5 px-3 font-bold">
                          Book Service
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              /* Customer My Live Orders / History */
              <div className="space-y-4">
                {bookings.length === 0 ? (
                  <div className="card p-12 text-center space-y-3">
                    <ShoppingBag className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto" />
                    <div className="font-bold text-slate-700 dark:text-slate-200">No bookings placed yet</div>
                    <p className="text-xs text-slate-400 dark:text-slate-500">Choose a service from the catalogue to book with zero pre-payment.</p>
                    <button onClick={() => setActiveTab('services')} className="btn-primary text-xs py-2 px-4 font-bold">
                      Browse Services
                    </button>
                  </div>
                ) : (
                  bookings.map((bk) => {
                    const isCompleted =
                      bk.status === 'COMPLETED_PAID_DIGITALLY' ||
                      bk.status === 'COMPLETED_PAID_CASH' ||
                      bk.status === 'COMPLETED';

                    return (
                      <div key={bk.id} className="card p-5 space-y-4">
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-slate-900 dark:text-slate-100 text-base">{bk.serviceName}</span>
                              <span className={getBadgeClass(bk.status)}>{getStatusReadableLabel(bk.status)}</span>
                            </div>
                            <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1.5">
                              <CalendarDays className="w-3.5 h-3.5" /> Scheduled: {formatDateTime(bk.scheduledDate)}
                            </div>
                            <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mt-0.5">
                              <MapPin className="w-3.5 h-3.5" /> Location: {bk.address}
                            </div>
                          </div>

                          <div className="text-right">
                            <div className="text-base font-black text-blue-600 dark:text-blue-400">{formatCurrency(bk.totalAmount)}</div>
                            <div className={`text-[11px] font-bold ${
                              isCompleted ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'
                            }`}>
                              {isCompleted
                                ? `✓ Settled (${bk.paymentMethod || 'Direct'})`
                                : 'Payment Due on Completion'}
                            </div>
                          </div>
                        </div>

                        {/* Reported Problem Description Box */}
                        {bk.problemDescription && (
                          <div className="p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs space-y-1">
                            <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1.5 uppercase tracking-wider">
                              <Wrench className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                              Reported Problem Description
                            </div>
                            <p className="text-slate-800 dark:text-slate-200 leading-relaxed font-medium">
                              &quot;{bk.problemDescription}&quot;
                            </p>
                          </div>
                        )}

                        {/* In-Progress Notification (Step 1 -> 2) */}
                        {bk.status === 'IN_PROGRESS' && (
                          <div className="p-3.5 bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/80 rounded-xl text-xs text-blue-900 dark:text-blue-200 flex items-center gap-2">
                            <Clock className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
                            <span>
                              Artisan <strong className="text-slate-900 dark:text-slate-100">{bk.workerName}</strong> has accepted your request and is performing the service. No payment is required until work is completed.
                            </span>
                          </div>
                        )}

                        {/* Post-Service Payment Card (Step 3 Option A / Option B) */}
                        {bk.status === 'AWAITING_PAYMENT' && (
                          <div className="p-4 rounded-xl bg-gradient-to-r from-violet-50 to-blue-50 dark:from-violet-950/40 dark:to-blue-950/40 border border-violet-200 dark:border-violet-800/80 flex flex-col sm:flex-row items-center justify-between gap-3 animate-fadein">
                            <div className="text-xs text-violet-950 dark:text-violet-200">
                              <div className="font-bold text-sm flex items-center gap-1.5 text-slate-900 dark:text-slate-100">
                                <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                                Service Completed by {bk.workerName} • Pay {formatCurrency(bk.totalAmount)}
                              </div>
                              <div className="text-violet-700 dark:text-violet-300 mt-0.5 font-medium">
                                Pay securely online right now, or hand cash directly to the artisan on site.
                              </div>
                            </div>
                            <button
                              onClick={() => setActivePaymentBooking(bk)}
                              className="btn-primary text-xs py-2 px-5 font-bold shadow-md whitespace-nowrap"
                            >
                              <CreditCard className="w-3.5 h-3.5" /> Pay {formatCurrency(bk.totalAmount)} Online
                            </button>
                          </div>
                        )}

                        {/* Completed State: Support Note & Customer Review Card */}
                        {isCompleted && (
                          <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
                            {/* Support Note */}
                            <div className="p-3 bg-amber-50/70 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/80 rounded-xl text-xs text-amber-900 dark:text-amber-200 flex items-start gap-2">
                              <Phone className="w-4 h-4 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
                              <div>
                                <span className="font-bold">Service Assistance:</span> Have an issue with this service? Contact your local society coordinator.
                              </div>
                            </div>

                            {/* Customer Review Card */}
                            <CustomerReviewCard
                              booking={bk}
                              onReviewSubmitted={() => refreshData(currentUser)}
                            />
                          </div>
                        )}

                        {/* Visual Progress Tracker */}
                        <div className="bg-slate-50 dark:bg-slate-900/60 rounded-xl p-3.5 border border-slate-100 dark:border-slate-800">
                          <div className="grid grid-cols-4 gap-2 text-center text-[11px]">
                            <div className={`p-2 rounded-lg font-bold ${
                              ['PENDING_ACCEPTANCE', 'IN_PROGRESS', 'AWAITING_PAYMENT', 'COMPLETED_PAID_DIGITALLY', 'COMPLETED_PAID_CASH', 'COMPLETED'].includes(bk.status)
                                ? 'bg-blue-600 text-white'
                                : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                            }`}>
                              1. Requested
                            </div>
                            <div className={`p-2 rounded-lg font-bold ${
                              ['IN_PROGRESS', 'AWAITING_PAYMENT', 'COMPLETED_PAID_DIGITALLY', 'COMPLETED_PAID_CASH', 'COMPLETED'].includes(bk.status)
                                ? 'bg-blue-600 text-white'
                                : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                            }`}>
                              2. In Progress
                            </div>
                            <div className={`p-2 rounded-lg font-bold ${
                              ['AWAITING_PAYMENT', 'COMPLETED_PAID_DIGITALLY', 'COMPLETED_PAID_CASH', 'COMPLETED'].includes(bk.status)
                                ? 'bg-violet-600 text-white'
                                : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                            }`}>
                              3. Work Done (Pay)
                            </div>
                            <div className={`p-2 rounded-lg font-bold ${
                              isCompleted
                                ? 'bg-emerald-600 text-white'
                                : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                            }`}>
                              4. Settled & Rated
                            </div>
                          </div>

                          {bk.workerName && (
                            <div className="mt-2.5 text-xs text-slate-600 dark:text-slate-400 text-center">
                              Assigned Artisan: <strong className="text-slate-900 dark:text-slate-100">{bk.workerName}</strong>
                            </div>
                          )}
                        </div>
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

      {activeBookingService && currentUser && (
        <ServiceBookingModal
          service={activeBookingService}
          user={currentUser}
          onClose={() => setActiveBookingService(null)}
          onBookingSubmitted={() => {
            setActiveBookingService(null);
            setActiveTab('bookings');
            refreshData(currentUser);
          }}
        />
      )}

      {activePaymentBooking && (
        <PostServicePaymentModal
          booking={activePaymentBooking}
          onConfirm={handleConfirmDigitalPayment}
          onClose={() => setActivePaymentBooking(null)}
        />
      )}

      {/* ─── Footer ─────────────────────────────────────────────────────────── */}
      <footer className="bg-white border-t border-slate-200 py-6 mt-12">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <div>
            © 2026 <strong>SahakarGig</strong> — Primary Cooperative Services Platform.
          </div>
          <div>
            <a href="/admin/login" className="text-blue-600 font-semibold hover:underline flex items-center gap-1">
              <Shield className="w-3 h-3" /> PACS Administration Console
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
