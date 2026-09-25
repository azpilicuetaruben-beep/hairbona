import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const barbers = await prisma.barber.findMany({
      where: {
        active: true,
      },
      orderBy: {
        order: 'asc',
      },
    });

    return NextResponse.json(barbers);
  } catch (error) {
    console.error('Error fetching barbers:', error);
    return NextResponse.json(
      { error: 'Error fetching barbers' },
      { status: 500 }
    );
  }
}
