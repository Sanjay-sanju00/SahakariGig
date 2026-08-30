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
  totalCommissionCollected: number; // 5% platform fee accumulated from digital & cash dues
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
  trade: string;
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
  // 3-Factor Quality & Trust Scores
  qualityRating: number;          // 1.0 - 5.0 Work Quality score
  behaviorRating: number;         // 1.0 - 5.0 Behavior, Punctuality & Respect score
  pricingRating?: number;         // 1.0 - 5.0 Fair Pricing & Overcharge score (1=Highly Overcharged, 5=Highly Fair)
  fairPricingPercentage: number;  // 0 - 100% Fair Pricing percentage
  fairPricingVotes: number;       // Count of customers voting "Fair Pricing"
  totalReviewsCount: number;      // Total review count
  // Cash Commission Ledger & Automated Suspension
  outstandingDues: number;        // Accumulated 5% platform dues from cash jobs (₹)
  accountStatus: 'ACTIVE' | 'SUSPENDED_UNPAID_DUES';
}

export interface Service {
  id: string;
  name: string;
  category: string;
  description: string;
  price: number; // Base rate for trade (₹)
  basePrice?: number;
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
  // Dynamic Invoice Breakdown
  basePrice: number;              // Fixed trade base rate
  extraCost?: number;             // Extra labor / material cost added by artisan
  extraCostReason?: string;       // Reason / scope breakdown for extra cost
  subtotalAmount?: number;        // Base + Extra
  platformFee?: number;           // 5% PACS platform fee on customer
  totalAmount: number;            // Subtotal + Platform Fee
  paymentStatus: PaymentStatus;
  paymentMethod?: 'DIGITAL' | 'CASH';
  createdAt: string;
  acceptedAt?: string;
  settlementRequestedAt?: string;
  paidAt?: string;
  completedAt?: string;
  // 3-Factor Review Survey Submission (Customer -> Worker)
  qualityRating?: number;         // 1 - 5 Work Quality
  behaviorRating?: number;        // 1 - 5 Behavior & Punctuality
  pricingRating?: number;         // 1 - 5 Pricing Fairness (1=Highly Overcharged, 5=Highly Fair)
  fairPricingReport?: 'FAIR' | 'OVERCHARGED';
  reviewRating?: number;
  reviewComment?: string;
  reviewedAt?: string;
  // Worker-to-Customer Private Behavior Rating (Worker -> Customer, strictly private to workers)
  workerCustomerBehaviorRating?: number; // 1 - 5 Behavior score given by worker
  workerCustomerReviewComment?: string;  // Private worker comment regarding customer behavior
  workerReviewedCustomerAt?: string;     // When worker reviewed the customer
  cancelledAt?: string;                  // When customer cancelled (only allowed before acceptance)
  cancellationReason?: string;
}

// ─── Initial Seed Data ────────────────────────────────────────────────────────
export const seedSociety: Society = {
  id: 'soc-1',
  name: 'Primary Cooperative Services Society',
  registrationNo: 'PACS/DCF/2021/089',
  district: 'Central District Cluster',
  state: 'State Cooperative Federation',
  welfareFundBalance: 52400,
  totalCommissionCollected: 14850,
  monthlyPassRate: 69,
  yearlyPassRate: 599,
};

