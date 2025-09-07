
import React from 'react';

interface VolumeMeterProps {
  volume: number; // 0 to 1
  threshold: number; // 0 to 1
}

export const VolumeMeter: React.FC<VolumeMeterProps> = ({ volume, threshold }) => {
  return (
    <div className="flex flex-col items-center">
      <div className="relative w-6 h-40 bg-gray-600/50 rounded-full overflow-hidden border-2 border-gray-500">
        <div
          className="absolute bottom-0 w-full bg-cyan-400 transition-transform duration-75"
          style={{ transform: `scaleY(${volume})`, transformOrigin: 'bottom' }}
        ></div>
        <div
          className="absolute w-full h-0.5 bg-red-400 transition-all"
          style={{ bottom: `${threshold * 100}%` }}
        >
          <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-2 h-0.5 bg-red-400"></div>
        </div>
      </div>
      <span className="mt-2 text-xs text-gray-400">Live Volume</span>
    </div>
  );
};
