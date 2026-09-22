import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { NextRequest, NextResponse } from 'next/server';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await params;
    const body = await request.json();
    const { status } = body;

    if (!['confirmed', 'completed', 'cancelled'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    const appointment = await prisma.appointment.update({
      where: { id },
      data: { status },
      include: { service: true, barber: true },
    });

    // Auto-register visit when completing an appointment
    if (status === 'completed') {
      // Find user by phone number matching customerPhone
      const userByPhone = await prisma.user.findFirst({
        where: { email: { not: null } },
        include: { accounts: true },
      });
      // Try to find a user whose session/account corresponds to this appointment
      // For now, we track by appointmentId to avoid duplicate visits
      const existingVisit = await prisma.visit.findFirst({
        where: { appointmentId: id },
      });
      if (!existingVisit) {
        // Try finding user by matching email first
        let matchedUser = null;
        if (appointment.customerEmail) {
          matchedUser = await prisma.user.findUnique({
            where: { email: appointment.customerEmail }
          });
        }
        
        // Fallback to matching by exact name if no email is found (legacy appointments)
        if (!matchedUser) {
          matchedUser = await prisma.user.findFirst({
            where: { 
              name: { equals: appointment.customerName, mode: 'insensitive' }
            }
          });
        }

        if (matchedUser) {
          await prisma.visit.create({
            data: {
              userId: matchedUser.id,
              appointmentId: id,
              date: appointment.date,
              serviceName: appointment.service.name,
              barberName: appointment.barber.name,
            },
          });
        }
      }
    }

    return NextResponse.json(appointment);
  } catch (error) {
    console.error('Error updating appointment:', error);
    return NextResponse.json(
      { error: 'Error updating appointment' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await params;
    await prisma.appointment.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting appointment:', error);
    return NextResponse.json(
      { error: 'Error deleting appointment' },
      { status: 500 }
    );
  }
}