export const seedServices: Service[] = [
  {
    id: 'svc-1',
    name: 'Plumbing & Pipe Repair',
    category: 'Plumbing',
    description: 'Fix leaking taps, pipe washers, drainage clearance, and basic bathroom fixtures.',
    price: 200,
    basePrice: 200,
    icon: '',
    duration: '30–45 min',
  },
  {
    id: 'svc-2',
    name: 'Electrical Socket & Switch Fix',
    category: 'Electrical',
    description: 'Repair faulty switches, MCB tripping issues, and household wiring checks.',
    price: 150,
    basePrice: 150,
    icon: '',
    duration: '45–60 min',
  },
  {
    id: 'svc-3',
    name: 'Appliance Diagnosis & Repair',
    category: 'Appliance Fix',
    description: 'Inspection and diagnostics for washing machines, water coolers, pumps, and motors.',
    price: 180,
    basePrice: 180,
    icon: '',
    duration: '60–90 min',
  },
  {
    id: 'svc-4',
    name: 'Carpentry & Woodwork Fitting',
    category: 'Carpentry',
    description: 'Door hinges, handle fitting, shelf installation, and minor wooden repairs.',
    price: 250,
    basePrice: 250,
    icon: '',
    duration: '60–90 min',
  },
  {
    id: 'svc-5',
    name: 'House Deep Cleaning & Sanitization',
    category: 'Cleaning',
    description: 'Intensive kitchen, bathroom, and household floor deep cleaning.',
    price: 300,
    basePrice: 300,
    icon: '',
    duration: '2–3 hrs',
  },
  {
    id: 'svc-6',
    name: 'Ceiling Fan & Fixture Installation',
    category: 'Electrical',
    description: 'Complete ceiling/exhaust fan installation, regulator checks, and balancing.',
    price: 150,
    basePrice: 150,
    icon: '',
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
    rating: 4.9,
    ratingsCount: 42,
    qualityRating: 4.9,
    behaviorRating: 4.8,
    fairPricingPercentage: 97,
    fairPricingVotes: 41,
    totalReviewsCount: 42,
    outstandingDues: 85,
    accountStatus: 'ACTIVE',
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
    isAvailable: true,
    kycStatus: 'VERIFIED',
    kycDocName: 'kyc_kavita_sharma.jpg',
    subscriptionPlan: 'MONTHLY',
    passValidUntil: new Date(Date.now() + 20 * 86400000).toISOString(),
    totalEarnings: 21500,
    digitalEarnings: 17200,
    cashEarnings: 4300,
    completedJobs: 54,
    rating: 4.8,
    ratingsCount: 28,
    qualityRating: 4.8,
    behaviorRating: 4.9,
    fairPricingPercentage: 96,
    fairPricingVotes: 27,
    totalReviewsCount: 28,
    outstandingDues: 40,
    accountStatus: 'ACTIVE',
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
    qualityRating: 4.7,
    behaviorRating: 4.8,
    fairPricingPercentage: 95,
    fairPricingVotes: 18,
    totalReviewsCount: 19,
    outstandingDues: 0,
    accountStatus: 'ACTIVE',
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
    basePrice: 150,
    extraCost: 0,
    subtotalAmount: 150,
    platformFee: 8,
    totalAmount: 158,
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
    scheduledDate: '2026-08-26T14:00:00Z',
    address: 'Sector 4, Community Housing Block B',
    basePrice: 250,
    extraCost: 50,
    extraCostReason: 'Replaced brass hinges and planed bottom door frame',
    subtotalAmount: 300,
    platformFee: 15,
    totalAmount: 315,
    paymentStatus: 'PAID_DIGITAL',
    paymentMethod: 'DIGITAL',
    createdAt: '2026-08-25T11:00:00Z',
    acceptedAt: '2026-08-25T11:10:00Z',
    settlementRequestedAt: '2026-08-26T15:00:00Z',
    paidAt: '2026-08-26T15:05:00Z',
    completedAt: '2026-08-26T15:05:00Z',
    qualityRating: 5,
    behaviorRating: 5,
    pricingRating: 5,
    fairPricingReport: 'FAIR',
    reviewRating: 5.0,
    reviewComment: 'Prompt arrival and clean woodwork fitting. Fixed the scraping door smoothly without extra fuss!',
    reviewedAt: '2026-08-26T15:30:00Z',
    workerCustomerBehaviorRating: 5,
    workerCustomerReviewComment: 'Very courteous resident. Provided safe and clean workspace, clear instructions, and settled bill immediately.',
    workerReviewedCustomerAt: '2026-08-26T15:35:00Z',
  },
  {
    id: 'bk-rev-1',
    customerId: 'usr-cust-2',
    customerName: 'Sunita Kulkarni',
    customerPhone: '9823099881',
    customerAddress: 'Tower C-402, Green Meadows',
    workerId: 'usr-wkr-1',
    workerName: 'Suresh Patil',
    serviceId: 'svc-2',
    serviceName: 'Electrical Socket & Switch Fix',
    status: 'COMPLETED_PAID_DIGITALLY',
    scheduledDate: '2026-08-24T11:00:00Z',
    address: 'Tower C-402, Green Meadows',
    basePrice: 150,
    extraCost: 30,
    extraCostReason: 'Replaced heavy duty 16A AC socket',
    subtotalAmount: 180,
    platformFee: 9,
    totalAmount: 189,
    paymentStatus: 'PAID_DIGITAL',
    paymentMethod: 'DIGITAL',
    createdAt: '2026-08-24T09:00:00Z',
    completedAt: '2026-08-24T12:00:00Z',
    qualityRating: 5,
    behaviorRating: 5,
    pricingRating: 5,
    fairPricingReport: 'FAIR',
    reviewRating: 5.0,
    reviewComment: 'Excellent electrical work! Replaced the faulty MCB switch and balanced the load cleanly. No extra hidden charges.',
    reviewedAt: '2026-08-24T12:30:00Z',
    workerCustomerBehaviorRating: 5,
    workerCustomerReviewComment: 'Extremely polite customer. Offered water, clarified exact switch requirements, and paid digitally right upon job wrap-up.',
    workerReviewedCustomerAt: '2026-08-24T12:35:00Z',
  },
  {
    id: 'bk-rev-2',
    customerId: 'usr-cust-3',
    customerName: 'Priya Nair',
    customerPhone: '9823044556',
    customerAddress: 'Villa 12, Cooperative Enclave',
    workerId: 'usr-wkr-1',
    workerName: 'Suresh Patil',
    serviceId: 'svc-6',
    serviceName: 'Ceiling Fan & Fixture Installation',
    status: 'COMPLETED_PAID_DIGITALLY',
    scheduledDate: '2026-08-22T16:00:00Z',
    address: 'Villa 12, Cooperative Enclave',
    basePrice: 150,
    extraCost: 0,
    subtotalAmount: 150,
    platformFee: 8,
    totalAmount: 158,
    paymentStatus: 'PAID_DIGITAL',
    paymentMethod: 'DIGITAL',
    createdAt: '2026-08-22T14:00:00Z',
    completedAt: '2026-08-22T17:15:00Z',
    qualityRating: 5,
    behaviorRating: 5,
    pricingRating: 5,
    fairPricingReport: 'FAIR',
    reviewRating: 5.0,
    reviewComment: 'Very punctual and courteous. Installed two BLDC ceiling fans neatly and tested all regulator speeds.',
    reviewedAt: '2026-08-22T17:45:00Z',
  },
  {
    id: 'bk-rev-3',
    customerId: 'usr-cust-4',
    customerName: 'Neha Gupta',
    customerPhone: '9823077665',
    customerAddress: 'Flat 301, Shanti Niketan',
    workerId: 'usr-wkr-2',
    workerName: 'Kavita Sharma',
    serviceId: 'svc-1',
    serviceName: 'Pipeline Leakage & Tap Fitting',
    status: 'COMPLETED_PAID_DIGITALLY',
    scheduledDate: '2026-08-25T10:00:00Z',
    address: 'Flat 301, Shanti Niketan',
    basePrice: 200,
    extraCost: 40,
    extraCostReason: 'Replaced Teflon washers and angle cock valve',
    subtotalAmount: 240,
    platformFee: 12,
    totalAmount: 252,
    paymentStatus: 'PAID_DIGITAL',
    paymentMethod: 'DIGITAL',
    createdAt: '2026-08-25T08:00:00Z',
    completedAt: '2026-08-25T11:00:00Z',
    qualityRating: 5,
    behaviorRating: 5,
    pricingRating: 5,
    fairPricingReport: 'FAIR',
    reviewRating: 5.0,
    reviewComment: 'Fixed the leaking bathroom valve and cleared the drain trap without creating any mess. Super polite and honest billing!',
    reviewedAt: '2026-08-25T11:30:00Z',
  },
];

