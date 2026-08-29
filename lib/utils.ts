import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export function formatDateTime(dateString: string): string {
  return new Date(dateString).toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function daysUntil(dateString: string): number {
  const target = new Date(dateString).getTime();
  const now = Date.now();
  return Math.max(0, Math.ceil((target - now) / (1000 * 60 * 60 * 24)));
}

export function getBadgeClass(status: string): string {
  const map: Record<string, string> = {
    // Post-service payment lifecycle
    PENDING_ACCEPTANCE:        'badge text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 border-amber-300 dark:border-amber-800',
    IN_PROGRESS:               'badge text-blue-800 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/60 border-blue-300 dark:border-blue-800',
    AWAITING_PAYMENT:          'badge text-violet-800 dark:text-violet-300 bg-violet-50 dark:bg-violet-950/60 border-violet-300 dark:border-violet-800',
    COMPLETED_PAID_DIGITALLY:  'badge text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 border-emerald-300 dark:border-emerald-800',
    COMPLETED_PAID_CASH:       'badge text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 border-emerald-300 dark:border-emerald-800',
    COMPLETED:                 'badge text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 border-emerald-300 dark:border-emerald-800',
    CANCELLED:                 'badge text-red-800 dark:text-red-300 bg-red-50 dark:bg-red-950/60 border-red-300 dark:border-red-800',

    // KYC and payment
    VERIFIED:     'badge text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 border-emerald-300 dark:border-emerald-800',
    PENDING:      'badge text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 border-amber-300 dark:border-amber-800',
    REJECTED:     'badge text-red-800 dark:text-red-300 bg-red-50 dark:bg-red-950/60 border-red-300 dark:border-red-800',
    PAID:         'badge text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 border-emerald-300 dark:border-emerald-800',
    PAID_DIGITAL: 'badge text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 border-emerald-300 dark:border-emerald-800',
    PAID_CASH:    'badge text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 border-emerald-300 dark:border-emerald-800',
  };

  return map[status] ?? 'badge text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700';
}

export function getStatusReadableLabel(status: string): string {
  const map: Record<string, string> = {
    PENDING_ACCEPTANCE:        'Pending Artisan Acceptance',
    IN_PROGRESS:               'Worker Assigned • Service In Progress',
    AWAITING_PAYMENT:          'Service Completed • Ready for Payment',
    COMPLETED_PAID_DIGITALLY:  'Service Completed & Settled (Digital)',
    COMPLETED_PAID_CASH:       'Service Completed & Settled (Cash)',
    COMPLETED:                 'Service Completed & Settled',
    CANCELLED:                 'Cancelled / Declined',
  };
  return map[status] ?? status.replace(/_/g, ' ');
}
