import { NextRequest, NextResponse } from 'next/server';
import appStore from '@/lib/store';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const kycStatus = searchParams.get('kycStatus');
    const available = searchParams.get('available');

    let workers = appStore.getWorkers();

    if (kycStatus) {
      workers = workers.filter((w) => w.kycStatus === kycStatus);
    }
    if (available === 'true') {
      workers = workers.filter((w) => w.isAvailable);
    }

    return NextResponse.json({ workers });
  } catch (err) {
    console.error('Fetch workers error:', err);
    return NextResponse.json({ error: 'Failed to fetch workers.' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, action, plan, isAvailable, kycStatus, kycDocName, totalEarnings, completedJobs } = body;

    if (!userId) {
      return NextResponse.json({ error: 'Worker userId is required.' }, { status: 400 });
    }

    // Handle Membership Pass Subscription / Renewal
    if (action === 'SUBSCRIBE') {
      const selectedPlan = plan === 'YEARLY' ? 'YEARLY' : 'MONTHLY';
      const updated = appStore.subscribeWorker(userId, selectedPlan);
      if (!updated) {
        return NextResponse.json({ error: 'Worker profile not found.' }, { status: 404 });
      }
      return NextResponse.json({ worker: updated });
    }

    // Enforce active subscription before allowing online availability
    if (isAvailable === true) {
      const isSubscribed = appStore.isWorkerSubscribed(userId);
      if (!isSubscribed) {
        return NextResponse.json(
          { error: 'Active membership pass required to go online. Please purchase or renew your subscription.' },
          { status: 403 }
        );
      }
    }

    const updated = appStore.updateWorker(userId, {
      ...(isAvailable !== undefined && { isAvailable }),
      ...(kycStatus && { kycStatus }),
      ...(kycDocName && { kycDocName }),
      ...(totalEarnings !== undefined && { totalEarnings }),
      ...(completedJobs !== undefined && { completedJobs }),
    });

    if (!updated) {
      return NextResponse.json({ error: 'Worker profile not found.' }, { status: 404 });
    }

    // If KYC is verified, add contribution to welfare pool
    if (kycStatus === 'VERIFIED') {
      appStore.incrementWelfare(250);
    }

    return NextResponse.json({ worker: updated });
  } catch (err) {
    console.error('Update worker error:', err);
    return NextResponse.json({ error: 'Failed to update worker profile.' }, { status: 500 });
  }
}
