import { NextRequest, NextResponse } from 'next/server';
import appStore, { Booking, BookingStatus, PaymentStatus } from '@/lib/store';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const customerId = searchParams.get('customerId');
    const workerId = searchParams.get('workerId');
    const status = searchParams.get('status') as BookingStatus | null;

    let bookings = appStore.getBookings();

    if (customerId) {
      bookings = bookings.filter((b) => b.customerId === customerId);
    }
    if (workerId) {
      const includePending = searchParams.get('includePending') === 'true';
      if (includePending) {
        bookings = bookings.filter(
          (b) => b.workerId === workerId || (!b.workerId && b.status === 'PENDING_ACCEPTANCE')
        );
      } else {
        bookings = bookings.filter((b) => b.workerId === workerId);
      }
    }
    if (status) {
      bookings = bookings.filter((b) => b.status === status);
    }

    return NextResponse.json({ bookings });
  } catch (err) {
    console.error('Fetch bookings error:', err);
    return NextResponse.json({ error: 'Failed to fetch bookings.' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      customerId,
      customerName,
      customerPhone,
      customerAddress,
      serviceId,
      serviceName,
      problemDescription,
      scheduledDate,
      address,
      totalAmount,
    } = body;

    if (!customerId || !serviceId || !scheduledDate || !address || !totalAmount) {
      return NextResponse.json({ error: 'Missing required booking details.' }, { status: 400 });
    }

    const customerUser = appStore.findUserById(customerId);

    // Step 1: Customer creates booking with ZERO upfront charge
    const newBooking: Booking = {
      id: `bk-${Date.now()}`,
      customerId,
      customerName: customerName || customerUser?.name || 'Resident Customer',
      customerPhone: customerPhone || customerUser?.phone || '9823011223',
      customerAddress: customerAddress || address,
      serviceId,
      serviceName: serviceName || 'Cooperative Service',
      problemDescription: problemDescription?.trim() || 'General maintenance and repair request.',
      status: 'PENDING_ACCEPTANCE',
      scheduledDate,
      address,
      totalAmount: Number(totalAmount),
      paymentStatus: 'PENDING',
      createdAt: new Date().toISOString(),
    };

    appStore.addBooking(newBooking);

    return NextResponse.json({ booking: newBooking }, { status: 201 });
  } catch (err) {
    console.error('Create booking error:', err);
    return NextResponse.json({ error: 'Failed to create booking.' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, action, workerId, workerName, reviewRating, reviewComment } = body;

    if (!id) {
      return NextResponse.json({ error: 'Booking ID is required.' }, { status: 400 });
    }

    const currentBooking = appStore.findBookingById(id);
    if (!currentBooking) {
      return NextResponse.json({ error: 'Booking record not found.' }, { status: 404 });
    }

    let updateData: Partial<Booking> = {};
    const now = new Date().toISOString();

    // ── Strict Post-Service Lifecycle Actions ──

    // Step 1: Worker Accepts Request -> Sets IN_PROGRESS (No payment requested yet)
    if (action === 'ACCEPT_JOB') {
      const activeWorkerId = workerId || currentBooking.workerId;
      if (activeWorkerId && !appStore.isWorkerSubscribed(activeWorkerId)) {
        return NextResponse.json(
          { error: 'Active membership pass required to accept jobs. Please subscribe or renew your pass.' },
          { status: 403 }
        );
      }

      updateData = {
        status: 'IN_PROGRESS',
        workerId: activeWorkerId,
        workerName: workerName || currentBooking.workerName || 'Assigned Artisan',
        acceptedAt: now,
      };
    }

    // Step 2: Worker Finishes Physical Work -> Requests Settlement (AWAITING_PAYMENT)
    else if (action === 'REQUEST_SETTLEMENT') {
      updateData = {
        status: 'AWAITING_PAYMENT',
        settlementRequestedAt: now,
      };
    }

    // Step 3 Option A: Customer Pays Digitally in-app -> COMPLETED_PAID_DIGITALLY
    else if (action === 'PAY_DIGITALLY' || action === 'PAY_NOW') {
      updateData = {
        status: 'COMPLETED_PAID_DIGITALLY',
        paymentStatus: 'PAID_DIGITAL' as PaymentStatus,
        paymentMethod: 'DIGITAL',
        paidAt: now,
        completedAt: now,
      };
    }

    // Step 3 Option B: Worker Collects Cash on Site -> COMPLETED_PAID_CASH
    else if (action === 'COLLECT_CASH') {
      updateData = {
        status: 'COMPLETED_PAID_CASH',
        paymentStatus: 'PAID_CASH' as PaymentStatus,
        paymentMethod: 'CASH',
        paidAt: now,
        completedAt: now,
      };
    }

    // Step 4: Customer submits review
    else if (action === 'SUBMIT_REVIEW') {
      updateData = {
        reviewRating: Number(reviewRating) || 5,
        reviewComment: reviewComment?.trim() || 'Service completed satisfactorily.',
        reviewedAt: now,
      };
    }

    // Cancellation / Decline
    else if (action === 'DECLINE_JOB' || action === 'CANCEL_JOB') {
      updateData = {
        status: 'CANCELLED',
      };
    } else {
      // Direct field update fallback
      const { status, paymentStatus, paymentMethod } = body;
      updateData = {
        ...(status && { status }),
        ...(workerId && { workerId }),
        ...(workerName && { workerName }),
        ...(paymentStatus && { paymentStatus }),
        ...(paymentMethod && { paymentMethod }),
      };
    }

    const updated = appStore.updateBooking(id, updateData);

    return NextResponse.json({ booking: updated });
  } catch (err) {
    console.error('Update booking error:', err);
    return NextResponse.json({ error: 'Failed to update booking status.' }, { status: 500 });
  }
}
