import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/nextauth';

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const email = searchParams.get('userId'); // actually email passed from client

  // Find user by email
  const user = await prisma.user.findUnique({ where: { email: email || '' } });
  if (!user) return NextResponse.json({ visits: [], appointments: [], loyaltyVisits: 10, loyaltyMessage: '' });

  const visits = await prisma.visit.findMany({
    where: { userId: user.id },
    orderBy: { date: 'desc' },
  });

  const appointments = await prisma.appointment.findMany({
    where: { customerName: user.name || '' }, // Or maybe search by phone? The user doesn't have phone in User table. But we will fetch by customerName for now. Wait, let's fetch by email if we can? We don't store email in appointment. Let's fetch by name since Google gives us name.
    orderBy: { date: 'desc' },
    include: { service: true, barber: true },
  });

  const config = await prisma.siteConfig.findMany({
    where: { key: { in: ['loyaltyVisits', 'loyaltyMessage'] } },
  });

  const loyaltyVisits = parseInt(config.find(c => c.key === 'loyaltyVisits')?.value || '10');
  const loyaltyMessage = config.find(c => c.key === 'loyaltyMessage')?.value || '¡Felicitaciones! Ganaste una recompensa especial. Mostrá este mensaje en tu próxima visita.';

  return NextResponse.json({ visits, appointments, loyaltyVisits, loyaltyMessage });
}
