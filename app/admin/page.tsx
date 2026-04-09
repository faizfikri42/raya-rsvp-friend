'use client';

import { useState, useEffect } from 'react';

type RSVP = {
  id: string;
  name: string;
  attending: 'yes' | 'no';
  time_slot: string | null;
  guest_count: number | null;
  car_plate: string | null;
  message: string | null;
  created_at: string;
};

export default function AdminPage() {
  const [secret, setSecret] = useState('');
  const [authenticated, setAuthenticated] = useState(false);
  const [rsvps, setRsvps] = useState<RSVP[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<RSVP>>({});
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function fetchRsvps(s: string) {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/rsvps?secret=${encodeURIComponent(s)}`);
      if (res.status === 401) {
        setError('Wrong password. Try again.');
        setAuthenticated(false);
        setLoading(false);
        return;
      }
      const data = await res.json();
      setRsvps(data.rsvps || []);
      setAuthenticated(true);
    } catch {
      setError('Failed to fetch. Check your connection.');
    }
    setLoading(false);
  }

  function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    fetchRsvps(secret);
  }

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Delete RSVP from ${name}?`)) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/rsvps/${id}?secret=${encodeURIComponent(secret)}`, {
        method: 'DELETE',
      });
      if (res.ok) setRsvps(prev => prev.filter(r => r.id !== id));
    } catch {
      alert('Failed to delete.');
    }
    setDeletingId(null);
  }

  function startEdit(r: RSVP) {
    setEditingId(r.id);
    setEditForm({
      name: r.name,
      attending: r.attending,
      time_slot: r.time_slot ?? '',
      guest_count: r.guest_count,
      car_plate: r.car_plate ?? '',
      message: r.message ?? '',
    });
  }

  async function handleSave(id: string) {
    setSaving(true);
    try {
      const res = await fetch(`/api/rsvps/${id}?secret=${encodeURIComponent(secret)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...editForm,
          time_slot: editForm.time_slot || null,
          car_plate: editForm.car_plate || null,
          message: editForm.message || null,
        }),
      });
      if (res.ok) {
        const { rsvp } = await res.json();
        setRsvps(prev => prev.map(r => r.id === id ? rsvp : r));
        setEditingId(null);
      }
    } catch {
      alert('Failed to save.');
    }
    setSaving(false);
  }

  useEffect(() => {
    if (!authenticated) return;
    const interval = setInterval(() => fetchRsvps(secret), 30000);
    return () => clearInterval(interval);
  }, [authenticated, secret]);

  const attending = rsvps.filter(r => r.attending === 'yes');
  const notAttending = rsvps.filter(r => r.attending === 'no');
  const totalGuests = attending.reduce((sum, r) => sum + (r.guest_count ?? 0), 0);

  // Group attending by time slot
  const byTimeSlot = attending.reduce<Record<string, number>>((acc, r) => {
    const slot = r.time_slot ?? 'Unknown';
    acc[slot] = (acc[slot] ?? 0) + 1;
    return acc;
  }, {});

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-900 via-emerald-800 to-teal-900 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-sm w-full">
          <h1 className="text-2xl font-bold text-emerald-800 mb-1">Admin Dashboard</h1>
          <p className="text-gray-500 text-sm mb-6">Enter your admin password to view RSVPs</p>
          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="password"
              value={secret}
              onChange={e => setSecret(e.target.value)}
              placeholder="Admin password"
              required
              className="w-full border border-gray-300 rounded-xl px-4 py-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
            />
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl transition"
            >
              {loading ? 'Loading...' : 'Login'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">🌙 Raya RSVP Dashboard</h1>
            <p className="text-gray-500 text-sm">{rsvps.length} responses · auto-refreshes every 30s</p>
          </div>
          <button
            onClick={() => fetchRsvps(secret)}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl text-sm font-semibold transition"
          >
            🔄 Refresh
          </button>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-2xl shadow p-5 border-l-4 border-emerald-500">
            <p className="text-3xl font-bold text-emerald-600">{attending.length}</p>
            <p className="text-sm text-gray-500 mt-1">✅ Datang</p>
            <p className="text-xs text-gray-400">{totalGuests} orang total</p>
          </div>
          <div className="bg-white rounded-2xl shadow p-5 border-l-4 border-red-400">
            <p className="text-3xl font-bold text-red-500">{notAttending.length}</p>
            <p className="text-sm text-gray-500 mt-1">❌ Tak datang</p>
          </div>
          <div className="bg-white rounded-2xl shadow p-5 border-l-4 border-blue-400">
            <p className="text-3xl font-bold text-blue-500">{rsvps.length}</p>
            <p className="text-sm text-gray-500 mt-1">📋 Total responses</p>
          </div>
        </div>

        {/* Time slot breakdown */}
        {Object.keys(byTimeSlot).length > 0 && (
          <div className="bg-white rounded-2xl shadow p-5 mb-6">
            <h2 className="font-semibold text-gray-700 mb-3">⏰ Agihan Masa Ketibaan</h2>
            <div className="flex flex-wrap gap-3">
              {Object.entries(byTimeSlot).map(([slot, count]) => (
                <div key={slot} className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-xl px-4 py-2">
                  <span className="text-amber-700 font-bold text-lg">{count}</span>
                  <span className="text-gray-600 text-sm">{slot}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* RSVP table */}
        <div className="bg-white rounded-2xl shadow overflow-hidden">
          <div className="p-5 border-b border-gray-100">
            <h2 className="font-semibold text-gray-700">All Responses</h2>
          </div>
          {rsvps.length === 0 ? (
            <div className="p-10 text-center text-gray-400">No RSVPs yet 🌙</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-gray-500 uppercase text-xs">
                  <tr>
                    <th className="px-4 py-3 text-left">#</th>
                    <th className="px-4 py-3 text-left">Nama</th>
                    <th className="px-4 py-3 text-left">Hadir</th>
                    <th className="px-4 py-3 text-left">Masa</th>
                    <th className="px-4 py-3 text-left">Orang</th>
                    <th className="px-4 py-3 text-left">Plate</th>
                    <th className="px-4 py-3 text-left">Ucapan</th>
                    <th className="px-4 py-3 text-left">Submitted</th>
                    <th className="px-4 py-3 text-left">Tindakan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {rsvps.map((r, i) => (
                    <tr key={r.id} className={`transition ${deletingId === r.id ? 'opacity-40' : 'hover:bg-gray-50'}`}>
                      <td className="px-4 py-3 text-gray-400">{i + 1}</td>

                      {editingId === r.id ? (
                        <>
                          <td className="px-4 py-2">
                            <input
                              value={editForm.name ?? ''}
                              onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))}
                              className="border border-gray-300 rounded-lg px-2 py-1 w-full text-gray-800 focus:outline-none focus:ring-1 focus:ring-emerald-400"
                            />
                          </td>
                          <td className="px-4 py-2">
                            <select
                              value={editForm.attending ?? 'yes'}
                              onChange={e => setEditForm(f => ({ ...f, attending: e.target.value as 'yes' | 'no' }))}
                              className="border border-gray-300 rounded-lg px-2 py-1 text-gray-800 focus:outline-none focus:ring-1 focus:ring-emerald-400"
                            >
                              <option value="yes">✅ Datang</option>
                              <option value="no">❌ Tak datang</option>
                            </select>
                          </td>
                          <td className="px-4 py-2">
                            <select
                              value={editForm.time_slot ?? ''}
                              onChange={e => setEditForm(f => ({ ...f, time_slot: e.target.value }))}
                              className="border border-gray-300 rounded-lg px-2 py-1 text-gray-800 focus:outline-none focus:ring-1 focus:ring-emerald-400"
                            >
                              <option value="">—</option>
                              <option value="1pm - 3pm">1pm – 3pm</option>
                              <option value="3pm - 5pm">3pm – 5pm</option>
                              <option value="5pm - 7pm">5pm – 7pm</option>
                              <option value="7pm - 8pm">7pm – 8pm</option>
                            </select>
                          </td>
                          <td className="px-4 py-2">
                            <select
                              value={editForm.guest_count ?? 1}
                              onChange={e => setEditForm(f => ({ ...f, guest_count: parseInt(e.target.value) }))}
                              className="border border-gray-300 rounded-lg px-2 py-1 text-gray-800 focus:outline-none focus:ring-1 focus:ring-emerald-400"
                            >
                              {[1,2,3,4].map(n => <option key={n} value={n}>{n}</option>)}
                            </select>
                          </td>
                          <td className="px-4 py-2">
                            <input
                              value={editForm.car_plate ?? ''}
                              onChange={e => setEditForm(f => ({ ...f, car_plate: e.target.value.toUpperCase() }))}
                              className="border border-gray-300 rounded-lg px-2 py-1 w-24 text-gray-800 uppercase tracking-wider focus:outline-none focus:ring-1 focus:ring-emerald-400"
                            />
                          </td>
                          <td className="px-4 py-2">
                            <input
                              value={editForm.message ?? ''}
                              onChange={e => setEditForm(f => ({ ...f, message: e.target.value }))}
                              className="border border-gray-300 rounded-lg px-2 py-1 w-40 text-gray-800 focus:outline-none focus:ring-1 focus:ring-emerald-400"
                            />
                          </td>
                          <td className="px-4 py-3 text-gray-400 whitespace-nowrap">
                            {new Date(r.created_at).toLocaleString('en-MY', { timeZone: 'Asia/Kuala_Lumpur', dateStyle: 'short', timeStyle: 'short' })}
                          </td>
                          <td className="px-4 py-2">
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleSave(r.id)}
                                disabled={saving}
                                className="bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition"
                              >
                                {saving ? '...' : 'Save'}
                              </button>
                              <button
                                onClick={() => setEditingId(null)}
                                className="bg-gray-200 hover:bg-gray-300 text-gray-700 text-xs font-semibold px-3 py-1.5 rounded-lg transition"
                              >
                                Cancel
                              </button>
                            </div>
                          </td>
                        </>
                      ) : (
                        <>
                          <td className="px-4 py-3 font-medium text-gray-800">{r.name}</td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                              r.attending === 'yes' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                            }`}>
                              {r.attending === 'yes' ? '✅ Datang' : '❌ Tak datang'}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            {r.time_slot ? (
                              <span className="bg-amber-100 text-amber-700 text-xs font-semibold px-2.5 py-0.5 rounded-full whitespace-nowrap">
                                {r.time_slot}
                              </span>
                            ) : '—'}
                          </td>
                          <td className="px-4 py-3 text-center text-gray-700">{r.guest_count ?? '—'}</td>
                          <td className="px-4 py-3 text-gray-500 font-mono tracking-wider">{r.car_plate || '—'}</td>
                          <td className="px-4 py-3 text-gray-500 max-w-xs truncate">{r.message || '—'}</td>
                          <td className="px-4 py-3 text-gray-400 whitespace-nowrap">
                            {new Date(r.created_at).toLocaleString('en-MY', { timeZone: 'Asia/Kuala_Lumpur', dateStyle: 'short', timeStyle: 'short' })}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex gap-2">
                              <button
                                onClick={() => startEdit(r)}
                                className="bg-amber-100 hover:bg-amber-200 text-amber-700 text-xs font-semibold px-3 py-1.5 rounded-lg transition"
                              >
                                ✏️ Edit
                              </button>
                              <button
                                onClick={() => handleDelete(r.id, r.name)}
                                disabled={deletingId === r.id}
                                className="bg-red-100 hover:bg-red-200 disabled:opacity-50 text-red-600 text-xs font-semibold px-3 py-1.5 rounded-lg transition"
                              >
                                🗑️ Delete
                              </button>
                            </div>
                          </td>
                        </>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