// ─── Browser LocalStorage Storage Helper ───────────────────────────────────────
const LS_KEY_USERS = 'sahakar_users';
const LS_KEY_WORKERS = 'sahakar_workers';
const LS_KEY_SERVICES = 'sahakar_services';
const LS_KEY_BOOKINGS = 'sahakar_bookings';
const LS_KEY_SOCIETY = 'sahakar_society';

function getItem<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length === 0 && Array.isArray(fallback) && (fallback as unknown[]).length > 0) {
      return fallback;
    }
    return parsed;
  } catch {
    return fallback;
  }
}

function setItem<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Silently ignore storage quota errors in demo mode
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
          if (Array.isArray(data.users) && data.users.length > 0) {
            setItem(LS_KEY_USERS, data.users);
          } else {
            setItem(LS_KEY_USERS, seedUsers);
          }

          if (Array.isArray(data.workers) && data.workers.length > 0) {
            setItem(LS_KEY_WORKERS, data.workers);
          } else {
            setItem(LS_KEY_WORKERS, seedWorkers);
          }

          if (Array.isArray(data.services) && data.services.length > 0) {
            setItem(LS_KEY_SERVICES, data.services);
          } else {
            setItem(LS_KEY_SERVICES, seedServices);
          }

          if (Array.isArray(data.bookings)) {
            setItem(LS_KEY_BOOKINGS, data.bookings.length > 0 ? data.bookings : seedBookings);
          }

          if (data.society && typeof data.society === 'object') {
            setItem(LS_KEY_SOCIETY, data.society);
          }
        }
      }
    } else if (res.status === 404) {
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
    // Cloud sync fails silently
  }
}

