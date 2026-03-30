"use client";

import { useState } from "react";
import { Guest } from "@/types";
import GuestCard from "./GuestCard";

export default function GuestGrid({ guests }: { guests: Guest[] }) {
  const [revealedCount, setRevealedCount] = useState(0);

  return (
    <div>
      {/* Counter */}
      <div className="text-center mb-8">
        <p className="text-gray-500 text-sm">
          <span className="font-semibold text-amber-600">{revealedCount}</span>
          {" / "}
          <span className="font-semibold">{guests.length}</span> invités
          révélés
        </p>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
        {guests.map((guest) => (
          <div
            key={guest.id}
            onClick={() => setRevealedCount((c) => Math.min(c + 1, guests.length))}
          >
            <GuestCard guest={guest} />
          </div>
        ))}
      </div>
    </div>
  );
}
