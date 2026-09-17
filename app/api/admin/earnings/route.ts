import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');

    if (!date) {
      return NextResponse.json({ error: 'Date is required' }, { status: 400 });
    }

    // Get all completed appointments for the day
    const appointments = await prisma.appointment.findMany({
      where: {
        date: date,
        status: 'completed',
      },
      include: {
        service: true,
        barber: true,
      },
    });

    // Group by barber
    const earningsByBarber = appointments.reduce((acc, app) => {
      const barberId = app.barberId;
      if (!acc[barberId]) {
        acc[barberId] = {
          barber: app.barber,
          totalEarnings: 0,
          appointmentsCount: 0,
          services: [],
        };
      }

      // Add price to earnings (fallback to service price if historical price is missing somehow)
      acc[barberId].totalEarnings += (app.price || app.service.price || 0);
      acc[barberId].appointmentsCount += 1;
      
      // Keep track of services performed
      acc[barberId].services.push({
        id: app.id,
        name: app.service.name,
        price: app.price || app.service.price || 0,
        time: app.startTime,
        customerName: app.customerName,
      });

      return acc;
    }, {} as Record<string, any>);

    return NextResponse.json(Object.values(earningsByBarber));
  } catch (error) {
    console.error('Error fetching earnings:', error);
    return NextResponse.json(
      { error: 'Error fetching earnings' },
      { status: 500 }
    );
  }
}
