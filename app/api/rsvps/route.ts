import { NextRequest, NextResponse } from 'next/server';
import { getAllRsvps } from '@/lib/db';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const secret = searchParams.get('secret');

  if (secret !== process.env.ADMIN_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const rsvps = await getAllRsvps();
    return NextResponse.json({ rsvps });
  } catch (error) {
    console.error('Fetch RSVPs error:', error);
    return NextResponse.json({ error: 'Failed to fetch RSVPs' }, { status: 500 });
  }
}
