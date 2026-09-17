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
    const { name, description, photo, whatsapp, order, active } = body;
    
    // We expect Next to resolve params properly, but in newer versions it's a promise, we await it if needed, but standard is fine.

    const { id } = await params;
    const barber = await prisma.barber.update({
      where: { id },
      data: { name, description, photo, whatsapp, order, active },
    });
    return NextResponse.json(barber);
  } catch (error) {
    return NextResponse.json({ error: 'Error updating barber' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: Params) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await params;
    await prisma.barber.delete({
      where: { id },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Error deleting barber' }, { status: 500 });
  }
}
