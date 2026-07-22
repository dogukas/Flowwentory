'use client';

import { useEffect, useState } from 'react';

interface Star {
  left: string;
  top: string;
  animationDelay: string;
  animationDuration: string;
}

export const InteractiveBackground = () => {
  const [stars, setStars] = useState<Star[]>([]);

  useEffect(() => {
    const newStars = Array(50).fill(null).map(() => ({
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      animationDelay: `${Math.random() * 5}s`,
      animationDuration: `${3 + Math.random() * 3}s`
    }));
    setStars(newStars);
  }, []);

  return (
    <>
      {/* Interaktif arka plan */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div 
          className="absolute inset-0"
          onMouseMove={(e) => {
            const starElements = document.querySelectorAll('.star');
            const x = e.clientX / window.innerWidth;
            const y = e.clientY / window.innerHeight;
            
            starElements.forEach((star) => {
              const rect = (star as HTMLElement).getBoundingClientRect();
              const starX = (rect.left + rect.width / 2) / window.innerWidth;
              const starY = (rect.top + rect.height / 2) / window.innerHeight;
              
              const distance = Math.sqrt(Math.pow(x - starX, 2) + Math.pow(y - starY, 2));
              const intensity = Math.max(0, 1 - distance * 3);
              
              (star as HTMLElement).style.transform = `scale(${1 + intensity})`;
              (star as HTMLElement).style.opacity = (0.2 + intensity * 0.8).toString();
            });
          }}
        >
          {stars.map((star, i) => (
            <div
              key={i}
              className="star"
              style={star}
            />
          ))}
        </div>
      </div>

      {/* Soft ışık efektleri */}
      <div className="absolute inset-0">
        <div className="absolute h-96 w-96 top-0 left-1/4 bg-blue-400/10 rounded-full blur-3xl animate-soft-float" />
        <div className="absolute h-96 w-96 bottom-0 right-1/4 bg-indigo-400/10 rounded-full blur-3xl animate-soft-float animation-delay-2000" />
      </div>

      {/* İnce çizgi detayları */}
      <div className="absolute inset-0 bg-grid-slate-800/20 [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]" />

      <style jsx>{`
        .star {
          position: absolute;
          width: 2px;
          height: 2px;
          background: white;
          border-radius: 50%;
          opacity: 0;
          animation: twinkle var(--duration, 4s) infinite;
          transform: translate3d(0, 0, 0);
          transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
          will-change: transform, opacity;
        }

        @keyframes twinkle {
          0%, 100% {
            opacity: 0;
            transform: scale(0.5);
          }
          50% {
            opacity: 0.25;
            transform: scale(1);
          }
        }
      `}</style>
    </>
  );
}; 