import { NextRequest, NextResponse } from 'next/server';
import appStore, { Role } from '@/lib/store';
import prisma from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      name,
      email,
      password,
      address,       // Address / Village Cluster
      role,          // 'CUSTOMER' | 'WORKER'
      trade,         // Worker: Primary Trade Category
      kycDocName,    // Worker: Uploaded Sample KYC Document
      phone,
    } = body;

    if (!name || !email || !password || !role) {
      return NextResponse.json(
        { error: 'Name, email, password, and role are required.' },
        { status: 400 }
      );
    }

    if (!address) {
      return NextResponse.json(
        { error: 'Address / Village Cluster is required.' },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();

    // Check if user already exists
    const existing = appStore.findUserByEmail(cleanEmail);
    if (existing) {
      return NextResponse.json(
        { error: 'An account with this email already exists. Please sign in.' },
        { status: 409 }
      );
    }

    const userId = `usr-${Date.now()}`;
    const newUser = {
      id: userId,
      name: name.trim(),
      email: cleanEmail,
      password: password.trim(),
      phone: phone?.trim() || '9876543210',
      role: role as Role,
      address: address.trim(),
      trade: trade?.trim(),
      localSociety: 'Primary Cooperative Services Society',
      kycDocName: kycDocName?.trim() || (role === 'WORKER' ? 'artisan_id_card.pdf' : undefined),
      isVerified: true,
      createdAt: new Date().toISOString(),
    };

    appStore.addUser(newUser);

    let workerProfile = undefined;

    if (role === 'WORKER') {
      const tradeSkillMap: Record<string, string[]> = {
        Plumbing:        ['Tap Repair', 'Pipe Fitting', 'Drainage', 'Tank Cleaning'],
        Electrical:      ['Wiring', 'Socket Repair', 'Fan Installation', 'MCB Fitting'],
        Carpentry:       ['Furniture Assembly', 'Door Fitting', 'Wood Polish', 'Shelving'],
        Cleaning:        ['Home Deep Clean', 'Kitchen Sanitation', 'Floor Scrubbing'],
        'Appliance Fix': ['Appliance Diagnosis', 'Motor Repair', 'Pump Servicing'],
      };

      const skills = trade ? (tradeSkillMap[trade] || [trade]) : ['General Maintenance'];

      workerProfile = appStore.addWorker({
        id: `wp-${Date.now()}`,
        userId,
        name: newUser.name,
        email: newUser.email,
        phone: newUser.phone,
        trade: newUser.trade || 'General Maintenance',
        localSociety: newUser.localSociety,
        skills,
        bio: `${trade || 'Service'} artisan registered with Primary Cooperative Services Society.`,
        isAvailable: true,
        kycStatus: 'PENDING',
        kycDocName: newUser.kycDocName,
        passValidUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        totalEarnings: 0,
        digitalEarnings: 0,
        cashEarnings: 0,
        completedJobs: 0,
        rating: 5.0,
        qualityRating: 5.0,
        behaviorRating: 5.0,
        fairPricingPercentage: 100,
        fairPricingVotes: 1,
        totalReviewsCount: 1,
        outstandingDues: 0,
        accountStatus: 'ACTIVE',
      });
    }

    // Attempt PostgreSQL database synchronization via Prisma asynchronously
    try {
      await prisma.user.create({
        data: {
          id: newUser.id,
          name: newUser.name,
          email: newUser.email,
          password: newUser.password,
          phone: newUser.phone,
          role: newUser.role,
          address: newUser.address,
          trade: newUser.trade,
          localSociety: newUser.localSociety,
          kycDocName: newUser.kycDocName,
          isVerified: true,
        },
      });

      if (role === 'WORKER' && workerProfile) {
        await prisma.workerProfile.create({
          data: {
            id: workerProfile.id,
            userId: workerProfile.userId,
            skills: workerProfile.skills,
            bio: workerProfile.bio,
            isAvailable: workerProfile.isAvailable,
            kycStatus: 'PENDING',
            totalEarnings: 0,
            digitalEarnings: 0,
            cashEarnings: 0,
            completedJobs: 0,
            rating: 5.0,
          },
        });
      }
    } catch {
      // In-memory store maintains synchronization
    }

    return NextResponse.json(
      {
        message: 'Account registered successfully.',
        user: newUser,
        workerProfile,
      },
      { status: 201 }
    );
  } catch (err) {
    console.error('Registration error:', err);
    return NextResponse.json({ error: 'Failed to process registration.' }, { status: 500 });
  }
}
