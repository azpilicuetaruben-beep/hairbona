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
    const from = searchParams.get('from');
    const to = searchParams.get('to');

    let where: Record<string, unknown> = {};

    if (date) {
      where.date = date;
    } else if (from) {
      where.date = {
        gte: from,
        ...(to ? { lte: to } : {}),
      };
    }

    const appointments = await prisma.appointment.findMany({
      where,
      include: { service: true, barber: true },
      orderBy: [{ date: 'asc' }, { startTime: 'asc' }],
    });

    return NextResponse.json(appointments);
  } catch (error) {
    console.error('Error fetching admin appointments:', error);
    return NextResponse.json(
      { error: 'Error fetching appointments' },
      { status: 500 }
    );
  }
}
