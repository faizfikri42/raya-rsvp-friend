import { put, list, del } from '@vercel/blob';

export type RSVP = {
  id: string;
  attending: 'yes' | 'no';
  guest_count: number | null;
  car_plate: string | null;
  message: string | null;
  created_at: string;
};

export async function saveRsvp(data: Omit<RSVP, 'id' | 'created_at'>): Promise<RSVP> {
  const rsvp: RSVP = {
    ...data,
    id: Date.now().toString(),
    created_at: new Date().toISOString(),
  };

  await put(`rsvps/${rsvp.id}.json`, JSON.stringify(rsvp), {
    access: 'public',
    contentType: 'application/json',
    addRandomSuffix: false,
  });

  return rsvp;
}

export async function getAllRsvps(): Promise<RSVP[]> {
  const { blobs } = await list({ prefix: 'rsvps/' });

  const rsvps = await Promise.all(
    blobs.map(async (blob) => {
      const res = await fetch(blob.downloadUrl);
      return res.json() as Promise<RSVP>;
    })
  );

  return rsvps.sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
}

export async function deleteRsvp(id: string): Promise<void> {
  const { blobs } = await list({ prefix: `rsvps/${id}.json` });
  if (blobs.length > 0) {
    await del(blobs[0].url);
  }
}

export async function updateRsvp(id: string, data: Partial<Omit<RSVP, 'id' | 'created_at'>>): Promise<RSVP> {
  const { blobs } = await list({ prefix: `rsvps/${id}.json` });
  if (blobs.length === 0) throw new Error('RSVP not found');

  const res = await fetch(blobs[0].downloadUrl);
  const existing: RSVP = await res.json();

  const updated: RSVP = { ...existing, ...data };

  await put(`rsvps/${id}.json`, JSON.stringify(updated), {
    access: 'public',
    contentType: 'application/json',
    addRandomSuffix: false,
  });

  return updated;
}
