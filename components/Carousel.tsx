import Image from 'next/image';
import React, { useState, useEffect } from 'react';

import AnimatedText from './AnimatedTextProps';
import '../styles/animations.css';

const slides = [
  {
    title: {
      highlight: "Écouter, progresser !",
      rest: "Une aventure ludique pour apprendre à mieux identifier les sons."
    },
    image: "/images/carousel/Image1.png",
    color: "bg-blue-600"
  },
];

export default function Carousel() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    // Désactive l'autoplay si une seule slide
    if (slides.length <= 1) return;

    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 5000);
    
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative h-full bg-blue-600">
      {slides.map((slide, index) => (
        <div
          key={index}
          className={`absolute inset-0 transition-opacity duration-500 ${
            index === current ? "opacity-100" : "opacity-0"
          }`}
        >
          <div className="flex flex-col items-center justify-center h-full p-12">
            <div className="relative w-full max-w-2xl">
              {/* Bulle de dialogue */}
              <div className="bg-white rounded-tr-3xl rounded-tl-3xl rounded-br-3xl p-6 m-20 shadow-lg">
                <p className="text-blue-600">
                  <span className="text-3xl font-medium block">
                    <AnimatedText text={slide.title.highlight} />
                  </span>
                  <span className="text-xl font-normal mt-2 block">
                    {slide.title.rest}
                  </span>
                </p>
              </div>
              {/* Avatar */}
              <div className="absolute -bottom-20 left-2">
                <Image 
                  src={slide.image}
                  alt=""
                  width={150}
                  height={150}
                  className="object-contain"
                />
              </div>
            </div>
          </div>
        </div>
      ))}
      
      {/* Points de navigation - Affichés uniquement s'il y a plus d'une slide */}
      {slides.length > 1 && (
        <div className="absolute bottom-8 left-0 right-0 flex justify-center gap-2">
          {slides.map((_, index) => (
            <button
              key={index}
              className={`w-2 h-2 rounded-full ${
                index === current ? "bg-white" : "bg-white/50"
              }`}
              onClick={() => setCurrent(index)}
            />
          ))}
        </div>
      )}
    </div>
  );
}