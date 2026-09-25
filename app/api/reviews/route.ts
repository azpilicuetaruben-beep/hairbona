import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/nextauth';
import { sendNotificationEmail } from '@/lib/email';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const reviews = await prisma.review.findMany({
      where: { approved: true },
      include: {
        user: {
          select: { name: true, image: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(reviews);
  } catch (error) {
    console.error('Error fetching reviews:', error);
    return NextResponse.json({ error: 'Error fetching reviews' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Debes iniciar sesión con Google para dejar una reseña' }, { status: 401 });
    }

    const body = await request.json();
    const { rating, text } = body;

    if (!text || text.trim().length === 0) {
      return NextResponse.json({ error: 'El texto de la reseña es obligatorio' }, { status: 400 });
    }

    if (!rating || rating < 1 || rating > 5) {
      return NextResponse.json({ error: 'La calificación debe ser entre 1 y 5' }, { status: 400 });
    }

    // Find the user by email
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
    }

    const review = await prisma.review.create({
      data: {
        userId: user.id,
        rating,
        text: text.trim(),
        approved: true,
      },
      include: {
        user: {
          select: { name: true, image: true },
        },
      },
    });

    const emailSubject = `⭐ Nueva Reseña: ${user.name || 'Anónimo'}`;
    const emailBody = `
      <h2>¡Nueva reseña recibida!</h2>
      <p><strong>Cliente:</strong> ${user.name || 'Anónimo'}</p>
      <p><strong>Email:</strong> ${user.email}</p>
      <p><strong>Calificación:</strong> ${rating} estrellas</p>
      <p><strong>Reseña:</strong></p>
      <blockquote style="font-style: italic; border-left: 4px solid #d4a012; padding-left: 10px;">
        ${text.trim()}
      </blockquote>
    `;
    sendNotificationEmail(emailSubject, emailBody);

    return NextResponse.json(review, { status: 201 });
  } catch (error) {
    console.error('Error creating review:', error);
    return NextResponse.json({ error: 'Error creating review' }, { status: 500 });
  }
}
