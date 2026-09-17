import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const barbers = await prisma.barber.findMany({
      orderBy: { order: 'asc' },
    });
    return NextResponse.json(barbers);
  } catch (error) {
    return NextResponse.json({ error: 'Error fetching barbers' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { name, description, photo, whatsapp, order, active } = body;

    const barber = await prisma.barber.create({
      data: { name, description, photo, whatsapp, order, active },
    });
    return NextResponse.json(barber, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Error creating barber' }, { status: 500 });
  }
}
