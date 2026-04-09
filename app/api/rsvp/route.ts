import { NextRequest, NextResponse } from 'next/server';
import { saveRsvp } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { attending, guest_count, car_plate, message } = body;

    if (!['yes', 'no'].includes(attending)) {
      return NextResponse.json({ error: 'Attendance is required' }, { status: 400 });
    }

    const rsvp = await saveRsvp({
      attending,
      guest_count: attending === 'yes' ? (parseInt(guest_count) || 1) : null,
      car_plate: attending === 'yes' ? (car_plate?.trim() || null) : null,
      message: message?.trim() || null,
    });

    return NextResponse.json({ success: true, id: rsvp.id });
  } catch (error) {
    console.error('RSVP submit error:', error);
    return NextResponse.json({ error: 'Failed to submit RSVP' }, { status: 500 });
  }
}
