import Image from "next/image";
import { fetchGuests } from "@/lib/notion";
import GuestGrid from "@/components/GuestGrid";

const LE_TICKET_LOGO =
  "https://zbjdebe6vzupm06b.public.blob.vercel-storage.com/summer-party/logos/Le%20ticket-Le%20ticket_logo%20sans%20baselineVert.png";

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
        <div className="flex flex-wrap justify-center items-center gap-2 mb-4">
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-1.5">
            <span>🍹</span>
            <p className="text-white font-medium tracking-widest uppercase text-sm">
              Mardi 23 juin 2026
            </p>
            <span>🩴</span>
          </div>
          <a
            href="https://maps.app.goo.gl/s8MxVH1nRX16Dj786"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-white/20 hover:bg-white/35 backdrop-blur-sm rounded-full px-4 py-1.5 text-white font-medium tracking-widest uppercase text-sm transition-colors"
          >
            <span>📍</span>
            <span>Café A, Paris</span>
            <span className="text-white/70 normal-case tracking-normal">→</span>
          </a>
        </div>
        <h1 className="flex flex-wrap justify-center items-center gap-3 sm:gap-4 text-4xl sm:text-6xl font-extrabold text-white tracking-tight drop-shadow-lg">
          <span>Summer Party</span>
          <span className="bg-white rounded-xl sm:rounded-2xl shadow-lg px-3 py-2 sm:px-4 sm:py-3 ring-1 ring-black/5">
            <span className="relative block w-32 h-9 sm:w-44 sm:h-12">
              <Image
                src={LE_TICKET_LOGO}
                alt="Le Ticket"
                fill
                className="object-contain"
                sizes="(min-width: 640px) 176px, 128px"
                priority
              />
            </span>
          </span>
        </h1>
        <div className="flex justify-center gap-2 mt-4 text-3xl">
          <span className="float-slow">🦩</span>
          <span className="float-medium">🍩</span>
          <span className="float-fast">🍉</span>
        </div>
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
