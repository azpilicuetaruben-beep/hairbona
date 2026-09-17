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
    const from = searchParams.get('from');
    const to = searchParams.get('to');

    if (!from || !to) {
      return NextResponse.json({ error: 'From and to dates are required' }, { status: 400 });
    }

    const dateFilter = from === to 
      ? from 
      : { gte: from, lte: to };

    // Get all completed appointments for the period
    const appointments = await prisma.appointment.findMany({
      where: {
        date: dateFilter,
        status: 'completed',
      },
      include: {
        service: true,
        barber: true,
      },
    });

    // Get all manual incomes for the period
    const manualIncomes = await prisma.manualIncome.findMany({
      where: {
        date: dateFilter,
      },
      include: {
        barber: true,
        service: true,
      },
    });

    // Group by barber
    const earningsByBarber = [...appointments, ...manualIncomes].reduce((acc, item) => {
      const barberId = item.barberId;
      if (!acc[barberId]) {
        acc[barberId] = {
          barber: item.barber,
          totalEarnings: 0,
          appointmentsCount: 0,
          services: [],
        };
      }

      const isManual = 'amount' in item;

      if (isManual) {
        // Handle ManualIncome
        const manual = item as typeof manualIncomes[0];
        acc[barberId].totalEarnings += manual.amount;
        acc[barberId].appointmentsCount += 1;
        
        acc[barberId].services.push({
          id: manual.id,
          name: manual.service?.name || manual.description || 'Ingreso Manual',
          price: manual.amount,
          time: '-', // No time for manual
          customerName: 'Cliente Sin Turno',
          isManual: true,
          date: manual.date
        });
      } else {
        // Handle Appointment
        const app = item as typeof appointments[0];
        acc[barberId].totalEarnings += (app.price || app.service.price || 0);
        acc[barberId].appointmentsCount += 1;
        
        acc[barberId].services.push({
          id: app.id,
          name: app.service.name,
          price: app.price || app.service.price || 0,
          time: app.startTime,
          customerName: app.customerName,
          isManual: false,
          date: app.date
        });
      }

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
