import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const products = await prisma.product.findMany({
      where: { active: true },
      orderBy: { order: 'asc' },
    });
    const response = NextResponse.json(products);
    response.headers.set('Cache-Control', 's-maxage=60, stale-while-revalidate=300');
    return response;
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json({ error: 'Error fetching products' }, { status: 500 });
  }
}
