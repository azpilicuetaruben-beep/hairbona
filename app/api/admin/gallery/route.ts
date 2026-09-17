import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const images = await prisma.galleryImage.findMany({
      orderBy: { order: 'asc' },
    });
    return NextResponse.json(images);
  } catch (error) {
    return NextResponse.json({ error: 'Error fetching gallery' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { url, caption, order } = body;

    const image = await prisma.galleryImage.create({
      data: { url, caption, order },
    });
    return NextResponse.json(image, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Error creating gallery image' }, { status: 500 });
  }
}
