import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { name, description, price, stock, image, active, order } = body;

    const product = await prisma.product.create({
      data: {
        name,
        description,
        price: Number(price),
        stock: Number(stock),
        image,
        active: active ?? true,
        order: order ?? 0,
      },
    });

    return NextResponse.json(product);
  } catch (error) {
    return NextResponse.json({ error: 'Error creating product' }, { status: 500 });
  }
}
