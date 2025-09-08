
import { useState, useEffect, useCallback, useRef } from 'react';

interface MicrophoneHook {
  start: (deviceId: string) => Promise<void>;
  stop: () => void;
  volume: number;
  error: string | null;
}

export const useMicrophone = (): MicrophoneHook => {
  const [volume, setVolume] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);

  const audioContextRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceNodeRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const intervalIdRef = useRef<number | null>(null);

  const stop = useCallback(() => {
    if (intervalIdRef.current) {
      clearInterval(intervalIdRef.current);
      intervalIdRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close();
    }
    setVolume(0);
    streamRef.current = null;
    audioContextRef.current = null;
  }, []);
  
  const start = useCallback(async (deviceId: string) => {
    stop(); 
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { deviceId: deviceId ? { exact: deviceId } : undefined },
      });
      streamRef.current = stream;
      const context = new AudioContext();
      audioContextRef.current = context;
      analyserRef.current = context.createAnalyser();
      analyserRef.current.fftSize = 256;
      sourceNodeRef.current = context.createMediaStreamSource(stream);
      sourceNodeRef.current.connect(analyserRef.current);
      
      const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);

      intervalIdRef.current = window.setInterval(() => {
        if (analyserRef.current) {
          analyserRef.current.getByteTimeDomainData(dataArray);
          let sumSquares = 0.0;
          for (const amplitude of dataArray) {
            const normalizedAmplitude = (amplitude / 128.0) - 1.0;
            sumSquares += normalizedAmplitude * normalizedAmplitude;
          }
          const rms = Math.sqrt(sumSquares / dataArray.length);
          // Scale it up to make it more sensitive to voice
          const scaledRms = Math.min(rms * 4, 1.0);
          setVolume(scaledRms);
        }
      }, 30); // update every 100ms

    } catch (err) {
      if (err instanceof Error) {
        setError(`Error accessing microphone: ${err.message}`);
      } else {
        setError('An unknown error occurred while accessing the microphone.');
      }
      stop();
    }
  }, [stop]);

  useEffect(() => {
    // Cleanup on unmount
    return () => {
      stop();
    };
  }, [stop]);

  return { start, stop, volume, error };
};
