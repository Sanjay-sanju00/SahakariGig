import { NextRequest, NextResponse } from 'next/server';
import appStore from '@/lib/store';

export async function GET() {
  try {
    const society = appStore.getSociety();
    const services = appStore.getServices();
    const metrics = appStore.getPlatformMetrics();

    return NextResponse.json({ society, services, metrics });
  } catch (err) {
    console.error('Fetch society error:', err);
    return NextResponse.json({ error: 'Failed to fetch society data.' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { serviceId, price, monthlyPassRate, yearlyPassRate } = body;

    // Handle Membership Pass Rate update (Admin Only Governance)
    if (monthlyPassRate !== undefined || yearlyPassRate !== undefined) {
      const numMonthly = monthlyPassRate !== undefined ? Number(monthlyPassRate) : undefined;
      const numYearly = yearlyPassRate !== undefined ? Number(yearlyPassRate) : undefined;

      if ((numMonthly !== undefined && (isNaN(numMonthly) || numMonthly <= 0)) ||
          (numYearly !== undefined && (isNaN(numYearly) || numYearly <= 0))) {
        return NextResponse.json({ error: 'Valid positive pass rates are required.' }, { status: 400 });
      }

      const updatedSociety = appStore.updateSocietyPassRates(numMonthly, numYearly);
      return NextResponse.json({ society: updatedSociety });
    }

    // Handle Service Price update
    if (serviceId && price !== undefined) {
      const updatedService = appStore.updateServicePrice(serviceId, Number(price));
      if (!updatedService) {
        return NextResponse.json({ error: 'Service not found.' }, { status: 404 });
      }
      return NextResponse.json({ service: updatedService });
    }

    return NextResponse.json({ error: 'Invalid update payload.' }, { status: 400 });
  } catch (err) {
    console.error('Update society error:', err);
    return NextResponse.json({ error: 'Failed to update society settings.' }, { status: 500 });
  }
}
