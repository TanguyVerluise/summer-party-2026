"use client";

import Image from "next/image";
import { Guest } from "@/types";

const CARD_EMOJIS = ["🦩", "🍩", "🍉", "🌴", "🍹", "🎈", "🩴", "🍍", "🌺", "🏖️"];

interface GuestCardProps {
  guest: Guest;
  revealed: boolean;
  onReveal: (id: string) => void;
  index: number;
}

export default function GuestCard({ guest, revealed, onReveal, index }: GuestCardProps) {
  const initials = `${guest.firstName.charAt(0)}${guest.lastName.charAt(0)}`.toUpperCase();
  const emoji = CARD_EMOJIS[index % CARD_EMOJIS.length];

  return (
    <div
      onClick={() => onReveal(guest.id)}
      className={`relative cursor-pointer rounded-2xl overflow-hidden transition-all duration-500 hover:shadow-xl ${
        revealed
          ? "bg-white shadow-lg ring-2 ring-pink-300"
          : "bg-white/90 backdrop-blur-sm shadow-md hover:scale-[1.02]"
      }`}
    >
      {/* Photo */}
      <div className="relative w-full aspect-[3/4] bg-gradient-to-br from-sky-100 via-cyan-50 to-pink-100">
        {guest.photoUrl ? (
          <Image
            src={guest.photoUrl}
            alt={`${guest.firstName} ${guest.lastName}`}
            fill
            className={`object-cover transition-[filter] duration-700 ${
              revealed ? "blur-0" : "blur-xl"
            }`}
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
        ) : (
          <div
            className={`w-full h-full flex items-center justify-center text-4xl font-bold text-sky-400/40 transition-[filter] duration-700 ${
              revealed ? "blur-0" : "blur-xl"
            }`}
          >
            {initials}
          </div>
        )}

        {/* Overlay when hidden — logo or pool emoji */}
        {!revealed && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-b from-sky-200/40 to-pink-200/40 backdrop-blur-sm transition-opacity duration-500">
            {guest.logoUrl ? (
              <div className="relative w-16 h-16 mb-3">
                <Image
                  src={guest.logoUrl}
                  alt={guest.company}
                  fill
                  className="object-contain drop-shadow-md"
                  sizes="64px"
                />
              </div>
            ) : (
              <span className="text-5xl mb-2 drop-shadow-sm">{emoji}</span>
            )}
            <span className="text-sm font-medium text-sky-800 bg-white/70 px-3 py-1 rounded-full shadow-sm">
              Tap to reveal
            </span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-4">
        <div
          className={`transition-[filter] duration-700 ${
            revealed ? "blur-0" : "blur-md"
          }`}
        >
          <p className="font-bold text-gray-900 text-lg leading-tight">
            {guest.firstName} {guest.lastName}
          </p>
          <p className="text-sm text-gray-600 mt-1">{guest.jobTitle}</p>
          <p className="text-sm font-medium text-sky-600 mt-0.5">
            {guest.company}
          </p>
        </div>
      </div>
    </div>
  );
}
