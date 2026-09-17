import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');
    const serviceId = searchParams.get('serviceId');
    const barberId = searchParams.get('barberId');

    if (!date || !serviceId || !barberId) {
      return NextResponse.json(
        { error: 'date, serviceId and barberId are required' },
        { status: 400 }
      );
    }

    // Get the service to know its duration
    const service = await prisma.service.findUnique({
      where: { id: serviceId },
    });

    if (!service) {
      return NextResponse.json({ error: 'Service not found' }, { status: 404 });
    }

    // Get day of week (0=Sunday, 1=Monday...6=Saturday)
    const dateObj = new Date(date + 'T12:00:00');
    const dayOfWeek = dateObj.getDay();

    // Get schedule rules for this day (either specific to this barber, or global)
    const scheduleRules = await prisma.scheduleRule.findMany({
      where: {
        dayOfWeek: dayOfWeek,
        isBlock: false,
        OR: [
          { barberId: barberId },
          { barberId: null }
        ]
      },
    });

    // Get date-specific blocks (either specific to this barber, or global)
    const dateBlocks = await prisma.scheduleRule.findMany({
      where: {
        date: date,
        isBlock: true,
        OR: [
          { barberId: barberId },
          { barberId: null }
        ]
      },
    });

    // Get existing appointments for this date AND this specific barber
    const existingAppointments = await prisma.appointment.findMany({
      where: {
        date: date,
        barberId: barberId,
        status: { not: 'cancelled' },
      },
    });

    // Generate available time slots
    const availableSlots: string[] = [];
    const slotInterval = 15; // 15-minute intervals

    for (const rule of scheduleRules) {
      const [startH, startM] = rule.startTime.split(':').map(Number);
      const [endH, endM] = rule.endTime.split(':').map(Number);

      let currentMinutes = startH * 60 + startM;
      const endMinutes = endH * 60 + endM;

      while (currentMinutes + service.duration <= endMinutes) {
        const slotStart = `${String(Math.floor(currentMinutes / 60)).padStart(2, '0')}:${String(currentMinutes % 60).padStart(2, '0')}`;
        const slotEndMinutes = currentMinutes + service.duration;
        const slotEnd = `${String(Math.floor(slotEndMinutes / 60)).padStart(2, '0')}:${String(slotEndMinutes % 60).padStart(2, '0')}`;

        // Check if slot is blocked by date-specific block
        const isBlocked = dateBlocks.some((block) => {
          const [bStartH, bStartM] = block.startTime.split(':').map(Number);
          const [bEndH, bEndM] = block.endTime.split(':').map(Number);
          const blockStart = bStartH * 60 + bStartM;
          const blockEnd = bEndH * 60 + bEndM;
          return currentMinutes < blockEnd && slotEndMinutes > blockStart;
        });

        // Check if slot conflicts with existing appointments
        const hasConflict = existingAppointments.some((apt) => {
          const [aStartH, aStartM] = apt.startTime.split(':').map(Number);
          const [aEndH, aEndM] = apt.endTime.split(':').map(Number);
          const aptStart = aStartH * 60 + aStartM;
          const aptEnd = aEndH * 60 + aEndM;
          return currentMinutes < aptEnd && slotEndMinutes > aptStart;
        });

        if (!isBlocked && !hasConflict) {
          availableSlots.push(slotStart);
        }

        currentMinutes += slotInterval;
      }
    }

    // Check if date is in the past
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const selectedDate = new Date(date + 'T00:00:00');

    if (selectedDate < today) {
      return NextResponse.json([]);
    }

    // If it's today, filter out past time slots
    if (selectedDate.getTime() === today.getTime()) {
      const now = new Date();
      const currentTime = now.getHours() * 60 + now.getMinutes();
      const filteredSlots = availableSlots.filter((slot) => {
        const [h, m] = slot.split(':').map(Number);
        return h * 60 + m > currentTime;
      });
      return NextResponse.json(filteredSlots);
    }

    return NextResponse.json(availableSlots);
  } catch (error) {
    console.error('Error fetching availability:', error);
    return NextResponse.json(
      { error: 'Error fetching availability' },
      { status: 500 }
    );
  }
}
