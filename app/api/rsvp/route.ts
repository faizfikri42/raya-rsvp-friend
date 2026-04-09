import { NextRequest, NextResponse } from 'next/server';
import { saveRsvp } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, attending, time_slot, guest_count, car_plate, message } = body;

    if (!name?.trim()) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }
    if (!['yes', 'no'].includes(attending)) {
      return NextResponse.json({ error: 'Attendance is required' }, { status: 400 });
    }

    const rsvp = await saveRsvp({
      name: name.trim(),
      attending,
      time_slot: attending === 'yes' ? (time_slot?.trim() || null) : null,
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
