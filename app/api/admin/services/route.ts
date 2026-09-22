import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { name, description, duration, price, image, active, order } = body;

    const service = await prisma.service.create({
      data: {
        name,
        description,
        duration: Number(duration),
        price: price ? Number(price) : null,
        image,
        active: active ?? true,
        order: order ?? 0,
      },
    });

    return NextResponse.json(service);
  } catch (error) {
    return NextResponse.json({ error: 'Error creating service' }, { status: 500 });
  }
}
