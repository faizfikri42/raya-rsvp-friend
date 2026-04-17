export default function ClosedPage() {
  return (
    <div className="min-h-screen bg-[#0d2418] flex items-center justify-center p-6">
      <div className="text-center max-w-md">
        <div className="flex justify-center gap-4 mb-6 text-4xl">
          <span>🏮</span>
          <span className="text-5xl">🌙</span>
          <span>🏮</span>
        </div>

        <h1 className="text-3xl font-bold text-white mb-3">
          RSVP Ditutup
        </h1>

        <p className="text-emerald-300 text-lg mb-2">
          Terima kasih atas minat anda.
        </p>
        <p className="text-emerald-500 text-base mb-8">
          Pendaftaran RSVP telah ditutup.
        </p>

        <div className="w-16 h-px bg-emerald-800 mx-auto mb-8" />

        <p className="text-amber-400 font-semibold">
          Selamat Hari Raya Aidilfitri
        </p>
        <p className="text-emerald-700 text-sm mt-1">
          Maaf Zahir &amp; Batin
        </p>
      </div>
    </div>
  );
}
