"use client";

import { useCallback, useState } from "react";
import { Guest } from "@/types";
import GuestCard from "./GuestCard";

export default function GuestGrid({ guests }: { guests: Guest[] }) {
  const [revealedIds, setRevealedIds] = useState<Set<string>>(new Set());

  const onReveal = useCallback((id: string) => {
    setRevealedIds((prev) => {
      if (prev.has(id)) return prev;
      const next = new Set(prev);
      next.add(id);
      return next;
    });
  }, []);

  return (
    <div>
      {/* Counter */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-5 py-2">
          <span className="text-white text-sm">
            <span className="font-bold text-lg">{revealedIds.size}</span>
            {" / "}
            <span className="font-bold text-lg">{guests.length}</span>
            {" "}invités révélés
          </span>
          <span>🏊</span>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
        {guests.map((guest, index) => (
          <GuestCard
            key={guest.id}
            guest={guest}
            revealed={revealedIds.has(guest.id)}
            onReveal={onReveal}
            index={index}
          />
        ))}
      </div>
    </div>
  );
}
