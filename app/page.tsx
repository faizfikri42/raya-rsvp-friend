'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';

// ─── CUSTOMIZE YOUR EVENT DETAILS HERE ────────────────────────────────────────
const EVENT_DATE = '18 April 2026, Sabtu';
const EVENT_TIME = '1:00 Petang – 8:00 Malam';
const EVENT_ADDRESS_1 = '48, Jalan Eco Majestic 9/2D';
const EVENT_ADDRESS_2 = 'Semenyih';
const GOOGLE_MAPS_URL = 'https://maps.app.goo.gl/Dp4HaoAa6SkdJfBy6?g_st=iw';
const WAZE_URL = 'https://waze.com/ul/hw282t2skp';
// ──────────────────────────────────────────────────────────────────────────────

type FormData = {
  name: string;
  attending: 'yes' | 'no' | '';
  time_slot: string;
  guest_count: number | null;
  car_plate: string;
  message: string;
};

type Direction = 'up' | 'down';

const GUEST_OPTIONS = [
  { value: 1, letter: 'A', label: 'Saya sorang je', sub: '1 orang' },
  { value: 2, letter: 'B', label: 'Bawak +1', sub: '2 orang' },
  { value: 3, letter: 'C', label: '3 orang', sub: 'Ramai sikit' },
  { value: 4, letter: 'D', label: '4 orang', sub: 'Rombongan dah ni' },
];

const TIME_OPTIONS = [
  { value: '1pm', letter: 'A', label: 'Pukul 1pm', sub: 'Tengah hari' },
  { value: '2pm', letter: 'B', label: 'Pukul 2pm', sub: 'Tengah hari' },
  { value: '3pm', letter: 'C', label: 'Pukul 3pm', sub: 'Petang' },
  { value: '4pm', letter: 'D', label: 'Pukul 4pm', sub: 'Petang' },
  { value: '5pm', letter: 'E', label: 'Pukul 5pm', sub: 'Petang' },
  { value: '6pm', letter: 'F', label: 'Pukul 6pm', sub: 'Petang lewat' },
  { value: '7pm', letter: 'G', label: 'Pukul 7pm', sub: 'Malam' },
  { value: '8pm', letter: 'H', label: 'Pukul 8pm', sub: 'Malam' },
];

// Steps: 0=name, 1=attending, 2=time_slot(yes), 3=guest_count(yes), 4=car_plate(yes), 5=message
// Not attending path: 0 → 1 → 5

