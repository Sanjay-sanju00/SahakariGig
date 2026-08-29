// Unified Client & Multi-Device Cloud Sync Data Engine for SahakarGig
// Supports LocalStorage persistence + Multi-Device Real-Time Cloud Synchronization
'use client';

export type Role = 'CUSTOMER' | 'WORKER' | 'ADMIN';
export type KycStatus = 'PENDING' | 'VERIFIED' | 'REJECTED';

export type BookingStatus =
  | 'PENDING_ACCEPTANCE'
  | 'IN_PROGRESS'
  | 'AWAITING_PAYMENT'
  | 'COMPLETED_PAID_DIGITALLY'
  | 'COMPLETED_PAID_CASH'
  | 'COMPLETED'
  | 'CANCELLED';

export type PaymentStatus = 'PENDING' | 'PAID_DIGITAL' | 'PAID_CASH' | 'PAID';

export interface Society {
  id: string;
  name: string;
  registrationNo: string;
  district: string;
  state: string;
  welfareFundBalance: number;
  monthlyPassRate: number;
  yearlyPassRate: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  phone?: string;
  role: Role;
  address?: string;
  trade?: string;
  localSociety?: string;
  kycDocName?: string;
  isVerified: boolean;
  createdAt: string;
}

export interface WorkerProfile {
  id: string;
  userId: string;
  name: string;
  email: string;
  phone?: string;
  trade?: string;
  localSociety?: string;
  skills: string[];
  bio: string;
  isAvailable: boolean;
  kycStatus: KycStatus;
  kycDocName?: string;
  subscriptionPlan?: 'MONTHLY' | 'YEARLY';
  passValidUntil: string;
  totalEarnings: number;
  digitalEarnings: number;
  cashEarnings: number;
  completedJobs: number;
  rating: number;
  ratingsCount?: number;
}

export interface Service {
  id: string;
  name: string;
  category: string;
  description: string;
  price: number;
  icon: string;
  duration: string;
}

export interface Booking {
  id: string;
  customerId: string;
  customerName: string;
  customerPhone?: string;
  customerAddress: string;
  workerId?: string;
  workerName?: string;
  serviceId: string;
  serviceName: string;
  problemDescription?: string;
  status: BookingStatus;
  scheduledDate: string;
  address: string;
  totalAmount: number;
  paymentStatus: PaymentStatus;
  paymentMethod?: 'DIGITAL' | 'CASH';
  createdAt: string;
  acceptedAt?: string;
  settlementRequestedAt?: string;
  paidAt?: string;
  completedAt?: string;
  reviewRating?: number;
  reviewComment?: string;
  reviewedAt?: string;
}

// ─── Initial Seed Data ────────────────────────────────────────────────────────
export const seedSociety: Society = {
  id: 'soc-1',
  name: 'Primary Cooperative Services Society',
  registrationNo: 'PACS/DCF/2021/089',
  district: 'Central District Cluster',
  state: 'State Cooperative Federation',
  welfareFundBalance: 52400,
  monthlyPassRate: 69,
  yearlyPassRate: 599,
};

