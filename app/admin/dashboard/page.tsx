'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  Shield, LogOut, Users, CalendarDays, Coins, BadgeCheck,
  CheckCircle, XCircle, Loader2, AlertTriangle, IndianRupee,
  TrendingUp, FileText, Save, X, Edit3, Leaf, Eye, Building2,
  Check, User, QrCode
} from 'lucide-react';
import ThemeToggle from '@/components/ThemeToggle';
import dataService, { WorkerProfile, Service, Society } from '@/lib/dataService';
import { formatCurrency, getBadgeClass } from '@/lib/utils';

export default function AdminDashboardPage() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [workers, setWorkers] = useState<WorkerProfile[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [society, setSociety] = useState<Society | null>(null);
  const [metrics, setMetrics] = useState({
    totalVolume: 0,
    activeArtisans: 0,
    verifiedArtisans: 0,
    pendingKyc: 0,
    totalCompletedJobs: 0,
    welfareFundBalance: 0,
  });
  const [loading, setLoading] = useState(true);
  const [updatingKycId, setUpdatingKycId] = useState<string | null>(null);
  const [editingServiceId, setEditingServiceId] = useState<string | null>(null);
  const [editPriceValue, setEditPriceValue] = useState('');
  const [selectedWorkerKyc, setSelectedWorkerKyc] = useState<WorkerProfile | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Membership Pass Governance States
  const [isEditingPassRates, setIsEditingPassRates] = useState(false);
  const [monthlyRateInput, setMonthlyRateInput] = useState('69');
  const [yearlyRateInput, setYearlyRateInput] = useState('599');
  const [savingPassRates, setSavingPassRates] = useState(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Auth Guard
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const isAuthed = sessionStorage.getItem('pacs_admin_auth') === 'true';
      if (!isAuthed) {
        router.replace('/admin/login');
        return;
      }
      setIsAuthenticated(true);
    }
  }, [router]);

  // Load Administrative Data
  const fetchData = useCallback(() => {
    const soc = dataService.getSociety();
    setSociety(soc);

    const svcs = dataService.getServices();
    setServices(svcs || []);

    const met = dataService.getPlatformMetrics();
    setMetrics(met);

    const wkrs = dataService.getWorkers();
    setWorkers(wkrs || []);

    setLoading(false);
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      fetchData();
    }
  }, [isAuthenticated, fetchData]);

  // Real-time polling for admin dashboard metrics
  useEffect(() => {
    if (!isAuthenticated) return;
    const interval = setInterval(fetchData, 3000);
    return () => clearInterval(interval);
  }, [isAuthenticated, fetchData]);

  function handleSignOut() {
    sessionStorage.removeItem('pacs_admin_auth');
    router.push('/admin/login');
  }

  async function handleKycAction(userId: string, action: 'VERIFIED' | 'REJECTED') {
    setUpdatingKycId(userId);
    setTimeout(() => {
      dataService.updateWorker(userId, { kycStatus: action });
      showToast(
        action === 'VERIFIED'
          ? '✓ Worker KYC Approved. ₹250 pass credit contributed to Welfare Pool.'
          : '✓ Worker KYC Rejected.'
      );
      fetchData();
      if (selectedWorkerKyc && selectedWorkerKyc.userId === userId) {
        setSelectedWorkerKyc(null);
      }
      setUpdatingKycId(null);
    }, 300);
  }

  function startEditPrice(svc: Service) {
    setEditingServiceId(svc.id);
    setEditPriceValue(svc.price.toString());
  }

  async function saveEditPrice(serviceId: string) {
    const numPrice = parseFloat(editPriceValue);
    if (isNaN(numPrice) || numPrice <= 0) return;

    dataService.updateServicePrice(serviceId, numPrice);
    setServices((prev) =>
      prev.map((s) => (s.id === serviceId ? { ...s, price: numPrice } : s))
    );
    showToast('✓ Village Cluster Service Rate successfully updated.');
    setEditingServiceId(null);
    fetchData();
  }

  // Synchronize pass rate input fields when society loads (only if not actively editing)
  useEffect(() => {
    if (society && !isEditingPassRates) {
      setMonthlyRateInput(society.monthlyPassRate?.toString() || '69');
      setYearlyRateInput(society.yearlyPassRate?.toString() || '599');
    }
  }, [society, isEditingPassRates]);

  async function savePassRates() {
    const monthly = parseFloat(monthlyRateInput);
    const yearly = parseFloat(yearlyRateInput);

    if (isNaN(monthly) || monthly <= 0 || isNaN(yearly) || yearly <= 0) {
      showToast('❌ Please enter valid positive subscription rates.');
      return;
    }

    setSavingPassRates(true);
    setTimeout(() => {
      const updated = dataService.updateSocietyPassRates(monthly, yearly);
      setSociety(updated);
      setIsEditingPassRates(false);
      setSavingPassRates(false);
      showToast(`✓ Worker Membership Pass Rates updated: Monthly ₹${monthly}, Yearly ₹${yearly}`);
      fetchData();
    }, 300);
  }

  if (!isAuthenticated) return null;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Top Administrative Navigation */}
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center text-white">
              <Leaf className="w-4 h-4" />
            </div>
            <div>
              <span className="font-black text-slate-900 text-lg leading-none block">
                SahakarGig
              </span>
              <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                PACS Governance & Admin Desk
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 text-xs font-bold text-blue-700 dark:text-blue-300">
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
        <div className="flex flex-wrap items-center justify-between gap-4 pb-2 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-2 text-blue-600 text-xs font-bold uppercase tracking-wider mb-1">
              <Building2 className="w-4 h-4" /> District Cooperative Federation Cluster
            </div>
            <h1 className="text-2xl font-black text-slate-900">
              {society?.name || 'Primary Cooperative Services Society'}
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Registration No: {society?.registrationNo || 'PACS/DCF/2021/089'} · {society?.district || 'Central District'}, {society?.state || 'State Federation'}
            </p>
          </div>
        </div>

        {/* Action Toast Alert */}
        {toastMessage && (
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2 shadow-sm animate-fadein">
            <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Real-time Dynamic KPI Metric Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="kpi-card border-l-4 border-l-blue-600">
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-3">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div className="text-xs text-slate-500 font-semibold mb-0.5">Total Platform Volume</div>
            <div className="text-2xl font-black text-blue-600">
              {formatCurrency(metrics.totalVolume)}
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">Aggregated completed jobs sum</div>
          </div>

          <div className="kpi-card border-l-4 border-l-emerald-600">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3">
              <Users className="w-5 h-5" />
            </div>
            <div className="text-xs text-slate-500 font-semibold mb-0.5">Active Village Artisans</div>
            <div className="text-2xl font-black text-emerald-600">
              {metrics.activeArtisans} <span className="text-xs font-normal text-slate-400">({metrics.verifiedArtisans} Verified)</span>
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">Registered trade partners</div>
          </div>

          <div className="kpi-card border-l-4 border-l-violet-600">
            <div className="w-9 h-9 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center mb-3">
              <Coins className="w-5 h-5" />
            </div>
            <div className="text-xs text-slate-500 font-semibold mb-0.5">Community Welfare Reserve</div>
            <div className="text-2xl font-black text-violet-600">
              {formatCurrency(metrics.welfareFundBalance)}
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">Healthcare & emergency pool</div>
          </div>

          <div className="kpi-card border-l-4 border-l-amber-500">
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-3">
              <CalendarDays className="w-5 h-5" />
            </div>
            <div className="text-xs text-slate-500 font-semibold mb-0.5">Completed Cluster Jobs</div>
            <div className="text-2xl font-black text-amber-600">
              {metrics.totalCompletedJobs}
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">Delivered with 0% cut</div>
          </div>
        </div>

        {/* Section: Worker KYC Verification Desk with Sample ID Previews */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BadgeCheck className="w-5 h-5 text-blue-600" />
              <h2 className="text-base font-black text-slate-900">Worker KYC Review & Verification Desk</h2>
            </div>
            {metrics.pendingKyc > 0 && (
              <span className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-bold flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5" /> {metrics.pendingKyc} Pending Review
              </span>
            )}
          </div>

          <div className="card overflow-hidden">
            {loading ? (
              <div className="py-12 flex justify-center">
                <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 font-bold uppercase tracking-wider text-left">
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
                      <tr key={w.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="px-4 py-3.5">
                          <div className="font-bold text-slate-900 text-sm">{w.name}</div>
                          <div className="text-slate-400 text-[11px]">{w.phone} · {w.email}</div>
                        </td>
                        <td className="px-4 py-3.5">
                          <div className="font-semibold text-slate-700">{w.trade || 'Technician'}</div>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {w.skills.slice(0, 2).map((sk) => (
                              <span key={sk} className="text-[10px] bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded border border-blue-100">
                                {sk}
                              </span>
                            ))}
                            {w.skills.length > 2 && (
                              <span className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded">
                                +{w.skills.length - 2}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3.5">
                          {/* Sample Identity Card Thumbnail Button */}
                          <button
                            onClick={() => setSelectedWorkerKyc(w)}
                            className="flex items-center gap-2 p-1.5 bg-blue-50/80 hover:bg-blue-100/80 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-lg border border-blue-200 dark:border-slate-700 transition-all text-left group"
                          >
                            <div className="w-8 h-8 rounded bg-gradient-to-br from-blue-600 to-blue-800 text-white flex items-center justify-center font-bold text-xs shadow-sm">
                              {w.name.charAt(0)}
                            </div>
                            <div>
                              <div className="font-bold text-blue-900 dark:text-blue-300 text-[11px] flex items-center gap-1">
                                <span>Preview ID Card</span>
                                <Eye className="w-3 h-3 text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform" />
                              </div>
                              <span className="text-[10px] text-blue-700 dark:text-slate-400 truncate block max-w-[110px]">
                                {w.kycDocName || 'identity_card.pdf'}
                              </span>
                            </div>
                          </button>
                        </td>
                        <td className="px-4 py-3.5 font-bold text-slate-800 dark:text-slate-200">
                          {w.completedJobs} Jobs
                        </td>
                        <td className="px-4 py-3.5">
                          <span className={getBadgeClass(w.kycStatus)}>
                            {w.kycStatus}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 text-right">
                          {updatingKycId === w.userId ? (
                            <Loader2 className="w-4 h-4 animate-spin text-blue-600 dark:text-blue-400 inline" />
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
                            <span className="text-slate-400 dark:text-slate-500 text-[11px] font-medium">— Verified</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>

        {/* Section: Village Cluster Service Price Configuration */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <IndianRupee className="w-5 h-5 text-blue-600" />
              <h2 className="text-base font-black text-slate-900">Village Cluster Standard Service Rates</h2>
            </div>
            <p className="text-xs text-slate-500">Board-governed flat price matrix for household bookings</p>
          </div>

          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 font-bold uppercase tracking-wider text-left">
                    <th className="px-4 py-3">Service Name</th>
                    <th className="px-4 py-3">Category</th>
                    <th className="px-4 py-3">Standard Duration</th>
                    <th className="px-4 py-3">Fixed Rate (₹)</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {services.map((svc) => (
                    <tr key={svc.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2.5">
                          <span className="text-xl">{svc.icon}</span>
                          <span className="font-bold text-slate-900 text-sm">{svc.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="px-2 py-0.5 rounded-full bg-blue-50 border border-blue-100 text-blue-700 font-bold text-[10px]">
                          {svc.category}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-slate-600 font-medium">
                        {svc.duration}
                      </td>
                      <td className="px-4 py-3.5">
                        {editingServiceId === svc.id ? (
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
                        ) : (
                          <span className="font-black text-slate-900 text-sm">{formatCurrency(svc.price)}</span>
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
                              <Save className="w-3.5 h-3.5" /> Save
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => startEditPrice(svc)}
                            className="btn-secondary py-1 px-2.5 text-xs font-bold inline-flex items-center gap-1"
                          >
                            <Edit3 className="w-3 h-3" /> Edit Rate
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

        {/* Section: Worker Membership Pass Rates & Governance Configuration */}
        <section className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <Coins className="w-5 h-5 text-emerald-600" />
                <h2 className="text-base font-black text-slate-900">Worker Membership Pass Rates & Governance</h2>
              </div>
              <p className="text-xs text-slate-500">Board-governed flat worker pass fees enabling 0% commission gig access</p>
            </div>

            {isEditingPassRates ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setIsEditingPassRates(false);
                    setMonthlyRateInput(society?.monthlyPassRate?.toString() || '69');
                    setYearlyRateInput(society?.yearlyPassRate?.toString() || '599');
                  }}
                  className="btn-secondary text-xs py-1.5 px-3 font-bold"
                  disabled={savingPassRates}
                >
                  <X className="w-3.5 h-3.5" /> Cancel
                </button>
                <button
                  onClick={savePassRates}
                  className="btn-success text-xs py-1.5 px-4 font-bold shadow-sm flex items-center gap-1.5"
                  disabled={savingPassRates}
                >
                  {savingPassRates ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                  Save Pass Rates
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsEditingPassRates(true)}
                className="btn-secondary text-xs py-1.5 px-3 font-bold flex items-center gap-1.5"
              >
                <Edit3 className="w-3.5 h-3.5 text-blue-600" />
                Modify Subscription Rates
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Monthly Pass Card */}
            <div className="card p-5 border-l-4 border-l-blue-600 bg-white dark:bg-slate-900 space-y-3 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded-full border border-blue-200 dark:border-blue-800">
                    Monthly Membership Pass
                  </span>
                  <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">30 Days Unlimited Dispatching & 0% Cut</div>
                </div>
                <div className="w-8 h-8 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-xs">
                  30d
                </div>
              </div>

              <div className="pt-2 flex items-baseline justify-between border-t border-slate-100 dark:border-slate-800">
                <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold">Active Member Fee:</span>
                {isEditingPassRates ? (
                  <div className="flex items-center gap-1">
                    <span className="text-xs font-bold text-slate-400 dark:text-slate-500">₹</span>
                    <input
                      type="number"
                      className="form-input w-24 py-1 px-2 text-sm font-black text-blue-600 dark:text-blue-400 text-right"
                      value={monthlyRateInput}
                      onChange={(e) => setMonthlyRateInput(e.target.value)}
                      placeholder="69"
                      min="1"
                    />
                    <span className="text-xs text-slate-400 dark:text-slate-500">/mo</span>
                  </div>
                ) : (
                  <div className="text-xl font-black text-blue-600 dark:text-blue-400">
                    {formatCurrency(society?.monthlyPassRate || 69)} <span className="text-xs font-normal text-slate-400 dark:text-slate-500">/month</span>
                  </div>
                )}
              </div>
            </div>

            {/* Yearly Pass Card */}
            <div className="card p-5 border-l-4 border-l-emerald-600 bg-white dark:bg-slate-900 space-y-3 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                    Annual / Yearly Pass (Best Value)
                  </span>
                  <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">365 Days Guaranteed Access & Emergency Pool</div>
                </div>
                <div className="w-8 h-8 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-xs">
                  365d
                </div>
              </div>

              <div className="pt-2 flex items-baseline justify-between border-t border-slate-100 dark:border-slate-800">
                <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold">Active Member Fee:</span>
                {isEditingPassRates ? (
                  <div className="flex items-center gap-1">
                    <span className="text-xs font-bold text-slate-400 dark:text-slate-500">₹</span>
                    <input
                      type="number"
                      className="form-input w-24 py-1 px-2 text-sm font-black text-emerald-600 dark:text-emerald-400 text-right"
                      value={yearlyRateInput}
                      onChange={(e) => setYearlyRateInput(e.target.value)}
                      placeholder="599"
                      min="1"
                    />
                    <span className="text-xs text-slate-400 dark:text-slate-500">/yr</span>
                  </div>
                ) : (
                  <div className="text-xl font-black text-emerald-600 dark:text-emerald-400">
                    {formatCurrency(society?.yearlyPassRate || 599)} <span className="text-xs font-normal text-slate-400 dark:text-slate-500">/year</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="p-3.5 bg-blue-50/60 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900 rounded-xl text-xs text-blue-900 dark:text-blue-300 flex items-center gap-2">
            <Shield className="w-4 h-4 text-blue-600 shrink-0" />
            <span>
              <strong>Cooperative Governance Policy:</strong> 100% of worker membership subscription inflows are automatically routed to the <strong>Primary Cooperative Society Welfare Reserve</strong> to fund artisan healthcare insurance and emergency safety nets.
            </span>
          </div>
        </section>
      </main>

      {/* ── Sample Identity Card Preview Modal ── */}
      {selectedWorkerKyc && (
        <div className="modal-backdrop" onClick={() => setSelectedWorkerKyc(null)}>
          <div className="modal-box p-6 space-y-5" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <BadgeCheck className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-slate-900 text-sm">Artisan KYC Identity Card</h3>
              </div>
              <button onClick={() => setSelectedWorkerKyc(null)} className="p-1 rounded hover:bg-slate-100">
                <X className="w-4 h-4 text-slate-400" />
              </button>
            </div>

            {/* Simulated Government / Cooperative Identity Badge Card */}
            <div className="rounded-2xl border-2 border-blue-300 dark:border-blue-700 bg-gradient-to-b from-white to-blue-50/50 dark:from-slate-900 dark:to-blue-950/40 p-5 shadow-sm space-y-4">
              {/* Card Header */}
              <div className="flex items-center justify-between pb-3 border-b border-blue-100 dark:border-blue-900/60">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center text-white text-xs font-black">
                    <Leaf className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-black text-slate-900 dark:text-slate-100 text-xs tracking-tight">PRIMARY COOPERATIVE SERVICES SOCIETY</div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">District Cooperative Federation · Artisan Registry Card</div>
                  </div>
                </div>
                <div className="px-2 py-0.5 rounded bg-blue-600 text-white font-mono text-[10px] font-bold">
                  PASS-2026
                </div>
              </div>

              {/* Card Body with Avatar & Bio */}
              <div className="flex gap-4 items-center">
                <div className="w-16 h-16 rounded-xl bg-gradient-to-tr from-blue-700 to-indigo-600 text-white flex flex-col items-center justify-center font-black text-xl shadow-md shrink-0 border-2 border-white dark:border-slate-800">
                  {selectedWorkerKyc.name.charAt(0)}
                  <span className="text-[9px] font-normal opacity-75 uppercase mt-0.5">Artisan</span>
                </div>

                <div className="space-y-1 flex-1">
                  <div className="font-black text-slate-900 dark:text-slate-100 text-base leading-none">{selectedWorkerKyc.name}</div>
                  <div className="text-xs font-bold text-blue-700 dark:text-blue-400">{selectedWorkerKyc.trade || 'General Maintenance'}</div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">Reg No: PACS-ART-{selectedWorkerKyc.userId.slice(-6).toUpperCase()}</div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">Contact: {selectedWorkerKyc.phone || '9876543210'} · {selectedWorkerKyc.email}</div>
                </div>
              </div>

              {/* Skills & Validity */}
              <div className="grid grid-cols-2 gap-2 bg-white dark:bg-slate-900/90 p-3 rounded-xl border border-blue-100 dark:border-blue-900/60 text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 block font-semibold">Verified Trade Skills</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200 text-[11px]">{selectedWorkerKyc.skills.join(', ')}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 block font-semibold">Document Reference</span>
                  <span className="font-mono text-blue-600 dark:text-blue-400 font-bold text-[11px] truncate block">
                    {selectedWorkerKyc.kycDocName || 'identity_document.pdf'}
                  </span>
                </div>
              </div>

              {/* Committee Verification Seal */}
              <div className="flex items-center justify-between text-[11px] pt-1 text-slate-500 dark:text-slate-400">
                <div className="flex items-center gap-1.5">
                  <BadgeCheck className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <span>Current Committee Status: <strong className="text-slate-900 dark:text-slate-100">{selectedWorkerKyc.kycStatus}</strong></span>
                </div>
                <span className="text-emerald-700 dark:text-emerald-400 font-bold">✓ Direct Payouts Active</span>
              </div>
            </div>

            {/* Modal Actions */}
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
      <footer className="bg-white border-t border-slate-200 py-4 mt-8">
        <div className="max-w-7xl mx-auto px-4 text-center text-xs text-slate-400">
          PACS Governance Console · Primary Cooperative Services Society System
        </div>
      </footer>
    </div>
  );
}
