'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  Leaf, LogOut, Wrench, BadgeCheck, CheckCircle, XCircle,
  CalendarDays, MapPin, Star, ToggleLeft, ToggleRight,
  Shield, AlertCircle, Loader2, User, Clock, Banknote,
  CreditCard, Coins, Check, Phone, MessageSquare, Copy,
  Navigation, AlertTriangle, FileText, Send, DollarSign,
  Award, ThumbsUp
} from 'lucide-react';
import ThemeToggle from '@/components/ThemeToggle';
import dataService, { Booking, WorkerProfile, User as UserType, Society } from '@/lib/dataService';
import { formatCurrency, formatDate, formatDateTime, getBadgeClass, getStatusReadableLabel } from '@/lib/utils';

function getSessionUser(): UserType | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem('sahakargig_user');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

// --- Customer Contact Section Component -------------------------------------
interface CustomerContactCardProps {
  booking: Booking;
  workerName: string;
  onViewIntel?: () => void;
}

function CustomerContactCard({ booking, workerName, onViewIntel }: CustomerContactCardProps) {
  const [copied, setCopied] = useState(false);
  const phone = booking.customerPhone || '';
  const cleanDigits = phone.replace(/\D/g, '');
  const waUrl = `https://wa.me/91${cleanDigits}?text=${encodeURIComponent(
    `Hello ${booking.customerName}, I am your SahakarGig artisan (${workerName}) for ${booking.serviceName}. I am contacting you regarding your service request.`
  )}`;
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(booking.address)}`;

  const customerRating = dataService.getCustomerBehaviorRating(booking.customerId);

  function handleCopy(text: string) {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  return (
    <div className="bg-zinc-50 dark:bg-zinc-900/60 rounded-xl p-3.5 border border-zinc-200 dark:border-zinc-700/60 space-y-2.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 flex items-center justify-center font-bold text-xs">
            <User className="w-3.5 h-3.5" />
          </div>
          <div>
            <div className="font-bold text-zinc-900 dark:text-zinc-50 text-xs flex items-center gap-1.5">
              <span>{booking.customerName}</span>
              <span className="text-[10px] text-zinc-400 dark:text-zinc-500 font-normal">(Resident Customer)</span>
            </div>
            <div className="text-[11px] text-zinc-600 dark:text-zinc-400 flex items-center gap-1 font-mono">
              <Phone className="w-3 h-3 text-zinc-400" />
              <span>{phone ? `+91 ${phone}` : 'Contact on file'}</span>
            </div>
          </div>
        </div>

        {/* Quick Copy Action */}
        <button
          type="button"
          onClick={() => handleCopy(`${booking.customerName} - ${phone} - ${booking.address}`)}
          className="text-[10px] font-semibold text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-zinc-50 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700/60 px-2 py-1 rounded-md flex items-center gap-1 transition-colors"
          title="Copy customer contact info"
        >
          {copied ? <Check className="w-3 h-3 text-zinc-900 dark:text-zinc-50" /> : <Copy className="w-3 h-3" />}
          <span>{copied ? 'Copied!' : 'Copy Info'}</span>
        </button>
      </div>

      {/* Worker-Only Resident Behavior Score Badge */}
      <div className="p-2 rounded-lg bg-zinc-100/80 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/50 flex items-center justify-between text-xs">
        <div className="flex items-center gap-1.5">
          <Shield className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
          <div>
            <span className="text-zinc-500 font-medium">Resident Behavior:</span>{' '}
            <span className="font-bold text-zinc-900 dark:text-zinc-50 tabular-nums">
              {customerRating.totalReviews > 0 ? `${customerRating.averageRating.toFixed(1)}/5` : '5.0/5 (New)'}
            </span>
            <span className="text-[10px] text-zinc-400 ml-1">
              ({customerRating.totalReviews} worker {customerRating.totalReviews === 1 ? 'review' : 'reviews'})
            </span>
          </div>
        </div>

        {onViewIntel && (
          <button
            type="button"
            onClick={onViewIntel}
            className="text-[11px] font-semibold text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-zinc-50 underline flex items-center gap-0.5 transition-colors"
          >
            Artisan Intel ↗
          </button>
        )}
      </div>

      {/* Action Buttons: Direct Call, WhatsApp & Navigation */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
        {/* Direct Phone Call Button */}
        {cleanDigits ? (
          <a
            href={`tel:${cleanDigits}`}
            className="flex items-center justify-center gap-1.5 py-2 px-2.5 bg-zinc-950 hover:bg-zinc-800 active:scale-95 text-white font-bold text-xs rounded-lg transition-all shadow-sm shadow-zinc-900/20"
          >
            <Phone className="w-3.5 h-3.5" />
            <span>Call Now</span>
          </a>
        ) : (
          <button
            type="button"
            disabled
            className="flex items-center justify-center gap-1.5 py-2 px-2.5 bg-zinc-200 dark:bg-zinc-800 text-zinc-500 font-bold text-xs rounded-lg cursor-not-allowed opacity-70"
          >
            <Phone className="w-3.5 h-3.5" />
            <span>No Phone</span>
          </button>
        )}

        {/* WhatsApp Chat Button */}
        {cleanDigits ? (
          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-1.5 py-2 px-2.5 bg-zinc-800 hover:bg-zinc-700 active:scale-95 text-white font-bold text-xs rounded-lg transition-all shadow-sm shadow-zinc-900/20"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>WhatsApp</span>
          </a>
        ) : (
          <button
            type="button"
            disabled
            className="flex items-center justify-center gap-1.5 py-2 px-2.5 bg-zinc-200 dark:bg-zinc-800 text-zinc-500 font-bold text-xs rounded-lg cursor-not-allowed opacity-70"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>No WhatsApp</span>
          </button>
        )}

        {/* Live GPS Directions */}
        <a
          href={mapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-1.5 py-2 px-2.5 bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-800 dark:hover:bg-zinc-700 active:scale-95 text-white font-bold text-xs rounded-lg transition-all shadow-sm"
        >
          <Navigation className="w-3.5 h-3.5 text-zinc-300" />
          <span>GPS Map</span>
        </a>
      </div>
    </div>
  );
}

// --- Dynamic Invoice Generation Modal ---------------------------------------
interface DynamicInvoiceModalProps {
  booking: Booking;
  onClose: () => void;
  onSubmitInvoice: (extraCost: number, reason: string) => void;
}

function DynamicInvoiceModal({ booking, onClose, onSubmitInvoice }: DynamicInvoiceModalProps) {
  const base = booking.basePrice || 150;
  const [extraCostInput, setExtraCostInput] = useState<string>('0');
  const [reasonInput, setReasonInput] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const extraCostNum = Math.max(0, parseFloat(extraCostInput) || 0);
  const subtotal = base + extraCostNum;
  const platformFee = Math.round(subtotal * 0.05);
  const totalCustomerBill = subtotal + platformFee;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (extraCostNum > 0 && !reasonInput.trim()) {
      setError('Please provide a reason / scope breakdown for the extra charges.');
      return;
    }
    setError('');
    setSubmitting(true);

    setTimeout(() => {
      onSubmitInvoice(extraCostNum, reasonInput.trim());
      setSubmitting(false);
    }, 300);
  }

  return (
    <div className="modal-backdrop" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-box p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800/60">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-zinc-950 text-white flex items-center justify-center shadow-md">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-zinc-900 dark:text-zinc-50 text-base">
                Complete Job & Generate Invoice
              </h3>
              <p className="text-xs text-zinc-500">
                Customer: {booking.customerName} · {booking.serviceName}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400">
            <XCircle className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Read-Only Base Price */}
          <div className="p-3 bg-zinc-50 dark:bg-zinc-900/60 rounded-xl border border-zinc-200 dark:border-zinc-700/60 flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-zinc-600 dark:text-zinc-400 block">
                Standard Base Diagnostic Rate (PACS Fixed)
              </span>
              <span className="text-[11px] text-zinc-400">Fixed rate approved for this trade</span>
            </div>
            <span className="text-base font-black text-zinc-900 dark:text-zinc-50">
              {formatCurrency(base)}
            </span>
          </div>

          {/* Extra Labor / Material Cost Input */}
          <div>
            <label className="form-label text-xs">
              Extra Labor / Material Cost (₹)
            </label>
            <input
              type="number"
              min="0"
              className="form-input text-sm font-bold"
              placeholder="0"
              value={extraCostInput}
              onChange={(e) => setExtraCostInput(e.target.value)}
            />
            <span className="text-[10px] text-zinc-400 mt-0.5 block">
              Leave 0 if only standard service was performed with no replacement parts.
            </span>
          </div>

          {/* Reason / Work Scope */}
          <div>
            <label className="form-label text-xs">
              Reason / Work Scope for Extra Cost
            </label>
            <textarea
              className="form-input text-xs"
              rows={2}
              placeholder="e.g. Replaced 3 modular switches, installed 5m copper wire, and cleaned drain trap..."
              value={reasonInput}
              onChange={(e) => setReasonInput(e.target.value)}
            />
          </div>

          {/* Live Dynamic Invoice Breakdown Preview */}
          <div className="p-4 bg-zinc-50 dark:bg-zinc-900/60 rounded-xl border border-zinc-200 dark:border-zinc-700/60 space-y-2 text-xs">
            <div className="font-bold text-zinc-900 dark:text-zinc-50 flex items-center gap-1.5 pb-1 border-b border-zinc-100 dark:border-zinc-800/40">
              <DollarSign className="w-4 h-4 text-zinc-700" />
              Live Bill Summary Preview
            </div>

            <div className="flex justify-between text-zinc-600 dark:text-zinc-400">
              <span>Worker Base Rate:</span>
              <span className="font-semibold text-zinc-900 dark:text-zinc-50">{formatCurrency(base)}</span>
            </div>

            {extraCostNum > 0 && (
              <div className="flex justify-between text-zinc-600 dark:text-zinc-400">
                <span>Extra Labor / Materials:</span>
                <span className="font-semibold text-zinc-900 dark:text-zinc-50">+{formatCurrency(extraCostNum)}</span>
              </div>
            )}

            <div className="flex justify-between font-bold text-zinc-900 dark:text-zinc-50 pt-1 border-t border-zinc-100 dark:border-zinc-800/40">
              <span>Your Take-Home Subtotal:</span>
              <span className="text-zinc-900 dark:text-zinc-50">{formatCurrency(subtotal)} (100%)</span>
            </div>

            <div className="flex justify-between text-zinc-700 dark:text-zinc-300">
              <span>PACS Platform Fee (5% on Customer):</span>
              <span>+{formatCurrency(platformFee)}</span>
            </div>

            <div className="h-px bg-zinc-200 dark:bg-zinc-700 my-1" />

            <div className="flex justify-between font-black text-sm text-zinc-900 dark:text-zinc-50">
              <span>Total Customer Payable:</span>
              <span className="text-zinc-700 dark:text-zinc-300 text-base">{formatCurrency(totalCustomerBill)}</span>
            </div>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-zinc-100 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-700/60 text-zinc-700 dark:text-zinc-300 text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary text-xs py-2 px-4 font-bold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="btn-primary text-xs py-2 px-5 font-bold shadow-md flex items-center gap-1.5"
            >
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              <span>Submit Final Bill & Request Settlement</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// --- Subscription Pass Modal ------------------------------------------------
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
        setError('Failed to activate pass. Please try again.');
      }
      setLoading(false);
    }, 300);
  }

  const activeCost = selectedPlan === 'YEARLY' ? yearlyRate : monthlyRate;

  return (
    <div className="modal-backdrop" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-box p-6 space-y-5" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800/60">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-zinc-950 text-white flex items-center justify-center shadow-md">
              <Coins className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-zinc-900 dark:text-zinc-50 text-base">
                {isExpired ? 'Subscribe / Renew Artisan Pass' : 'Extend / Upgrade Membership Pass'}
              </h3>
              <p className="text-xs text-zinc-500">Cooperative Society Zero-Commission Access</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400">
            <XCircle className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-zinc-100 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-700/60 text-zinc-700 dark:text-zinc-300 text-xs font-semibold">
            {error}
          </div>
        )}

        {/* Plan Selection Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Monthly Option */}
          <div
            onClick={() => setSelectedPlan('MONTHLY')}
            className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
              selectedPlan === 'MONTHLY'
                ? 'border-zinc-900 bg-zinc-50 dark:bg-zinc-900/60 shadow-sm'
                : 'border-zinc-200 dark:border-zinc-700/60 hover:bg-zinc-50 dark:hover:bg-zinc-800'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                Monthly Pass
              </span>
              <span className="w-4 h-4 rounded-full border flex items-center justify-center text-[10px] font-bold border-zinc-500">
                {selectedPlan === 'MONTHLY' ? '' : ''}
              </span>
            </div>
            <div className="text-2xl font-black text-zinc-900 dark:text-zinc-50">
              {formatCurrency(monthlyRate)} <span className="text-xs font-normal text-zinc-500">/mo</span>
            </div>
            <div className="text-[11px] text-zinc-500 mt-1">30 Days Unlimited Dispatching</div>
          </div>

          {/* Yearly Option */}
          <div
            onClick={() => setSelectedPlan('YEARLY')}
            className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
              selectedPlan === 'YEARLY'
                ? 'border-zinc-700 bg-zinc-50 dark:bg-zinc-900/60 shadow-sm'
                : 'border-zinc-200 dark:border-zinc-700/60 hover:bg-zinc-50 dark:hover:bg-zinc-800'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                Yearly Pass (Best Value)
              </span>
              <span className="w-4 h-4 rounded-full border flex items-center justify-center text-[10px] font-bold border-zinc-500">
                {selectedPlan === 'YEARLY' ? '' : ''}
              </span>
            </div>
            <div className="text-2xl font-black text-zinc-900 dark:text-zinc-50">
              {formatCurrency(yearlyRate)} <span className="text-xs font-normal text-zinc-500">/yr</span>
            </div>
            <div className="text-[11px] text-zinc-500 mt-1">365 Days Guaranteed Access</div>
          </div>
        </div>

        {/* Benefits Note */}
        <div className="p-3 bg-zinc-50 dark:bg-zinc-900/60 rounded-xl border border-zinc-200 dark:border-zinc-700/60 text-xs text-zinc-600 dark:text-zinc-400 space-y-1">
          <div className="font-bold text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5 text-zinc-700" /> Cooperative Welfare Protection
          </div>
          <p className="text-[11px] leading-relaxed">
            100% of membership pass fees go into the Primary Cooperative Society Welfare Reserve for artisan healthcare and emergency funds.
          </p>
        </div>

        {/* Modal Actions */}
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
            className="btn-primary text-xs py-2.5 px-6 font-bold shadow-md flex items-center gap-2"
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

// --- Worker-to-Customer Behavior Rating Modal (Confidential / Worker-Only) ---
interface WorkerCustomerReviewModalProps {
  booking: Booking;
  onClose: () => void;
  onSubmitReview: (rating: number, comment: string) => void;
}

const BEHAVIOR_SCALE: Record<number, { label: string; desc: string }> = {
  1: { label: 'Difficult / Disrespectful', desc: 'Unreasonable demands, hostile or unsafe working conditions' },
  2: { label: 'Uncooperative', desc: 'Slow communication, disputes over agreed job scope or delayed access' },
  3: { label: 'Average / Fair', desc: 'Standard cooperative interaction, routine household access' },
  4: { label: 'Cooperative & Polite', desc: 'Clear communication, respectful, provided safe work area' },
  5: { label: 'Highly Respectful & Prompt', desc: 'Exemplary resident, welcoming, clear instructions & immediate payment' },
};

function WorkerCustomerReviewModal({ booking, onClose, onSubmitReview }: WorkerCustomerReviewModalProps) {
  const [rating, setRating] = useState<number>(booking.workerCustomerBehaviorRating || 5);
  const [comment, setComment] = useState<string>(booking.workerCustomerReviewComment || '');
  const [submitting, setSubmitting] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setTimeout(() => {
      onSubmitReview(rating, comment.trim());
      setSubmitting(false);
    }, 300);
  }

  return (
    <div className="modal-backdrop" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-box p-6 space-y-4" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800/60">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-zinc-950 dark:bg-zinc-100 text-white dark:text-zinc-950 flex items-center justify-center font-black text-sm shadow-sm">
              <Star className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-zinc-900 dark:text-zinc-50 text-base tracking-tight">
                Rate Resident Behavior
              </h3>
              <p className="text-xs text-zinc-500">
                Customer: {booking.customerName} · {booking.serviceName}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400">
            <XCircle className="w-5 h-5" />
          </button>
        </div>

        {/* Strict Confidentiality Banner */}
        <div className="p-3 bg-zinc-100 dark:bg-zinc-900/80 rounded-xl border border-zinc-200 dark:border-zinc-700/60 space-y-1 text-xs">
          <div className="font-bold text-zinc-900 dark:text-zinc-50 flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5 text-zinc-500" />
            <span>Private Artisan-Only Confidentiality</span>
          </div>
          <p className="text-[11px] text-zinc-500 leading-relaxed">
            This review is evaluated solely on <strong>customer behavior, respect, and payment cooperation</strong>. This data is strictly restricted to certified cooperative artisans on SahakarGig. <strong>The resident customer will never see this review or score.</strong>
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* 1-5 Star Behavior Rating */}
          <div className="p-3.5 bg-zinc-50 dark:bg-zinc-900/60 rounded-xl border border-zinc-200 dark:border-zinc-700/60 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-zinc-900 dark:text-zinc-50">
                Resident Behavior & Cooperation
              </label>
              <span className="text-sm font-black text-zinc-900 dark:text-zinc-50 tabular-nums">
                {rating} / 5
              </span>
            </div>

            <div className="flex items-center gap-1.5 py-1">
              {[1, 2, 3, 4, 5].map((st) => (
                <button
                  type="button"
                  key={st}
                  onClick={() => setRating(st)}
                  className={`p-1.5 rounded-lg border transition-all ${
                    rating >= st
                      ? 'bg-zinc-950 dark:bg-zinc-100 text-white dark:text-zinc-950 border-zinc-950 dark:border-zinc-100 scale-105'
                      : 'bg-white dark:bg-zinc-800 text-zinc-400 border-zinc-200 dark:border-zinc-700/60'
                  }`}
                  title={`${st} Star - ${BEHAVIOR_SCALE[st]?.label}`}
                >
                  <Star className="w-4 h-4 fill-current" />
                </button>
              ))}
            </div>

            <div className="text-[11px] pt-1">
              <span className="font-bold text-zinc-800 dark:text-zinc-200 block">
                {BEHAVIOR_SCALE[rating]?.label}
              </span>
              <span className="text-zinc-500 text-[10px]">
                {BEHAVIOR_SCALE[rating]?.desc}
              </span>
            </div>
          </div>

          {/* Feedback Notes */}
          <div>
            <label className="form-label text-xs">
              Private Artisan Notes (Optional)
            </label>
            <textarea
              className="form-input text-xs"
              rows={3}
              placeholder="e.g. Respectful customer, clear instructions, provided clean work space, and settled bill immediately..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
            <span className="text-[10px] text-zinc-400 mt-1 block">
              Helps fellow artisans know what to expect when visiting this location.
            </span>
          </div>

          <div className="pt-2 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary text-xs py-2 px-4 font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="btn-primary text-xs py-2 px-5 font-semibold flex items-center gap-1.5"
            >
              {submitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
              <span>Save Behavior Rating</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// --- Customer Behavior Intel Modal (Worker-Only) ---------------------------
interface CustomerIntelModalProps {
  customerId: string;
  customerName: string;
  onClose: () => void;
}

function CustomerIntelModal({ customerId, customerName, onClose }: CustomerIntelModalProps) {
  const reviews = dataService.getCustomerWorkerReviews(customerId);
  const ratingData = dataService.getCustomerBehaviorRating(customerId);

  return (
    <div className="modal-backdrop" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-box modal-box-lg p-6 space-y-4" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-zinc-950 dark:bg-zinc-100 text-white dark:text-zinc-950 flex items-center justify-center font-black text-base shadow-sm">
              {customerName.charAt(0)}
            </div>
            <div>
              <h3 className="font-bold text-zinc-900 dark:text-zinc-50 text-base leading-tight tracking-tight">
                {customerName} — Resident Behavior History
              </h3>
              <p className="text-xs text-zinc-500 flex items-center gap-1 mt-0.5">
                <Shield className="w-3 h-3 text-zinc-400" />
                <span>Confidential Artisan Intelligence · Private to Workers</span>
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400">
            <XCircle className="w-5 h-5" />
          </button>
        </div>

        {/* Behavior Summary Card */}
        <div className="p-4 bg-zinc-50 dark:bg-zinc-900/60 rounded-xl border border-zinc-200 dark:border-zinc-700/60 flex items-center justify-between gap-4">
          <div>
            <span className="text-[10px] text-zinc-400 block font-bold uppercase tracking-wider">
              Overall Behavior Trust Score
            </span>
            <div className="text-2xl font-black text-zinc-900 dark:text-zinc-50 tabular-nums flex items-center gap-1.5 mt-0.5">
              <span>{ratingData.totalReviews > 0 ? ratingData.averageRating.toFixed(1) : '5.0'}</span>
              <span className="text-sm font-bold text-zinc-400">/ 5.0</span>
            </div>
            <span className="text-[11px] text-zinc-500">
              Based on {ratingData.totalReviews} verified artisan ratings
            </span>
          </div>

          <div className="text-right">
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800 px-2.5 py-1 rounded-full border border-zinc-200 dark:border-zinc-700/60 inline-block">
              {ratingData.averageRating >= 4.5 ? 'Highly Recommended' : ratingData.averageRating >= 3.5 ? 'Standard Resident' : 'Caution Advised'}
            </span>
          </div>
        </div>

        {/* Reviews List */}
        <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
          {reviews.length === 0 ? (
            <div className="p-8 text-center text-xs text-zinc-400 space-y-2">
              <MessageSquare className="w-8 h-8 mx-auto text-zinc-300 dark:text-zinc-700" />
              <p className="font-semibold text-zinc-700 dark:text-zinc-300">No written artisan feedback yet</p>
              <p className="text-[11px]">This resident currently holds a clean 5.0 baseline. You can be the first to leave behavior notes after finishing a job.</p>
            </div>
          ) : (
            reviews.map((r) => (
              <div key={r.id} className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-700/60 space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-zinc-900 dark:text-zinc-50">
                      {r.workerName || 'Artisan Partner'}
                    </span>
                    <span className="text-[10px] text-zinc-400">
                      ({r.serviceName})
                    </span>
                  </div>
                  <span className="text-[10px] text-zinc-400">
                    {r.workerReviewedCustomerAt ? formatDate(r.workerReviewedCustomerAt) : 'Recent'}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-xs">
                  <span className="font-bold text-zinc-900 dark:text-zinc-50 flex items-center gap-1">
                    Behavior Score: {r.workerCustomerBehaviorRating || 5} / 5
                  </span>
                </div>

                {r.workerCustomerReviewComment && (
                  <p className="text-xs text-zinc-600 dark:text-zinc-400 italic pt-0.5 leading-relaxed">
                    &ldquo;{r.workerCustomerReviewComment}&rdquo;
                  </p>
                )}
              </div>
            ))
          )}
        </div>

        <div className="pt-2 flex justify-end">
          <button onClick={onClose} className="btn-secondary text-xs py-2 px-4 font-semibold">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

// --- Main Worker Dashboard Page --------------------------------------------
export default function WorkerDashboardPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<UserType | null>(null);
  const [workerProfile, setWorkerProfile] = useState<WorkerProfile | null>(null);
  const [society, setSociety] = useState<Society | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [invoicingBooking, setInvoicingBooking] = useState<Booking | null>(null);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const [reviewingCustomerBooking, setReviewingCustomerBooking] = useState<Booking | null>(null);
  const [selectedCustomerForIntel, setSelectedCustomerForIntel] = useState<{ customerId: string; customerName: string } | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [settlingDues, setSettlingDues] = useState(false);

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

  function handleCustomerReviewSubmitted(rating: number, comment: string) {
    if (!reviewingCustomerBooking) return;
    dataService.submitWorkerCustomerReview(reviewingCustomerBooking.id, rating, comment);
    setReviewingCustomerBooking(null);
    showToast('Resident behavior review saved! Visible only to cooperative artisans.');
    if (currentUser) refreshData(currentUser.id);
  }

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

    if (workerProfile.kycStatus !== 'VERIFIED') {
      showToast(
        workerProfile.kycStatus === 'REJECTED'
          ? 'KYC verification was rejected. Please contact your local PACS office.'
          : 'Artisan KYC is pending approval from the PACS Admin. You can go online once verified.'
      );
      return;
    }

    if (workerProfile.accountStatus === 'SUSPENDED_UNPAID_DUES' || (workerProfile.outstandingDues || 0) >= 300) {
      showToast('Account temporarily paused due to unpaid PACS dues (₹' + workerProfile.outstandingDues + '). Please clear dues to go online.');
      return;
    }

    const nextState = !workerProfile.isAvailable;
    const updated = dataService.updateWorker(currentUser.id, {
      isAvailable: nextState,
    });
    if (updated) {
      setWorkerProfile(updated);
      showToast(nextState ? 'Status updated: Online and accepting jobs.' : 'Status updated: Offline.');
    }
  }

  // 1-Click Clear Outstanding Dues
  async function handlePayOutstandingDues() {
    if (!currentUser || !workerProfile) return;
    setSettlingDues(true);
    setTimeout(() => {
      const updated = dataService.payWorkerDues(currentUser.id);
      if (updated) {
        setWorkerProfile(updated);
        showToast('PACS Commission Dues cleared successfully! Your account is now fully Active.');
      }
      setSettlingDues(false);
      refreshData(currentUser.id);
    }, 400);
  }

  // Step 1: Accept Request -> IN_PROGRESS
  async function handleAcceptJob(bookingId: string) {
    if (!currentUser || !workerProfile) return;

    if (workerProfile.kycStatus !== 'VERIFIED') {
      showToast('KYC Verification by PACS Admin is required before accepting jobs.');
      return;
    }

    if (workerProfile.accountStatus === 'SUSPENDED_UNPAID_DUES' || (workerProfile.outstandingDues || 0) >= 300) {
      showToast('Account paused due to unpaid dues. Please clear outstanding PACS dues to accept jobs.');
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
      showToast('Job accepted! You can now contact the resident and begin service.');
      refreshData(currentUser.id);
    }, 300);
  }

  // Step 2: Dynamic Invoice Submission -> AWAITING_PAYMENT
  function handleGenerateInvoice(booking: Booking) {
    setInvoicingBooking(booking);
  }

  function handleInvoiceSubmitted(extraCost: number, reason: string) {
    if (!invoicingBooking || !currentUser) return;
    dataService.submitInvoice(invoicingBooking.id, extraCost, reason);
    setInvoicingBooking(null);
    showToast('Final bill submitted! Payment requested from resident.');
    refreshData(currentUser.id);
  }

  // Step 3 Option B: Worker Collects Cash On-Site -> COMPLETED_PAID_CASH + Add 5% to dues
  async function handleCollectCash(booking: Booking) {
    if (!currentUser) return;
    const subtotal = booking.subtotalAmount || booking.totalAmount;
    const fee = booking.platformFee || Math.round(subtotal * 0.05);

    if (!confirm(`Confirm that you have physically collected ${formatCurrency(booking.totalAmount)} cash from the customer?\n\nThe 5% PACS platform fee (${formatCurrency(fee)}) will be added to your outstanding dues ledger.`)) return;

    setActionLoadingId(booking.id);
    setTimeout(() => {
      dataService.settleCashPayment(booking.id);
      setActionLoadingId(null);
      showToast(`Cash collected! 5% commission (${formatCurrency(fee)}) logged to your PACS dues.`);
      refreshData(currentUser.id);
    }, 300);
  }

  if (loading || !currentUser) {
    return (
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-zinc-700" />
      </div>
    );
  }

  const outstandingDues = workerProfile?.outstandingDues || 0;
  const isSuspended = workerProfile?.accountStatus === 'SUSPENDED_UNPAID_DUES' || outstandingDues >= 300;

  // Task Category Filtering
  const incomingRequests = bookings.filter((b) => b.status === 'PENDING_ACCEPTANCE' && (!b.workerId || b.workerId === currentUser.id));
  const inProgressTasks = bookings.filter((b) => b.status === 'IN_PROGRESS' && b.workerId === currentUser.id);
  const awaitingPaymentTasks = bookings.filter((b) => b.status === 'AWAITING_PAYMENT' && b.workerId === currentUser.id);
  const completedJobsList = bookings.filter(
    (b) =>
      (b.status === 'COMPLETED_PAID_DIGITALLY' ||
       b.status === 'COMPLETED_PAID_CASH' ||
       b.status === 'COMPLETED') &&
      b.workerId === currentUser.id
  );

  return (
    <div className="min-h-screen flex flex-col bg-zinc-50">
      {/* --- Top Header -------------------------------------------------------- */}
      <header className="nav-sticky">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 shrink-0 min-w-0">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-zinc-950 dark:bg-zinc-100 flex items-center justify-center text-white dark:text-zinc-950 shadow-sm shrink-0">
              <Wrench className="w-4.5 h-4.5 sm:w-5 sm:h-5" />
            </div>
            <div className="flex flex-col justify-center min-w-0">
              <span className="font-black text-zinc-900 dark:text-zinc-50 text-lg sm:text-xl tracking-tight leading-none block whitespace-nowrap">
                SahakarGig
              </span>
              <span className="text-[10px] sm:text-[11px] font-medium text-zinc-500 leading-none block truncate max-w-[130px] xs:max-w-[200px] sm:max-w-none mt-1">
                Artisan Partner Dashboard
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <div className="hidden md:block text-right">
              <div className="text-xs font-bold text-zinc-900 dark:text-zinc-50">{currentUser.name}</div>
              <div className="text-[10px] text-zinc-500 font-semibold">
                {workerProfile?.trade || 'Artisan Partner'}
              </div>
            </div>
            <button
              onClick={handleSignOut}
              className="btn-secondary py-1.5 px-2.5 sm:px-3 text-xs font-semibold whitespace-nowrap flex items-center gap-1"
              title="Sign Out"
            >
              <LogOut className="w-3.5 h-3.5" /> <span className="hidden xs:inline">Sign Out</span>
            </button>
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* --- Main Content ----------------------------------------------------- */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-8 space-y-6">
        {/* Toast Alert Message */}
        {toastMessage && (
          <div className="p-4 rounded-xl bg-zinc-100 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-700/60 text-zinc-700 dark:text-zinc-300 text-xs font-semibold flex items-center gap-2 shadow-sm animate-fadein">
            <CheckCircle className="w-4 h-4 text-zinc-700 shrink-0" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* -- HIGH PRIORITY RED SUSPENSION BANNER -- */}
        {isSuspended && (
          <div className="p-5 rounded-2xl bg-red-500/10 border-2 border-red-500 dark:border-red-600/80 shadow-md space-y-3 animate-fadein">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-red-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-red-600/30">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-black text-zinc-900 dark:text-zinc-50 text-base flex items-center gap-2">
                    <span>Account Temporarily Paused (Unpaid PACS Dues)</span>
                    <span className="text-[10px] uppercase font-black bg-red-100 dark:bg-red-950 text-zinc-700 dark:text-zinc-300 px-2 py-0.5 rounded-full border border-red-200 dark:border-red-800">
                      Suspended
                    </span>
                  </h3>
                  <p className="text-xs text-zinc-600 dark:text-zinc-300 mt-1 max-w-xl leading-relaxed">
                    Your accumulated PACS cash commission dues have reached <strong>{formatCurrency(outstandingDues)}</strong> (threshold: ₹300). Your profile is currently hidden from resident search and job acceptance is paused.
                  </p>
                </div>
              </div>

              <button
                onClick={handlePayOutstandingDues}
                disabled={settlingDues}
                className="btn-primary py-2.5 px-5 text-xs font-black shadow-lg bg-red-600 hover:bg-red-700 text-white whitespace-nowrap flex items-center gap-2 self-start sm:self-auto"
              >
                {settlingDues ? <Loader2 className="w-4 h-4 animate-spin" /> : <Coins className="w-4 h-4" />}
                <span>Pay Outstanding Dues ({formatCurrency(outstandingDues)})</span>
              </button>
            </div>
          </div>
        )}        {/* -- KYC VERIFICATION STATUS ALERT BANNER -- */}
        {workerProfile && workerProfile.kycStatus !== 'VERIFIED' && (
          <div className={`p-5 rounded-2xl border shadow-sm space-y-2 animate-fadein ${
            workerProfile.kycStatus === 'REJECTED'
              ? 'bg-red-50/50 dark:bg-red-950/20 border-red-200 dark:border-red-900/60'
              : 'bg-zinc-100 dark:bg-zinc-900/60 border-zinc-200 dark:border-zinc-700/60'
          }`}>
            <div className="flex items-start gap-3.5">
              <div className="w-9 h-9 rounded-xl bg-zinc-950 dark:bg-zinc-100 text-white dark:text-zinc-950 flex items-center justify-center shrink-0">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-zinc-900 dark:text-zinc-50 text-sm flex items-center gap-2">
                  <span>
                    {workerProfile.kycStatus === 'REJECTED'
                      ? 'Artisan KYC Verification Rejected'
                      : 'Artisan KYC Verification Under Review'}
                  </span>
                  <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
                    {workerProfile.kycStatus}
                  </span>
                </h3>
                <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1 max-w-xl leading-relaxed">
                  {workerProfile.kycStatus === 'REJECTED'
                    ? 'Your trade verification was rejected by the Primary Cooperative Services Society board. Please contact your society desk.'
                    : 'Your registration documents have been submitted to the PACS Administration Board. Once verified by the committee, your profile will be activated for resident discovery and you will start receiving job requests.'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* -- Cooperative Profile Banner -- */}
        <div className="membership-banner flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <span className={`text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full flex items-center gap-1.5 ${
                workerProfile?.kycStatus !== 'VERIFIED'
                  ? 'bg-zinc-800 text-zinc-300 border border-zinc-700'
                  : !isSuspended
                  ? 'bg-zinc-100 text-zinc-300 border border-zinc-500/30'
                  : 'bg-red-400/20 text-red-200 border border-red-400/30'
              }`}>
                {workerProfile?.kycStatus !== 'VERIFIED' ? (
                  <Shield className="w-3.5 h-3.5 text-zinc-400" />
                ) : !isSuspended ? (
                  <BadgeCheck className="w-3.5 h-3.5 text-zinc-300" />
                ) : (
                  <AlertTriangle className="w-3.5 h-3.5 text-zinc-400" />
                )}
                {workerProfile?.kycStatus !== 'VERIFIED'
                  ? `Verification ${workerProfile?.kycStatus || 'Pending'}`
                  : !isSuspended
                  ? 'Account Active & Verified'
                  : 'Account Paused (Unpaid Dues)'}
              </span>

              {outstandingDues > 0 && !isSuspended && workerProfile?.kycStatus === 'VERIFIED' && (
                <span className="text-[11px] font-bold text-amber-200 bg-amber-900/40 border border-amber-400/30 px-2 py-0.5 rounded-full">
                  Outstanding Dues: {formatCurrency(outstandingDues)} / ₹300 limit
                </span>
              )}

              <button
                type="button"
                onClick={() => setShowSubscriptionModal(true)}
                className="text-[11px] font-bold underline hover:text-white text-zinc-400 transition-colors"
              >
                Manage / Upgrade Membership Pass
              </button>
            </div>

            <h2 className="text-2xl font-black text-white">{currentUser.name}</h2>
            <div className="text-xs text-zinc-400 mt-1">
              Trade: <strong className="text-white">{workerProfile?.trade || 'General Maintenance'}</strong> · {workerProfile?.localSociety || 'Primary Cooperative Services Society'}
            </div>
          </div>

          {/* Availability Toggle */}
          <div className="bg-white/10 backdrop-blur-md p-3.5 rounded-xl border border-white/20 flex items-center gap-3">
            <div>
              <div className="text-[11px] text-zinc-400 font-medium">Job Dispatching Status</div>
              <div className="text-xs font-bold text-white flex items-center gap-1.5 mt-0.5">
                <span className={`w-2 h-2 rounded-full ${workerProfile?.kycStatus === 'VERIFIED' && workerProfile?.isAvailable && !isSuspended ? 'bg-emerald-400 animate-pulse' : 'bg-zinc-500'}`} />
                <span>
                  {workerProfile?.kycStatus !== 'VERIFIED'
                    ? 'Verification Required'
                    : !isSuspended
                    ? (workerProfile?.isAvailable ? 'Online (Accepting Jobs)' : 'Offline')
                    : 'Locked Offline (Clear Dues)'}
                </span>
              </div>
            </div>
            <button
              onClick={handleToggleAvailability}
              className="transition-transform active:scale-95"
              title={workerProfile?.kycStatus !== 'VERIFIED' ? 'Verification Pending' : !isSuspended ? 'Toggle Availability' : 'Clear Dues to Go Online'}
            >
              {workerProfile?.kycStatus === 'VERIFIED' && workerProfile?.isAvailable && !isSuspended ? (
                <ToggleRight className="w-9 h-9 text-zinc-300" />
              ) : (
                <ToggleLeft className="w-9 h-9 text-zinc-300" />
              )}
            </button>
          </div>
        </div>

        {/* -- Key Performance Metrics Grid -- */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="card p-4 space-y-1">
            <div className="text-xs text-zinc-500 flex items-center gap-1">
              <Coins className="w-3.5 h-3.5 text-zinc-400" /> Total Direct Earnings
            </div>
            <div className="text-2xl font-black text-zinc-900 dark:text-zinc-50">{formatCurrency(workerProfile?.totalEarnings || 0)}</div>
            <div className="text-[10px] text-zinc-400">100% Payout · Zero Commission Cut</div>
          </div>

          <div className="card p-4 space-y-1">
            <div className="text-xs text-zinc-500 flex items-center gap-1">
              <CheckCircle className="w-3.5 h-3.5 text-zinc-400" /> Completed Jobs
            </div>
            <div className="text-2xl font-black text-zinc-900 dark:text-zinc-50">{workerProfile?.completedJobs || 0}</div>
            <div className="text-[10px] text-zinc-400">Services Delivered</div>
          </div>

          <div className="card p-4 space-y-1">
            <div className="text-xs text-zinc-500 flex items-center gap-1">
              <Star className="w-3.5 h-3.5 text-zinc-400" /> Work Quality Rating
            </div>
            <div className="text-2xl font-black text-zinc-900 dark:text-zinc-50 flex items-center gap-1">
              <span>{(workerProfile?.qualityRating || 5.0).toFixed(1)}</span>
              <span className="text-xs text-zinc-400 font-normal">/ 5.0</span>
            </div>
            <div className="text-[10px] text-zinc-400">Skill Quality Score</div>
          </div>

          <div className="card p-4 space-y-1">
            <div className="text-xs text-zinc-500 flex items-center gap-1">
              <Shield className="w-3.5 h-3.5 text-zinc-400" /> Pricing Fairness
            </div>
            <div className="text-2xl font-black text-zinc-900 dark:text-zinc-50 flex items-center gap-1">
              <span>{workerProfile?.pricingRating ? workerProfile.pricingRating.toFixed(1) : '5.0'}</span>
              <span className="text-xs text-zinc-400 font-normal">/ 5.0</span>
            </div>
            <div className="text-[10px] text-zinc-400">{workerProfile?.fairPricingPercentage || 100}% Fair Pricing Score</div>
          </div>
        </div>

        {/* -- 1. Incoming Job Requests -- */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-zinc-950" />
              <h3 className="font-bold text-zinc-900 dark:text-zinc-50 text-base">Incoming Job Requests</h3>
              <span className="text-xs text-zinc-400">({incomingRequests.length})</span>
            </div>
          </div>

          {workerProfile?.kycStatus !== 'VERIFIED' ? (
            <div className="card p-8 text-center space-y-2">
              <Shield className="w-8 h-8 text-zinc-400 mx-auto" />
              <div className="font-bold text-zinc-700 dark:text-zinc-300">
                {workerProfile?.kycStatus === 'REJECTED' ? 'KYC Verification Rejected' : 'KYC Verification Pending'}
              </div>
              <p className="text-xs text-zinc-400 max-w-md mx-auto">
                {workerProfile?.kycStatus === 'REJECTED'
                  ? 'Your profile could not be approved by the PACS board. Please contact your local cooperative office.'
                  : 'Your artisan registration is under review by the PACS Administrative Board. Once approved, you will appear in resident search and receive job requests.'}
              </p>
            </div>
          ) : isSuspended ? (
            <div className="card p-8 text-center space-y-2 border-zinc-200 dark:border-zinc-700/60 bg-red-50/30 dark:bg-red-950/20">
              <AlertTriangle className="w-8 h-8 text-red-600 mx-auto" />
              <div className="font-bold text-red-900 dark:text-zinc-400">Incoming Requests Paused</div>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 max-w-md mx-auto">
                Please clear your outstanding PACS dues ({formatCurrency(outstandingDues)}) to resume receiving and accepting customer requests.
              </p>
              <button
                onClick={handlePayOutstandingDues}
                disabled={settlingDues}
                className="btn-primary text-xs py-2 px-4 font-bold bg-red-600 hover:bg-red-700"
              >
                Clear Dues & Reactivate
              </button>
            </div>
          ) : incomingRequests.length === 0 ? (
            <div className="card p-8 text-center space-y-2">
              <Clock className="w-8 h-8 text-zinc-300 dark:text-zinc-600 mx-auto" />
              <div className="font-bold text-zinc-700 dark:text-zinc-300">No pending job requests</div>
              <p className="text-xs text-zinc-400">Ensure your status is Online to receive new requests.</p>
            </div>
          ) : (
              incomingRequests.map((bk) => (
              <div key={bk.id} className="card p-5 space-y-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="font-bold text-zinc-900 dark:text-zinc-50 text-base">{bk.serviceName}</div>
                    <div className="text-xs text-zinc-500 mt-1 flex items-center gap-1.5">
                      <CalendarDays className="w-3.5 h-3.5" /> Scheduled: {formatDateTime(bk.scheduledDate)}
                    </div>
                    <div className="text-xs text-zinc-500 flex items-center gap-1.5 mt-0.5">
                      <MapPin className="w-3.5 h-3.5" /> Location: {bk.address}
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] uppercase font-bold text-zinc-400 block">Base Rate</span>
                    <span className="text-base font-black text-zinc-700 dark:text-zinc-300">{formatCurrency(bk.basePrice || 150)}</span>
                  </div>
                </div>

                {bk.problemDescription && (
                  <div className="p-3 bg-zinc-50 dark:bg-zinc-900/60 rounded-xl border border-zinc-200 dark:border-zinc-700/60 text-xs">
                    <span className="font-bold text-zinc-500 uppercase text-[10px] block mb-0.5">Reported Issue</span>
                    <p className="text-zinc-800 dark:text-zinc-200">&quot;{bk.problemDescription}&quot;</p>
                  </div>
                )}

                {/* Resident Behavior Trust Score (Worker-Only Intel) */}
                {(() => {
                  const custRating = dataService.getCustomerBehaviorRating(bk.customerId);
                  return (
                    <div className="p-3 bg-zinc-50 dark:bg-zinc-900/60 rounded-xl border border-zinc-200 dark:border-zinc-700/60 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1.5">
                        <Shield className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                        <div>
                          <span className="text-zinc-500 font-medium">Resident Behavior Score:</span>{' '}
                          <span className="font-bold text-zinc-900 dark:text-zinc-50 tabular-nums">
                            {custRating.totalReviews > 0 ? `${custRating.averageRating.toFixed(1)} / 5.0` : '5.0 / 5.0 (New)'}
                          </span>
                          <span className="text-[10px] text-zinc-400 ml-1">
                            ({custRating.totalReviews} worker {custRating.totalReviews === 1 ? 'review' : 'reviews'} · Artisan Intel)
                          </span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => setSelectedCustomerForIntel({ customerId: bk.customerId, customerName: bk.customerName })}
                        className="text-[11px] font-semibold text-zinc-700 dark:text-zinc-300 hover:text-zinc-950 dark:hover:text-zinc-50 underline flex items-center gap-0.5 transition-colors"
                      >
                        Artisan Intel ↗
                      </button>
                    </div>
                  );
                })()}

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-100 dark:border-zinc-800/60">
                  <button
                    onClick={() => handleAcceptJob(bk.id)}
                    disabled={actionLoadingId === bk.id}
                    className="btn-primary text-xs py-2 px-5 font-bold shadow-sm"
                  >
                    {actionLoadingId === bk.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                    Accept Job
                  </button>
                </div>
              </div>
            ))
          )}
        </section>

        {/* -- 2. Active Tasks In Progress -- */}
        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
            <h3 className="font-bold text-zinc-900 dark:text-zinc-50 text-base">Active Tasks In Progress</h3>
            <span className="text-xs text-zinc-400">({inProgressTasks.length})</span>
          </div>

          {inProgressTasks.length === 0 ? (
            <div className="card p-8 text-center space-y-2">
              <CheckCircle className="w-8 h-8 text-zinc-300 dark:text-zinc-600 mx-auto" />
              <div className="font-bold text-zinc-700 dark:text-zinc-300">No active tasks in progress</div>
              <p className="text-xs text-zinc-400">Accept an incoming request to start working.</p>
            </div>
          ) : (
            inProgressTasks.map((bk) => (
              <div key={bk.id} className="card p-5 space-y-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="font-bold text-zinc-900 dark:text-zinc-50 text-base">{bk.serviceName}</div>
                    <div className="text-xs text-zinc-500 mt-1 flex items-center gap-1.5">
                      <CalendarDays className="w-3.5 h-3.5" /> Scheduled: {formatDateTime(bk.scheduledDate)}
                    </div>
                  </div>
                  <span className="badge bg-zinc-100 text-zinc-700 border-zinc-200">In Progress</span>
                </div>

                <CustomerContactCard
                  booking={bk}
                  workerName={currentUser.name}
                  onViewIntel={() => setSelectedCustomerForIntel({ customerId: bk.customerId, customerName: bk.customerName })}
                />

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-100 dark:border-zinc-800/60">
                  <button
                    onClick={() => handleGenerateInvoice(bk)}
                    className="btn-primary text-xs py-2 px-5 font-bold shadow-md bg-zinc-800 hover:bg-zinc-700 text-white flex items-center gap-1.5"
                  >
                    <FileText className="w-4 h-4" />
                    Complete Job & Generate Invoice
                  </button>
                </div>
              </div>
            ))
          )}
        </section>

        {/* -- 3. Awaiting Payment Tasks (Cash / Digital Settlement) -- */}
        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-violet-600" />
            <h3 className="font-bold text-zinc-900 dark:text-zinc-50 text-base">Awaiting Payment Settlement</h3>
            <span className="text-xs text-zinc-400">({awaitingPaymentTasks.length})</span>
          </div>

          {awaitingPaymentTasks.length === 0 ? (
            <div className="card p-8 text-center space-y-2">
              <Coins className="w-8 h-8 text-zinc-300 dark:text-zinc-600 mx-auto" />
              <div className="font-bold text-zinc-700 dark:text-zinc-300">No jobs awaiting payment</div>
              <p className="text-xs text-zinc-400">Completed jobs will appear here for settlement.</p>
            </div>
          ) : (
            awaitingPaymentTasks.map((bk) => {
              const base = bk.basePrice || 150;
              const extra = bk.extraCost || 0;
              const subtotal = bk.subtotalAmount || (base + extra);
              const fee = bk.platformFee || Math.round(subtotal * 0.05);
              const total = bk.totalAmount || (subtotal + fee);

              return (
                <div key={bk.id} className="card p-5 space-y-4 border-l-4 border-l-violet-600">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <div className="font-bold text-zinc-900 dark:text-zinc-50 text-base">{bk.serviceName}</div>
                      <div className="text-xs text-zinc-500 mt-1">Customer: {bk.customerName} ({bk.customerPhone})</div>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] uppercase font-bold text-zinc-400 block">Total Customer Bill</span>
                      <span className="text-base font-black text-zinc-700 dark:text-zinc-300">{formatCurrency(total)}</span>
                    </div>
                  </div>

                  {/* Invoice Summary */}
                  <div className="p-3 bg-zinc-50 dark:bg-zinc-900/60 rounded-xl border border-zinc-200 dark:border-zinc-700/60 text-xs space-y-1">
                    <div className="flex justify-between text-zinc-600 dark:text-zinc-400">
                      <span>Base Diagnostic Rate:</span>
                      <span className="font-semibold text-zinc-900 dark:text-zinc-50">{formatCurrency(base)}</span>
                    </div>
                    {extra > 0 && (
                      <div className="flex justify-between text-zinc-600 dark:text-zinc-400">
                        <span>Extra Labor / Materials ({bk.extraCostReason}):</span>
                        <span className="font-semibold text-zinc-900 dark:text-zinc-50">+{formatCurrency(extra)}</span>
                      </div>
                    )}
                    <div className="flex justify-between font-bold text-zinc-900 dark:text-zinc-50 pt-1 border-t border-zinc-200 dark:border-zinc-700/60">
                      <span>Your Direct Take-Home:</span>
                      <span className="text-zinc-900 dark:text-zinc-50">{formatCurrency(subtotal)}</span>
                    </div>
                    <div className="flex justify-between text-zinc-600 dark:text-zinc-400 text-[11px]">
                      <span>PACS Commission (5%):</span>
                      <span>+{formatCurrency(fee)}</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-zinc-100 dark:border-zinc-800/60">
                    <div className="text-xs text-zinc-500">
                      Resident can pay online, or you can record collected cash:
                    </div>

                    <button
                      onClick={() => handleCollectCash(bk)}
                      disabled={actionLoadingId === bk.id}
                      className="btn-primary text-xs py-2 px-5 font-bold shadow-md bg-zinc-800 hover:bg-zinc-700 text-white flex items-center gap-1.5"
                    >
                      {actionLoadingId === bk.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Banknote className="w-4 h-4" />}
                      <span>Collected Cash ({formatCurrency(total)})</span>
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </section>

        {/* -- 4. Completed Service History & Resident Rating -- */}
        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-zinc-800" />
            <h3 className="font-bold text-zinc-900 dark:text-zinc-50 text-base">Completed Job History</h3>
            <span className="text-xs text-zinc-400">({completedJobsList.length})</span>
          </div>

          {completedJobsList.length === 0 ? (
            <div className="card p-8 text-center space-y-2">
              <CalendarDays className="w-8 h-8 text-zinc-300 dark:text-zinc-600 mx-auto" />
              <div className="font-bold text-zinc-700 dark:text-zinc-300">No completed jobs yet</div>
            </div>
          ) : (
            <div className="space-y-3">
              {completedJobsList.map((bk) => (
                <div key={bk.id} className="card p-4 space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <div className="font-bold text-zinc-900 dark:text-zinc-50 text-sm">{bk.serviceName}</div>
                      <div className="text-xs text-zinc-500 mt-0.5">
                        Customer: {bk.customerName} · Settled via {bk.paymentMethod || 'Direct'}
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-sm font-black text-zinc-900 dark:text-zinc-50">{formatCurrency(bk.subtotalAmount || bk.totalAmount)}</div>
                      <div className="text-[10px] text-zinc-400">{formatDateTime(bk.completedAt || bk.createdAt)}</div>
                    </div>
                  </div>

                  {/* Worker-Only Resident Review Action Bar */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-zinc-100 dark:border-zinc-800/60">
                    <div className="text-xs text-zinc-500">
                      {bk.workerCustomerBehaviorRating !== undefined ? (
                        <span className="inline-flex items-center gap-1.5 font-semibold text-zinc-800 dark:text-zinc-200">
                          <Shield className="w-3.5 h-3.5 text-zinc-500" />
                          Resident Behavior: <strong>{bk.workerCustomerBehaviorRating}/5</strong>
                          <span className="text-[10px] text-zinc-400 font-normal">(Private Artisan Intel)</span>
                        </span>
                      ) : (
                        <span className="text-zinc-400 text-[11px]">
                          Help fellow artisans: Rate resident behavior and cooperation.
                        </span>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => setReviewingCustomerBooking(bk)}
                      className={`text-xs py-1.5 px-3 font-semibold rounded-lg transition-colors flex items-center gap-1.5 ${
                        bk.workerCustomerBehaviorRating !== undefined
                          ? 'btn-secondary text-zinc-700 dark:text-zinc-300'
                          : 'btn-primary'
                      }`}
                    >
                      <Star className="w-3.5 h-3.5" />
                      <span>{bk.workerCustomerBehaviorRating !== undefined ? 'Edit Behavior Rating' : 'Rate Resident Behavior'}</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* -- 5. Resident Reviews & Feedback -- */}
        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-zinc-700 dark:text-zinc-300" />
            <h3 className="font-bold text-zinc-900 dark:text-zinc-50 text-base">Resident Reviews & Feedback</h3>
            <span className="text-xs text-zinc-400">
              ({dataService.getWorkerReviews(currentUser?.id || '').length})
            </span>
          </div>

          {(() => {
            const myReviews = dataService.getWorkerReviews(currentUser?.id || '');
            if (myReviews.length === 0) {
              return (
                <div className="card p-6 text-center space-y-1 text-xs text-zinc-400">
                  <p className="font-semibold text-zinc-600 dark:text-zinc-300">No written reviews yet</p>
                  <p>Customer feedback and 3-factor ratings will appear here after job completion.</p>
                </div>
              );
            }

            return (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {myReviews.map((r) => (
                  <div key={r.id} className="card p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-zinc-900 dark:text-zinc-50 text-xs">
                        {r.customerName || 'Verified Resident'}
                      </span>
                      <span className="text-[10px] text-zinc-400">
                        {r.reviewedAt ? formatDate(r.reviewedAt) : 'Recent'}
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-1.5 text-[10px]">
                      <span className="bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded text-zinc-700 dark:text-zinc-300 font-semibold">
                        Skill: {r.qualityRating || 5}/5
                      </span>
                      <span className="bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded text-zinc-700 dark:text-zinc-300 font-semibold">
                        Behavior: {r.behaviorRating || 5}/5
                      </span>
                      <span className="bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 px-2 py-0.5 rounded font-bold">
                        Pricing: {r.pricingRating || 5}/5
                      </span>
                    </div>

                    {r.reviewComment ? (
                      <p className="text-xs text-zinc-700 dark:text-zinc-300 italic pt-0.5 leading-relaxed">
                        &ldquo;{r.reviewComment}&rdquo; 
                      </p>
                    ) : (
                      <p className="text-xs text-zinc-400 italic">
                        (Rating verified upon digital job completion)
                      </p>
                    )}
                  </div>
                ))}
              </div>
            );
          })()}
        </section>
      </main>

      {/* -- Dynamic Invoicing Modal -- */}
      {invoicingBooking && (
        <DynamicInvoiceModal
          booking={invoicingBooking}
          onClose={() => setInvoicingBooking(null)}
          onSubmitInvoice={handleInvoiceSubmitted}
        />
      )}

      {/* -- Subscription Pass Modal -- */}
      {showSubscriptionModal && workerProfile && (
        <SubscriptionModal
          worker={workerProfile}
          monthlyRate={society?.monthlyPassRate || 69}
          yearlyRate={society?.yearlyPassRate || 599}
          onClose={() => setShowSubscriptionModal(false)}
          onSubscribed={(updated) => {
            setWorkerProfile(updated);
            setShowSubscriptionModal(false);
            showToast('Membership Pass activated successfully! You are now online with 0% commission.');
            if (currentUser) refreshData(currentUser.id);
          }}
        />
      )}

      {/* -- Worker Customer Behavior Review Modal (Confidential) -- */}
      {reviewingCustomerBooking && (
        <WorkerCustomerReviewModal
          booking={reviewingCustomerBooking}
          onClose={() => setReviewingCustomerBooking(null)}
          onSubmitReview={handleCustomerReviewSubmitted}
        />
      )}

      {/* -- Customer Behavior Intel Modal (Worker-Only) -- */}
      {selectedCustomerForIntel && (
        <CustomerIntelModal
          customerId={selectedCustomerForIntel.customerId}
          customerName={selectedCustomerForIntel.customerName}
          onClose={() => setSelectedCustomerForIntel(null)}
        />
      )}

      {/* Footer */}
      <footer className="bg-white dark:bg-zinc-950 border-t border-zinc-100 dark:border-zinc-800/60 py-4 mt-8">
        <div className="max-w-6xl mx-auto px-4 text-center text-xs text-zinc-400">
          SahakarGig Artisan Network · Primary Cooperative Services Society System
        </div>
      </footer>
    </div>
  );
}