export const seedServices: Service[] = [
  {
    id: 'svc-1',
    name: 'Plumbing & Pipe Repair',
    category: 'Plumbing',
    description: 'Fix leaking taps, pipe washers, drainage clearance, and basic bathroom fixtures.',
    price: 199,
    icon: '🔧',
    duration: '30–45 min',
  },
  {
    id: 'svc-2',
    name: 'Electrical Socket & Switch Fix',
    category: 'Electrical',
    description: 'Repair faulty switches, MCB tripping issues, and household wiring checks.',
    price: 299,
    icon: '⚡',
    duration: '45–60 min',
  },
  {
    id: 'svc-3',
    name: 'Appliance Diagnosis & Repair',
    category: 'Appliance Fix',
    description: 'Inspection and diagnostics for washing machines, water coolers, pumps, and motors.',
    price: 499,
    icon: '🛠️',
    duration: '60–90 min',
  },
  {
    id: 'svc-4',
    name: 'Carpentry & Woodwork Fitting',
    category: 'Carpentry',
    description: 'Door hinges, handle fitting, shelf installation, and minor wooden repairs.',
    price: 399,
    icon: '🪚',
    duration: '60–90 min',
  },
  {
    id: 'svc-5',
    name: 'House Deep Cleaning & Sanitization',
    category: 'Cleaning',
    description: 'Intensive kitchen, bathroom, and household floor deep cleaning.',
    price: 699,
    icon: '🧹',
    duration: '2–3 hrs',
  },
  {
    id: 'svc-6',
    name: 'Ceiling Fan & Fixture Installation',
    category: 'Electrical',
    description: 'Complete ceiling/exhaust fan installation, regulator checks, and balancing.',
    price: 349,
    icon: '🔌',
    duration: '45–60 min',
  },
];

const seedUsers: User[] = [
  {
    id: 'usr-cust-1',
    name: 'Rajesh Verma',
    email: 'rajesh@example.com',
    password: 'password123',
    phone: '9823011223',
    role: 'CUSTOMER',
    address: 'Sector 4, Community Housing Block B',
    isVerified: true,
    createdAt: new Date('2026-08-10').toISOString(),
  },
  {
    id: 'usr-wkr-1',
    name: 'Suresh Patil',
    email: 'suresh@example.com',
    password: 'password123',
    phone: '9845012345',
    role: 'WORKER',
    trade: 'Electrical',
    localSociety: 'Primary Cooperative Services Society',
    kycDocName: 'gov_id_suresh_patil.pdf',
    isVerified: true,
    createdAt: new Date('2026-08-01').toISOString(),
  },
  {
    id: 'usr-wkr-2',
    name: 'Kavita Sharma',
    email: 'kavita@example.com',
    password: 'password123',
    phone: '9867023456',
    role: 'WORKER',
    trade: 'Plumbing',
    localSociety: 'Primary Cooperative Services Society',
    kycDocName: 'kyc_kavita_sharma.jpg',
    isVerified: true,
    createdAt: new Date('2026-08-05').toISOString(),
  },
  {
    id: 'usr-wkr-3',
    name: 'Anil Deshmukh',
    email: 'anil@example.com',
    password: 'password123',
    phone: '9878034567',
    role: 'WORKER',
    trade: 'Carpentry',
    localSociety: 'Primary Cooperative Services Society',
    kycDocName: 'trade_cert_anil.pdf',
    isVerified: true,
    createdAt: new Date('2026-08-15').toISOString(),
  },
];

