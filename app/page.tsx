import { fetchGuests } from "@/lib/notion";
import GuestGrid from "@/components/GuestGrid";

export const revalidate = 3600;

const POOL_FLOATS = ["🍩", "🦩", "🍉", "🌴", "🍹", "🎈", "🩴", "🍍", "🌺", "🏖️"];

export default async function Home() {
  const guests = await fetchGuests();

  return (
    <main className="min-h-screen pool-bg relative overflow-hidden">
      {/* Decorative floating elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
        {POOL_FLOATS.map((emoji, i) => (
          <span
            key={i}
            className={`absolute text-3xl sm:text-4xl opacity-30 select-none ${
              i % 3 === 0 ? "float-slow" : i % 3 === 1 ? "float-medium" : "float-fast"
            }`}
            style={{
              left: `${(i * 17 + 5) % 90}%`,
              top: `${(i * 23 + 10) % 85}%`,
              animationDelay: `${i * 0.7}s`,
            }}
          >
            {emoji}
          </span>
        ))}
      </div>

      {/* Header */}
      <header className="relative pt-12 pb-8 px-4 text-center">
        <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-1.5 mb-4">
          <span>🍹</span>
          <p className="text-white font-medium tracking-widest uppercase text-sm">
            Mardi 23 juin 2026
          </p>
          <span>🩴</span>
        </div>
        <h1 className="text-4xl sm:text-6xl font-extrabold text-white tracking-tight drop-shadow-lg">
          Summer Party
        </h1>
        <div className="flex justify-center gap-2 mt-2 text-3xl">
          <span className="float-slow">🦩</span>
          <span className="float-medium">🍩</span>
          <span className="float-fast">🍉</span>
        </div>
        <a
          href="https://maps.app.goo.gl/s8MxVH1nRX16Dj786"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 mt-4 bg-white/25 hover:bg-white/35 backdrop-blur-sm rounded-full px-4 py-1.5 text-white font-medium text-sm transition-colors drop-shadow"
        >
          <span>📍</span>
          <span>Café A, Paris</span>
          <span className="text-white/70">→</span>
        </a>
        <p className="text-lg text-white/80 mt-4 max-w-md mx-auto drop-shadow">
          Découvre qui sera là — tape sur une carte pour révéler un invité
        </p>
      </header>

      {/* Guest grid */}
      <section className="relative max-w-6xl mx-auto px-4 pb-16">
        <GuestGrid guests={guests} />
      </section>
    </main>
  );
}
