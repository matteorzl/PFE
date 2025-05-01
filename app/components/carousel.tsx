"use client";

import React, { useState, useEffect } from 'react';

const slides = [
  {
    title: "Écouter, progresser ! Une aventure ludique pour apprendre à mieux identifier les sons.",
    image: "/images/slide1.png"
  },
  // Ajoutez d'autres slides ici
];

export default function Carousel() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
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
          <div className="flex flex-col items-center justify-center h-full p-12 text-white">
            <img src={slide.image} alt="" className="w-64 h-64 mb-8" />
            <p className="text-2xl font-medium text-center max-w-md">
              {slide.title}
            </p>
          </div>
        </div>
      ))}
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
    </div>
  );
}