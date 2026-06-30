import React, { useEffect, useState } from 'react';

// Borboleta SVG fofa e delicada
const ButterflySVG = ({ color }) => (
  <svg
    viewBox="0 0 100 100"
    className="w-full h-full drop-shadow-[0_2px_5px_rgba(0,0,0,0.05)]"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M50 45 C42 20 15 20 15 45 C15 60 35 65 50 80 C65 65 85 60 85 45 C85 20 58 20 50 45 Z"
      fill={color}
      opacity="0.75"
    />
    <path
      d="M50 48 C45 35 30 35 30 48 C30 55 42 60 50 70 C58 60 70 55 70 48 C70 35 55 35 50 48 Z"
      fill="#fff"
      opacity="0.4"
    />
    {/* Antenas */}
    <path
      d="M48 40 Q45 25 38 22 M52 40 Q55 25 62 22"
      stroke="#6b5880"
      strokeWidth="1.5"
      strokeLinecap="round"
      fill="none"
      opacity="0.6"
    />
    {/* Corpinho */}
    <rect x="48" y="40" width="4" height="25" rx="2" fill="#6b5880" opacity="0.7" />
  </svg>
);

export default function FloatingButterflies({ count = 12 }) {
  const [butterflies, setButterflies] = useState([]);

  useEffect(() => {
    const colors = [
      '#ffd1dc', // Rosa bebê
      '#d4f0fc', // Azul bebê
      '#d2f8d2', // Verde bebê
      '#e8d7fa', // Lilás médio
      '#fcd4ff', // Rosa bebê vibrante
    ];

    const generated = Array.from({ length: count }).map((_, i) => {
      const size = Math.random() * 24 + 16; // 16px a 40px
      const left = Math.random() * 100; // 0% a 100% da largura
      const duration = Math.random() * 15 + 15; // 15s a 30s
      const delay = Math.random() * -20; // Atraso negativo para já começar distribuído
      const color = colors[Math.floor(Math.random() * colors.length)];
      const swayDuration = Math.random() * 4 + 3; // 3s a 7s para balanço horizontal

      return {
        id: i,
        size,
        left,
        duration,
        delay,
        color,
        swayDuration,
      };
    });

    setButterflies(generated);
  }, [count]);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
      {butterflies.map((butterfly) => (
        <div
          key={butterfly.id}
          className="absolute bottom-[-50px] animate-[float_linear_infinite]"
          style={{
            left: `${butterfly.left}%`,
            width: `${butterfly.size}px`,
            height: `${butterfly.size}px`,
            animationDuration: `${butterfly.duration}s`,
            animationDelay: `${butterfly.delay}s`,
          }}
        >
          <div
            className="w-full h-full animate-[sway_ease-in-out_infinite]"
            style={{
              animationDuration: `${butterfly.swayDuration}s`,
            }}
          >
            <ButterflySVG color={butterfly.color} />
          </div>
        </div>
      ))}
    </div>
  );
}