const seedWorkers: WorkerProfile[] = [
  {
    id: 'wp-1',
    userId: 'usr-wkr-1',
    name: 'Suresh Patil',
    email: 'suresh@example.com',
    phone: '9845012345',
    trade: 'Electrical',
    localSociety: 'Primary Cooperative Services Society',
    skills: ['Wiring', 'Socket Repair', 'Fan Installation', 'MCB Fitting'],
    bio: 'Certified electrician with 7+ years experience in domestic and commercial repairs.',
    isAvailable: true,
    kycStatus: 'VERIFIED',
    kycDocName: 'gov_id_suresh_patil.pdf',
    subscriptionPlan: 'MONTHLY',
    passValidUntil: new Date(Date.now() + 25 * 86400000).toISOString(),
    totalEarnings: 34200,
    digitalEarnings: 28400,
    cashEarnings: 5800,
    completedJobs: 86,
    rating: 4.8,
    ratingsCount: 42,
  },
  {
    id: 'wp-2',
    userId: 'usr-wkr-2',
    name: 'Kavita Sharma',
    email: 'kavita@example.com',
    phone: '9867023456',
    trade: 'Plumbing',
    localSociety: 'Primary Cooperative Services Society',
    skills: ['Tap Repair', 'Pipe Fitting', 'Drainage', 'Tank Cleaning'],
    bio: 'Experienced plumbing technician trained in residential water distribution.',
    isAvailable: false,
    kycStatus: 'PENDING',
    kycDocName: 'kyc_kavita_sharma.jpg',
    subscriptionPlan: 'MONTHLY',
    passValidUntil: new Date(Date.now() - 5 * 86400000).toISOString(),
    totalEarnings: 21500,
    digitalEarnings: 17200,
    cashEarnings: 4300,
    completedJobs: 54,
    rating: 4.6,
    ratingsCount: 28,
  },
  {
    id: 'wp-3',
    userId: 'usr-wkr-3',
    name: 'Anil Deshmukh',
    email: 'anil@example.com',
    phone: '9878034567',
    trade: 'Carpentry',
    localSociety: 'Primary Cooperative Services Society',
    skills: ['Furniture Assembly', 'Door Fitting', 'Wood Polish', 'Shelving'],
    bio: 'Skilled artisan for domestic carpentry, modular fixtures, and restoration.',
    isAvailable: true,
    kycStatus: 'VERIFIED',
    kycDocName: 'trade_cert_anil.pdf',
    subscriptionPlan: 'YEARLY',
    passValidUntil: new Date(Date.now() + 180 * 86400000).toISOString(),
    totalEarnings: 19800,
    digitalEarnings: 15600,
    cashEarnings: 4200,
    completedJobs: 42,
    rating: 4.7,
    ratingsCount: 19,
  },
];

const seedBookings: Booking[] = [
  {
    id: 'bk-101',
    customerId: 'usr-cust-1',
    customerName: 'Rajesh Verma',
    customerPhone: '9823011223',
    customerAddress: 'Sector 4, Community Housing Block B',
    workerId: 'usr-wkr-1',
    workerName: 'Suresh Patil',
    serviceId: 'svc-2',
    serviceName: 'Electrical Socket & Switch Fix',
    problemDescription: 'Living room main switchboard sparking and MCB trips when power points are turned on.',
    status: 'IN_PROGRESS',
    scheduledDate: '2026-08-28T10:00:00Z',
    address: 'Sector 4, Community Housing Block B',
    totalAmount: 299,
    paymentStatus: 'PENDING',
    createdAt: '2026-08-27T08:30:00Z',
    acceptedAt: '2026-08-27T08:35:00Z',
  },
  {
    id: 'bk-102',
    customerId: 'usr-cust-1',
    customerName: 'Rajesh Verma',
    customerPhone: '9823011223',
    customerAddress: 'Sector 4, Community Housing Block B',
    workerId: 'usr-wkr-3',
    workerName: 'Anil Deshmukh',
    serviceId: 'svc-4',
    serviceName: 'Carpentry & Woodwork Fitting',
    problemDescription: 'Main wooden front door hinges loose and scraping against the floor tiles.',
    status: 'COMPLETED_PAID_DIGITALLY',
    scheduledDate: '2026-08-25T09:00:00Z',
    address: 'Sector 4, Community Housing Block B',
    totalAmount: 399,
    paymentStatus: 'PAID_DIGITAL',
    paymentMethod: 'DIGITAL',
    createdAt: '2026-08-24T10:00:00Z',
    acceptedAt: '2026-08-24T10:05:00Z',
    settlementRequestedAt: '2026-08-24T11:00:00Z',
    paidAt: '2026-08-24T11:05:00Z',
    completedAt: '2026-08-24T11:05:00Z',
    reviewRating: 5,
    reviewComment: 'Excellent wood fitting work and very polite artisan!',
    reviewedAt: '2026-08-24T12:00:00Z',
  },
];

// ─── Browser LocalStorage Storage Helper ───────────────────────────────────────
const LS_KEY_USERS = 'sahakar_users';
const LS_KEY_WORKERS = 'sahakar_workers';
const LS_KEY_SERVICES = 'sahakar_services';
const LS_KEY_BOOKINGS = 'sahakar_bookings';
const LS_KEY_SOCIETY = 'sahakar_society';
const LS_KEY_CLOUD_DB = 'sahakar_cloud_db_url';

