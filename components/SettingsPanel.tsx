import React, { useState, useEffect } from 'react';
import type { AudioDevice } from '../types';
import { PenIcon } from './Icons';

interface SettingsPanelProps {
  threshold: number;
  setThreshold: (value: number) => void;
  silenceDuration: number;
  setSilenceDuration: (value: number) => void;
  visualDelay: number;
  setVisualDelay: (value: number) => void;
  countBackwards: boolean;
  setCountBackwards: (value: boolean) => void;
  audioDevices: AudioDevice[];
  selectedDeviceId: string;
  setSelectedDeviceId: (id: string) => void;
  currentVolume: number;
  isListening: boolean;
}

export const SettingsPanel: React.FC<SettingsPanelProps> = ({
  threshold,
  setThreshold,
  silenceDuration,
  setSilenceDuration,
  visualDelay,
  setVisualDelay,
  countBackwards,
  setCountBackwards,
  audioDevices,
  selectedDeviceId,
  setSelectedDeviceId,
  currentVolume,
  isListening,
}) => {
  const [isManualDuration, setIsManualDuration] = useState(false);
  const [manualDurationInput, setManualDurationInput] = useState(silenceDuration.toString());
  const [isManualVisualDelay, setIsManualVisualDelay] = useState(false);
  const [manualVisualDelayInput, setManualVisualDelayInput] = useState(visualDelay.toString());


  useEffect(() => {
    setManualDurationInput(silenceDuration.toString());
  }, [silenceDuration]);

  useEffect(() => {
    setManualVisualDelayInput(visualDelay.toString());
  }, [visualDelay]);

  const handleManualDurationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setManualDurationInput(e.target.value);
  };

  const handleManualDurationBlur = () => {
    let value = parseInt(manualDurationInput, 10);
    if (isNaN(value) || value < 1) {
      value = 1;
    } else if (value > 60) {
      value = 60;
    }
    setSilenceDuration(value);
    setManualDurationInput(value.toString());
    setIsManualDuration(false);
  };
  
  const handleManualVisualDelayChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setManualVisualDelayInput(e.target.value);
  };

  const handleManualVisualDelayBlur = () => {
    let value = parseInt(manualVisualDelayInput, 10);
    if (isNaN(value) || value < 0) {
      value = 0;
    } else if (value > 10) {
      value = 10;
    }
    setVisualDelay(value);
    setManualVisualDelayInput(value.toString());
    setIsManualVisualDelay(false);
  };

  return (
    <div className="absolute bottom-16 sm:bottom-20 right-4 bg-gray-800/80 backdrop-blur-md p-6 rounded-lg shadow-2xl w-80 text-white border border-gray-600 space-y-6 z-20">
      <h3 className="text-lg font-semibold text-center border-b border-gray-600 pb-2">Settings</h3>
      
      {/* Threshold Setting */}
      <div className="space-y-2">
        <label htmlFor="threshold" className="block text-sm font-medium text-gray-300">
          Silence Threshold
        </label>
        <div className="relative w-full h-2">
          {/* Gray background track */}
          <div className="absolute top-0 left-0 w-full h-full bg-gray-600 rounded-lg" />
          {/* Cyan volume fill */}
          <div
            className="absolute top-0 left-0 h-full bg-cyan-400 rounded-lg transition-all duration-75"
            style={{ width: `${currentVolume * 100}%` }}
          />
          {/* Slider input itself */}
          <input
            id="threshold"
            type="range"
            min="0.01"
            max="1.0"
            step="0.01"
            value={threshold}
            onChange={(e) => setThreshold(parseFloat(e.target.value))}
            className="relative w-full h-full bg-transparent appearance-none cursor-pointer accent-cyan-400"
          />
        </div>
        <div className="text-xs text-gray-400 text-center">{(threshold * 100).toFixed(0)}%</div>
      </div>


      {/* Silence Duration */}
      <div className="space-y-2">
         <label htmlFor="silenceDuration" className="block text-sm font-medium text-gray-300">
            Silence Duration ({silenceDuration}s)
          </label>
        <div className="flex items-center space-x-2">
          {isManualDuration ? (
            <input
              type="number"
              value={manualDurationInput}
              onChange={handleManualDurationChange}
              onBlur={handleManualDurationBlur}
              onKeyDown={(e) => e.key === 'Enter' && handleManualDurationBlur()}
              className="w-full bg-gray-700 border border-gray-500 rounded-md px-3 py-1 text-center"
              autoFocus
            />
          ) : (
            <input
              id="silenceDuration"
              type="range"
              min="1"
              max="60"
              step="1"
              value={silenceDuration}
              onChange={(e) => setSilenceDuration(parseInt(e.target.value))}
              className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-cyan-400"
            />
          )}
          <button 
            onClick={() => setIsManualDuration(!isManualDuration)}
            className="p-2 rounded-full hover:bg-gray-700 transition-colors"
            title="Manual Input"
            >
            <PenIcon className="w-5 h-5"/>
          </button>
        </div>
      </div>

      {/* Visual Red Delay */}
      <div className="space-y-2">
         <label htmlFor="visualDelay" className="block text-sm font-medium text-gray-300">
            Red Background Delay ({visualDelay}s)
          </label>
        <div className="flex items-center space-x-2">
          {isManualVisualDelay ? (
            <input
              type="number"
              value={manualVisualDelayInput}
              onChange={handleManualVisualDelayChange}
              onBlur={handleManualVisualDelayBlur}
              onKeyDown={(e) => e.key === 'Enter' && handleManualVisualDelayBlur()}
              className="w-full bg-gray-700 border border-gray-500 rounded-md px-3 py-1 text-center"
              autoFocus
            />
          ) : (
            <input
              id="visualDelay"
              type="range"
              min="0"
              max="10"
              step="1"
              value={visualDelay}
              onChange={(e) => setVisualDelay(parseInt(e.target.value))}
              className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-cyan-400"
            />
          )}
          <button 
            onClick={() => setIsManualVisualDelay(!isManualVisualDelay)}
            className="p-2 rounded-full hover:bg-gray-700 transition-colors"
            title="Manual Input"
            >
            <PenIcon className="w-5 h-5"/>
          </button>
        </div>
      </div>
      
      {/* Audio Device Selector */}
      {audioDevices.length > 1 && (
         <div className="space-y-2">
          <label htmlFor="audioDevice" className="block text-sm font-medium text-gray-300">
            Input Device
          </label>
          <select 
            id="audioDevice"
            value={selectedDeviceId}
            onChange={(e) => setSelectedDeviceId(e.target.value)}
            className="w-full bg-gray-700 border border-gray-500 rounded-md px-3 py-2"
          >
            {audioDevices.map(device => (
              <option key={device.id} value={device.id}>{device.label}</option>
            ))}
          </select>
        </div>
      )}

      {/* Count Backwards Checkbox */}
      <div className="flex items-center justify-between">
          <label htmlFor="countBackwards" className="text-sm font-medium text-gray-300">
            Count Backwards
          </label>
           <label className="relative inline-flex items-center cursor-pointer">
            <input 
              type="checkbox" 
              id="countBackwards"
              checked={countBackwards}
              onChange={(e) => setCountBackwards(e.target.checked)}
              className="sr-only peer"
              />
            <div className="w-11 h-6 bg-gray-600 rounded-full peer peer-focus:ring-4 peer-focus:ring-cyan-800 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-500"></div>
          </label>
      </div>

    </div>
  );
};