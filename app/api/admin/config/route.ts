import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const config = await prisma.siteConfig.findMany();
    const configMap = config.reduce((acc, curr) => {
      acc[curr.key] = curr.value;
      return acc;
    }, {} as Record<string, string>);
    return NextResponse.json(configMap);
  } catch (error) {
    return NextResponse.json({ error: 'Error fetching config' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    
    // Body should be an object of key-value pairs
    for (const [key, value] of Object.entries(body)) {
      if (typeof value === 'string') {
        await prisma.siteConfig.upsert({
          where: { key },
          update: { value },
          create: { key, value },
        });
      }
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Error updating config' }, { status: 500 });
  }
}
