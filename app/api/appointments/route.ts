import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { customerName, customerPhone, date, startTime, serviceId, barberId } = body;

    if (!customerName || !customerPhone || !date || !startTime || !serviceId || !barberId) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    // Get service to calculate end time
    const service = await prisma.service.findUnique({
      where: { id: serviceId },
    });

    if (!service) {
      return NextResponse.json({ error: 'Service not found' }, { status: 404 });
    }

    // Calculate end time
    const [startH, startM] = startTime.split(':').map(Number);
    const endMinutes = startH * 60 + startM + service.duration;
    const endTime = `${String(Math.floor(endMinutes / 60)).padStart(2, '0')}:${String(endMinutes % 60).padStart(2, '0')}`;

    // Check for conflicts one more time for this specific barber
    const conflict = await prisma.appointment.findFirst({
      where: {
        date: date,
        barberId: barberId,
        status: { not: 'cancelled' },
        OR: [
          {
            AND: [
              { startTime: { lte: startTime } },
              { endTime: { gt: startTime } },
            ],
          },
          {
            AND: [
              { startTime: { lt: endTime } },
              { endTime: { gte: endTime } },
            ],
          },
          {
            AND: [
              { startTime: { gte: startTime } },
              { endTime: { lte: endTime } },
            ],
          },
        ],
      },
    });

    if (conflict) {
      return NextResponse.json(
        { error: 'Este horario ya no está disponible con este barbero. Por favor elegí otro.' },
        { status: 409 }
      );
    }

    // Create appointment
    const appointment = await prisma.appointment.create({
      data: {
        customerName,
        customerPhone,
        date,
        startTime,
        endTime,
        serviceId,
        barberId,
        status: 'confirmed',
      },
      include: {
        service: true,
        barber: true,
      },
    });

    return NextResponse.json(appointment, { status: 201 });
  } catch (error) {
    console.error('Error creating appointment:', error);
    return NextResponse.json(
      { error: 'Error creating appointment' },
      { status: 500 }
    );
  }
}
