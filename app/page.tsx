import { fetchGuests } from "@/lib/notion";
import GuestGrid from "@/components/GuestGrid";

export const revalidate = 3600;

export default async function Home() {
  const guests = await fetchGuests();

  return (
    <main className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-rose-50">
      {/* Header */}
      <header className="pt-12 pb-8 px-4 text-center">
        <p className="text-amber-600 font-medium tracking-widest uppercase text-sm mb-2">
          Juin 2026
        </p>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 tracking-tight">
          Summer Party 🌞
        </h1>
        <p className="text-lg text-gray-500 mt-3 max-w-md mx-auto">
          Découvre qui sera là — tape sur une carte pour révéler un invité
        </p>
      </header>

      {/* Guest grid */}
      <section className="max-w-6xl mx-auto px-4 pb-16">
        <GuestGrid guests={guests} />
      </section>
    </main>
  );
}
