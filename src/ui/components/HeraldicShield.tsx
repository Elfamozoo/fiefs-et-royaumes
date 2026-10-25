import React from 'react';
import type { LordHeraldry } from '../../engine/types';

interface HeraldicShieldProps {
  heraldry?: LordHeraldry;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export const HeraldicShield: React.FC<HeraldicShieldProps> = ({
  heraldry,
  size = 'md',
  className = '',
}) => {
  const primary = heraldry?.primaryColor ?? '#c0392b';
  const secondary = heraldry?.secondaryColor ?? '#f1c40f';
  const charge = heraldry?.charge ?? 'lion';

  const sizePixels = {
    sm: 28,
    md: 44,
    lg: 64,
    xl: 96,
  }[size];

  return (
    <div
      className={`inline-block relative select-none drop-shadow-md ${className}`}
      style={{ width: sizePixels, height: sizePixels * 1.15 }}
      title={`Blason héraldique: ${charge}`}
    >
      <svg
        viewBox="0 0 100 115"
        className="w-full h-full overflow-visible"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <clipPath id={`shield-clip-${primary.replace('#', '')}-${secondary.replace('#', '')}`}>
            <path d="M 10 10 L 90 10 Q 90 65 50 110 Q 10 65 10 10 Z" />
          </clipPath>
          <linearGradient id="shield-shine" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.35" />
            <stop offset="40%" stopColor="#ffffff" stopOpacity="0.05" />
            <stop offset="100%" stopColor="#000000" stopOpacity="0.3" />
          </linearGradient>
        </defs>

        {/* Shield Border Outer */}
        <path
          d="M 8 8 L 92 8 Q 92 67 50 114 Q 8 67 8 8 Z"
          fill="#4a3728"
          stroke="#d4af37"
          strokeWidth="3"
        />

        {/* Shield Body Clipped */}
        <g clipPath={`url(#shield-clip-${primary.replace('#', '')}-${secondary.replace('#', '')})`}>
          {/* Left half primary, right half secondary */}
          <rect x="0" y="0" width="50" height="120" fill={primary} />
          <rect x="50" y="0" width="50" height="120" fill={secondary} />

          {/* Charge / Emblem in Center */}
          <g transform="translate(50, 48) scale(0.65)" textAnchor="middle" dominantBaseline="central">
            {charge === 'lion' && (
              <text fontSize="46" fill="#ffffff" filter="drop-shadow(0 2px 3px rgba(0,0,0,0.6))">
                🦁
              </text>
            )}
            {charge === 'sword' && (
              <text fontSize="46" fill="#ffffff" filter="drop-shadow(0 2px 3px rgba(0,0,0,0.6))">
                ⚔️
              </text>
            )}
            {charge === 'scale' && (
              <text fontSize="46" fill="#ffffff" filter="drop-shadow(0 2px 3px rgba(0,0,0,0.6))">
                ⚖️
              </text>
            )}
            {charge === 'raven' && (
              <text fontSize="46" fill="#ffffff" filter="drop-shadow(0 2px 3px rgba(0,0,0,0.6))">
                🦅
              </text>
            )}
            {charge === 'tower' && (
              <text fontSize="46" fill="#ffffff" filter="drop-shadow(0 2px 3px rgba(0,0,0,0.6))">
                🏰
              </text>
            )}
            {charge === 'cross' && (
              <text fontSize="46" fill="#ffffff" filter="drop-shadow(0 2px 3px rgba(0,0,0,0.6))">
                ✝️
              </text>
            )}
            {charge === 'purse' && (
              <text fontSize="46" fill="#ffffff" filter="drop-shadow(0 2px 3px rgba(0,0,0,0.6))">
                💰
              </text>
            )}
            {!['lion', 'sword', 'scale', 'raven', 'tower', 'cross', 'purse'].includes(charge) && (
              <text fontSize="44" fill="#ffffff" filter="drop-shadow(0 2px 3px rgba(0,0,0,0.6))">
                🛡️
              </text>
            )}
          </g>

          {/* Shading & Sheen */}
          <path
            d="M 10 10 L 90 10 Q 90 65 50 110 Q 10 65 10 10 Z"
            fill="url(#shield-shine)"
          />
        </g>
      </svg>
    </div>
  );
};
