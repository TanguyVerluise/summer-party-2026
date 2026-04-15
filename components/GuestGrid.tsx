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
      {/* Counter + Reveal-all CTA — linked together in one card */}
      <div className="flex justify-center mb-8">
        <div className="inline-flex flex-col items-center gap-3 bg-white/20 backdrop-blur-sm rounded-3xl px-6 py-4 max-w-sm">
          {/* Counter */}
          <div className="flex items-center gap-2 text-white">
            <span className="text-sm">
              <span className="font-bold text-lg">{revealedIds.size}</span>
              {" / "}
              <span className="font-bold text-lg">{guests.length}</span>
              {" "}invités révélés
            </span>
            <span>🏊</span>
          </div>

          {/* Progress bar */}
          <div className="w-full h-2 bg-white/25 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-pink-400 to-rose-400 transition-all duration-500 ease-out"
              style={{
                width: `${(revealedIds.size / Math.max(guests.length, 1)) * 100}%`,
              }}
            />
          </div>

          {/* Reveal-all CTA (hidden once everyone is revealed) */}
          {!allRevealed && (
            <>
              <p className="text-white/85 text-xs italic">
                Pas patient·e ? Révèle tout le monde d&apos;un coup 👇
              </p>
              <button
                onClick={() => setShowQuiz(true)}
                className="inline-flex items-center gap-2 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white font-bold px-6 py-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
              >
                <span>🎉</span>
                Révéler tous les invités
                <span>🦩</span>
              </button>
            </>
          )}
        </div>
      </div>

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
