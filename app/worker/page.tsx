'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  Leaf, LogOut, Wrench, BadgeCheck, CheckCircle, XCircle,
  CalendarDays, MapPin, Star, ToggleLeft, ToggleRight,
  CircleCheck, Shield, TrendingUp, AlertCircle, Loader2, User,
  FileText, Clock, Banknote, CreditCard, Coins, Check, Phone,
  MessageSquare, MessageCircle, Copy, ExternalLink, Navigation,
  AlertTriangle, Sparkles
} from 'lucide-react';
import ThemeToggle from '@/components/ThemeToggle';
import dataService, { Booking, WorkerProfile, User as UserType, Society } from '@/lib/dataService';
import { formatCurrency, formatDateTime, getBadgeClass, getStatusReadableLabel } from '@/lib/utils';

function getSessionUser(): UserType | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem('sahakargig_user');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

// ─── Customer Contact Section Component ─────────────────────────────────────
interface CustomerContactCardProps {
  booking: Booking;
  workerName: string;
}

function CustomerContactCard({ booking, workerName }: CustomerContactCardProps) {
  const [copied, setCopied] = useState(false);
  const phone = booking.customerPhone || '';
  const cleanDigits = phone.replace(/\D/g, '');
  const waUrl = `https://wa.me/91${cleanDigits}?text=${encodeURIComponent(
    `Hello ${booking.customerName}, I am your SahakarGig artisan (${workerName}) for ${booking.serviceName}. I am contacting you regarding your service request.`
  )}`;
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(booking.address)}`;

  function handleCopy(text: string) {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  return (
    <div className="bg-slate-50 dark:bg-slate-900/80 rounded-xl p-3.5 border border-slate-200/90 dark:border-slate-800 space-y-2.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 flex items-center justify-center font-bold text-xs">
            <User className="w-3.5 h-3.5" />
          </div>
          <div>
            <div className="font-bold text-slate-900 dark:text-slate-100 text-xs flex items-center gap-1.5">
              <span>{booking.customerName}</span>
              <span className="text-[10px] text-slate-400 dark:text-slate-500 font-normal">(Resident Customer)</span>
            </div>
            <div className="text-[11px] text-slate-600 dark:text-slate-400 flex items-center gap-1 font-mono">
              <Phone className="w-3 h-3 text-slate-400" />
              <span>{phone ? `+91 ${phone}` : 'Contact on file'}</span>
            </div>
          </div>
        </div>

        {/* Quick Copy Action */}
        <button
          type="button"
          onClick={() => handleCopy(`${booking.customerName} - ${phone} - ${booking.address}`)}
          className="text-[10px] font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-2 py-1 rounded-md flex items-center gap-1 transition-colors"
          title="Copy customer contact info"
        >
          {copied ? <Check className="w-3 h-3 text-emerald-600 dark:text-emerald-400" /> : <Copy className="w-3 h-3" />}
          <span>{copied ? 'Copied!' : 'Copy Info'}</span>
        </button>
      </div>

      {/* Action Buttons: Direct Call, WhatsApp & Navigation */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
        {/* Direct Phone Call Button */}
        <a
          href={`tel:${cleanDigits}`}
          className="flex items-center justify-center gap-1.5 py-2 px-2.5 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-bold text-xs rounded-lg transition-all shadow-sm shadow-blue-600/20"
        >
          <Phone className="w-3.5 h-3.5" />
          <span>Call Now</span>
        </a>

        {/* WhatsApp Chat Button */}
        <a
          href={waUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-1.5 py-2 px-2.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold text-xs rounded-lg transition-all shadow-sm shadow-emerald-600/20"
        >
          <MessageSquare className="w-3.5 h-3.5" />
          <span>WhatsApp</span>
        </a>

        {/* Live GPS Directions */}
        <a
          href={mapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-1.5 py-2 px-2.5 bg-slate-700 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 active:scale-95 text-white font-bold text-xs rounded-lg transition-all shadow-sm"
        >
          <Navigation className="w-3.5 h-3.5 text-blue-300" />
          <span>GPS Map</span>
        </a>
      </div>
    </div>
  );
}

// ─── Subscription Pass Modal ────────────────────────────────────────────────
interface SubscriptionModalProps {
  worker: WorkerProfile;
  monthlyRate: number;
  yearlyRate: number;
  onClose: () => void;
  onSubscribed: (updatedWorker: WorkerProfile) => void;
}

function SubscriptionModal({ worker, monthlyRate, yearlyRate, onClose, onSubscribed }: SubscriptionModalProps) {
  const [selectedPlan, setSelectedPlan] = useState<'MONTHLY' | 'YEARLY'>('MONTHLY');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const isExpired = !worker.passValidUntil || new Date(worker.passValidUntil).getTime() <= Date.now();

  async function handleSubscribe() {
    setLoading(true);
    setError('');
    setTimeout(() => {
      const updated = dataService.subscribeWorker(worker.userId, selectedPlan);
      if (updated) {
        onSubscribed(updated);
      } else {
        setError('Failed to activate pass.');
      }
      setLoading(false);
    }, 300);
  }

  const activeCost = selectedPlan === 'YEARLY' ? yearlyRate : monthlyRate;

  return (
    <div className="modal-backdrop" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-box p-6 space-y-5" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-blue-800 text-white flex items-center justify-center shadow-md shadow-blue-600/20">
              <Coins className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base">
                {isExpired ? 'Subscribe / Renew Artisan Pass' : 'Upgrade Membership Pass'}
              </h3>
              <p className="text-xs text-slate-500">Cooperative Society Zero-Commission Access</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400">
            <XCircle className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-300 text-xs font-semibold">
            {error}
          </div>
        )}

        {/* Plan Selection Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Monthly Option */}
          <div
            onClick={() => setSelectedPlan('MONTHLY')}
            className={`p-4 rounded-xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
              selectedPlan === 'MONTHLY'
                ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-950/40 shadow-sm'
                : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
            }`}
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-blue-700 dark:text-blue-400 uppercase tracking-wider">
                  Monthly Pass
                </span>
                {selectedPlan === 'MONTHLY' && (
                  <CheckCircle className="w-4 h-4 text-blue-600" />
                )}
              </div>
              <div className="text-2xl font-black text-slate-900 dark:text-slate-100 mt-2">
                {formatCurrency(monthlyRate)}
                <span className="text-xs font-normal text-slate-500"> /mo</span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Valid for 30 days of unlimited 0% commission gigs.
              </p>
            </div>
          </div>

          {/* Yearly Option */}
          <div
            onClick={() => setSelectedPlan('YEARLY')}
            className={`p-4 rounded-xl border-2 transition-all cursor-pointer flex flex-col justify-between relative ${
              selectedPlan === 'YEARLY'
                ? 'border-emerald-600 bg-emerald-50/50 dark:bg-emerald-950/40 shadow-sm'
                : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
            }`}
          >
            <span className="absolute -top-2.5 right-3 bg-emerald-600 text-white text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full shadow-sm">
              Best Value
            </span>
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">
                  Annual Pass
                </span>
                {selectedPlan === 'YEARLY' && (
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                )}
              </div>
              <div className="text-2xl font-black text-slate-900 dark:text-slate-100 mt-2">
                {formatCurrency(yearlyRate)}
                <span className="text-xs font-normal text-slate-500"> /yr</span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Valid for 365 days + PACS healthcare pool priority.
              </p>
            </div>
          </div>
        </div>

        {/* Benefits Checklist */}
        <div className="p-3.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl space-y-2 text-xs">
          <div className="font-bold text-slate-900 dark:text-slate-200">Membership Pass Privileges:</div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-600 dark:text-slate-300 text-[11px]">
            <div className="flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5 text-emerald-600" />
              <span>0% Platform Commission</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5 text-emerald-600" />
              <span>Direct Customer Call & WhatsApp</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5 text-emerald-600" />
              <span>Instant Job Dispatching Alerts</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5 text-emerald-600" />
              <span>100% Payouts to Your Wallet</span>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="pt-2 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="btn-secondary text-xs py-2 px-4 font-bold"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubscribe}
            className="btn-primary text-xs py-2.5 px-6 font-black shadow-md flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
            disabled={loading}
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Coins className="w-4 h-4" />}
            <span>Pay {formatCurrency(activeCost)} & Activate Pass</span>
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Worker Dashboard Page ────────────────────────────────────────────
export default function WorkerDashboardPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<UserType | null>(null);
  const [workerProfile, setWorkerProfile] = useState<WorkerProfile | null>(null);
  const [society, setSociety] = useState<Society | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const refreshData = useCallback(async (userId: string) => {
    await dataService.syncCloud();
    const prof = dataService.findWorkerByUserId(userId);
    if (prof) setWorkerProfile(prof);

    const bData = dataService.getBookings();
    setBookings(bData || []);

    const sData = dataService.getSociety();
    if (sData) setSociety(sData);
    setLoading(false);
  }, []);

  // Auth Guard
  useEffect(() => {
    const user = getSessionUser();
    if (!user) {
      router.replace('/');
      return;
    }
    if (user.role !== 'WORKER') {
      router.replace('/');
      return;
    }
    setCurrentUser(user);
    refreshData(user.id);
  }, [router, refreshData]);

  // Live polling for instant state synchronization
  useEffect(() => {
    if (!currentUser) return;
    const interval = setInterval(() => {
      refreshData(currentUser.id);
    }, 2500);
    return () => clearInterval(interval);
  }, [currentUser, refreshData]);

  function handleSignOut() {
    localStorage.removeItem('sahakargig_user');
    router.push('/');
  }

  // Toggle Availability
  async function handleToggleAvailability() {
    if (!currentUser || !workerProfile) return;

    // Check if worker has an active subscription
    const isSubscribed = Boolean(
      workerProfile.passValidUntil && new Date(workerProfile.passValidUntil).getTime() > Date.now()
    );

    if (!isSubscribed) {
      showToast('⚠️ Active membership pass required to go online. Please purchase or renew your subscription.');
      setShowSubscriptionModal(true);
      return;
    }

    const nextState = !workerProfile.isAvailable;
    const updated = dataService.updateWorker(currentUser.id, {
      isAvailable: nextState,
    });
    if (updated) {
      setWorkerProfile(updated);
      showToast(nextState ? '🟢 You are now Online and accepting jobs.' : '⛔ You are now Offline.');
    }
  }

  // Step 1: Accept Request -> IN_PROGRESS (No payment requested yet)
  async function handleAcceptJob(bookingId: string) {
    if (!currentUser || !workerProfile) return;

    const isSubscribed = Boolean(
      workerProfile.passValidUntil && new Date(workerProfile.passValidUntil).getTime() > Date.now()
    );

    if (!isSubscribed) {
      showToast('⚠️ Active membership pass required to accept jobs. Please subscribe or renew your pass.');
      setShowSubscriptionModal(true);
      return;
    }

    setActionLoadingId(bookingId);
    setTimeout(() => {
      dataService.updateBooking(bookingId, {
        status: 'IN_PROGRESS',
        workerId: currentUser.id,
        workerName: currentUser.name,
        acceptedAt: new Date().toISOString(),
      });
      setActionLoadingId(null);
      showToast('✓ Job accepted! You can now contact the resident and begin service.');
      refreshData(currentUser.id);
    }, 300);
  }

  // Decline Request
  async function handleDeclineJob(bookingId: string) {
    if (!currentUser) return;
    setActionLoadingId(bookingId);
    setTimeout(() => {
      dataService.updateBooking(bookingId, {
        status: 'CANCELLED',
      });
      setActionLoadingId(null);
      showToast('✓ Job request declined.');
      refreshData(currentUser.id);
    }, 300);
  }

  // Step 2: Complete Physical Job & Request Settlement -> AWAITING_PAYMENT
  async function handleRequestSettlement(bookingId: string) {
    if (!currentUser) return;
    setActionLoadingId(bookingId);
    setTimeout(() => {
      dataService.updateBooking(bookingId, {
        status: 'AWAITING_PAYMENT',
        settlementRequestedAt: new Date().toISOString(),
      });
      setActionLoadingId(null);
      showToast('✓ Job Completed! Settlement requested from resident.');
      refreshData(currentUser.id);
    }, 300);
  }

  // Step 3 Option B: Worker Collects Cash On-Site -> COMPLETED_PAID_CASH
  async function handleCollectCash(bookingId: string) {
    if (!currentUser) return;
    if (!confirm('Confirm that you have physically collected cash from the customer on site?')) return;
    setActionLoadingId(bookingId);
    setTimeout(() => {
      dataService.updateBooking(bookingId, {
        status: 'COMPLETED_PAID_CASH',
        paymentStatus: 'PAID_CASH',
        paymentMethod: 'CASH',
        paidAt: new Date().toISOString(),
        completedAt: new Date().toISOString(),
      });
      setActionLoadingId(null);
      showToast('✓ Cash Settlement Recorded! 100% credited to your wallet.');
      refreshData(currentUser.id);
    }, 300);
  }

  if (loading || !currentUser) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  // Task Category Filtering
  const incomingRequests = bookings.filter((b) => b.status === 'PENDING_ACCEPTANCE');
  const inProgressTasks = bookings.filter((b) => b.status === 'IN_PROGRESS' && b.workerId === currentUser.id);
  const awaitingPaymentTasks = bookings.filter((b) => b.status === 'AWAITING_PAYMENT' && b.workerId === currentUser.id);
  const completedJobsList = bookings.filter(
    (b) =>
      (b.status === 'COMPLETED_PAID_DIGITALLY' ||
       b.status === 'COMPLETED_PAID_CASH' ||
       b.status === 'COMPLETED') &&
      b.workerId === currentUser.id
  );

  // Membership Pass Subscription Calculations
  const isSubscribed = Boolean(
    workerProfile?.passValidUntil && new Date(workerProfile.passValidUntil).getTime() > Date.now()
  );
  const daysLeft = isSubscribed && workerProfile?.passValidUntil
    ? Math.ceil((new Date(workerProfile.passValidUntil).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : 0;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      {/* ─── Top Header (Strict Worker Context) ────────────────────────────── */}
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-600/20">
              <Wrench className="w-5 h-5" />
            </div>
            <div>
              <span className="font-black text-slate-900 text-xl tracking-tight leading-none block">
                SahakarGig
              </span>
              <span className="text-[11px] font-medium text-slate-500 leading-none">
                Artisan Partner Dashboard
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:block text-right">
              <div className="text-xs font-bold text-slate-900 dark:text-slate-100">{currentUser.name}</div>
              <div className="text-[10px] text-blue-600 dark:text-blue-400 font-semibold">
                {workerProfile?.trade || currentUser.trade || 'Artisan Partner'}
              </div>
            </div>
            <button
              onClick={handleSignOut}
              className="btn-secondary py-1.5 px-3 text-xs font-bold"
              title="Sign Out"
            >
              <LogOut className="w-3.5 h-3.5" /> Sign Out
            </button>
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* ─── Main Content ───────────────────────────────────────────────────── */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-8 space-y-6">
        {/* Toast Alert Message */}
        {toastMessage && (
          <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 text-amber-900 dark:text-amber-200 text-xs font-semibold flex items-center gap-2 shadow-sm animate-fadein">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* ── Warning Banner if Membership Pass Inactive / Expired ── */}
        {!isSubscribed && (
          <div className="p-5 rounded-2xl bg-gradient-to-r from-amber-500/10 via-amber-500/20 to-red-500/10 border-2 border-amber-400 dark:border-amber-600/60 shadow-md space-y-3 animate-fadein">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-md shadow-amber-500/30">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-black text-slate-900 dark:text-slate-100 text-base flex items-center gap-2">
                    <span>Membership Pass Inactive or Expired</span>
                    <span className="text-[10px] uppercase font-black bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300 px-2 py-0.5 rounded-full border border-red-200 dark:border-red-800">
                      Dispatching Offline
                    </span>
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 max-w-xl leading-relaxed">
                    Take a subscription or renew your pass to accept customer repair requests, turn on your online status, and receive 100% take-home payouts with 0% commission.
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowSubscriptionModal(true)}
                className="btn-primary py-2.5 px-5 text-xs font-black shadow-lg bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white whitespace-nowrap flex items-center gap-2 self-start sm:self-auto"
              >
                <Coins className="w-4 h-4" />
                <span>Subscribe / Renew Pass (from {formatCurrency(society?.monthlyPassRate || 69)})</span>
              </button>
            </div>
          </div>
        )}

        {/* Cooperative Membership Card */}
        <div className="membership-banner flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <span className={`text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full flex items-center gap-1.5 ${
                isSubscribed
                  ? 'bg-emerald-400/20 text-emerald-300 border border-emerald-400/30'
                  : 'bg-red-400/20 text-red-200 border border-red-400/30'
              }`}>
                {isSubscribed ? <BadgeCheck className="w-3.5 h-3.5 text-emerald-300" /> : <AlertTriangle className="w-3.5 h-3.5 text-red-300" />}
                {isSubscribed
                  ? `${workerProfile?.subscriptionPlan || 'Monthly'} Pass Active (${daysLeft}d remaining)`
                  : 'Pass Inactive / Expired'}
              </span>

              <button
                onClick={() => setShowSubscriptionModal(true)}
                className="text-[11px] font-black underline hover:text-white text-blue-200 transition-colors"
              >
                {isSubscribed ? 'Extend / Upgrade Pass' : 'Activate Pass'}
              </button>
            </div>

            <h2 className="text-2xl font-black text-white">{currentUser.name}</h2>
            <div className="text-xs text-blue-100 mt-1">
              Trade: <strong className="text-white">{workerProfile?.trade || currentUser.trade || 'General Maintenance'}</strong> · {workerProfile?.localSociety || 'Primary Cooperative Services Society'}
            </div>
          </div>

          {/* Availability Toggle */}
          <div className="bg-white/10 backdrop-blur-md p-3.5 rounded-xl border border-white/20 flex items-center gap-3">
            <div>
              <div className="text-[11px] text-blue-200 font-medium">Job Dispatching Status</div>
              <div className="text-xs font-bold text-white">
                {isSubscribed
                  ? (workerProfile?.isAvailable ? '🟢 Online (Accepting Jobs)' : '⛔ Offline')
                  : '🔒 Locked Offline (Pass Required)'}
              </div>
            </div>
            <button
              onClick={handleToggleAvailability}
              className="transition-transform active:scale-95"
              title={isSubscribed ? 'Toggle Availability' : 'Active Pass Required to Go Online'}
            >
              {workerProfile?.isAvailable && isSubscribed ? (
                <ToggleRight className="w-9 h-9 text-emerald-400" />
              ) : (
                <ToggleLeft className="w-9 h-9 text-slate-300" />
              )}
            </button>
          </div>
        </div>

        {/* Real-time Earnings Breakdown & KPI Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Total Wallet */}
          <div className="kpi-card border-l-4 border-l-emerald-600 bg-white dark:bg-slate-900">
            <div className="text-xs text-slate-500 dark:text-slate-400 font-semibold mb-1">Take-Home Earnings Wallet</div>
            <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
              {formatCurrency(workerProfile?.totalEarnings || 0)}
            </div>
            <div className="text-[11px] text-emerald-700 dark:text-emerald-400 font-bold mt-0.5">100% Direct Payouts (0% Cut)</div>
          </div>

          {/* Digital vs Cash Settlements Split */}
          <div className="kpi-card border-l-4 border-l-blue-600 bg-white dark:bg-slate-900">
            <div className="text-xs text-slate-500 dark:text-slate-400 font-semibold mb-1">Settlement Channels Breakdown</div>
            <div className="flex items-center justify-between text-xs mt-1">
              <span className="text-blue-700 dark:text-blue-300 font-bold flex items-center gap-1">
                <CreditCard className="w-3.5 h-3.5" /> Digital: {formatCurrency(workerProfile?.digitalEarnings || 0)}
              </span>
              <span className="text-emerald-700 dark:text-emerald-300 font-bold flex items-center gap-1">
                <Banknote className="w-3.5 h-3.5" /> Cash: {formatCurrency(workerProfile?.cashEarnings || 0)}
              </span>
            </div>
            <div className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">Directly received & verified</div>
          </div>

          {/* Completed Services */}
          <div className="kpi-card border-l-4 border-l-amber-500 bg-white dark:bg-slate-900">
            <div className="text-xs text-slate-500 dark:text-slate-400 font-semibold mb-1">Delivered Services & Rating</div>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-black text-slate-900 dark:text-slate-100">{workerProfile?.completedJobs || 0}</div>
              <div className="text-base font-black text-amber-500 flex items-center gap-1">
                {workerProfile?.rating ? workerProfile.rating.toFixed(1) : '5.0'} <Star className="w-4 h-4 fill-amber-500" />
              </div>
            </div>
            <div className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">Verified resident ratings</div>
          </div>

          {/* KYC Status */}
          <div className="kpi-card border-l-4 border-l-violet-600 bg-white dark:bg-slate-900">
            <div className="text-xs text-slate-500 dark:text-slate-400 font-semibold mb-1">KYC Committee Verification</div>
            <div className="text-base font-bold mt-1">
              <span className={getBadgeClass(workerProfile?.kycStatus || 'PENDING')}>
                {workerProfile?.kycStatus || 'PENDING'}
              </span>
            </div>
            <div className="text-[11px] text-slate-400 dark:text-slate-500 mt-1 truncate max-w-[140px]">
              ID: {workerProfile?.kycDocName || 'identity_card.pdf'}
            </div>
          </div>
        </div>

        {/* ── Section 1: Active In-Progress Tasks (Physical Work Underway) ── */}
        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-pulse" />
            <h3 className="font-bold text-slate-900 dark:text-slate-100 text-lg">Active Tasks In Progress</h3>
            <span className="px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 text-xs font-bold">
              {inProgressTasks.length}
            </span>
          </div>

          {inProgressTasks.length === 0 ? (
            <div className="card p-6 text-center text-xs text-slate-400 dark:text-slate-500">
              No tasks currently in progress. Accept incoming dispatches below to start work.
            </div>
          ) : (
            inProgressTasks.map((task) => (
              <div key={task.id} className="card p-5 border-l-4 border-l-blue-600 space-y-4 shadow-sm bg-blue-50/20 dark:bg-blue-950/20">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-black text-slate-900 dark:text-slate-100 text-base">{task.serviceName}</span>
                      <span className="badge text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/60 border-blue-200 dark:border-blue-800">
                        Physical Service In Progress
                      </span>
                    </div>
                    <div className="text-xs text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" /> Location: <strong className="text-slate-900 dark:text-slate-100">{task.address}</strong>
                    </div>
                    <div className="text-xs text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
                      <CalendarDays className="w-3.5 h-3.5 text-slate-400" /> Scheduled: {formatDateTime(task.scheduledDate)}
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-xl font-black text-blue-600 dark:text-blue-400">{formatCurrency(task.totalAmount)}</div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Post-Service Settlement</div>
                  </div>
                </div>

                {/* ── Problem Description Reported by Customer ── */}
                {task.problemDescription && (
                  <div className="p-3.5 bg-amber-50/70 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 rounded-xl text-xs space-y-1">
                    <div className="text-[11px] font-bold text-amber-900 dark:text-amber-300 flex items-center gap-1.5 uppercase tracking-wider">
                      <AlertCircle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
                      Reported Issue by Resident
                    </div>
                    <p className="text-slate-800 dark:text-slate-200 leading-relaxed font-medium">
                      &quot;{task.problemDescription}&quot;
                    </p>
                  </div>
                )}

                {/* ── Customer Contact & Location Section ── */}
                <CustomerContactCard booking={task} workerName={currentUser.name} />

                {/* Step 2 Primary Action */}
                <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    Once the physical repair is finished, click below to request customer settlement.
                  </span>
                  <button
                    onClick={() => handleRequestSettlement(task.id)}
                    className="btn-primary text-xs py-2 px-5 font-bold shadow-md flex items-center gap-1.5 whitespace-nowrap"
                    disabled={actionLoadingId === task.id}
                  >
                    {actionLoadingId === task.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <CheckCircle className="w-4 h-4" />
                    )}
                    Complete Job & Request Settlement
                  </button>
                </div>
              </div>
            ))
          )}
        </section>

        {/* ── Section 2: Awaiting Settlement (Dual Settlement Options) ── */}
        {awaitingPaymentTasks.length > 0 && (
          <section className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-violet-600 animate-pulse" />
              <h3 className="font-bold text-slate-900 dark:text-slate-100 text-lg">Awaiting Settlement (Work Done)</h3>
              <span className="px-2 py-0.5 rounded-full bg-violet-100 dark:bg-violet-950/60 text-violet-800 dark:text-violet-300 text-xs font-bold">
                {awaitingPaymentTasks.length}
              </span>
            </div>

            {awaitingPaymentTasks.map((task) => (
              <div key={task.id} className="card p-5 border-l-4 border-l-violet-600 bg-violet-50/20 dark:bg-violet-950/20 space-y-4 shadow-sm">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 dark:text-slate-100 text-base">{task.serviceName}</span>
                      <span className="badge text-violet-700 dark:text-violet-300 bg-violet-50 dark:bg-violet-950/60 border-violet-200 dark:border-violet-800">
                        Work Completed • Settlement Requested
                      </span>
                    </div>
                    <div className="text-xs text-violet-700 dark:text-violet-300 font-medium mt-1">
                      💡 Customer has been prompted to pay {formatCurrency(task.totalAmount)} online in their app. If they handed you cash instead, click the button below.
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-xl font-black text-violet-700 dark:text-violet-300">{formatCurrency(task.totalAmount)}</div>
                    <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold">100% Payout</div>
                  </div>
                </div>

                {/* ── Problem Description Reported by Customer ── */}
                {task.problemDescription && (
                  <div className="p-3.5 bg-amber-50/70 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 rounded-xl text-xs space-y-1">
                    <div className="text-[11px] font-bold text-amber-900 dark:text-amber-300 flex items-center gap-1.5 uppercase tracking-wider">
                      <AlertCircle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
                      Reported Issue by Resident
                    </div>
                    <p className="text-slate-800 dark:text-slate-200 leading-relaxed font-medium">
                      &quot;{task.problemDescription}&quot;
                    </p>
                  </div>
                )}

                {/* ── Customer Contact & Location Section ── */}
                <CustomerContactCard booking={task} workerName={currentUser.name} />

                {/* Option B: Worker Confirms Cash Received on Site */}
                <div className="pt-3 border-t border-violet-100 dark:border-violet-900/60 flex items-center justify-between">
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                    Option B: Received physical cash from customer?
                  </span>
                  <button
                    onClick={() => handleCollectCash(task.id)}
                    className="btn-success text-xs py-2 px-4 font-bold shadow-sm flex items-center gap-1.5"
                    disabled={actionLoadingId === task.id}
                  >
                    {actionLoadingId === task.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Banknote className="w-4 h-4" />
                    )}
                    Collected Cash from Customer ({formatCurrency(task.totalAmount)})
                  </button>
                </div>
              </div>
            ))}
          </section>
        )}

        {/* ── Section 3: Incoming Requests (PENDING_ACCEPTANCE) ── */}
        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-slate-900 dark:text-slate-100 text-lg">Incoming Requests (Zero Pre-Payment)</h3>
            <span className="px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 text-xs font-bold">
              {incomingRequests.length}
            </span>
          </div>

          {incomingRequests.length === 0 ? (
            <div className="card p-6 text-center text-xs text-slate-400 dark:text-slate-500">
              No new incoming dispatches currently. Keep your status Online to receive household alerts.
            </div>
          ) : (
            incomingRequests.map((req) => (
              <div key={req.id} className="card p-5 border-l-4 border-l-blue-600 space-y-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 dark:text-slate-100 text-base">{req.serviceName}</span>
                      <span className="badge text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 border-amber-200 dark:border-amber-800">Pending Acceptance</span>
                    </div>
                    <div className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                      Resident: <strong className="text-slate-900 dark:text-slate-100">{req.customerName}</strong>
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" /> Location: {req.address}
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5">
                      <CalendarDays className="w-3.5 h-3.5 text-slate-400" /> Scheduled: {formatDateTime(req.scheduledDate)}
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-lg font-black text-blue-600 dark:text-blue-400">{formatCurrency(req.totalAmount)}</div>
                    <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold">100% Payout</div>
                  </div>
                </div>

                {/* ── Problem Description Reported by Customer ── */}
                {req.problemDescription && (
                  <div className="p-3.5 bg-amber-50/70 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 rounded-xl text-xs space-y-1">
                    <div className="text-[11px] font-bold text-amber-900 dark:text-amber-300 flex items-center gap-1.5 uppercase tracking-wider">
                      <AlertCircle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
                      Reported Issue by Resident
                    </div>
                    <p className="text-slate-800 dark:text-slate-200 leading-relaxed font-medium">
                      &quot;{req.problemDescription}&quot;
                    </p>
                  </div>
                )}

                {/* ── Customer Contact & Location Section for Incoming Request ── */}
                <CustomerContactCard booking={req} workerName={currentUser.name} />

                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <span className="text-xs text-slate-500 dark:text-slate-400">Accept to start the job without requiring upfront charges.</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleDeclineJob(req.id)}
                      className="btn-danger text-xs py-1.5 px-3 font-bold"
                      disabled={actionLoadingId === req.id}
                    >
                      <XCircle className="w-3.5 h-3.5" /> Decline
                    </button>
                    <button
                      onClick={() => handleAcceptJob(req.id)}
                      className="btn-success text-xs py-1.5 px-4 font-bold shadow-sm"
                      disabled={actionLoadingId === req.id}
                    >
                      <CheckCircle className="w-3.5 h-3.5" /> Accept Job
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </section>

        {/* ── Section 4: Completed Jobs History ── */}
        {completedJobsList.length > 0 && (
          <section className="space-y-3">
            <h3 className="font-bold text-slate-900 dark:text-slate-100 text-lg">Settled Services & Customer Reviews</h3>
            <div className="space-y-3">
              {completedJobsList.map((job) => (
                <div key={job.id} className="card p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 dark:text-slate-100 text-sm">{job.serviceName}</span>
                      <span className="badge text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-800">
                        {job.status === 'COMPLETED_PAID_DIGITALLY' ? 'Settled Digitally' : 'Settled via Cash'}
                      </span>
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      {job.customerName} · {job.address} · {formatDateTime(job.scheduledDate)}
                    </div>
                    {job.reviewComment && (
                      <div className="text-xs text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-900/60 p-2 rounded-lg mt-2 border border-slate-100 dark:border-slate-800 flex items-center gap-1.5">
                        <span className="text-amber-500 font-bold">{job.reviewRating} ★</span>
                        <span className="italic">&quot;{job.reviewComment}&quot;</span>
                      </div>
                    )}
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-emerald-600 dark:text-emerald-400 text-base">+{formatCurrency(job.totalAmount)}</div>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold uppercase tracking-wider">
                      {job.paymentMethod || 'Direct Payout'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>

      {/* ── Membership Pass Subscription / Renewal Modal ── */}
      {showSubscriptionModal && workerProfile && (
        <SubscriptionModal
          worker={workerProfile}
          monthlyRate={society?.monthlyPassRate || 69}
          yearlyRate={society?.yearlyPassRate || 599}
          onClose={() => setShowSubscriptionModal(false)}
          onSubscribed={(updatedWorker) => {
            setWorkerProfile(updatedWorker);
            setShowSubscriptionModal(false);
            showToast('✓ Membership Pass Activated! You can now go online and accept job requests.');
            if (currentUser) refreshData(currentUser.id);
          }}
        />
      )}

      {/* Footer */}
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
