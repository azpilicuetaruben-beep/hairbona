import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function GET(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const email = searchParams.get('userId'); // actually email passed from client

  // Find user by email
  const user = await prisma.user.findUnique({ where: { email: email || '' } });
  if (!user) return NextResponse.json({ visits: [], loyaltyVisits: 10, loyaltyMessage: '' });

  const visits = await prisma.visit.findMany({
    where: { userId: user.id },
    orderBy: { date: 'desc' },
  });

  const config = await prisma.siteConfig.findMany({
    where: { key: { in: ['loyaltyVisits', 'loyaltyMessage'] } },
  });

  const loyaltyVisits = parseInt(config.find(c => c.key === 'loyaltyVisits')?.value || '10');
  const loyaltyMessage = config.find(c => c.key === 'loyaltyMessage')?.value || '¡Felicitaciones! Ganaste una recompensa especial. Mostrá este mensaje en tu próxima visita.';

  return NextResponse.json({ visits, loyaltyVisits, loyaltyMessage });
}
