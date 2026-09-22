import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

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

    const response = NextResponse.json(barbers);
    response.headers.set('Cache-Control', 's-maxage=60, stale-while-revalidate=300');
    return response;
  } catch (error) {
    console.error('Error fetching barbers:', error);
    return NextResponse.json(
      { error: 'Error fetching barbers' },
      { status: 500 }
    );
  }
}
