import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const services = await prisma.service.findMany({
      where: { active: true },
      orderBy: { order: 'asc' },
    });
    const response = NextResponse.json(services);
    response.headers.set('Cache-Control', 's-maxage=60, stale-while-revalidate=300');
    return response;
  } catch (error) {
    console.error('Error fetching services:', error);
    return NextResponse.json({ error: 'Error fetching services' }, { status: 500 });
  }
}
