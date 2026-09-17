import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { barberId, amount, description, serviceId, date } = body;

    if (!barberId || amount === undefined || !date) {
      return NextResponse.json(
        { error: 'barberId, amount, and date are required' },
        { status: 400 }
      );
    }

    const manualIncome = await prisma.manualIncome.create({
      data: {
        barberId,
        amount: parseFloat(amount),
        description: description || null,
        serviceId: serviceId || null,
        date,
      },
    });

    return NextResponse.json(manualIncome, { status: 201 });
  } catch (error) {
    console.error('Error creating manual income:', error);
    return NextResponse.json(
      { error: 'Error creating manual income' },
      { status: 500 }
    );
  }
}