// Background sync loop for real-time collaboration
if (typeof window !== 'undefined') {
  syncFromCloud();
  setInterval(() => {
    syncFromCloud();
  }, 2500);
}

// ─── Data Service Operations ──────────────────────────────────────────────────
export const dataService = {
  async syncCloud(): Promise<void> {
    await syncFromCloud();
  },

  getSociety(): Society {
    return getItem<Society>(LS_KEY_SOCIETY, seedSociety);
  },

  updateSociety(update: Partial<Society>): Society {
    const current = this.getSociety();
    const updated = { ...current, ...update };
    setItem(LS_KEY_SOCIETY, updated);
    pushToCloud();
    return updated;
  },

  incrementWelfare(amount: number): Society {
    const current = this.getSociety();
    const updated = {
      ...current,
      welfareFundBalance: current.welfareFundBalance + amount,
      totalCommissionCollected: (current.totalCommissionCollected || 0) + amount,
    };
    setItem(LS_KEY_SOCIETY, updated);
    pushToCloud();
    return updated;
  },

  getServices(): Service[] {
    return getItem<Service[]>(LS_KEY_SERVICES, seedServices);
  },

  getServiceById(id: string): Service | undefined {
    return this.getServices().find((s) => s.id === id);
  },

  updateServiceBasePrice(serviceId: string, newBasePrice: number): Service | undefined {
    const services = this.getServices();
    const idx = services.findIndex((s) => s.id === serviceId);
    if (idx !== -1) {
      services[idx] = {
        ...services[idx],
        price: newBasePrice,
        basePrice: newBasePrice,
      };
      setItem(LS_KEY_SERVICES, services);
      pushToCloud();
      return services[idx];
    }
    return undefined;
  },

  getUsers(): User[] {
    return getItem<User[]>(LS_KEY_USERS, seedUsers);
  },

  findUser(email: string): User | undefined {
    const users = this.getUsers();
    return users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  },

  async login(email: string, pass: string): Promise<User | null> {
    try {
      await Promise.race([syncFromCloud(), new Promise((resolve) => setTimeout(resolve, 1200))]);
    } catch {}
    const user = this.findUser(email);
    if (user && user.password === pass) return user;
    return null;
  },

  async register(
    user: User,
    workerData?: { trade: string; skills: string[]; bio: string; kycDocName?: string }
  ): Promise<User> {
    try {
      await Promise.race([syncFromCloud(), new Promise((resolve) => setTimeout(resolve, 1200))]);
    } catch {}
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
        phone: user.phone || '',
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
        ratingsCount: 1,
        qualityRating: 5.0,
        behaviorRating: 5.0,
        fairPricingPercentage: 100,
        fairPricingVotes: 1,
        totalReviewsCount: 1,
        outstandingDues: 0,
        accountStatus: 'ACTIVE',
      };
      if (existingWorkerIdx !== -1) {
        workers[existingWorkerIdx] = newWorker;
      } else {
        workers.unshift(newWorker);
      }
      setItem(LS_KEY_WORKERS, workers);
    }

    pushToCloud();
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

      // Synchronize User table isVerified status
      if (update.kycStatus !== undefined) {
        const users = this.getUsers();
        const uIdx = users.findIndex((u) => u.id === userId);
        if (uIdx !== -1) {
          users[uIdx].isVerified = update.kycStatus === 'VERIFIED';
          setItem(LS_KEY_USERS, users);
        }
      }

      if (update.kycStatus === 'VERIFIED') {
        this.incrementWelfare(250);
      }
      pushToCloud();
      return workers[idx];
    }
    return undefined;
  },

  payWorkerDues(userId: string): WorkerProfile | undefined {
    const workers = this.getWorkers();
    const idx = workers.findIndex((w) => w.userId === userId);
    if (idx === -1) return undefined;

    const currentDues = workers[idx].outstandingDues || 0;
    workers[idx] = {
      ...workers[idx],
      outstandingDues: 0,
      accountStatus: 'ACTIVE',
      isAvailable: true,
    };

    setItem(LS_KEY_WORKERS, workers);
    if (currentDues > 0) {
      this.incrementWelfare(currentDues);
    }
    pushToCloud();
    return workers[idx];
  },

  adminClearWorkerDues(userId: string): WorkerProfile | undefined {
    return this.payWorkerDues(userId);
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

  submitInvoice(bookingId: string, extraCost: number, extraCostReason: string): Booking | undefined {
    const bookings = this.getBookings();
    const idx = bookings.findIndex((b) => b.id === bookingId);
    if (idx === -1) return undefined;

    const bk = bookings[idx];
    const base = bk.basePrice || bk.totalAmount || 150;
    const extra = Math.max(0, extraCost || 0);
    const subtotal = base + extra;
    const fee = Math.round(subtotal * 0.05);
    const total = subtotal + fee;

    const updated: Booking = {
      ...bk,
      extraCost: extra,
      extraCostReason: extraCostReason.trim() || undefined,
      subtotalAmount: subtotal,
      platformFee: fee,
      totalAmount: total,
      status: 'AWAITING_PAYMENT',
      settlementRequestedAt: new Date().toISOString(),
    };

    bookings[idx] = updated;
    setItem(LS_KEY_BOOKINGS, bookings);
    pushToCloud();
    return updated;
  },

  settleDigitalPayment(bookingId: string): Booking | undefined {
    const bookings = this.getBookings();
    const idx = bookings.findIndex((b) => b.id === bookingId);
    if (idx === -1) return undefined;

    const bk = bookings[idx];
    const subtotal = bk.subtotalAmount || (bk.totalAmount - (bk.platformFee || 0)) || bk.totalAmount;
    const fee = bk.platformFee || Math.round(subtotal * 0.05);

    const updated: Booking = {
      ...bk,
      status: 'COMPLETED_PAID_DIGITALLY',
      paymentStatus: 'PAID_DIGITAL',
      paymentMethod: 'DIGITAL',
      paidAt: new Date().toISOString(),
      completedAt: new Date().toISOString(),
    };

    bookings[idx] = updated;
    setItem(LS_KEY_BOOKINGS, bookings);

    if (updated.workerId) {
      const worker = this.findWorkerByUserId(updated.workerId);
      if (worker) {
        this.updateWorker(updated.workerId, {
          totalEarnings: worker.totalEarnings + subtotal,
          digitalEarnings: worker.digitalEarnings + subtotal,
          completedJobs: worker.completedJobs + 1,
        });
      }
    }

    this.incrementWelfare(fee);
    pushToCloud();
    return updated;
  },

  settleCashPayment(bookingId: string): Booking | undefined {
    const bookings = this.getBookings();
    const idx = bookings.findIndex((b) => b.id === bookingId);
    if (idx === -1) return undefined;

    const bk = bookings[idx];
    const subtotal = bk.subtotalAmount || (bk.totalAmount - (bk.platformFee || 0)) || bk.totalAmount;
    const fee = bk.platformFee || Math.round(subtotal * 0.05);
    const total = bk.totalAmount;

    const updated: Booking = {
      ...bk,
      status: 'COMPLETED_PAID_CASH',
      paymentStatus: 'PAID_CASH',
      paymentMethod: 'CASH',
      paidAt: new Date().toISOString(),
      completedAt: new Date().toISOString(),
    };

    bookings[idx] = updated;
    setItem(LS_KEY_BOOKINGS, bookings);

    if (updated.workerId) {
      const worker = this.findWorkerByUserId(updated.workerId);
      if (worker) {
        const newDues = (worker.outstandingDues || 0) + fee;
        const isSuspended = newDues >= 300;
        this.updateWorker(updated.workerId, {
          totalEarnings: worker.totalEarnings + subtotal,
          cashEarnings: worker.cashEarnings + total,
          completedJobs: worker.completedJobs + 1,
          outstandingDues: newDues,
          accountStatus: isSuspended ? 'SUSPENDED_UNPAID_DUES' : worker.accountStatus,
          isAvailable: isSuspended ? false : worker.isAvailable,
        });
      }
    }

    pushToCloud();
    return updated;
  },

  submitThreeFactorReview(
    bookingId: string,
    quality: number,
    behavior: number,
    pricingRating: number,
    comment?: string
  ): Booking | undefined {
    const bookings = this.getBookings();
    const idx = bookings.findIndex((b) => b.id === bookingId);
    if (idx === -1) return undefined;

    const bk = bookings[idx];
    const avgScore = Math.round(((quality + behavior + pricingRating) / 3) * 10) / 10;
    const fairPricingReport = pricingRating >= 3 ? 'FAIR' : 'OVERCHARGED';

    const updated: Booking = {
      ...bk,
      qualityRating: quality,
      behaviorRating: behavior,
      pricingRating: pricingRating,
      fairPricingReport,
      reviewRating: avgScore,
      reviewComment: comment?.trim() || undefined,
      reviewedAt: new Date().toISOString(),
    };

    bookings[idx] = updated;
    setItem(LS_KEY_BOOKINGS, bookings);

    if (updated.workerId) {
      const worker = this.findWorkerByUserId(updated.workerId);
      if (worker) {
        const count = worker.totalReviewsCount || 10;
        const newQuality = Math.round((((worker.qualityRating || 4.9) * count + quality) / (count + 1)) * 10) / 10;
        const newBehavior = Math.round((((worker.behaviorRating || 4.8) * count + behavior) / (count + 1)) * 10) / 10;
        const newPricing = Math.round((((worker.pricingRating || 4.8) * count + pricingRating) / (count + 1)) * 10) / 10;
        const newOverall = Math.round((((worker.rating || 4.8) * count + avgScore) / (count + 1)) * 10) / 10;
        const isFair = pricingRating >= 3;
        const newFairVotes = (worker.fairPricingVotes || Math.round(count * 0.96)) + (isFair ? 1 : 0);
        const newFairPercent = Math.round((newPricing / 5) * 100);

        this.updateWorker(updated.workerId, {
          qualityRating: newQuality,
          behaviorRating: newBehavior,
          pricingRating: newPricing,
          rating: newOverall,
          ratingsCount: count + 1,
          totalReviewsCount: count + 1,
          fairPricingVotes: newFairVotes,
          fairPricingPercentage: newFairPercent,
        });
      }
    }

    pushToCloud();
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('sahakar_state_updated'));
    }
    return updated;
  },

  getWorkerReviews(workerUserId: string): Booking[] {
    const bookings = this.getBookings();
    return bookings
      .filter((b) => b.workerId === workerUserId && (b.qualityRating !== undefined || b.reviewRating !== undefined || Boolean(b.reviewComment)))
      .sort((a, b) => {
        const timeA = new Date(a.reviewedAt || a.completedAt || a.createdAt).getTime();
        const timeB = new Date(b.reviewedAt || b.completedAt || b.createdAt).getTime();
        return timeB - timeA;
      });
  },

  // Worker reviewing customer based on behavior only (Strictly Private to Workers)
  submitWorkerCustomerReview(
    bookingId: string,
    behaviorRating: number,
    comment?: string
  ): Booking | undefined {
    const bookings = this.getBookings();
    const idx = bookings.findIndex((b) => b.id === bookingId);
    if (idx === -1) return undefined;

    const bk = bookings[idx];
    const updated: Booking = {
      ...bk,
      workerCustomerBehaviorRating: Math.max(1, Math.min(5, behaviorRating)),
      workerCustomerReviewComment: comment?.trim() || undefined,
      workerReviewedCustomerAt: new Date().toISOString(),
    };

    bookings[idx] = updated;
    setItem(LS_KEY_BOOKINGS, bookings);
    pushToCloud();
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('sahakar_state_updated'));
    }
    return updated;
  },

  // Get private worker-only reviews for a resident customer
  getCustomerWorkerReviews(customerId: string): Booking[] {
    const bookings = this.getBookings();
    return bookings
      .filter((b) => b.customerId === customerId && b.workerCustomerBehaviorRating !== undefined)
      .sort((a, b) => {
        const timeA = new Date(a.workerReviewedCustomerAt || a.completedAt || a.createdAt).getTime();
        const timeB = new Date(b.workerReviewedCustomerAt || b.completedAt || b.createdAt).getTime();
        return timeB - timeA;
      });
  },

  // Get aggregate customer behavior rating (Worker-only trust intelligence)
  getCustomerBehaviorRating(customerId: string): { averageRating: number; totalReviews: number } {
    const reviews = this.getCustomerWorkerReviews(customerId);
    if (reviews.length === 0) {
      return { averageRating: 5.0, totalReviews: 0 };
    }
    const sum = reviews.reduce((acc, r) => acc + (r.workerCustomerBehaviorRating || 5), 0);
    const avg = Math.round((sum / reviews.length) * 10) / 10;
    return { averageRating: avg, totalReviews: reviews.length };
  },

  // Cancel requested booking (Allowed ONLY when worker has not agreed/accepted yet)
  cancelBooking(bookingId: string, cancelReason?: string): { success: boolean; error?: string; booking?: Booking } {
    const bookings = this.getBookings();
    const idx = bookings.findIndex((b) => b.id === bookingId);
    if (idx === -1) return { success: false, error: 'Booking request not found.' };

    const bk = bookings[idx];
    if (bk.status !== 'PENDING_ACCEPTANCE') {
      return {
        success: false,
        error: 'Cancellation is not permitted once an artisan has agreed to and accepted the job request.'
      };
    }

    const updated: Booking = {
      ...bk,
      status: 'CANCELLED',
      cancelledAt: new Date().toISOString(),
      cancellationReason: cancelReason?.trim() || undefined,
    };

    bookings[idx] = updated;
    setItem(LS_KEY_BOOKINGS, bookings);
    pushToCloud();
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('sahakar_state_updated'));
    }
    return { success: true, booking: updated };
  },

  updateBooking(id: string, update: Partial<Booking>): Booking | undefined {
    const bookings = this.getBookings();
    const idx = bookings.findIndex((b) => b.id === id);
    if (idx !== -1) {
      const current = bookings[idx];
      const updated = { ...current, ...update };
      bookings[idx] = updated;
      setItem(LS_KEY_BOOKINGS, bookings);
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
    const activeArtisans = workers.filter((w) => w.accountStatus !== 'SUSPENDED_UNPAID_DUES').length;
    const suspendedArtisans = workers.filter((w) => w.accountStatus === 'SUSPENDED_UNPAID_DUES').length;
    const verifiedArtisans = workers.filter((w) => w.kycStatus === 'VERIFIED').length;
    const pendingKyc = workers.filter((w) => w.kycStatus === 'PENDING').length;
    const totalCompletedJobs = completedList.length + 182;
    const totalOutstandingWorkerDues = workers.reduce((acc, w) => acc + (w.outstandingDues || 0), 0);

    return {
      totalVolume,
      activeArtisans,
      suspendedArtisans,
      verifiedArtisans,
      pendingKyc,
      totalCompletedJobs,
      welfareFundBalance: society.welfareFundBalance,
      totalCommissionCollected: society.totalCommissionCollected || 14850,
      totalOutstandingWorkerDues,
    };
  },
};

export default dataService;
