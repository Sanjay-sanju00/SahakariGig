// Central store and state engine for SahakarGig platform
// Supports database models, real-time post-service payment lifecycle, and digital/cash settlement
import fs from 'fs';
import path from 'path';

export type Role = 'CUSTOMER' | 'WORKER' | 'ADMIN';
export type KycStatus = 'PENDING' | 'VERIFIED' | 'REJECTED';

// Post-service payment lifecycle
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
  monthlyPassRate: number; // Board-governed Monthly Pass (e.g. ₹69)
  yearlyPassRate: number;  // Board-governed Yearly Pass (e.g. ₹599)
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
  // 3-Factor Review Survey Submission
  qualityRating?: number;         // 1 - 5 Work Quality
  behaviorRating?: number;        // 1 - 5 Behavior & Punctuality
  pricingRating?: number;         // 1 - 5 Pricing Fairness (1=Highly Overcharged, 5=Highly Fair)
  fairPricingReport?: 'FAIR' | 'OVERCHARGED';
  reviewRating?: number;
  reviewComment?: string;
  reviewedAt?: string;
}

// ─── Initial Seed Data ────────────────────────────────────────────────────────

export const initialSociety: Society = {
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

export const initialServices: Service[] = [
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

const initialUsers: User[] = [
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

const initialWorkers: WorkerProfile[] = [
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

const initialBookings: Booking[] = [
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

// ─── Persistent Storage File Path ──────────────────────────────────────────────
const DATA_DIR = path.join(process.cwd(), 'data');
const STORE_FILE = path.join(DATA_DIR, 'store_state.json');

// ─── Persistent Store Singleton ──────────────────────────────────────────────

class Store {
  private users: User[] = [...initialUsers];
  private workers: WorkerProfile[] = [...initialWorkers];
  private services: Service[] = [...initialServices];
  private bookings: Booking[] = [...initialBookings];
  private society: Society = { ...initialSociety };

  constructor() {
    this.loadFromDisk();
  }

  private loadFromDisk() {
    try {
      if (fs.existsSync(STORE_FILE)) {
        const raw = fs.readFileSync(STORE_FILE, 'utf-8');
        const data = JSON.parse(raw);
        if (data.users && Array.isArray(data.users)) this.users = data.users;
        if (data.workers && Array.isArray(data.workers)) this.workers = data.workers;
        if (data.services && Array.isArray(data.services)) this.services = data.services;
        if (data.bookings && Array.isArray(data.bookings)) this.bookings = data.bookings;
        if (data.society && typeof data.society === 'object') this.society = data.society;
      } else {
        this.persist();
      }
    } catch (err) {
      console.error('Error loading store state from disk:', err);
    }
  }

  private persist() {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      const state = {
        users: this.users,
        workers: this.workers,
        services: this.services,
        bookings: this.bookings,
        society: this.society,
      };
      fs.writeFileSync(STORE_FILE, JSON.stringify(state, null, 2), 'utf-8');
    } catch (err) {
      console.error('Error persisting store state to disk:', err);
    }
  }

  // ── Users
  getUsers(): User[] {
    return this.users;
  }

  findUserByEmail(email: string): User | undefined {
    return this.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  }

  findUserById(id: string): User | undefined {
    return this.users.find((u) => u.id === id);
  }

  addUser(user: User): User {
    this.users.unshift(user);
    this.persist();
    return user;
  }

  // ── Workers
  getWorkers(): WorkerProfile[] {
    return this.workers;
  }

  findWorkerByUserId(userId: string): WorkerProfile | undefined {
    return this.workers.find((w) => w.userId === userId);
  }

  addWorker(profile: WorkerProfile): WorkerProfile {
    this.workers.unshift(profile);
    this.persist();
    return profile;
  }

  isWorkerSubscribed(userId: string): boolean {
    const worker = this.findWorkerByUserId(userId);
    if (!worker || !worker.passValidUntil) return false;
    return new Date(worker.passValidUntil).getTime() > Date.now();
  }

  subscribeWorker(userId: string, plan: 'MONTHLY' | 'YEARLY'): WorkerProfile | undefined {
    const idx = this.workers.findIndex((w) => w.userId === userId);
    if (idx === -1) return undefined;
    const worker = this.workers[idx];
    const cost = plan === 'YEARLY' ? this.society.yearlyPassRate : this.society.monthlyPassRate;
    const addDays = plan === 'YEARLY' ? 365 : 30;

    const currentValidUntil = worker.passValidUntil ? new Date(worker.passValidUntil).getTime() : 0;
    const baseTime = Math.max(Date.now(), currentValidUntil);
    const newValidUntil = new Date(baseTime + addDays * 86400000).toISOString();

    this.workers[idx] = {
      ...worker,
      subscriptionPlan: plan,
      passValidUntil: newValidUntil,
      isAvailable: true, // Auto enable availability upon subscription
    };

    this.incrementWelfare(cost);
    this.persist();
    return this.workers[idx];
  }

  updateWorker(userId: string, update: Partial<WorkerProfile>): WorkerProfile | undefined {
    const idx = this.workers.findIndex((w) => w.userId === userId);
    if (idx !== -1) {
      this.workers[idx] = { ...this.workers[idx], ...update };
      this.persist();
      return this.workers[idx];
    }
    return undefined;
  }

  // ── Services
  getServices(): Service[] {
    return this.services;
  }

  updateServicePrice(id: string, price: number): Service | undefined {
    const idx = this.services.findIndex((s) => s.id === id);
    if (idx !== -1) {
      this.services[idx].price = price;
      this.persist();
      return this.services[idx];
    }
    return undefined;
  }

  // ── Bookings
  getBookings(): Booking[] {
    return this.bookings;
  }

  findBookingById(id: string): Booking | undefined {
    return this.bookings.find((b) => b.id === id);
  }

  addBooking(booking: Booking): Booking {
    this.bookings.unshift(booking);
    this.persist();
    return booking;
  }

  updateBooking(id: string, update: Partial<Booking>): Booking | undefined {
    const idx = this.bookings.findIndex((b) => b.id === id);
    if (idx !== -1) {
      const current = this.bookings[idx];
      const updated = { ...current, ...update };
      this.bookings[idx] = updated;

      const isBecomingComplete =
        (update.status === 'COMPLETED_PAID_DIGITALLY' ||
         update.status === 'COMPLETED_PAID_CASH' ||
         update.status === 'COMPLETED') &&
        !(current.status === 'COMPLETED_PAID_DIGITALLY' ||
          current.status === 'COMPLETED_PAID_CASH' ||
          current.status === 'COMPLETED');

      // Real-time payout crediting with Digital vs Cash breakdown
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
        // Society welfare pool contribution
        this.incrementWelfare(Math.round(updated.totalAmount * 0.05));
      }

      // Review Rating aggregation
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

      this.persist();
      return this.bookings[idx];
    }
    return undefined;
  }

  // ── Society / Welfare
  getSociety(): Society {
    return this.society;
  }

  updateSocietyPassRates(monthlyPassRate?: number, yearlyPassRate?: number): Society {
    if (monthlyPassRate !== undefined && !isNaN(monthlyPassRate) && monthlyPassRate > 0) {
      this.society.monthlyPassRate = monthlyPassRate;
    }
    if (yearlyPassRate !== undefined && !isNaN(yearlyPassRate) && yearlyPassRate > 0) {
      this.society.yearlyPassRate = yearlyPassRate;
    }
    this.persist();
    return this.society;
  }

  incrementWelfare(amount: number): void {
    this.society.welfareFundBalance += amount;
    this.persist();
  }

  // ── Dynamic Platform Metrics
  getPlatformMetrics() {
    const completedList = this.bookings.filter(
      (b) =>
        b.status === 'COMPLETED_PAID_DIGITALLY' ||
        b.status === 'COMPLETED_PAID_CASH' ||
        b.status === 'COMPLETED'
    );
    const totalVolume = completedList.reduce((acc, b) => acc + b.totalAmount, 0) + 75500;
    const activeArtisans = this.workers.length;
    const verifiedArtisans = this.workers.filter((w) => w.kycStatus === 'VERIFIED').length;
    const pendingKyc = this.workers.filter((w) => w.kycStatus === 'PENDING').length;
    const totalCompletedJobs = completedList.length + 182;

    return {
      totalVolume,
      activeArtisans,
      verifiedArtisans,
      pendingKyc,
      totalCompletedJobs,
      welfareFundBalance: this.society.welfareFundBalance,
    };
  }
}

const globalStore = globalThis as unknown as { appStore?: Store };
export const appStore = globalStore.appStore ?? new Store();
if (process.env.NODE_ENV !== 'production') {
  globalStore.appStore = appStore;
}

export default appStore;
