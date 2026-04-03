"use client";

import { useCallback, useState } from "react";
import { Guest } from "@/types";
import GuestCard from "./GuestCard";
import QuizModal from "./QuizModal";

export default function GuestGrid({ guests }: { guests: Guest[] }) {
  const [revealedIds, setRevealedIds] = useState<Set<string>>(new Set());
  const [showQuiz, setShowQuiz] = useState(false);

  const onReveal = useCallback((id: string) => {
    setRevealedIds((prev) => {
      if (prev.has(id)) return prev;
      const next = new Set(prev);
      next.add(id);
      return next;
    });
  }, []);

  const revealAll = useCallback(() => {
    setRevealedIds(new Set(guests.map((g) => g.id)));
    setShowQuiz(false);
  }, [guests]);

  const allRevealed = revealedIds.size >= guests.length;

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

      {/* Reveal all button */}
      {!allRevealed && (
        <div className="text-center mb-8">
          <button
            onClick={() => setShowQuiz(true)}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white font-bold px-6 py-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
          >
            <span>🎉</span>
            Révéler tous les invités
            <span>🦩</span>
          </button>
        </div>
      )}

      {/* Quiz modal */}
      {showQuiz && (
        <QuizModal
          onSuccess={revealAll}
          onClose={() => setShowQuiz(false)}
        />
      )}

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
