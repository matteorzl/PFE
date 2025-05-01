import React from 'react';

interface AnimatedTextProps {
  text: string;
}

const AnimatedText = ({ text }: AnimatedTextProps) => {
  return (
    <span className="inline-flex">
      {text.split('').map((letter, index) => (
        <span
          key={index}
          className="animate-letter"
          style={{
            animationDelay: `${index * 0.1}s`
          }}
        >
          {letter}
        </span>
      ))}
    </span>
  );
};

export default AnimatedText;