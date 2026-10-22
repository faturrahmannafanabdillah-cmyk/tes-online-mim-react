import React from 'react';

interface WatermarkProps {
  name: string;
  email: string;
  visible: boolean;
}

export const Watermark: React.FC<WatermarkProps> = ({ name, email, visible }) => {
  if (!visible || !name) return null;

  const text = `${name.toUpperCase()} – ${email} – PT MIM`;
  // Generate 16 rotated watermark tiles
  const tiles = Array.from({ length: 16 });

  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 w-screen h-screen z-[500] flex flex-wrap justify-center items-center content-center overflow-hidden opacity-[0.07] pointer-events-none select-none"
    >
      {tiles.map((_, idx) => (
        <div
          key={idx}
          className="text-lg sm:text-2xl font-black text-black transform -rotate-[30deg] p-8 sm:p-12 whitespace-nowrap tracking-wider"
        >
          {text}
        </div>
      ))}
    </div>
  );
};
