import React from 'react';

interface OfficialEmblemLogoProps {
  className?: string;
  size?: number;
}

export const OfficialEmblemLogo: React.FC<OfficialEmblemLogoProps> = ({
  className = 'w-11 h-11',
  size = 48,
}) => {
  return (
    <svg
      viewBox="0 0 120 120"
      width={size}
      height={size}
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="YojanaSathi Official Emblem"
    >
      <defs>
        {/* Navy Gradient */}
        <linearGradient id="emblemNavy" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#142352" />
          <stop offset="50%" stopColor="#0B1B3D" />
          <stop offset="100%" stopColor="#060F24" />
        </linearGradient>

        {/* Saffron & Gold Gradient */}
        <linearGradient id="emblemSaffron" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FF9933" />
          <stop offset="40%" stopColor="#F28C28" />
          <stop offset="100%" stopColor="#D96B00" />
        </linearGradient>

        {/* Gold Accent */}
        <linearGradient id="emblemGold" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFE082" />
          <stop offset="50%" stopColor="#D4AF37" />
          <stop offset="100%" stopColor="#997A15" />
        </linearGradient>

        {/* Soft Drop Shadow Filter */}
        <filter id="emblemGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#060F24" floodOpacity="0.35" />
        </filter>

        <filter id="chiseled" x="-10%" y="-10%" width="120%" height="120%">
          <feDropShadow dx="0" dy="1" stdDeviation="0.8" floodColor="#000000" floodOpacity="0.25" />
        </filter>
      </defs>

      {/* Outer Circular Shield Base */}
      <circle
        cx="60"
        cy="60"
        r="56"
        fill="url(#emblemNavy)"
        stroke="url(#emblemGold)"
        strokeWidth="2.2"
        filter="url(#emblemGlow)"
      />

      {/* Concentric Guilloché Ring */}
      <circle
        cx="60"
        cy="60"
        r="51"
        fill="none"
        stroke="#FF9933"
        strokeWidth="0.8"
        strokeDasharray="2.5 1.5"
        opacity="0.85"
      />
      <circle
        cx="60"
        cy="60"
        r="47.5"
        fill="none"
        stroke="url(#emblemGold)"
        strokeWidth="0.6"
        opacity="0.7"
      />

      {/* Background Micro Sunburst Rays */}
      <g opacity="0.12" stroke="#FFFFFF" strokeWidth="0.5">
        <line x1="60" y1="12" x2="60" y2="108" />
        <line x1="12" y1="60" x2="108" y2="60" />
        <line x1="26" y1="26" x2="94" y2="94" />
        <line x1="26" y1="94" x2="94" y2="26" />
      </g>

      {/* Open Book / Statutory Charter Foundation (Bottom Half) */}
      <g transform="translate(60, 78)" filter="url(#chiseled)">
        {/* Book Left Page */}
        <path
          d="M -2 -14 C -12 -17 -22 -14 -28 -10 C -28 3 -28 10 -28 10 C -22 6 -12 4 -2 7 Z"
          fill="#FAF6EE"
          stroke="#D4AF37"
          strokeWidth="1"
        />
        {/* Book Right Page */}
        <path
          d="M 2 -14 C 12 -17 22 -14 28 -10 C 28 3 28 10 28 10 C 22 6 12 4 2 7 Z"
          fill="#FAF6EE"
          stroke="#D4AF37"
          strokeWidth="1"
        />
        {/* Book Spine */}
        <path d="M 0 -15 L 0 8" stroke="#1B2A6B" strokeWidth="1.2" strokeLinecap="round" />
        {/* Text Lines on Left Page */}
        <line x1="-22" y1="-8" x2="-8" y2="-6" stroke="#9E8B6E" strokeWidth="0.8" strokeLinecap="round" />
        <line x1="-24" y1="-3" x2="-8" y2="-1" stroke="#9E8B6E" strokeWidth="0.8" strokeLinecap="round" />
        <line x1="-22" y1="2" x2="-8" y2="4" stroke="#9E8B6E" strokeWidth="0.8" strokeLinecap="round" />
        {/* Text Lines on Right Page */}
        <line x1="8" y1="-6" x2="22" y2="-8" stroke="#9E8B6E" strokeWidth="0.8" strokeLinecap="round" />
        <line x1="8" y1="-1" x2="24" y2="-3" stroke="#9E8B6E" strokeWidth="0.8" strokeLinecap="round" />
        <line x1="8" y1="4" x2="22" y2="2" stroke="#9E8B6E" strokeWidth="0.8" strokeLinecap="round" />
      </g>

      {/* Left Flanking Wheat Ear / Laurel */}
      <g transform="translate(24, 60)" filter="url(#chiseled)">
        <path d="M 10 -30 C 0 -10 0 16 10 32" fill="none" stroke="url(#emblemSaffron)" strokeWidth="1.4" />
        {/* Wheat Grains */}
        <ellipse cx="8" cy="-24" rx="2" ry="3.5" transform="rotate(-30 8 -24)" fill="url(#emblemGold)" />
        <ellipse cx="4" cy="-14" rx="2.2" ry="4" transform="rotate(-40 4 -14)" fill="url(#emblemGold)" />
        <ellipse cx="2" cy="-3" rx="2.4" ry="4.2" transform="rotate(-55 2 -3)" fill="url(#emblemGold)" />
        <ellipse cx="2" cy="9" rx="2.4" ry="4.2" transform="rotate(-70 2 9)" fill="url(#emblemGold)" />
        <ellipse cx="5" cy="20" rx="2.2" ry="3.8" transform="rotate(-85 5 20)" fill="url(#emblemGold)" />
        <ellipse cx="9" cy="29" rx="1.8" ry="3.2" transform="rotate(-100 9 29)" fill="url(#emblemGold)" />
      </g>

      {/* Right Flanking Wheat Ear / Laurel (Mirrored) */}
      <g transform="translate(96, 60) scale(-1, 1)" filter="url(#chiseled)">
        <path d="M 10 -30 C 0 -10 0 16 10 32" fill="none" stroke="url(#emblemSaffron)" strokeWidth="1.4" />
        {/* Wheat Grains */}
        <ellipse cx="8" cy="-24" rx="2" ry="3.5" transform="rotate(-30 8 -24)" fill="url(#emblemGold)" />
        <ellipse cx="4" cy="-14" rx="2.2" ry="4" transform="rotate(-40 4 -14)" fill="url(#emblemGold)" />
        <ellipse cx="2" cy="-3" rx="2.4" ry="4.2" transform="rotate(-55 2 -3)" fill="url(#emblemGold)" />
        <ellipse cx="2" cy="9" rx="2.4" ry="4.2" transform="rotate(-70 2 9)" fill="url(#emblemGold)" />
        <ellipse cx="5" cy="20" rx="2.2" ry="3.8" transform="rotate(-85 5 20)" fill="url(#emblemGold)" />
        <ellipse cx="9" cy="29" rx="1.8" ry="3.2" transform="rotate(-100 9 29)" fill="url(#emblemGold)" />
      </g>

      {/* Ashoka Chakra Wheel (Top Center) */}
      <g transform="translate(60, 38)" filter="url(#chiseled)">
        {/* Outer Ring */}
        <circle cx="0" cy="0" r="15" fill="#0B1B3D" stroke="url(#emblemSaffron)" strokeWidth="1.8" />
        <circle cx="0" cy="0" r="13" fill="none" stroke="url(#emblemGold)" strokeWidth="0.6" opacity="0.8" />
        {/* Central Hub */}
        <circle cx="0" cy="0" r="3.2" fill="url(#emblemSaffron)" stroke="#FFE082" strokeWidth="0.6" />
        <circle cx="0" cy="0" r="1.2" fill="#0B1B3D" />

        {/* 24 Radial Spokes with exact trigonometric angles */}
        <g stroke="url(#emblemGold)" strokeWidth="0.75" strokeLinecap="round">
          {/* 0, 90, 180, 270 */}
          <line x1="0" y1="-3.2" x2="0" y2="-13" />
          <line x1="0" y1="3.2" x2="0" y2="13" />
          <line x1="-3.2" y1="0" x2="-13" y2="0" />
          <line x1="3.2" y1="0" x2="13" y2="0" />
          {/* 45, 135, 225, 315 */}
          <line x1="2.26" y1="-2.26" x2="9.2" y2="-9.2" />
          <line x1="-2.26" y1="2.26" x2="-9.2" y2="9.2" />
          <line x1="-2.26" y1="-2.26" x2="-9.2" y2="-9.2" />
          <line x1="2.26" y1="2.26" x2="9.2" y2="9.2" />
          {/* 15, 75, 105, 165, 195, 255, 285, 345 */}
          <line x1="0.83" y1="-3.09" x2="3.36" y2="-12.56" />
          <line x1="-0.83" y1="3.09" x2="-3.36" y2="12.56" />
          <line x1="3.09" y1="-0.83" x2="12.56" y2="-3.36" />
          <line x1="-3.09" y1="0.83" x2="-12.56" y2="3.36" />
          <line x1="-0.83" y1="-3.09" x2="-3.36" y2="-12.56" />
          <line x1="0.83" y1="3.09" x2="3.36" y2="12.56" />
          <line x1="-3.09" y1="-0.83" x2="-12.56" y2="-3.36" />
          <line x1="3.09" y1="0.83" x2="12.56" y2="3.36" />
          {/* 30, 60, 120, 150, 210, 240, 300, 330 */}
          <line x1="1.6" y1="-2.77" x2="6.5" y2="-11.26" />
          <line x1="-1.6" y1="2.77" x2="-6.5" y2="11.26" />
          <line x1="2.77" y1="-1.6" x2="11.26" y2="-6.5" />
          <line x1="-2.77" y1="1.6" x2="-11.26" y2="6.5" />
          <line x1="-1.6" y1="-2.77" x2="-6.5" y2="-11.26" />
          <line x1="1.6" y1="2.77" x2="6.5" y2="11.26" />
          <line x1="-2.77" y1="-1.6" x2="-11.26" y2="-6.5" />
          <line x1="2.77" y1="1.6" x2="11.26" y2="6.5" />
        </g>
      </g>

      {/* Decorative Ornamental Flourishes beneath Chakra */}
      <path
        d="M 44 56 Q 52 59 60 56 Q 68 59 76 56"
        fill="none"
        stroke="url(#emblemSaffron)"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
      <circle cx="60" cy="58" r="1.2" fill="#FFE082" />

      {/* Bottom Star Accent */}
      <g transform="translate(60, 102)">
        <circle cx="0" cy="0" r="2.5" fill="url(#emblemSaffron)" stroke="#FFE082" strokeWidth="0.5" />
        <circle cx="-10" cy="-1.5" r="1" fill="#D4AF37" opacity="0.8" />
        <circle cx="10" cy="-1.5" r="1" fill="#D4AF37" opacity="0.8" />
      </g>
    </svg>
  );
};