const DEFAULT_CLOUD_DB = 'https://sahakarigig-default-rtdb.firebaseio.com';

function getItem<T>(key: string, defaultVal: T): T {
  if (typeof window === 'undefined') return defaultVal;
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : defaultVal;
  } catch {
    return defaultVal;
  }
}

function setItem<T>(key: string, val: T): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(val));
  } catch (err) {
    console.error('Failed to save to localStorage:', err);
  }
}

// ─── Cloud Firestore Real-Time Multi-Device Synchronization Engine ───────────
const FIRESTORE_URL =
  'https://firestore.googleapis.com/v1/projects/sahakarigig/databases/(default)/documents/app_state/main_store';

async function syncFromCloud(): Promise<void> {
  if (typeof window === 'undefined') return;
  try {
    const res = await fetch(FIRESTORE_URL, { method: 'GET', cache: 'no-store' });
    if (res.ok) {
      const doc = await res.json();
      const rawPayload = doc?.fields?.payload?.stringValue;
      if (rawPayload) {
        const data = JSON.parse(rawPayload);
        if (data && typeof data === 'object') {
          if (Array.isArray(data.users)) setItem(LS_KEY_USERS, data.users);
          if (Array.isArray(data.workers)) setItem(LS_KEY_WORKERS, data.workers);
          if (Array.isArray(data.services)) setItem(LS_KEY_SERVICES, data.services);
          if (Array.isArray(data.bookings)) setItem(LS_KEY_BOOKINGS, data.bookings);
          if (data.society && typeof data.society === 'object') setItem(LS_KEY_SOCIETY, data.society);
        }
      }
    } else if (res.status === 404) {
      // First time initialization: push seed data to Firestore
      await pushToCloud();
    }
  } catch {
    // Cloud sync fails silently, falls back to local storage
  }
}

