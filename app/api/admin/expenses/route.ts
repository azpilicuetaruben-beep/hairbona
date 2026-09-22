import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function GET(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const year = searchParams.get('year') || new Date().getFullYear().toString();
  const month = searchParams.get('month');

  let dateFilter: object;
  if (month) {
    const paddedMonth = month.padStart(2, '0');
    dateFilter = { startsWith: `${year}-${paddedMonth}` };
  } else {
    dateFilter = { startsWith: year };
  }

  const expenses = await prisma.expense.findMany({
    where: { date: dateFilter },
    orderBy: { date: 'desc' },
  });

  return NextResponse.json(expenses);
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await request.json();
  const { amount, description, date } = body;

  if (!amount || !description || !date) {
    return NextResponse.json({ error: 'Faltan campos requeridos' }, { status: 400 });
  }

  const expense = await prisma.expense.create({
    data: { amount: parseFloat(amount), description, date },
  });

  return NextResponse.json(expense, { status: 201 });
}
