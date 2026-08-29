import { NextRequest, NextResponse } from 'next/server';
import appStore from '@/lib/store';
import prisma from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email address and password are required.' },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();

    // Check store / DB
    let user = appStore.findUserByEmail(cleanEmail);

    if (!user) {
      try {
        const dbUser = await prisma.user.findUnique({
          where: { email: cleanEmail },
          include: { workerProfile: true },
        });

        if (dbUser) {
          user = {
            id: dbUser.id,
            name: dbUser.name,
            email: dbUser.email,
            password: dbUser.password,
            phone: dbUser.phone || undefined,
            role: dbUser.role,
            address: dbUser.address || undefined,
            trade: dbUser.trade || undefined,
            localSociety: dbUser.localSociety || undefined,
            kycDocName: dbUser.kycDocName || undefined,
            isVerified: dbUser.isVerified,
            createdAt: dbUser.createdAt.toISOString(),
          };
          appStore.addUser(user);
        }
      } catch {
        // Continue with store
      }
    }

    if (!user) {
      return NextResponse.json(
        { error: 'No account found with this email address. Please sign up first.' },
        { status: 404 }
      );
    }

    // Verify password
    if (user.password && user.password !== cleanPassword) {
      return NextResponse.json(
        { error: 'Invalid password. Please check your credentials and try again.' },
        { status: 401 }
      );
    }

    const workerProfile = user.role === 'WORKER' ? appStore.findWorkerByUserId(user.id) : undefined;

    return NextResponse.json({
      message: 'Sign in successful.',
      user,
      workerProfile,
    });
  } catch (err) {
    console.error('Login error:', err);
    return NextResponse.json({ error: 'Failed to process sign in.' }, { status: 500 });
  }
}