async function pushToCloud(): Promise<void> {
  if (typeof window === 'undefined') return;
  try {
    const state = {
      users: getItem(LS_KEY_USERS, seedUsers),
      workers: getItem(LS_KEY_WORKERS, seedWorkers),
      services: getItem(LS_KEY_SERVICES, seedServices),
      bookings: getItem(LS_KEY_BOOKINGS, seedBookings),
      society: getItem(LS_KEY_SOCIETY, seedSociety),
    };
    const body = {
      fields: {
        payload: {
          stringValue: JSON.stringify(state),
        },
      },
    };
    await fetch(FIRESTORE_URL, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
  } catch {
    // Silent failover
  }
}

// Initialize background cloud sync on client boot
if (typeof window !== 'undefined') {
  syncFromCloud();
  setInterval(syncFromCloud, 2000);
}

// ─── Data Service Operations ──────────────────────────────────────────────────
export const dataService = {
  syncCloud: syncFromCloud,
  pushCloud: pushToCloud,

  getSociety(): Society {
    return getItem<Society>(LS_KEY_SOCIETY, seedSociety);
  },

  updateSocietyPassRates(monthly?: number, yearly?: number): Society {
    const soc = this.getSociety();
    if (monthly !== undefined && !isNaN(monthly) && monthly > 0) soc.monthlyPassRate = monthly;
    if (yearly !== undefined && !isNaN(yearly) && yearly > 0) soc.yearlyPassRate = yearly;
    setItem(LS_KEY_SOCIETY, soc);
    pushToCloud();
    return soc;
  },

  incrementWelfare(amount: number): void {
    const soc = this.getSociety();
    soc.welfareFundBalance += amount;
    setItem(LS_KEY_SOCIETY, soc);
    pushToCloud();
  },

  getServices(): Service[] {
    return getItem<Service[]>(LS_KEY_SERVICES, seedServices);
  },

  updateServicePrice(id: string, price: number): Service[] {
    const services = this.getServices();
    const idx = services.findIndex((s) => s.id === id);
    if (idx !== -1) {
      services[idx].price = price;
      setItem(LS_KEY_SERVICES, services);
      pushToCloud();
    }
    return services;
  },

  getUsers(): User[] {
    return getItem<User[]>(LS_KEY_USERS, seedUsers);
  },

  findUser(email: string): User | undefined {
    const users = this.getUsers();
    return users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  },

  async login(email: string, pass: string): Promise<User | null> {
    await syncFromCloud();
    const user = this.findUser(email);
    if (user && user.password === pass) return user;
    return null;
  },

  async register(user: User, workerData?: { trade: string; skills: string[]; bio: string; kycDocName?: string }): Promise<User> {
    await syncFromCloud();
    const users = this.getUsers();
    const existingIdx = users.findIndex((u) => u.email.toLowerCase() === user.email.toLowerCase());
    if (existingIdx !== -1) {
      users[existingIdx] = user;
    } else {
      users.unshift(user);
    }
    setItem(LS_KEY_USERS, users);

    if (user.role === 'WORKER') {
      const workers = this.getWorkers();
      const existingWorkerIdx = workers.findIndex((w) => w.userId === user.id);
      const newWorker: WorkerProfile = {
        id: `wp-${Date.now()}`,
        userId: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone || '9845012345',
        trade: workerData?.trade || user.trade || 'General Maintenance',
        localSociety: user.localSociety || 'Primary Cooperative Services Society',
        skills: workerData?.skills && workerData.skills.length > 0 ? workerData.skills : ['Maintenance'],
        bio: workerData?.bio || 'Skilled artisan associated with Primary Cooperative Services Society.',
        isAvailable: true,
        kycStatus: 'PENDING',
        kycDocName: workerData?.kycDocName || user.kycDocName || 'identity_document.pdf',
        subscriptionPlan: 'MONTHLY',
        passValidUntil: new Date(Date.now() + 30 * 86400000).toISOString(),
        totalEarnings: 0,
        digitalEarnings: 0,
        cashEarnings: 0,
        completedJobs: 0,
        rating: 5.0,
        ratingsCount: 0,
      };
      if (existingWorkerIdx !== -1) {
        workers[existingWorkerIdx] = newWorker;
      } else {
        workers.unshift(newWorker);
      }
      setItem(LS_KEY_WORKERS, workers);
    }

    await pushToCloud();
    return user;
  },

  getWorkers(): WorkerProfile[] {
    return getItem<WorkerProfile[]>(LS_KEY_WORKERS, seedWorkers);
  },

  findWorkerByUserId(userId: string): WorkerProfile | undefined {
    return this.getWorkers().find((w) => w.userId === userId);
  },

  isWorkerSubscribed(userId: string): boolean {
    const worker = this.findWorkerByUserId(userId);
    if (!worker || !worker.passValidUntil) return false;
    return new Date(worker.passValidUntil).getTime() > Date.now();
  },

  subscribeWorker(userId: string, plan: 'MONTHLY' | 'YEARLY'): WorkerProfile | undefined {
    const workers = this.getWorkers();
    const idx = workers.findIndex((w) => w.userId === userId);
    if (idx === -1) return undefined;

    const soc = this.getSociety();
    const cost = plan === 'YEARLY' ? soc.yearlyPassRate : soc.monthlyPassRate;
    const addDays = plan === 'YEARLY' ? 365 : 30;

    const worker = workers[idx];
    const currentValidUntil = worker.passValidUntil ? new Date(worker.passValidUntil).getTime() : 0;
    const baseTime = Math.max(Date.now(), currentValidUntil);
    const newValidUntil = new Date(baseTime + addDays * 86400000).toISOString();

    workers[idx] = {
      ...worker,
      subscriptionPlan: plan,
      passValidUntil: newValidUntil,
      isAvailable: true,
    };

    setItem(LS_KEY_WORKERS, workers);
    this.incrementWelfare(cost);
    pushToCloud();
    return workers[idx];
  },

  updateWorker(userId: string, update: Partial<WorkerProfile>): WorkerProfile | undefined {
    const workers = this.getWorkers();
    const idx = workers.findIndex((w) => w.userId === userId);
    if (idx !== -1) {
      workers[idx] = { ...workers[idx], ...update };
      setItem(LS_KEY_WORKERS, workers);
      if (update.kycStatus === 'VERIFIED') {
        this.incrementWelfare(250);
      }
      pushToCloud();
      return workers[idx];
    }
    return undefined;
  },

  getBookings(): Booking[] {
    return getItem<Booking[]>(LS_KEY_BOOKINGS, seedBookings);
  },

  addBooking(booking: Booking): Booking {
    const bookings = this.getBookings();
    bookings.unshift(booking);
    setItem(LS_KEY_BOOKINGS, bookings);
    pushToCloud();
    return booking;
  },

  updateBooking(id: string, update: Partial<Booking>): Booking | undefined {
    const bookings = this.getBookings();
    const idx = bookings.findIndex((b) => b.id === id);
    if (idx !== -1) {
      const current = bookings[idx];
      const updated = { ...current, ...update };
      bookings[idx] = updated;
      setItem(LS_KEY_BOOKINGS, bookings);

      const isBecomingComplete =
        (update.status === 'COMPLETED_PAID_DIGITALLY' ||
         update.status === 'COMPLETED_PAID_CASH' ||
         update.status === 'COMPLETED') &&
        !(current.status === 'COMPLETED_PAID_DIGITALLY' ||
          current.status === 'COMPLETED_PAID_CASH' ||
          current.status === 'COMPLETED');

      if (isBecomingComplete && updated.workerId) {
        const worker = this.findWorkerByUserId(updated.workerId);
        if (worker) {
          const isDigital = update.status === 'COMPLETED_PAID_DIGITALLY' || updated.paymentMethod === 'DIGITAL';
          const isCash = update.status === 'COMPLETED_PAID_CASH' || updated.paymentMethod === 'CASH';

          this.updateWorker(updated.workerId, {
            totalEarnings: worker.totalEarnings + updated.totalAmount,
            digitalEarnings: worker.digitalEarnings + (isDigital ? updated.totalAmount : 0),
            cashEarnings: worker.cashEarnings + (isCash ? updated.totalAmount : 0),
            completedJobs: worker.completedJobs + 1,
          });
        }
        this.incrementWelfare(Math.round(updated.totalAmount * 0.05));
      }

      if (update.reviewRating && updated.workerId) {
        const worker = this.findWorkerByUserId(updated.workerId);
        if (worker) {
          const currentCount = worker.ratingsCount || 20;
          const newAvg = ((worker.rating * currentCount) + update.reviewRating) / (currentCount + 1);
          this.updateWorker(updated.workerId, {
            rating: Math.round(newAvg * 10) / 10,
            ratingsCount: currentCount + 1,
          });
        }
      }

      pushToCloud();
      return updated;
    }
    return undefined;
  },

  getPlatformMetrics() {
    const bookings = this.getBookings();
    const workers = this.getWorkers();
    const society = this.getSociety();

    const completedList = bookings.filter(
      (b) =>
        b.status === 'COMPLETED_PAID_DIGITALLY' ||
        b.status === 'COMPLETED_PAID_CASH' ||
        b.status === 'COMPLETED'
    );
    const totalVolume = completedList.reduce((acc, b) => acc + b.totalAmount, 0) + 75500;
    const activeArtisans = workers.length;
    const verifiedArtisans = workers.filter((w) => w.kycStatus === 'VERIFIED').length;
    const pendingKyc = workers.filter((w) => w.kycStatus === 'PENDING').length;
    const totalCompletedJobs = completedList.length + 182;

    return {
      totalVolume,
      activeArtisans,
      verifiedArtisans,
      pendingKyc,
      totalCompletedJobs,
      welfareFundBalance: society.welfareFundBalance,
    };
  },
};

export default dataService;
