import { NextRequest, NextResponse } from 'next/server';
import { deleteRsvp, updateRsvp } from '@/lib/db';

function isAuthorized(req: NextRequest) {
  const secret = new URL(req.url).searchParams.get('secret');
  return secret === process.env.ADMIN_SECRET;
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!isAuthorized(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { id } = await params;
    await deleteRsvp(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete error:', error);
    return NextResponse.json({ error: 'Failed to delete' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!isAuthorized(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { id } = await params;
    const body = await req.json();
    const updated = await updateRsvp(id, body);
    return NextResponse.json({ success: true, rsvp: updated });
  } catch (error) {
    console.error('Update error:', error);
    return NextResponse.json({ error: 'Failed to update' }, { status: 500 });
  }
}
