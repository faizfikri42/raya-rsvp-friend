'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

// ─── CUSTOMIZE YOUR EVENT DETAILS HERE ────────────────────────────────────────
const EVENT_HOST = 'Open House Raya';          // e.g. "Hafiz & Adibah"
const EVENT_DATE = 'XX April 2026';            // e.g. "20 April 2026"
const EVENT_DATE_SUB = '12 Tengah Hari sampai makanan habis 😋';
const GOOGLE_MAPS_URL = 'https://maps.google.com'; // paste your Google Maps share link
const WAZE_URL = 'https://waze.com';               // paste your Waze share link
// ──────────────────────────────────────────────────────────────────────────────

type FormData = {
  attending: 'yes' | 'no' | '';
  guest_count: number | null;
  car_plate: string;
  message: string;
};

type Direction = 'up' | 'down';

const GUEST_OPTIONS = [
  { value: 1, letter: 'A', label: 'Saya single', sub: '1 orang je' },
  { value: 2, letter: 'B', label: 'Mestilah bawak +1', sub: '2 orang' },
  { value: 3, letter: 'C', label: '3 orang', sub: 'Ramai sikit' },
  { value: 4, letter: 'D', label: '4 orang', sub: 'Rombongan dah ni' },
];

export default function RsvpPage() {
  const [started, setStarted] = useState(false);
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState<Direction>('up');
  const [stepKey, setStepKey] = useState(0);
  const [data, setData] = useState<FormData>({
    attending: '',
    guest_count: null,
    car_plate: '',
    message: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement | null>(null);

  // Steps: 0=attending, 1=guest_count, 2=car_plate, 3=message
  // If not attending, after step 0 jump straight to step 3

  const totalSteps = data.attending === 'no' ? 2 : 4;
  const progressIndex =
    data.attending === 'no' ? (step === 0 ? 0 : 1) : step;
  const progress = Math.min((progressIndex / (totalSteps - 1)) * 100, 100);

  function navigate(toStep: number, dir: Direction) {
    setDirection(dir);
    setStep(toStep);
    setStepKey(k => k + 1);
  }

  function goNext() {
    if (step === 2) { navigate(3, 'up'); return; }
    if (step === 3) { handleSubmit(); return; }
  }

  function goBack() {
    if (step === 0) return;
    if (step === 3 && data.attending === 'no') { navigate(0, 'down'); return; }
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
          attending: data.attending,
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

  // Focus input when step changes
  useEffect(() => {
    const timer = setTimeout(() => inputRef.current?.focus(), 480);
    return () => clearTimeout(timer);
  }, [step, stepKey]);

  // Enter key handler for text inputs
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        if (step === 2) goNext();
      }
    },
    [step]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  if (!started) {
    return (
      <div className="min-h-screen bg-[#0d2418] flex items-center justify-center p-6">
        <div className="text-center max-w-lg animate-slide-up">
          <div className="flex justify-center gap-6 mb-6 text-4xl">
            <span>🏮</span>
            <span className="text-5xl">🌙</span>
            <span>🏮</span>
          </div>

          <p className="text-amber-400 text-sm font-semibold tracking-widest uppercase mb-3">
            You&apos;re invited
          </p>

          <h1 className="text-4xl md:text-5xl font-extrabold text-white leading-tight mb-4">
            Open House<br />
            <span className="text-amber-400">{EVENT_HOST}</span>
          </h1>

          <p className="text-emerald-300 text-lg leading-relaxed mb-2">
            Assalamualaikum & Selamat Datang! 🤗
          </p>
          <p className="text-emerald-400 text-base leading-relaxed mb-8">
            Kami dengan penuh kegembiraan menjemput korang ke majlis<br className="hidden md:block" />
            <span className="text-white font-semibold"> Open House Hari Raya Aidilfitri</span> kami.<br />
            Jangan malu, jangan segan — makan banyak-banyak! 😄
          </p>

          {/* Event details card */}
          <div className="bg-emerald-950/60 border border-emerald-800 rounded-2xl px-6 py-5 mb-8 text-left space-y-3">
            <div className="flex items-start gap-3">
              <span className="text-xl mt-0.5">📅</span>
              <div>
                <p className="text-white font-semibold">{EVENT_DATE}</p>
                <p className="text-emerald-400 text-sm">{EVENT_DATE_SUB}</p>
              </div>
            </div>
            <div className="h-px bg-emerald-900" />
            <div className="flex items-start gap-3">
              <span className="text-xl mt-0.5">📍</span>
              <div>
                <p className="text-white font-semibold mb-2">Lokasi</p>
                <div className="flex gap-2 flex-wrap">
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

          <p className="text-emerald-500 text-sm mb-6">
            Ambik masa 1 minit je untuk isi borang ni.<br />
            Tolong confirm supaya kami boleh bersedia untuk korang! 🙏
          </p>

          <button
            onClick={() => setStarted(true)}
            className="bg-amber-400 hover:bg-amber-300 active:scale-95 text-emerald-950 font-bold px-10 py-4 rounded-xl transition-all text-lg shadow-lg shadow-amber-400/20"
          >
            RSVP Sekarang &nbsp;→
          </button>

          <p className="text-emerald-800 text-xs mt-8">
            Selamat Hari Raya Aidilfitri · Maaf Zahir & Batin
          </p>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-[#0d2418] flex items-center justify-center p-6">
        <div className="text-center max-w-md animate-slide-up">
          <div className="text-5xl mb-4">🌙✨</div>
          {data.attending === 'yes' ? (
            <>
              <h2 className="text-4xl font-bold text-white mb-2">Terima kasih!</h2>
              <p className="text-emerald-300 text-lg mb-6">Jumpa Nanti!! 😄</p>
            </>
          ) : (
            <>
              <h2 className="text-4xl font-bold text-white mb-2">Terima kasih!</h2>
              <p className="text-emerald-300 text-lg mb-6">Takpe, lain kali kita jumpa! 😊</p>
            </>
          )}
          <p className="text-amber-400 font-semibold text-lg">Selamat Hari Raya Aidilfitri 🌟</p>
          <p className="text-emerald-600 text-sm mt-1">Maaf Zahir & Batin</p>
        </div>
      </div>
    );
  }

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

      {/* Main content */}
      <div className="flex-1 flex items-center justify-center px-6 py-16">
        <div key={stepKey} className={`w-full max-w-xl ${animClass}`}>

          {/* Step 0: Attending */}
          {step === 0 && (
            <div>
              <p className="text-amber-400 text-sm font-semibold mb-2 flex items-center gap-2">
                <span>01</span>
                <span className="text-amber-600">→</span>
              </p>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-2 leading-tight">
                Assalamualaikum! 🎉
              </h2>
              <p className="text-emerald-300 text-xl mb-8">Datang tak ke open house Raya ni?</p>
              <div className="flex flex-col gap-3">
                {[
                  { value: 'yes', letter: 'Y', label: 'Datang! Insya-Allah 🤲', sub: 'Confirm hadir' },
                  { value: 'no', letter: 'N', label: 'Tak dapat la kali ni 😢', sub: 'Tak hadir' },
                ].map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => {
                      setData(d => ({ ...d, attending: opt.value as 'yes' | 'no' }));
                      const next = opt.value === 'no' ? 3 : 1;
                      setTimeout(() => navigate(next, 'up'), 150);
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
                    }`}>
                      {opt.letter}
                    </span>
                    <div>
                      <p className="text-white font-semibold">{opt.label}</p>
                      <p className="text-emerald-500 text-sm">{opt.sub}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 1: Guest count */}
          {step === 1 && (
            <div>
              <p className="text-amber-400 text-sm font-semibold mb-2 flex items-center gap-2">
                <span>02</span>
                <span className="text-amber-600">→</span>
              </p>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-2 leading-tight">
                Best tu! 🙌
              </h2>
              <p className="text-emerald-300 text-xl mb-8">Berapa orang datang sekali?</p>
              <div className="flex flex-col gap-3">
                {GUEST_OPTIONS.map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => {
                      setData(d => ({ ...d, guest_count: opt.value }));
                      setTimeout(() => navigate(2, 'up'), 150);
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
                    }`}>
                      {opt.letter}
                    </span>
                    <div>
                      <p className="text-white font-semibold">{opt.label}</p>
                      <p className="text-emerald-500 text-sm">{opt.sub}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Car plate */}
          {step === 2 && (
            <div>
              <p className="text-amber-400 text-sm font-semibold mb-2 flex items-center gap-2">
                <span>03</span>
                <span className="text-amber-600">→</span>
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

          {/* Step 3: Message */}
          {step === 3 && (
            <div>
              <p className="text-amber-400 text-sm font-semibold mb-2 flex items-center gap-2">
                <span>{data.attending === 'no' ? '02' : '04'}</span>
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
              {error && (
                <p className="text-red-400 text-sm mt-3">⚠️ {error}</p>
              )}
              <div className="mt-8">
                <button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="bg-amber-400 hover:bg-amber-300 disabled:opacity-60 text-emerald-950 font-bold px-8 py-4 rounded-lg transition-all text-base flex items-center gap-2"
                >
                  {submitting ? (
                    <>Menghantar...</>
                  ) : (
                    <>Hantar RSVP 🌙</>
                  )}
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
        {step === 2 && (
          <button
            onClick={goNext}
            className="w-10 h-10 rounded-lg bg-emerald-900 hover:bg-emerald-800 disabled:opacity-20 text-white flex items-center justify-center transition-all"
            title="Seterusnya"
          >
            ▼
          </button>
        )}
      </div>

      {/* Watermark */}
      <div className="fixed bottom-6 left-6 text-emerald-900 text-xs">
        Raya Open House 🌙
      </div>
    </div>
  );
}
