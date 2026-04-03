"use client";

import { useState, useCallback, useMemo } from "react";
import { QUESTIONS, Question } from "@/lib/questions";

interface QuizModalProps {
  onSuccess: () => void;
  onClose: () => void;
}

const EMOJI_CORRECT = ["🎉", "🥳", "🏖️", "🦩", "🍹"];
const EMOJI_WRONG = ["💦", "🫠", "🤿", "🌊", "😅"];
const MAX_WRONG = 10;

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export default function QuizModal({ onSuccess, onClose }: QuizModalProps) {
  // Shuffle all questions once on mount
  const shuffledQuestions = useMemo(() => shuffleArray(QUESTIONS), []);

  const [questionIndex, setQuestionIndex] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

  // Shuffled option indices for current question
  const currentQuestion: Question = shuffledQuestions[questionIndex % shuffledQuestions.length];
  const shuffledOptionIndices = useMemo(
    () => shuffleArray([0, 1, 2, 3]),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [questionIndex]
  );

  const handleSelect = useCallback(
    (optionOriginalIndex: number) => {
      if (selectedOption !== null) return; // already answered

      setSelectedOption(optionOriginalIndex);
      const correct = optionOriginalIndex === currentQuestion.correctIndex;
      setIsCorrect(correct);

      if (correct) {
        // Delay to show feedback, then reveal all
        setTimeout(() => onSuccess(), 1200);
      } else {
        const newWrongCount = wrongCount + 1;
        setWrongCount(newWrongCount);

        if (newWrongCount >= MAX_WRONG) {
          // Too many wrong — reveal anyway
          setTimeout(() => onSuccess(), 1500);
        } else {
          // Next question after delay
          setTimeout(() => {
            setQuestionIndex((prev) => prev + 1);
            setSelectedOption(null);
            setIsCorrect(null);
          }, 1200);
        }
      }
    },
    [selectedOption, currentQuestion.correctIndex, wrongCount, onSuccess]
  );

  const emoji =
    isCorrect === true
      ? EMOJI_CORRECT[questionIndex % EMOJI_CORRECT.length]
      : isCorrect === false
        ? EMOJI_WRONG[wrongCount % EMOJI_WRONG.length]
        : "🏊";

  const forceReveal = wrongCount >= MAX_WRONG && isCorrect === false;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-lg bg-white/90 backdrop-blur-md rounded-3xl shadow-2xl p-6 sm:p-8 ring-1 ring-white/50 animate-in">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-xl leading-none"
          aria-label="Fermer"
        >
          ✕
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <span className="text-4xl">{emoji}</span>
          {isCorrect === true ? (
            <h2 className="text-xl font-bold text-green-600 mt-2">
              Bravo ! 🎉
            </h2>
          ) : forceReveal ? (
            <h2 className="text-xl font-bold text-pink-500 mt-2">
              Allez, on te les montre quand même 😘
            </h2>
          ) : isCorrect === false ? (
            <h2 className="text-xl font-bold text-pink-500 mt-2">
              Raté ! On réessaie 💦
            </h2>
          ) : (
            <h2 className="text-xl font-bold text-sky-700 mt-2">
              Réponds correctement pour tout révéler
            </h2>
          )}

          {/* Wrong counter */}
          {wrongCount > 0 && !forceReveal && isCorrect !== true && (
            <p className="text-sm text-gray-400 mt-1">
              {wrongCount}/{MAX_WRONG} erreurs
            </p>
          )}
        </div>

        {/* Question */}
        <p className="text-gray-800 font-semibold text-center text-lg mb-5 leading-snug">
          {currentQuestion.question}
        </p>

        {/* Options */}
        <div className="grid grid-cols-1 gap-3">
          {shuffledOptionIndices.map((origIdx) => {
            const isSelected = selectedOption === origIdx;
            const isAnswer = origIdx === currentQuestion.correctIndex;
            const showResult = selectedOption !== null;

            let buttonClass =
              "w-full text-left px-4 py-3 rounded-xl font-medium transition-all duration-300 ";

            if (showResult && isAnswer) {
              buttonClass +=
                "bg-green-100 text-green-800 ring-2 ring-green-400";
            } else if (showResult && isSelected && !isAnswer) {
              buttonClass += "bg-pink-100 text-pink-800 ring-2 ring-pink-400";
            } else if (showResult) {
              buttonClass += "bg-gray-50 text-gray-400";
            } else {
              buttonClass +=
                "bg-sky-50 text-sky-800 hover:bg-sky-100 hover:ring-2 hover:ring-sky-300 cursor-pointer";
            }

            return (
              <button
                key={`${questionIndex}-${origIdx}`}
                onClick={() => handleSelect(origIdx)}
                disabled={selectedOption !== null}
                className={buttonClass}
              >
                {currentQuestion.options[origIdx]}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
