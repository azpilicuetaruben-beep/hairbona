import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { NextRequest, NextResponse } from 'next/server';

type Params = {
  params: Promise<{
    id: string;
  }>;
};

export async function PATCH(request: NextRequest, { params }: Params) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { name, description, duration, price } = body;
    
    const { id } = await params;
    const service = await prisma.service.update({
      where: { id },
      data: { name, description, duration, price },
    });
    return NextResponse.json(service);
  } catch (error) {
    return NextResponse.json({ error: 'Error updating service' }, { status: 500 });
  }
}
