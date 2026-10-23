import React from 'react';

interface RACSymbolProps {
  simbolId: string;
}

export const RACSymbolRenderer: React.FC<RACSymbolProps> = ({ simbolId }) => {
  const strokeColor = "#0056b3"; // Deep blueprint indigo/blue matching authentic test paper

  switch (simbolId) {
    // Soal 8: [ 9-box, 9-box, P-box ] (SAMA)
    case 'RAC_SIMBOL_8_A':
    case 'RAC_SIMBOL_8_B':
      return (
        <svg viewBox="0 0 170 50" className="h-10 sm:h-12 w-auto mx-auto fill-none stroke-[2.5]" stroke={strokeColor}>
          {/* Glyph 1: 9-box */}
          <rect x="10" y="8" width="30" height="22" rx="1" />
          <line x1="40" y1="8" x2="40" y2="44" />
          {/* Glyph 2: 9-box */}
          <rect x="65" y="8" width="30" height="22" rx="1" />
          <line x1="95" y1="8" x2="95" y2="44" />
          {/* Glyph 3: P-box */}
          <line x1="120" y1="8" x2="120" y2="44" />
          <rect x="120" y="8" width="30" height="22" rx="1" />
        </svg>
      );

    // Soal 12: Kolom A [Pin, Panah, Pin, Panah] vs Kolom B [Pin, Panah, Panah, Panah] (BERBEDA)
    case 'RAC_SIMBOL_12_A':
      return (
        <svg viewBox="0 0 160 55" className="h-10 sm:h-12 w-auto mx-auto fill-none stroke-[2.2]" stroke={strokeColor}>
          {/* Pin 1 */}
          <circle cx="20" cy="12" r="7" />
          <circle cx="20" cy="12" r="1.5" fill={strokeColor} />
          <line x1="20" y1="19" x2="20" y2="48" />
          <line x1="14" y1="28" x2="26" y2="28" />
          <line x1="14" y1="36" x2="26" y2="36" />
          {/* Arrow 2 */}
          <line x1="60" y1="48" x2="60" y2="12" />
          <polyline points="53,20 60,11 67,20" />
          {/* Pin 3 */}
          <circle cx="100" cy="12" r="7" />
          <circle cx="100" cy="12" r="1.5" fill={strokeColor} />
          <line x1="100" y1="19" x2="100" y2="48" />
          <line x1="94" y1="28" x2="106" y2="28" />
          <line x1="94" y1="36" x2="106" y2="36" />
          {/* Arrow 4 */}
          <line x1="140" y1="48" x2="140" y2="12" />
          <polyline points="133,20 140,11 147,20" />
        </svg>
      );

    case 'RAC_SIMBOL_12_B':
      return (
        <svg viewBox="0 0 160 55" className="h-10 sm:h-12 w-auto mx-auto fill-none stroke-[2.2]" stroke={strokeColor}>
          {/* Pin 1 */}
          <circle cx="20" cy="12" r="7" />
          <circle cx="20" cy="12" r="1.5" fill={strokeColor} />
          <line x1="20" y1="19" x2="20" y2="48" />
          <line x1="14" y1="28" x2="26" y2="28" />
          <line x1="14" y1="36" x2="26" y2="36" />
          {/* Arrow 2 */}
          <line x1="60" y1="48" x2="60" y2="12" />
          <polyline points="53,20 60,11 67,20" />
          {/* Arrow 3 (BERBEDA!) */}
          <line x1="100" y1="48" x2="100" y2="12" />
          <polyline points="93,20 100,11 107,20" />
          {/* Arrow 4 */}
          <line x1="140" y1="48" x2="140" y2="12" />
          <polyline points="133,20 140,11 147,20" />
        </svg>
      );

    // Soal 16: Kolom A [✕, △/, ✕, □/, ☒] vs Kolom B [⟋, △/, ✕, □/, ☒] (BERBEDA)
    case 'RAC_SIMBOL_16_A':
      return (
        <svg viewBox="0 0 190 50" className="h-10 sm:h-12 w-auto mx-auto fill-none stroke-[2.2]" stroke={strokeColor}>
          {/* 1: Cross */}
          <line x1="10" y1="10" x2="30" y2="40" />
          <line x1="30" y1="10" x2="10" y2="40" />
          {/* 2: Triangle with slash */}
          <polygon points="58,10 44,40 72,40" />
          <line x1="58" y1="10" x2="58" y2="40" />
          {/* 3: Cross */}
          <line x1="88" y1="10" x2="108" y2="40" />
          <line x1="108" y1="10" x2="88" y2="40" />
          {/* 4: Square with slash */}
          <rect x="122" y="12" width="26" height="26" />
          <line x1="122" y1="12" x2="148" y2="38" />
          {/* 5: Square with cross hatch */}
          <rect x="158" y="12" width="26" height="26" />
          <line x1="158" y1="12" x2="184" y2="38" />
          <line x1="184" y1="12" x2="158" y2="38" />
        </svg>
      );

    case 'RAC_SIMBOL_16_B':
      return (
        <svg viewBox="0 0 190 50" className="h-10 sm:h-12 w-auto mx-auto fill-none stroke-[2.2]" stroke={strokeColor}>
          {/* 1: Single slash / arc (BERBEDA!) */}
          <line x1="10" y1="10" x2="30" y2="40" />
          {/* 2: Triangle with slash */}
          <polygon points="58,10 44,40 72,40" />
          <line x1="58" y1="10" x2="58" y2="40" />
          {/* 3: Cross */}
          <line x1="88" y1="10" x2="108" y2="40" />
          <line x1="108" y1="10" x2="88" y2="40" />
          {/* 4: Square with slash */}
          <rect x="122" y="12" width="26" height="26" />
          <line x1="122" y1="12" x2="148" y2="38" />
          {/* 5: Square with cross hatch */}
          <rect x="158" y="12" width="26" height="26" />
          <line x1="158" y1="12" x2="184" y2="38" />
          <line x1="184" y1="12" x2="158" y2="38" />
        </svg>
      );

    // Soal 28: Kolom A [:— = ⦵ H 𝄀] vs Kolom B [:_ = ⦵ H 𝄀] (BERBEDA)
    case 'RAC_SIMBOL_28_A':
      return (
        <svg viewBox="0 0 180 50" className="h-10 sm:h-12 w-auto mx-auto fill-none stroke-[2.2]" stroke={strokeColor}>
          {/* 1: Colon with horizontal center line */}
          <circle cx="12" cy="18" r="2.5" fill={strokeColor} />
          <line x1="18" y1="25" x2="34" y2="25" />
          <circle cx="12" cy="32" r="2.5" fill={strokeColor} />
          {/* 2: Equals */}
          <line x1="48" y1="20" x2="68" y2="20" />
          <line x1="48" y1="30" x2="68" y2="30" />
          {/* 3: Circle with line */}
          <circle cx="95" cy="25" r="14" />
          <line x1="81" y1="25" x2="109" y2="25" />
          {/* 4: Letter H */}
          <line x1="122" y1="11" x2="122" y2="39" />
          <line x1="138" y1="11" x2="138" y2="39" />
          <line x1="122" y1="25" x2="138" y2="25" />
          {/* 5: Box with split */}
          <rect x="150" y="11" width="24" height="28" />
          <line x1="162" y1="11" x2="162" y2="39" />
        </svg>
      );

    case 'RAC_SIMBOL_28_B':
      return (
        <svg viewBox="0 0 180 50" className="h-10 sm:h-12 w-auto mx-auto fill-none stroke-[2.2]" stroke={strokeColor}>
          {/* 1: Dots with line underneath (BERBEDA!) */}
          <circle cx="12" cy="16" r="2.5" fill={strokeColor} />
          <circle cx="12" cy="28" r="2.5" fill={strokeColor} />
          <line x1="6" y1="38" x2="26" y2="38" />
          {/* 2: Equals */}
          <line x1="48" y1="20" x2="68" y2="20" />
          <line x1="48" y1="30" x2="68" y2="30" />
          {/* 3: Circle with line */}
          <circle cx="95" cy="25" r="14" />
          <line x1="81" y1="25" x2="109" y2="25" />
          {/* 4: Letter H */}
          <line x1="122" y1="11" x2="122" y2="39" />
          <line x1="138" y1="11" x2="138" y2="39" />
          <line x1="122" y1="25" x2="138" y2="25" />
          {/* 5: Box with split */}
          <rect x="150" y="11" width="24" height="28" />
          <line x1="162" y1="11" x2="162" y2="39" />
        </svg>
      );

    // Soal 32: [⊘, Q, ⊘, ⧄, ⊘] (SAMA)
    case 'RAC_SIMBOL_32_A':
    case 'RAC_SIMBOL_32_B':
      return (
        <svg viewBox="0 0 180 50" className="h-10 sm:h-12 w-auto mx-auto fill-none stroke-[2.2]" stroke={strokeColor}>
          {/* 1: Circle with slash */}
          <circle cx="20" cy="25" r="14" />
          <line x1="10" y1="35" x2="30" y2="15" />
          {/* 2: Q-circle */}
          <circle cx="55" cy="23" r="13" />
          <line x1="58" y1="27" x2="72" y2="41" />
          {/* 3: Circle with slash */}
          <circle cx="95" cy="25" r="14" />
          <line x1="85" y1="35" x2="105" y2="15" />
          {/* 4: Square with slash */}
          <rect x="120" y="12" width="26" height="26" />
          <line x1="120" y1="12" x2="146" y2="38" />
          {/* 5: Circle with slash */}
          <circle cx="165" cy="25" r="14" />
          <line x1="155" y1="35" x2="175" y2="15" />
        </svg>
      );

    // Soal 36: Kolom A [⊖ ▽ ⊙ ⬡ ⧄] vs Kolom B [⊖ ▽ ○ ⬡ ⧄] (BERBEDA)
    case 'RAC_SIMBOL_36_A':
      return (
        <svg viewBox="0 0 180 50" className="h-10 sm:h-12 w-auto mx-auto fill-none stroke-[2.2]" stroke={strokeColor}>
          {/* 1: Circle horizontal line */}
          <circle cx="20" cy="25" r="14" />
          <line x1="6" y1="25" x2="34" y2="25" />
          {/* 2: Inverted triangle with line */}
          <polygon points="40,13 70,13 55,39" />
          <line x1="55" y1="13" x2="55" y2="39" />
          {/* 3: Target circle */}
          <circle cx="92" cy="25" r="14" />
          <circle cx="92" cy="25" r="3" fill={strokeColor} />
          {/* 4: Hexagon */}
          <polygon points="125,12 141,12 147,25 141,38 125,38 119,25" />
          {/* 5: Square with slash */}
          <rect x="156" y="12" width="26" height="26" />
          <line x1="156" y1="12" x2="182" y2="38" />
        </svg>
      );

    case 'RAC_SIMBOL_36_B':
      return (
        <svg viewBox="0 0 180 50" className="h-10 sm:h-12 w-auto mx-auto fill-none stroke-[2.2]" stroke={strokeColor}>
          {/* 1: Circle horizontal line */}
          <circle cx="20" cy="25" r="14" />
          <line x1="6" y1="25" x2="34" y2="25" />
          {/* 2: Inverted triangle with line */}
          <polygon points="40,13 70,13 55,39" />
          <line x1="55" y1="13" x2="55" y2="39" />
          {/* 3: Empty circle (BERBEDA!) */}
          <circle cx="92" cy="25" r="14" />
          {/* 4: Hexagon */}
          <polygon points="125,12 141,12 147,25 141,38 125,38 119,25" />
          {/* 5: Square with slash */}
          <rect x="156" y="12" width="26" height="26" />
          <line x1="156" y1="12" x2="182" y2="38" />
        </svg>
      );

    // Soal 39: Kolom A [D — ⤹ ◇ ◈] vs Kolom B [D — ⤵ ◇ ◈] (BERBEDA)
    case 'RAC_SIMBOL_39_A':
      return (
        <svg viewBox="0 0 180 50" className="h-10 sm:h-12 w-auto mx-auto fill-none stroke-[2.2]" stroke={strokeColor}>
          {/* 1: D-curve */}
          <path d="M 12 12 L 12 38 Q 32 25 12 12" />
          <path d="M 16 17 L 16 33 Q 26 25 16 17" />
          {/* 2: Dash */}
          <line x1="42" y1="25" x2="62" y2="25" />
          {/* 3: Hook line pointing UP */}
          <path d="M 75 32 Q 95 32 95 16" />
          <polyline points="90,22 95,15 100,22" />
          {/* 4: Diamond */}
          <polygon points="125,12 137,25 125,38 113,25" />
          {/* 5: Diamond with vertical line */}
          <polygon points="160,12 172,25 160,38 148,25" />
          <line x1="160" y1="12" x2="160" y2="38" />
        </svg>
      );

    case 'RAC_SIMBOL_39_B':
      return (
        <svg viewBox="0 0 180 50" className="h-10 sm:h-12 w-auto mx-auto fill-none stroke-[2.2]" stroke={strokeColor}>
          {/* 1: D-curve */}
          <path d="M 12 12 L 12 38 Q 32 25 12 12" />
          <path d="M 16 17 L 16 33 Q 26 25 16 17" />
          {/* 2: Dash */}
          <line x1="42" y1="25" x2="62" y2="25" />
          {/* 3: Hook line pointing DOWN (BERBEDA!) */}
          <path d="M 75 18 Q 95 18 95 34" />
          <polyline points="90,28 95,35 100,28" />
          {/* 4: Diamond */}
          <polygon points="125,12 137,25 125,38 113,25" />
          {/* 5: Diamond with vertical line */}
          <polygon points="160,12 172,25 160,38 148,25" />
          <line x1="160" y1="12" x2="160" y2="38" />
        </svg>
      );

    default:
      return null;
  }
};
