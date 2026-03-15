"use client";

import React from "react";

type MagicLampProps = {
  active?: boolean;
  className?: string;
  onClick?: () => void;
};

export function MagicLamp({ active = false, className = "", onClick }: MagicLampProps) {
  return (
    <button
      aria-label="Trigger Genie magic"
      className={`group relative inline-flex items-center justify-center ${className}`}
      onClick={onClick}
      type="button"
    >
      <span
        className={`absolute inset-0 rounded-full bg-[radial-gradient(circle,rgba(251,191,36,0.42),rgba(168,85,247,0.14)_45%,transparent_70%)] blur-2xl transition duration-500 ${
          active ? "scale-125 opacity-100" : "scale-100 opacity-70"
        }`}
      />
      <svg
        aria-hidden="true"
        className={`relative h-36 w-36 drop-shadow-[0_0_35px_rgba(251,191,36,0.28)] transition duration-500 ${
          active ? "scale-105 rotate-3" : "group-hover:scale-105 group-hover:-rotate-2"
        }`}
        viewBox="0 0 220 220"
      >
        <defs>
          <linearGradient id="lampGold" x1="0%" x2="100%" y1="0%" y2="100%">
            <stop offset="0%" stopColor="#fff1a8" />
            <stop offset="38%" stopColor="#f4b93c" />
            <stop offset="70%" stopColor="#b76a12" />
            <stop offset="100%" stopColor="#ffdd78" />
          </linearGradient>
          <linearGradient id="lampShadow" x1="0%" x2="100%" y1="0%" y2="100%">
            <stop offset="0%" stopColor="#8b4d12" />
            <stop offset="100%" stopColor="#36204f" />
          </linearGradient>
        </defs>
        <path
          d="M73 151c-17 1-29 7-35 18 29 6 60 8 91 6 30-2 51-8 61-18-16-5-30-6-42-6-7 0-12 0-18 2-10 2-19 2-28-2-9-3-18-4-29 0z"
          fill="url(#lampShadow)"
          opacity="0.45"
        />
        <path
          d="M63 132c-4-18 6-41 22-53 16-11 30-17 57-18 20-1 37 5 46 13 7 7 8 15 4 24-4 10-11 19-23 28 3 11 0 23-9 33-10 12-24 17-45 18-18 1-33-2-43-10-7-5-10-12-9-20z"
          fill="url(#lampGold)"
          stroke="#fbe6a2"
          strokeWidth="3"
        />
        <path
          d="M163 72c16-5 30-2 41 9-8 3-13 8-16 15 12-2 21 0 27 7-10 10-25 15-45 14"
          fill="none"
          stroke="#f2cb62"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="7"
        />
        <path
          d="M103 59c3-16 13-29 28-37 4 13 3 24-2 34"
          fill="none"
          stroke="#f8d46e"
          strokeLinecap="round"
          strokeWidth="7"
        />
        <path
          d="M78 126c18 7 49 7 73-1"
          fill="none"
          stroke="#fff2bf"
          strokeLinecap="round"
          strokeWidth="4"
        />
        <ellipse cx="100" cy="104" fill="#fff4c3" opacity="0.34" rx="27" ry="18" />
        <circle cx="102" cy="84" fill="#fff8d4" opacity="0.75" r="5" />
      </svg>
    </button>
  );
}
