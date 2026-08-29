'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  Leaf, LogOut, Shield, Users, BadgeCheck, XCircle,
  CheckCircle, IndianRupee, Edit3, Save, X, Eye,
  Loader2, AlertTriangle, TrendingUp, CalendarDays,
  Coins, Building2, Wrench, RefreshCw
} from 'lucide-react';
import ThemeToggle from '@/components/ThemeToggle';
import dataService, { WorkerProfile, Service, Society, User } from '@/lib/dataService';
import { formatCurrency, getBadgeClass, getStatusReadableLabel } from '@/lib/utils';

export default function AdminDashboardPage() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [workers, setWorkers] = useState<WorkerProfile[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [society, setSociety] = useState<Society | null>(null);
  const [metrics, setMetrics] = useState({
    totalVolume: 0,
    activeArtisans: 0,
    suspendedArtisans: 0,
    verifiedArtisans: 0,
    pendingKyc: 0,
    totalCompletedJobs: 0,
    welfareFundBalance: 0,
    totalCommissionCollected: 0,
    totalOutstandingWorkerDues: 0,
  });

  const [loading, setLoading] = useState(true);
  const [updatingKycId, setUpdatingKycId] = useState<string | null>(null);
  const [selectedWorkerKyc, setSelectedWorkerKyc] = useState<WorkerProfile | null>(null);
  const [editingServiceId, setEditingServiceId] = useState<string | null>(null);
  const [editPriceValue, setEditPriceValue] = useState<string>('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const fetchData = useCallback(async () => {
    await dataService.syncCloud();
    const wData = dataService.getWorkers();
    const sData = dataService.getServices();
    const soc = dataService.getSociety();
    const mData = dataService.getPlatformMetrics();

    setWorkers(wData);
    setServices(sData);
    setSociety(soc);
    setMetrics(mData);
    setLoading(false);
  }, []);

  // Auth Guard
  useEffect(() => {
    const raw = typeof window !== 'undefined' ? localStorage.getItem('sahakar_admin_auth') : null;
    if (!raw) {
      router.replace('/admin/login');
      return;
    }
    try {
      const parsed = JSON.parse(raw);
      if (!parsed || parsed.role !== 'ADMIN') {
        router.replace('/admin/login');
        return;
      }
      setIsAuthenticated(true);
      fetchData();
    } catch {
      router.replace('/admin/login');
    }
  }, [router, fetchData]);

  // Live polling for instant state synchronization
  useEffect(() => {
    if (!isAuthenticated) return;
    const interval = setInterval(() => {
      fetchData();
    }, 2500);
    return () => clearInterval(interval);
  }, [isAuthenticated, fetchData]);

  function handleSignOut() {
    localStorage.removeItem('sahakar_admin_auth');
    router.push('/admin/login');
  }

  // KYC Approval / Rejection Action
  async function handleKycAction(userId: string, status: 'VERIFIED' | 'REJECTED') {
    setUpdatingKycId(userId);
    setTimeout(() => {
      dataService.updateWorker(userId, { kycStatus: status });
      setUpdatingKycId(null);
      setSelectedWorkerKyc(null);
      showToast(`Artisan KYC status updated to ${status}`);
      fetchData();
    }, 300);
  }

  // Service Base Price Update
  function startEditPrice(svc: Service) {
    setEditingServiceId(svc.id);
    setEditPriceValue(svc.price.toString());
  }

  function saveEditPrice(serviceId: string) {
    const newPrice = parseFloat(editPriceValue);
    if (isNaN(newPrice) || newPrice <= 0) {
      showToast(' Please enter a valid base price.');
      return;
    }
    const updated = dataService.updateServiceBasePrice(serviceId, newPrice);
    if (updated) {
      showToast(`Base Price updated to ${formatCurrency(newPrice)} for ${updated.name}`);
      setEditingServiceId(null);
      fetchData();
    }
  }

  // 1-Click Clear Worker Dues / Unsuspend Override
  function handleClearWorkerDues(userId: string, workerName: string) {
    const updated = dataService.adminClearWorkerDues(userId);
    if (updated) {
      showToast(`Dues cleared & ${workerName}'s account has been Unsuspended/Reactivated.`);
      fetchData();
    }
  }

  if (!isAuthenticated) return null;

  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col">
      {/* Top Administrative Navigation */}
      <header className="sticky top-0 z-40 bg-white border-b border-zinc-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-zinc-950 flex items-center justify-center text-white">
              <Leaf className="w-4 h-4" />
            </div>
            <div>
              <span className="font-black text-slate-900 text-lg leading-none block">
                SahakarGig
              </span>
              <span className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">
                PACS Governance & Admin Desk
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-50 dark:bg-blue-950 border border-zinc-200 dark:border-blue-800 text-xs font-bold text-zinc-700 dark:text-zinc-300">
              <Shield className="w-3.5 h-3.5" /> Primary Cooperative Services Society
            </div>
            <button
              onClick={handleSignOut}
              className="btn-secondary py-1.5 px-3 text-xs font-bold"
            >
              <LogOut className="w-3.5 h-3.5" /> Sign Out
            </button>
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Main Administrative Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-8 space-y-8">
        {/* Banner Title */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-2 border-b border-zinc-200">
          <div>
            <div className="flex items-center gap-2 text-zinc-700 text-xs font-bold uppercase tracking-wider mb-1">
              <Building2 className="w-4 h-4" /> District Cooperative Federation Cluster
            </div>
            <h1 className="text-2xl font-black text-slate-900">
              {society?.name || 'Primary Cooperative Services Society'}
            </h1>
            <p className="text-xs text-zinc-500 mt-0.5">
              Registration No: {society?.registrationNo || 'PACS/DCF/2021/089'} · {society?.district || 'Central District'}, {society?.state || 'State Federation'}
            </p>
          </div>
        </div>

        {/* Action Toast Alert */}
        {toastMessage && (
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2 shadow-sm animate-fadein">
            <CheckCircle className="w-4 h-4 text-zinc-700 shrink-0" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Real-time Dynamic KPI Metric Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Total Platform Volume */}
          <div className="kpi-card border-l-4 border-l-blue-600">
            <div className="w-9 h-9 rounded-xl bg-zinc-50 text-zinc-700 flex items-center justify-center mb-3">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div className="text-xs text-zinc-500 font-semibold mb-0.5">Total Service Volume</div>
            <div className="text-2xl font-black text-zinc-700">
              {formatCurrency(metrics.totalVolume)}
            </div>
            <div className="text-[11px] text-zinc-400 mt-0.5">Direct to artisans + 5% platform fee</div>
          </div>

          {/* Customer Commission Collected */}
          <div className="kpi-card border-l-4 border-l-emerald-600">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-zinc-700 flex items-center justify-center mb-3">
              <Coins className="w-5 h-5" />
            </div>
            <div className="text-xs text-zinc-500 font-semibold mb-0.5">Total Commission Collected</div>
            <div className="text-2xl font-black text-zinc-700">
              {formatCurrency(metrics.totalCommissionCollected)}
            </div>
            <div className="text-[11px] text-zinc-400 mt-0.5">5% Fee from Digital & Cash Dues</div>
          </div>

          {/* Outstanding Worker Cash Dues */}
          <div className="kpi-card border-l-4 border-l-amber-500">
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-3">
              <IndianRupee className="w-5 h-5" />
            </div>
            <div className="text-xs text-zinc-500 font-semibold mb-0.5">Outstanding Worker Cash Dues</div>
            <div className="text-2xl font-black text-amber-600">
              {formatCurrency(metrics.totalOutstandingWorkerDues)}
            </div>
            <div className="text-[11px] text-zinc-400 mt-0.5">
              {metrics.suspendedArtisans > 0 ? ` ${metrics.suspendedArtisans} Artisans Suspended` : 'All workers within ₹300 limit'}
            </div>
          </div>

          {/* Active Artisans & Welfare Pool */}
          <div className="kpi-card border-l-4 border-l-violet-600">
            <div className="w-9 h-9 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center mb-3">
              <Users className="w-5 h-5" />
            </div>
            <div className="text-xs text-zinc-500 font-semibold mb-0.5">Active Village Artisans</div>
            <div className="text-2xl font-black text-violet-600">
              {metrics.activeArtisans} <span className="text-xs font-normal text-zinc-400">({metrics.verifiedArtisans} Verified)</span>
            </div>
            <div className="text-[11px] text-zinc-400 mt-0.5">
              Welfare Pool: {formatCurrency(metrics.welfareFundBalance)}
            </div>
          </div>
        </div>

        {/* Section 1: Trade Category Base Price Management */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <IndianRupee className="w-5 h-5 text-zinc-700" />
              <h2 className="text-base font-black text-slate-900">Trade Category Base Diagnostic Price Matrix</h2>
            </div>
            <p className="text-xs text-zinc-500">Admin-controlled standard base prices (₹) across village cluster trades</p>
          </div>

          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-zinc-200 bg-zinc-50 text-slate-600 font-bold uppercase tracking-wider text-left">
                    <th className="px-4 py-3">Trade / Service Name</th>
                    <th className="px-4 py-3">Category</th>
                    <th className="px-4 py-3">Standard Duration</th>
                    <th className="px-4 py-3">Standard Base Rate (₹)</th>
                    <th className="px-4 py-3 text-right">Admin Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {services.map((svc) => (
                    <tr key={svc.id} className="hover:bg-zinc-50/70 transition-colors">
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2.5">
                          <span className="text-xl">{svc.icon}</span>
                          <span className="font-bold text-slate-900 text-sm">{svc.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="px-2 py-0.5 rounded-full bg-zinc-50 border border-blue-100 text-blue-700 font-bold text-[10px]">
                          {svc.category}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-slate-600 font-medium">
                        {svc.duration}
                      </td>
                      <td className="px-4 py-3.5">
                        {editingServiceId === svc.id ? (
                          <div className="flex items-center gap-1">
                            <span className="text-xs font-bold text-zinc-500">₹</span>
                            <input
                              type="number"
                              className="form-input w-28 py-1 px-2 text-xs font-bold"
                              value={editPriceValue}
                              onChange={(e) => setEditPriceValue(e.target.value)}
                              autoFocus
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') saveEditPrice(svc.id);
                                if (e.key === 'Escape') setEditingServiceId(null);
                              }}
                            />
                          </div>
                        ) : (
                          <span className="font-black text-slate-900 text-sm">{formatCurrency(svc.basePrice || svc.price)}</span>
                        )}
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        {editingServiceId === svc.id ? (
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => setEditingServiceId(null)}
                              className="btn-secondary py-1 px-2 text-xs"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => saveEditPrice(svc.id)}
                              className="btn-success py-1 px-2.5 text-xs font-bold"
                            >
                              <Save className="w-3.5 h-3.5" /> Save Rate
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => startEditPrice(svc)}
                            className="btn-secondary py-1 px-2.5 text-xs font-bold inline-flex items-center gap-1"
                          >
                            <Edit3 className="w-3 h-3" /> Edit Base Price
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Section 2: Worker Dues, Status & Suspension Governance Table */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-zinc-700" />
              <h2 className="text-base font-black text-slate-900">Artisan Cash Commission Dues & Suspension Ledger</h2>
            </div>
            <span className="text-xs text-zinc-500">Automated pause threshold: ₹300</span>
          </div>

          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-zinc-200 bg-zinc-50 text-slate-600 font-bold uppercase tracking-wider text-left">
                    <th className="px-4 py-3">Artisan Name & Contact</th>
                    <th className="px-4 py-3">Trade</th>
                    <th className="px-4 py-3">3-Factor Performance</th>
                    <th className="px-4 py-3">Outstanding Dues (₹)</th>
                    <th className="px-4 py-3">Account Status</th>
                    <th className="px-4 py-3 text-right">Administrative Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {workers.map((w) => {
                    const dues = w.outstandingDues || 0;
                    const isSuspended = w.accountStatus === 'SUSPENDED_UNPAID_DUES' || dues >= 300;

                    return (
                      <tr key={w.id} className="hover:bg-zinc-50/70 transition-colors">
                        <td className="px-4 py-3.5">
                          <div className="font-bold text-slate-900 text-sm">{w.name}</div>
                          <div className="text-zinc-400 text-[11px]">{w.phone} · {w.email}</div>
                        </td>
                        <td className="px-4 py-3.5 font-semibold text-slate-700">
                          {w.trade}
                        </td>
                        <td className="px-4 py-3.5 space-y-0.5">
                          <div> Quality: <strong>{(w.qualityRating || 4.9).toFixed(1)}/5</strong></div>
                          <div> Behavior: <strong>{(w.behaviorRating || 4.8).toFixed(1)}/5</strong></div>
                          <div className="text-emerald-700 font-bold">ðŸ·ï¸ Pricing: <strong>{(w.pricingRating || 4.9).toFixed(1)}/5</strong> ({w.fairPricingPercentage || 98}%)</div>
                        </td>
                        <td className="px-4 py-3.5">
                          <span className={`text-sm font-black ${dues >= 300 ? 'text-zinc-700' : 'text-slate-900'}`}>
                            {formatCurrency(dues)}
                          </span>
                          {dues >= 300 && (
                            <span className="text-[10px] text-zinc-700 block font-bold">Exceeds limit</span>
                          )}
                        </td>
                        <td className="px-4 py-3.5">
                          <span className={getBadgeClass(isSuspended ? 'SUSPENDED_UNPAID_DUES' : 'ACTIVE')}>
                            {getStatusReadableLabel(isSuspended ? 'SUSPENDED_UNPAID_DUES' : 'ACTIVE')}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 text-right">
                          {dues > 0 ? (
                            <button
                              onClick={() => handleClearWorkerDues(w.userId, w.name)}
                              className="btn-success text-xs py-1 px-3 font-bold shadow-sm"
                            >
                              Clear Dues & Unsuspend
                            </button>
                          ) : (
                            <span className="text-zinc-400 text-[11px] font-medium">— No Dues</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Section 3: Worker KYC Verification Desk */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BadgeCheck className="w-5 h-5 text-zinc-700" />
              <h2 className="text-base font-black text-slate-900">Worker KYC Review & Verification Desk</h2>
            </div>
            {metrics.pendingKyc > 0 && (
              <span className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-bold flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5" /> {metrics.pendingKyc} Pending Review
              </span>
            )}
          </div>

          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-zinc-200 bg-zinc-50 text-slate-600 font-bold uppercase tracking-wider text-left">
                    <th className="px-4 py-3">Artisan Details</th>
                    <th className="px-4 py-3">Primary Trade & Skills</th>
                    <th className="px-4 py-3">Sample Identity Card</th>
                    <th className="px-4 py-3">Completed Services</th>
                    <th className="px-4 py-3">Verification Status</th>
                    <th className="px-4 py-3 text-right">Committee Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {workers.map((w) => (
                    <tr key={w.id} className="hover:bg-zinc-50/70 transition-colors">
                      <td className="px-4 py-3.5">
                        <div className="font-bold text-slate-900 text-sm">{w.name}</div>
                        <div className="text-zinc-400 text-[11px]">{w.phone} · {w.email}</div>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="font-semibold text-slate-700">{w.trade || 'Technician'}</div>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {w.skills.slice(0, 2).map((sk) => (
                            <span key={sk} className="text-[10px] bg-zinc-50 text-blue-700 px-1.5 py-0.5 rounded border border-blue-100">
                              {sk}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <button
                          onClick={() => setSelectedWorkerKyc(w)}
                          className="flex items-center gap-2 p-1.5 bg-zinc-50/80 hover:bg-blue-100/80 dark:bg-zinc-800 dark:hover:bg-slate-700 rounded-lg border border-zinc-200 dark:border-slate-700 transition-all text-left group"
                        >
                          <div className="w-8 h-8 rounded bg-zinc-950 text-white flex items-center justify-center font-bold text-xs shadow-sm">
                            {w.name.charAt(0)}
                          </div>
                          <div>
                            <div className="font-bold text-blue-900 dark:text-blue-300 text-[11px] flex items-center gap-1">
                              <span>Preview ID Card</span>
                              <Eye className="w-3 h-3 text-zinc-700 dark:text-zinc-300 group-hover:scale-110 transition-transform" />
                            </div>
                            <span className="text-[10px] text-blue-700 dark:text-zinc-400 truncate block max-w-[110px]">
                              {w.kycDocName || 'identity_card.pdf'}
                            </span>
                          </div>
                        </button>
                      </td>
                      <td className="px-4 py-3.5 font-bold text-zinc-800 dark:text-zinc-200">
                        {w.completedJobs} Jobs
                      </td>
                      <td className="px-4 py-3.5">
                        <span className={getBadgeClass(w.kycStatus)}>
                          {w.kycStatus}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        {updatingKycId === w.userId ? (
                          <Loader2 className="w-4 h-4 animate-spin text-zinc-700 dark:text-zinc-300 inline" />
                        ) : w.kycStatus === 'PENDING' ? (
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleKycAction(w.userId, 'REJECTED')}
                              className="btn-danger text-xs py-1 px-2.5 font-bold"
                            >
                              <XCircle className="w-3.5 h-3.5" /> Reject
                            </button>
                            <button
                              onClick={() => handleKycAction(w.userId, 'VERIFIED')}
                              className="btn-success text-xs py-1 px-3 font-bold shadow-sm"
                            >
                              <CheckCircle className="w-3.5 h-3.5" /> Approve KYC
                            </button>
                          </div>
                        ) : (
                          <span className="text-zinc-400 dark:text-zinc-500 text-[11px] font-medium">— Verified</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </main>

      {/* Sample Identity Card Preview Modal */}
      {selectedWorkerKyc && (
        <div className="modal-backdrop" onClick={() => setSelectedWorkerKyc(null)}>
          <div className="modal-box p-6 space-y-5" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <BadgeCheck className="w-5 h-5 text-zinc-700" />
                <h3 className="font-bold text-slate-900 text-sm">Artisan KYC Identity Card</h3>
              </div>
              <button onClick={() => setSelectedWorkerKyc(null)} className="p-1 rounded hover:bg-zinc-100">
                <X className="w-4 h-4 text-zinc-400" />
              </button>
            </div>

            <div className="rounded-2xl border-2 border-blue-300 dark:border-blue-700 bg-gradient-to-b from-white to-blue-50/50 dark:from-slate-900 dark:to-blue-950/40 p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-blue-100 dark:border-blue-900/60">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-zinc-950 flex items-center justify-center text-white text-xs font-black">
                    <Leaf className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-black text-zinc-900 dark:text-zinc-50 text-xs tracking-tight">PRIMARY COOPERATIVE SERVICES SOCIETY</div>
                    <div className="text-[10px] text-zinc-500 font-medium">District Cooperative Federation · Artisan Registry Card</div>
                  </div>
                </div>
                <div className="px-2 py-0.5 rounded bg-zinc-950 text-white font-mono text-[10px] font-bold">
                  PASS-2026
                </div>
              </div>

              <div className="flex gap-4 items-center">
                <div className="w-16 h-16 rounded-xl bg-zinc-950 text-white flex flex-col items-center justify-center font-black text-xl shadow-md shrink-0 border-2 border-white dark:border-slate-800">
                  {selectedWorkerKyc.name.charAt(0)}
                  <span className="text-[9px] font-normal opacity-75 uppercase mt-0.5">Artisan</span>
                </div>

                <div className="space-y-1 flex-1">
                  <div className="font-black text-zinc-900 dark:text-zinc-50 text-base leading-none">{selectedWorkerKyc.name}</div>
                  <div className="text-xs font-bold text-blue-700 dark:text-blue-400">{selectedWorkerKyc.trade || 'General Maintenance'}</div>
                  <div className="text-[11px] text-zinc-500 font-mono">Reg No: PACS-ART-{selectedWorkerKyc.userId.slice(-6).toUpperCase()}</div>
                  <div className="text-[11px] text-zinc-500">Contact: {selectedWorkerKyc.phone || '9876543210'} · {selectedWorkerKyc.email}</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 bg-white dark:bg-zinc-900/90 p-3 rounded-xl border border-blue-100 dark:border-blue-900/60 text-xs">
                <div>
                  <span className="text-[10px] text-zinc-400 dark:text-zinc-500 block font-semibold">Verified Trade Skills</span>
                  <span className="font-bold text-zinc-800 dark:text-zinc-200 text-[11px]">{selectedWorkerKyc.skills.join(', ')}</span>
                </div>
                <div>
                  <span className="text-[10px] text-zinc-400 dark:text-zinc-500 block font-semibold">Document Reference</span>
                  <span className="font-mono text-zinc-700 dark:text-zinc-300 font-bold text-[11px] truncate block">
                    {selectedWorkerKyc.kycDocName || 'identity_document.pdf'}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between text-[11px] pt-1 text-zinc-500">
                <div className="flex items-center gap-1.5">
                  <BadgeCheck className="w-4 h-4 text-zinc-700 dark:text-zinc-300" />
                  <span>Current Committee Status: <strong className="text-zinc-900 dark:text-zinc-50">{selectedWorkerKyc.kycStatus}</strong></span>
                </div>
                <span className="text-emerald-700 dark:text-zinc-300 font-bold"> Direct Payouts Active</span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
              <button
                onClick={() => setSelectedWorkerKyc(null)}
                className="btn-secondary text-xs py-2 px-4 font-bold"
              >
                Close Preview
              </button>

              <div className="flex items-center gap-2">
                {selectedWorkerKyc.kycStatus === 'PENDING' ? (
                  <>
                    <button
                      onClick={() => handleKycAction(selectedWorkerKyc.userId, 'REJECTED')}
                      className="btn-danger text-xs py-2 px-3 font-bold"
                    >
                      <XCircle className="w-3.5 h-3.5" /> Reject KYC
                    </button>
                    <button
                      onClick={() => handleKycAction(selectedWorkerKyc.userId, 'VERIFIED')}
                      className="btn-success text-xs py-2 px-4 font-bold shadow-sm"
                    >
                      <CheckCircle className="w-3.5 h-3.5" /> Approve KYC Document
                    </button>
                  </>
                ) : (
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200 flex items-center gap-1">
                    <CheckCircle className="w-4 h-4" /> KYC Document Verified
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-white border-t border-zinc-200 py-4 mt-8">
        <div className="max-w-7xl mx-auto px-4 text-center text-xs text-zinc-400">
          PACS Governance Console · Primary Cooperative Services Society System
        </div>
      </footer>
    </div>
  );
}

