import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

export type RSVP = {
  id: string;
  name: string;
  attending: 'yes' | 'no';
  time_slot: string | null;
  guest_count: number | null;
  car_plate: string | null;
  message: string | null;
  created_at: string;
};

export async function saveRsvp(data: Omit<RSVP, 'id' | 'created_at'>): Promise<RSVP> {
  const id = Date.now().toString();
  const rows = await sql`
    INSERT INTO rsvps (id, name, attending, time_slot, guest_count, car_plate, message)
    VALUES (
      ${id},
      ${data.name},
      ${data.attending},
      ${data.time_slot ?? null},
      ${data.guest_count ?? null},
      ${data.car_plate ?? null},
      ${data.message ?? null}
    )
    RETURNING *
  `;
  return rows[0] as RSVP;
}

export async function getAllRsvps(): Promise<RSVP[]> {
  const rows = await sql`SELECT * FROM rsvps ORDER BY created_at DESC`;
  return rows as RSVP[];
}

export async function deleteRsvp(id: string): Promise<void> {
  await sql`DELETE FROM rsvps WHERE id = ${id}`;
}

export async function updateRsvp(id: string, data: Partial<Omit<RSVP, 'id' | 'created_at'>>): Promise<RSVP> {
  // Fetch existing first, merge, then update
  const existing = await sql`SELECT * FROM rsvps WHERE id = ${id}`;
  if (existing.length === 0) throw new Error('RSVP not found');

  const r = existing[0] as RSVP;
  const name        = data.name        !== undefined ? data.name        : r.name;
  const attending   = data.attending   !== undefined ? data.attending   : r.attending;
  const time_slot   = data.time_slot   !== undefined ? data.time_slot   : r.time_slot;
  const guest_count = data.guest_count !== undefined ? data.guest_count : r.guest_count;
  const car_plate   = data.car_plate   !== undefined ? data.car_plate   : r.car_plate;
  const message     = data.message     !== undefined ? data.message     : r.message;

  const rows = await sql`
    UPDATE rsvps
    SET
      name        = ${name},
      attending   = ${attending},
      time_slot   = ${time_slot ?? null},
      guest_count = ${guest_count ?? null},
      car_plate   = ${car_plate ?? null},
      message     = ${message ?? null}
    WHERE id = ${id}
    RETURNING *
  `;
  return rows[0] as RSVP;
}
