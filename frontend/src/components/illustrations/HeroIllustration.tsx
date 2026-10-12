import React from "react";

export function HeroIllustration() {
  return (
    <div className="relative w-full max-w-md mx-auto select-none animate-float">
      <svg viewBox="0 0 420 380" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
        <ellipse cx="210" cy="200" rx="180" ry="160" fill="#374785" opacity="0.12" />

        {/* Image frame */}
        <rect x="30" y="60" width="120" height="100" rx="12" fill="#24305E" />
        <rect x="38" y="68" width="104" height="84" rx="8" fill="#374785" />
        <circle cx="58" cy="88" r="10" fill="#A8D0E6" opacity="0.5" />
        <path d="M38 130 L70 105 L90 120 L115 95 L142 130Z" fill="#A8D0E6" opacity="0.4" />
        <rect x="38" y="68" width="104" height="84" rx="8" fill="url(#imgGrad)" opacity="0.3" />

        {/* Arrow 1 */}
        <path d="M158 108 L188 108" stroke="#F76C6C" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M183 103 L190 108 L183 113" stroke="#F76C6C" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

        {/* Hash/fingerprint block */}
        <rect x="196" y="68" width="100" height="80" rx="12" fill="#F8E9A1" opacity="0.2" stroke="#F8E9A1" strokeWidth="1.5" />
        <text x="246" y="90" textAnchor="middle" fill="#F8E9A1" fontSize="9" fontFamily="JetBrains Mono" opacity="0.9">#</text>
        <text x="246" y="102" textAnchor="middle" fill="#F8E9A1" fontSize="7" fontFamily="JetBrains Mono" opacity="0.7">3a9fc12e</text>
        <text x="246" y="113" textAnchor="middle" fill="#F8E9A1" fontSize="7" fontFamily="JetBrains Mono" opacity="0.7">b4c91f88</text>
        <text x="246" y="124" textAnchor="middle" fill="#F8E9A1" fontSize="7" fontFamily="JetBrains Mono" opacity="0.7">7bc288fa</text>
        <rect x="196" y="68" width="100" height="80" rx="12" fill="none" stroke="#F8E9A1" strokeWidth="1" opacity="0.4" />

        {/* Arrow 2 */}
        <path d="M304 108 L334 108" stroke="#F76C6C" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M329 103 L336 108 L329 113" stroke="#F76C6C" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

        {/* Blockchain blocks */}
        <rect x="342" y="72" width="52" height="36" rx="8" fill="#24305E" stroke="#374785" strokeWidth="1.5" />
        <rect x="346" y="76" width="44" height="28" rx="5" fill="#374785" opacity="0.8" />
        <circle cx="368" cy="90" r="4" fill="#A8D0E6" opacity="0.6" />

        <rect x="342" y="118" width="52" height="36" rx="8" fill="#24305E" stroke="#374785" strokeWidth="1.5" />
        <rect x="346" y="122" width="44" height="28" rx="5" fill="#374785" opacity="0.8" />
        <circle cx="368" cy="136" r="4" fill="#A8D0E6" opacity="0.6" />

        {/* Chain link */}
        <rect x="363" y="108" width="10" height="10" rx="3" fill="#374785" />

        {/* Big verified badge */}
        <circle cx="210" cy="260" r="72" fill="#374785" opacity="0.15" />
        <circle cx="210" cy="260" r="58" fill="#24305E" />
        <circle cx="210" cy="260" r="50" fill="#374785" />
        <path d="M188 260 L204 276 L234 246" stroke="#F76C6C" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" fill="none" />

        <text x="90" y="175" textAnchor="middle" fill="#24305E" fontSize="9" fontWeight="700" opacity="0.8">IMAGE</text>
        <text x="246" y="158" textAnchor="middle" fill="#F8E9A1" fontSize="9" fontWeight="700" opacity="0.8">FINGERPRINT</text>
        <text x="368" y="168" textAnchor="middle" fill="#A8D0E6" fontSize="9" fontWeight="700" opacity="0.8">PROOF</text>
        <text x="210" y="345" textAnchor="middle" fill="#F76C6C" fontSize="11" fontWeight="800">VERIFIED</text>

        <defs>
          <linearGradient id="imgGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#A8D0E6" />
            <stop offset="100%" stopColor="#374785" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}
