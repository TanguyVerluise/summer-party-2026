"use client";

import { useState } from "react";
import Image from "next/image";
import { Guest } from "@/types";

export default function GuestCard({ guest }: { guest: Guest }) {
  const [revealed, setRevealed] = useState(false);

  const initials = `${guest.firstName.charAt(0)}${guest.lastName.charAt(0)}`.toUpperCase();

  return (
    <div
      onClick={() => setRevealed(true)}
      className={`relative cursor-pointer rounded-2xl bg-white shadow-lg overflow-hidden transition-all duration-500 hover:shadow-xl ${
        revealed ? "ring-2 ring-amber-300" : "hover:scale-[1.02]"
      }`}
    >
      {/* Photo */}
      <div className="relative w-full aspect-[3/4] bg-gradient-to-br from-amber-100 to-rose-100">
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
            className={`w-full h-full flex items-center justify-center text-4xl font-bold text-amber-600/40 transition-[filter] duration-700 ${
              revealed ? "blur-0" : "blur-xl"
            }`}
          >
            {initials}
          </div>
        )}

        {/* Overlay when hidden */}
        {!revealed && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/30 backdrop-blur-sm transition-opacity duration-500">
            <span className="text-4xl mb-2">🎉</span>
            <span className="text-sm font-medium text-gray-700 bg-white/70 px-3 py-1 rounded-full">
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
          <p className="text-sm font-medium text-amber-600 mt-0.5">
            {guest.company}
          </p>
        </div>
      </div>
    </div>
  );
}
