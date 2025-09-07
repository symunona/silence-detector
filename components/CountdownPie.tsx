import React from 'react';

interface CountdownPieProps {
  silenceCounter: number;
  silenceDuration: number;
  countBackwards: boolean;
  isTimerFinished: boolean;
  isSilent: boolean;
}

const CountdownPie: React.FC<CountdownPieProps> = ({
  silenceCounter,
  silenceDuration,
  countBackwards,
  isTimerFinished,
  isSilent
}) => {
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  
  // Progress goes from 0 to 1 as silenceCounter increases
  const progress = silenceDuration > 0 ? silenceCounter / silenceDuration : 0;
  
  // dashoffset goes from 0 to circumference as progress goes from 0 to 1, depleting the circle
  const strokeDashoffset = circumference * progress;

  const displayedCounter = countBackwards
    ? silenceDuration - silenceCounter
    : silenceCounter;
    
  const strokeColor = isTimerFinished ? 'text-green-300' : 'text-white';

  const initialDisplay = countBackwards ? silenceDuration : 0;

  return (
    <div className="relative w-64 h-64 sm:w-80 sm:h-80">
      <svg className="w-full h-full" viewBox="0 0 120 120">
        {/* Background track */}
        <circle
          cx="60"
          cy="60"
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth="10"
          className="text-white/20"
        />
        {/* Foreground progress */}
        <circle
          cx="60"
          cy="60"
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth="10"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          transform="rotate(-90 60 60)"
          className={`${strokeColor} transition-all`}
          style={{ transitionProperty: 'stroke-dashoffset, color', transitionDuration: '1s', transitionTimingFunction: 'linear' }}
        />
        <text
          x="50%"
          y="50%"
          dy=".3em" // vertically center
          textAnchor="middle"
          className="font-mono text-6xl sm:text-7xl font-bold fill-current text-white select-none"
          style={{ textShadow: '0 0 10px rgba(0,0,0,0.5)' }}
        >
          {(isSilent || isTimerFinished) ? displayedCounter.toString().padStart(2, '0') : initialDisplay.toString().padStart(2, '0')}
        </text>
      </svg>
    </div>
  );
};

export default CountdownPie;
