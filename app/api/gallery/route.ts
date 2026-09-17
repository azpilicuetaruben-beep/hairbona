import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const images = await prisma.galleryImage.findMany({
      orderBy: {
        order: 'asc',
      },
    });

    return NextResponse.json(images);
  } catch (error) {
    console.error('Error fetching gallery:', error);
    return NextResponse.json(
      { error: 'Error fetching gallery' },
      { status: 500 }
    );
  }
}
