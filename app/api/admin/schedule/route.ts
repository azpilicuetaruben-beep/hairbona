import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const rules = await prisma.scheduleRule.findMany({
      orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }],
    });
    return NextResponse.json(rules);
  } catch (error) {
    console.error('Error fetching schedule:', error);
    return NextResponse.json(
      { error: 'Error fetching schedule' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { dayOfWeek, date, startTime, endTime, isBlock, label } = body;

    if (!startTime || !endTime) {
      return NextResponse.json(
        { error: 'startTime and endTime are required' },
        { status: 400 }
      );
    }

    const rule = await prisma.scheduleRule.create({
      data: {
        dayOfWeek: dayOfWeek ?? null,
        date: date ?? null,
        startTime,
        endTime,
        isBlock: isBlock ?? false,
        label: label ?? null,
      },
    });

    return NextResponse.json(rule, { status: 201 });
  } catch (error) {
    console.error('Error creating schedule rule:', error);
    return NextResponse.json(
      { error: 'Error creating schedule rule' },
      { status: 500 }
    );
  }
}
