import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useMicrophone } from './hooks/useMicrophone';
import type { AudioDevice } from './types';
import { SettingsPanel } from './components/SettingsPanel';
import { GearIcon, StopIcon, PlayIcon } from './components/Icons';
import CountdownPie from './components/CountdownPie';

const SETTINGS_KEY = 'silenceDetectorSettings';

const loadSettings = () => {
  try {
    const item = window.localStorage.getItem(SETTINGS_KEY);
    const settings = item ? JSON.parse(item) : {};
    return {
      threshold: settings.threshold ?? 0.05,
      silenceDuration: settings.silenceDuration ?? 10,
      visualDelay: settings.visualDelay ?? 1,
      countBackwards: settings.countBackwards ?? false,
      selectedDeviceId: settings.selectedDeviceId ?? 'default',
    };
  } catch (error) {
    console.error("Error reading settings from localStorage", error);
    return {
      threshold: 0.05,
      silenceDuration: 10,
      visualDelay: 1,
      countBackwards: false,
      selectedDeviceId: 'default',
    };
  }
};


export default function App() {
  const [isListening, setIsListening] = useState(false);
  const [isSilent, setIsSilent] = useState(false);
  const [isVisiblySilent, setIsVisiblySilent] = useState(false);
  const [silenceCounter, setSilenceCounter] = useState(0);
  const [isTimerFinished, setIsTimerFinished] = useState(false);
  
  // Settings State
  const [showSettings, setShowSettings] = useState(false);
  const [threshold, setThreshold] = useState(loadSettings().threshold);
  const [silenceDuration, setSilenceDuration] = useState(loadSettings().silenceDuration);
  const [visualDelay, setVisualDelay] = useState(loadSettings().visualDelay);
  const [countBackwards, setCountBackwards] = useState(loadSettings().countBackwards);
  const [audioDevices, setAudioDevices] = useState<AudioDevice[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState(loadSettings().selectedDeviceId);

  const { start, stop, volume, error } = useMicrophone();
  const pendingSilenceTimeoutRef = useRef<number | undefined>(undefined);

  useEffect(()=>{
    if (isVisiblySilent){
      console.log('silent')
    } else {
      console.log('ssss')
    }
  }, [isVisiblySilent])

  // Save settings to localStorage whenever they change
  useEffect(() => {
    const settingsToSave = {
      threshold,
      silenceDuration,
      visualDelay,
      countBackwards,
      selectedDeviceId,
    };
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(settingsToSave));
    } catch (error) {
      console.error("Failed to save settings to localStorage:", error);
    }
  }, [threshold, silenceDuration, visualDelay, countBackwards, selectedDeviceId]);

  const resetSilenceState = useCallback(() => {
    setIsSilent(false);
    setIsVisiblySilent(false);
    setSilenceCounter(0);
    setIsTimerFinished(false);

    console.log('!!?', visualDelay)  
    clearTimeout(pendingSilenceTimeoutRef.current);
    pendingSilenceTimeoutRef.current = window.setTimeout(() => {    
      console.log('!!!')  
      setIsVisiblySilent(true);
    }, visualDelay * 1000);

  }, []);

  useEffect(() => {
    const getDevices = async () => {
      try {
        // Dummy call to get permissions first
        await navigator.mediaDevices.getUserMedia({ audio: true });
        const devices = await navigator.mediaDevices.enumerateDevices();
        const audioInputDevices = devices
          .filter(device => device.kind === 'audioinput')
          .map((device, i) => ({ id: device.deviceId, label: device.label || `Microphone ${i + 1}` }));
        setAudioDevices(audioInputDevices);

        // After fetching devices, check if the loaded device ID is still valid.
        const savedDeviceExists = audioInputDevices.some(device => device.id === selectedDeviceId);

        // If the saved device is not found, default to the first available one.
        if (audioInputDevices.length > 0 && !savedDeviceExists) {
            setSelectedDeviceId(audioInputDevices[0].id);
        }
      } catch (err) {
        console.error("Could not enumerate audio devices:", err);
      }
    };
    getDevices();
     // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleListen = useCallback(() => {
    start(selectedDeviceId).then(() => {
        setIsListening(true);
        setShowSettings(false);
        resetSilenceState();
    });
  }, [start, selectedDeviceId, resetSilenceState]);


  const handleStop = useCallback(() => {
    stop();
    setIsListening(false);
    resetSilenceState();
  }, [stop, resetSilenceState]);

  // Handlers for settings that reset the counter when changed live
  const handleThresholdChange = useCallback((value: number) => {
    setThreshold(value);
    if (isListening) resetSilenceState();
  }, [isListening, resetSilenceState]);

  const handleSilenceDurationChange = useCallback((value: number) => {
    setSilenceDuration(value);
    if (isListening) resetSilenceState();
  }, [isListening, resetSilenceState]);
  
  const handleVisualDelayChange = useCallback((value: number) => {
    setVisualDelay(value);
    if (isListening) resetSilenceState();
  }, [isListening, resetSilenceState]);

  const handleCountBackwardsChange = useCallback((value: boolean) => {
    setCountBackwards(value);
    if (isListening) resetSilenceState();
  }, [isListening, resetSilenceState]);

  const handleSelectedDeviceChange = useCallback((id: string) => {
    setSelectedDeviceId(id);
    if (isListening) {
      start(id); // Restart microphone stream
      resetSilenceState();
    }
  }, [isListening, start, resetSilenceState]);


  // Silence detection effect
  useEffect(() => {
    if (!isListening) {
      return;
    }

    if (volume < threshold) {
      if (!isSilent) {
        // Silence just started, so start the counter logic
        setIsSilent(true);
      }
    } else { // volume >= threshold
      if (isSilent) {
        // Silence was broken, reset everything
        resetSilenceState();
        
      }
    }
  }, [isListening, volume, threshold, isSilent, visualDelay, resetSilenceState]);
  
  // Timer effect
  useEffect(() => {
    let timerId: number | undefined;
    if (isListening && isSilent && !isTimerFinished) {
      timerId = window.setInterval(() => {
        setSilenceCounter(prev => {
          const nextCount = prev + 1;
          if (nextCount >= silenceDuration) {
            setIsTimerFinished(true);
            if(timerId) clearInterval(timerId);
            return silenceDuration;
          }
          return nextCount;
        });
      }, 1000);
    }
    return () => {
      if (timerId) clearInterval(timerId);
    };
  }, [isListening, isSilent, isTimerFinished, silenceDuration]);

  const backgroundClass = useMemo(() => {
    if (!isListening) return 'from-gray-700 to-gray-800';
    if (isVisiblySilent) return 'from-red-700 to-red-900';
    if (isTimerFinished) return 'from-green-700 to-green-900';
    return 'from-gray-700 to-gray-800';
  }, [isListening, isVisiblySilent, isTimerFinished]);
  
  const renderContent = () => {
    if (!isListening) {
      return (
        <>
          <div className="flex flex-col items-center justify-center">
            <button
              onClick={handleListen}
              className="group w-64 h-64 sm:w-80 sm:h-80 bg-cyan-500 hover:bg-cyan-400 text-white font-bold rounded-full shadow-2xl transition-all duration-300 transform hover:scale-105 active:scale-100 flex flex-col items-center justify-center cursor-pointer"
              aria-label="Start listening for silence"
            >
              <PlayIcon className="w-16 h-16 sm:w-20 sm:h-20 mb-2 transition-transform group-hover:scale-110" />
              <span className="text-3xl sm:text-4xl tracking-wider uppercase">Listen</span>
            </button>
            {error && <p className="text-red-400 mt-4 text-center">{error}</p>}
          </div>

          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 w-full max-w-lg p-6 bg-gray-800/60 backdrop-blur-sm rounded-lg border border-gray-600 text-center mx-4">
              <p className="text-gray-300 mb-4 text-sm sm:text-base text-left">
                  When arguing, leave space after the other person speaks. <br/>This helps:
              </p>
              <ul className="text-left list-disc list-inside text-gray-400 space-y-1 text-sm sm:text-base">
                <li>The other person to feel heard.</li>
                <li>You to reflect instead of reacting emotionally.</li>
                <li>Arguments to become more constructive.</li>
              </ul>
          </div>
        </>
      );
    }

    return (
      <div className="flex flex-col items-center justify-center h-full">
        <CountdownPie
          silenceCounter={silenceCounter}
          silenceDuration={silenceDuration}
          countBackwards={countBackwards}
          isTimerFinished={isTimerFinished}
          isSilent={isSilent}
        />
        <button 
          onClick={handleStop} 
          className="mt-16 bg-red-600 hover:bg-red-500 text-white font-bold py-2 px-6 rounded-full shadow-lg transition-transform transform hover:scale-105 active:scale-100 flex items-center"
        >
            <StopIcon className="w-5 h-5 mr-2" />
            Stop
        </button>
      </div>
    );
  };

  return (
    <main className={`relative w-full h-screen text-white bg-gradient-to-b ${backgroundClass} flex items-center justify-center p-4 transition-colors duration-500`}>
      <div className="absolute top-4 right-4 z-10">
        <button 
            onClick={() => setShowSettings(!showSettings)}
            className="p-3 bg-gray-700/50 rounded-full hover:bg-gray-600/70 transition-colors"
            title="Settings"
        >
          <GearIcon className="w-6 h-6" />
        </button>
      </div>

      {showSettings && (
          <SettingsPanel 
            threshold={threshold}
            setThreshold={handleThresholdChange}
            silenceDuration={silenceDuration}
            setSilenceDuration={handleSilenceDurationChange}
            visualDelay={visualDelay}
            setVisualDelay={handleVisualDelayChange}
            countBackwards={countBackwards}
            setCountBackwards={handleCountBackwardsChange}
            audioDevices={audioDevices}
            selectedDeviceId={selectedDeviceId}
            setSelectedDeviceId={handleSelectedDeviceChange}
            currentVolume={volume}
            isListening={isListening}
          />
      )}
      
      {renderContent()}
    </main>
  );
}