export default function RsvpPage() {
  const [started, setStarted] = useState(false);
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState<Direction>('up');
  const [stepKey, setStepKey] = useState(0);
  const [data, setData] = useState<FormData>({
    name: '',
    attending: '',
    time_slot: '',
    guest_count: null,
    car_plate: '',
    message: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement | null>(null);

  // Progress calculation
  // Not attending: [0,1,5] → 3 steps
  // Attending:     [0,1,2,3,4,5] → 6 steps
  const totalSteps = data.attending === 'no' ? 3 : 6;
  function progressIndex(s: number) {
    if (data.attending === 'no') return s === 5 ? 2 : s; // 0→0, 1→1, 5→2
    return s; // 0-5
  }
  const progress = Math.min((progressIndex(step) / (totalSteps - 1)) * 100, 100);

  function navigate(toStep: number, dir: Direction) {
    setDirection(dir);
    setStep(toStep);
    setStepKey(k => k + 1);
  }

  function goNext() {
    if (step === 0 && !data.name.trim()) return;
    if (step === 0) { navigate(1, 'up'); return; }
    if (step === 4) { navigate(5, 'up'); return; }
    if (step === 5) { handleSubmit(); return; }
  }

  function goBack() {
    if (step === 0) return;
    if (step === 5 && data.attending === 'no') { navigate(1, 'down'); return; }
    if (step === 5 && data.attending === 'yes') { navigate(4, 'down'); return; }
    navigate(step - 1, 'down');
  }

  async function handleSubmit() {
    setSubmitting(true);
    setError('');
    try {
      const res = await fetch('/api/rsvp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: data.name,
          attending: data.attending,
          time_slot: data.time_slot,
          guest_count: data.guest_count,
          car_plate: data.car_plate,
          message: data.message,
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error || 'Something went wrong.');
        setSubmitting(false);
      } else {
        setSubmitted(true);
      }
    } catch {
      setError('Network error. Try again.');
      setSubmitting(false);
    }
  }

  useEffect(() => {
    const timer = setTimeout(() => inputRef.current?.focus(), 480);
    return () => clearTimeout(timer);
  }, [step, stepKey]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        if (step === 0 && data.name.trim()) goNext();
        if (step === 4) goNext();
      }
    },
    [step, data.name]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // ── Landing ──────────────────────────────────────────────────────────────────
  if (!started) {
    return (
      <div className="min-h-screen bg-[#0d2418] flex items-center justify-center p-6">
        <div className="text-center max-w-lg animate-slide-up">

          {/* Arabic greeting */}
          <p className="text-amber-300 text-3xl mb-2" style={{ fontFamily: 'serif' }}>
            السَّلَامُ عَلَيْكُمْ
          </p>

          {/* Divider */}
          <div className="flex items-center gap-3 justify-center mb-5">
            <div className="h-px w-12 bg-emerald-700" />
            <span className="text-amber-500 text-lg">🏮</span>
            <div className="h-px w-12 bg-emerald-700" />
          </div>

          <h1 className="text-4xl md:text-5xl font-extrabold text-white leading-tight mb-2">
            Jemputan
          </h1>
          <h2 className="text-3xl md:text-4xl font-extrabold text-amber-400 leading-tight mb-5">
            Makan-Makan Raya
          </h2>

          <p className="text-emerald-300 text-base italic leading-relaxed mb-1">
            Dengan segala hormatnya,
          </p>
          <p className="text-emerald-300 text-base italic leading-relaxed mb-8">
            kami menjemput anda ke majlis kami.
          </p>

          {/* Event details card */}
          <div className="bg-emerald-950/60 border border-emerald-800 rounded-2xl px-6 py-5 mb-6 text-left space-y-4">
            <div className="flex items-start gap-4">
              <span className="text-emerald-500 font-bold text-sm w-16 shrink-0 pt-0.5">Tarikh</span>
              <p className="text-white font-semibold">{EVENT_DATE}</p>
            </div>
            <div className="h-px bg-emerald-900" />
            <div className="flex items-start gap-4">
              <span className="text-emerald-500 font-bold text-sm w-16 shrink-0 pt-0.5">Masa</span>
              <p className="text-white font-semibold">{EVENT_TIME}</p>
            </div>
            <div className="h-px bg-emerald-900" />
            <div className="flex items-start gap-4">
              <span className="text-emerald-500 font-bold text-sm w-16 shrink-0 pt-0.5">Tempat</span>
              <div>
                <p className="text-white font-semibold">{EVENT_ADDRESS_1}</p>
                <p className="text-emerald-300 italic text-sm">{EVENT_ADDRESS_2}</p>
                <div className="flex gap-2 flex-wrap mt-3">
                  <a
                    href={GOOGLE_MAPS_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 bg-white/10 hover:bg-white/20 active:scale-95 border border-white/20 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-all"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
                    Google Maps
                  </a>
                  <a
                    href={WAZE_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 bg-[#05c8f7]/10 hover:bg-[#05c8f7]/20 active:scale-95 border border-[#05c8f7]/30 text-[#05c8f7] text-sm font-semibold px-4 py-2 rounded-lg transition-all"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a9.5 9.5 0 0 1 9.5 9.5c0 5.25-9.5 13-9.5 13S2.5 16.75 2.5 11.5A9.5 9.5 0 0 1 12 2zm0 5a4.5 4.5 0 1 0 0 9 4.5 4.5 0 0 0 0-9z"/></svg>
                    Waze
                  </a>
                </div>
              </div>
            </div>
          </div>

          <p className="text-emerald-400 text-base italic mb-6">
            Jemput yer datang. 🙏
          </p>

          <button
            onClick={() => setStarted(true)}
            className="bg-amber-400 hover:bg-amber-300 active:scale-95 text-emerald-950 font-bold px-10 py-4 rounded-xl transition-all text-lg shadow-lg shadow-amber-400/20"
          >
            RSVP Sekarang &nbsp;→
          </button>

          {/* Bottom ornament */}
          <div className="flex items-center gap-3 justify-center mt-8">
            <div className="h-px w-10 bg-emerald-800" />
            <span className="text-emerald-700 text-lg">🏮</span>
            <span className="text-emerald-800 text-sm">☽★</span>
            <span className="text-emerald-700 text-lg">🏮</span>
            <div className="h-px w-10 bg-emerald-800" />
          </div>
          <p className="text-emerald-800 text-xs mt-3">
            Selamat Hari Raya Aidilfitri · Maaf Zahir & Batin
          </p>

        </div>
      </div>
    );
  }

  // ── Success ──────────────────────────────────────────────────────────────────
  if (submitted) {
    return (
      <div className="min-h-screen bg-[#0d2418] flex items-center justify-center p-6">
        <div className="text-center max-w-md animate-slide-up">
          <h2 className="text-4xl font-bold text-white mb-2">
            Terima kasih, {data.name.split(' ')[0]}!
          </h2>
          {data.attending === 'yes' ? (
            <p className="text-emerald-300 text-lg mb-6">Jumpa Nanti!! 😄</p>
          ) : (
            <p className="text-emerald-300 text-lg mb-6">Takpe, lain kali kita jumpa! 😊</p>
          )}
          <div className="relative w-64 h-80 mx-auto mb-6">
            <Image
              src="/raya-cat.jpeg"
              alt="Selamat Hari Raya"
              fill
              className="object-cover rounded-2xl shadow-xl shadow-black/40"
            />
          </div>
          <p className="text-amber-400 font-semibold text-lg">Selamat Hari Raya Aidilfitri 🌟</p>
          <p className="text-emerald-600 text-sm mt-1">Maaf Zahir & Batin</p>
        </div>
      </div>
    );
  }

  // ── Form ─────────────────────────────────────────────────────────────────────
  const animClass = direction === 'up' ? 'animate-slide-up' : 'animate-slide-down';

  return (
    <div className="min-h-screen bg-[#0d2418] flex flex-col select-none">
      {/* Progress bar */}
      <div className="fixed top-0 left-0 right-0 h-1 bg-emerald-950 z-10">
        <div
          className="h-full bg-amber-400 transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="flex-1 flex items-center justify-center px-6 py-16">
        <div key={stepKey} className={`w-full max-w-xl ${animClass}`}>

          {/* Step 0: Name */}
          {step === 0 && (
            <div>
              <p className="text-amber-400 text-sm font-semibold mb-2 flex items-center gap-2">
                <span>01</span><span className="text-amber-600">→</span>
              </p>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-8 leading-tight">
                Eh, siapa tu? 👋<br />
                <span className="text-emerald-300">Nama apa ya?</span>
              </h2>
              <input
                ref={inputRef as React.RefObject<HTMLInputElement>}
                type="text"
                value={data.name}
                onChange={e => setData(d => ({ ...d, name: e.target.value }))}
                onKeyDown={e => e.key === 'Enter' && data.name.trim() && goNext()}
                placeholder="Type nama disini..."
                className="w-full bg-transparent border-b-2 border-emerald-600 focus:border-amber-400 text-white text-2xl py-3 outline-none placeholder:text-emerald-800 transition-colors caret-amber-400"
              />
              <div className="mt-8 flex items-center gap-4">
                <button
                  onClick={goNext}
                  disabled={!data.name.trim()}
                  className="bg-amber-400 hover:bg-amber-300 disabled:opacity-30 disabled:cursor-not-allowed text-emerald-950 font-bold px-7 py-3 rounded-lg transition-all text-base"
                >
                  OK &nbsp;✓
                </button>
                <span className="text-emerald-700 text-sm">atau tekan <kbd className="bg-emerald-900 text-emerald-300 px-2 py-0.5 rounded text-xs">Enter ↵</kbd></span>
              </div>
            </div>
          )}

          {/* Step 1: Attending */}
          {step === 1 && (
            <div>
              <p className="text-amber-400 text-sm font-semibold mb-2 flex items-center gap-2">
                <span>02</span><span className="text-amber-600">→</span>
              </p>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-2 leading-tight">
                Holla <span className="text-amber-400">{data.name.split(' ')[0]}</span>! 🎉
              </h2>
              <p className="text-emerald-300 text-xl mb-8">Datang tak ke open house Raya ni?</p>
              <div className="flex flex-col gap-3">
                {[
                  { value: 'yes', letter: 'Y', label: 'Datang! Insya-Allah 🤲', sub: 'Confirm hadir' },
                  { value: 'no',  letter: 'N', label: 'Tak dapat la kali ni 😢', sub: 'Tak hadir' },
                ].map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => {
                      setData(d => ({ ...d, attending: opt.value as 'yes' | 'no' }));
                      setTimeout(() => navigate(opt.value === 'no' ? 5 : 2, 'up'), 150);
                    }}
                    className={`flex items-center gap-4 p-4 rounded-xl border-2 text-left transition-all group ${
                      data.attending === opt.value
                        ? 'border-amber-400 bg-amber-400/10'
                        : 'border-emerald-800 hover:border-emerald-500 bg-emerald-950/40'
                    }`}
                  >
                    <span className={`w-8 h-8 rounded flex items-center justify-center text-xs font-bold shrink-0 border ${
                      data.attending === opt.value
                        ? 'bg-amber-400 border-amber-400 text-emerald-950'
                        : 'border-emerald-700 text-emerald-400 group-hover:border-emerald-400'
                    }`}>{opt.letter}</span>
                    <div>
                      <p className="text-white font-semibold">{opt.label}</p>
                      <p className="text-emerald-500 text-sm">{opt.sub}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Time slot */}
          {step === 2 && (
            <div>
              <p className="text-amber-400 text-sm font-semibold mb-2 flex items-center gap-2">
                <span>03</span><span className="text-amber-600">→</span>
              </p>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-2 leading-tight">
                Best tu! 🙌
              </h2>
              <p className="text-emerald-300 text-xl mb-8">
                Agak-agak pukul berapa nak datang?
              </p>
              <div className="flex flex-col gap-3">
                {TIME_OPTIONS.map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => {
                      setData(d => ({ ...d, time_slot: opt.value }));
                      setTimeout(() => navigate(3, 'up'), 150);
                    }}
                    className={`flex items-center gap-4 p-4 rounded-xl border-2 text-left transition-all group ${
                      data.time_slot === opt.value
                        ? 'border-amber-400 bg-amber-400/10'
                        : 'border-emerald-800 hover:border-emerald-500 bg-emerald-950/40'
                    }`}
                  >
                    <span className={`w-8 h-8 rounded flex items-center justify-center text-xs font-bold shrink-0 border ${
                      data.time_slot === opt.value
                        ? 'bg-amber-400 border-amber-400 text-emerald-950'
                        : 'border-emerald-700 text-emerald-400 group-hover:border-emerald-400'
                    }`}>{opt.letter}</span>
                    <div>
                      <p className="text-white font-semibold">{opt.label}</p>
                      <p className="text-emerald-500 text-sm">{opt.sub}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 3: Guest count */}
          {step === 3 && (
            <div>
              <p className="text-amber-400 text-sm font-semibold mb-2 flex items-center gap-2">
                <span>04</span><span className="text-amber-600">→</span>
              </p>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-2 leading-tight">
                Berapa orang datang? 👥
              </h2>
              <p className="text-emerald-300 text-xl mb-8">Kira semua sekali ya</p>
              <div className="flex flex-col gap-3">
                {GUEST_OPTIONS.map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => {
                      setData(d => ({ ...d, guest_count: opt.value }));
                      setTimeout(() => navigate(4, 'up'), 150);
                    }}
                    className={`flex items-center gap-4 p-4 rounded-xl border-2 text-left transition-all group ${
                      data.guest_count === opt.value
                        ? 'border-amber-400 bg-amber-400/10'
                        : 'border-emerald-800 hover:border-emerald-500 bg-emerald-950/40'
                    }`}
                  >
                    <span className={`w-8 h-8 rounded flex items-center justify-center text-xs font-bold shrink-0 border ${
                      data.guest_count === opt.value
                        ? 'bg-amber-400 border-amber-400 text-emerald-950'
                        : 'border-emerald-700 text-emerald-400 group-hover:border-emerald-400'
                    }`}>{opt.letter}</span>
                    <div>
                      <p className="text-white font-semibold">{opt.label}</p>
                      <p className="text-emerald-500 text-sm">{opt.sub}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 4: Car plate */}
          {step === 4 && (
            <div>
              <p className="text-amber-400 text-sm font-semibold mb-2 flex items-center gap-2">
                <span>05</span><span className="text-amber-600">→</span>
              </p>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-2 leading-tight">
                Nombor plate kereta? 🚗
              </h2>
              <p className="text-emerald-400 text-base mb-8">
                Untuk urusan parking. Boleh skip kalau tak drive.
              </p>
              <input
                ref={inputRef as React.RefObject<HTMLInputElement>}
                type="text"
                value={data.car_plate}
                onChange={e => setData(d => ({ ...d, car_plate: e.target.value.toUpperCase() }))}
                onKeyDown={e => e.key === 'Enter' && goNext()}
                placeholder="Contoh: WXY 1234"
                maxLength={10}
                className="w-full bg-transparent border-b-2 border-emerald-600 focus:border-amber-400 text-white text-2xl py-3 outline-none placeholder:text-emerald-800 transition-colors caret-amber-400 uppercase tracking-widest"
              />
              <div className="mt-8 flex items-center gap-4">
                <button
                  onClick={goNext}
                  className="bg-amber-400 hover:bg-amber-300 text-emerald-950 font-bold px-7 py-3 rounded-lg transition-all text-base"
                >
                  OK &nbsp;✓
                </button>
                <span className="text-emerald-700 text-sm">atau tekan <kbd className="bg-emerald-900 text-emerald-300 px-2 py-0.5 rounded text-xs">Enter ↵</kbd></span>
              </div>
            </div>
          )}

          {/* Step 5: Message */}
          {step === 5 && (
            <div>
              <p className="text-amber-400 text-sm font-semibold mb-2 flex items-center gap-2">
                <span>{data.attending === 'no' ? '03' : '06'}</span>
                <span className="text-amber-600">→</span>
              </p>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-2 leading-tight">
                Ada ucapan? 💬
              </h2>
              <p className="text-emerald-400 text-base mb-8">
                Tulis apa-apa untuk tuan rumah. <span className="text-emerald-600">(optional)</span>
              </p>
              <textarea
                ref={inputRef as React.RefObject<HTMLTextAreaElement>}
                value={data.message}
                onChange={e => setData(d => ({ ...d, message: e.target.value }))}
                rows={3}
                placeholder="Selamat Hari Raya! Maaf zahir batin..."
                className="w-full bg-transparent border-b-2 border-emerald-600 focus:border-amber-400 text-white text-xl py-3 outline-none placeholder:text-emerald-800 transition-colors caret-amber-400 resize-none"
              />
              {error && <p className="text-red-400 text-sm mt-3">⚠️ {error}</p>}
              <div className="mt-8">
                <button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="bg-amber-400 hover:bg-amber-300 disabled:opacity-60 text-emerald-950 font-bold px-8 py-4 rounded-lg transition-all text-base flex items-center gap-2"
                >
                  {submitting ? <>Menghantar...</> : <>Hantar RSVP 🌙</>}
                </button>
                <p className="text-emerald-700 text-xs mt-3">Shift + Enter untuk baris baru</p>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Bottom nav */}
      <div className="fixed bottom-6 right-6 flex gap-2">
        <button
          onClick={goBack}
          disabled={step === 0}
          className="w-10 h-10 rounded-lg bg-emerald-900 hover:bg-emerald-800 disabled:opacity-20 text-white flex items-center justify-center transition-all"
          title="Balik"
        >
          ▲
        </button>
        {(step === 0 || step === 4) && (
          <button
            onClick={goNext}
            disabled={step === 0 && !data.name.trim()}
            className="w-10 h-10 rounded-lg bg-emerald-900 hover:bg-emerald-800 disabled:opacity-20 text-white flex items-center justify-center transition-all"
            title="Seterusnya"
          >
            ▼
          </button>
        )}
      </div>

      <div className="fixed bottom-6 left-6 text-emerald-900 text-xs">
        Raya Open House 🌙
      </div>
    </div>
  );
}
