import React, { useState, useRef, useCallback } from 'react';
// Fix: Removed LiveSession as it is not an exported member of the '@google/genai' module.
import { GoogleGenAI, LiveServerMessage, Modality, Blob } from '@google/genai';
import { MicrophoneIcon } from './Icons';

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable is not set.");
}
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Fix: Defined the LiveSession interface locally based on its usage, as it's not exported from the library.
interface LiveSession {
  sendRealtimeInput(input: { media: Blob }): void;
  close(): void;
}

type Status = 'inactive' | 'connecting' | 'active' | 'error' | 'stopped';

// Helper functions for audio encoding/decoding, must be defined outside component
function decode(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function decodeAudioData(data: Uint8Array, ctx: AudioContext, sampleRate: number, numChannels: number): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);
  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

function encode(bytes: Uint8Array): string {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function createBlob(data: Float32Array): Blob {
  const l = data.length;
  const int16 = new Int16Array(l);
  for (let i = 0; i < l; i++) {
    int16[i] = data[i] * 32768;
  }
  return {
    data: encode(new Uint8Array(int16.buffer)),
    mimeType: 'audio/pcm;rate=16000',
  };
}

export const LiveConversation: React.FC = () => {
  const [status, setStatus] = useState<Status>('inactive');
  const [transcript, setTranscript] = useState<{ user: string, model: string }[]>([]);
  const [currentTurn, setCurrentTurn] = useState({ user: '', model: '' });

  const sessionPromiseRef = useRef<Promise<LiveSession> | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const inputAudioContextRef = useRef<AudioContext | null>(null);
  const outputAudioContextRef = useRef<AudioContext | null>(null);
  const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);
  const mediaStreamSourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  
  const nextStartTimeRef = useRef(0);
  const audioSourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());

  const cleanup = useCallback(() => {
    scriptProcessorRef.current?.disconnect();
    scriptProcessorRef.current = null;
    mediaStreamSourceRef.current?.disconnect();
    mediaStreamSourceRef.current = null;
    inputAudioContextRef.current?.close();
    inputAudioContextRef.current = null;
    outputAudioContextRef.current?.close();
    outputAudioContextRef.current = null;
    streamRef.current?.getTracks().forEach(track => track.stop());
    streamRef.current = null;
    for (const source of audioSourcesRef.current.values()) {
        source.stop();
    }
    audioSourcesRef.current.clear();
    nextStartTimeRef.current = 0;
  }, []);

  const handleStop = useCallback(async () => {
    setStatus('stopped');
    if (sessionPromiseRef.current) {
      const session = await sessionPromiseRef.current;
      session.close();
      sessionPromiseRef.current = null;
    }
    cleanup();
  }, [cleanup]);

  const handleStart = async () => {
    setStatus('connecting');
    setCurrentTurn({ user: '', model: '' });
    setTranscript([]);

    try {
      streamRef.current = await navigator.mediaDevices.getUserMedia({ audio: true });

      const inputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      inputAudioContextRef.current = inputAudioContext;

      const outputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      outputAudioContextRef.current = outputAudioContext;

      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        callbacks: {
          onopen: () => {
            setStatus('active');
            const source = inputAudioContext.createMediaStreamSource(streamRef.current!);
            mediaStreamSourceRef.current = source;
            const scriptProcessor = inputAudioContext.createScriptProcessor(4096, 1, 1);
            scriptProcessorRef.current = scriptProcessor;

            scriptProcessor.onaudioprocess = (audioProcessingEvent) => {
              const inputData = audioProcessingEvent.inputBuffer.getChannelData(0);
              const pcmBlob = createBlob(inputData);
              sessionPromiseRef.current?.then((session) => {
                session.sendRealtimeInput({ media: pcmBlob });
              });
            };
            source.connect(scriptProcessor);
            scriptProcessor.connect(inputAudioContext.destination);
          },
          onmessage: async (message: LiveServerMessage) => {
            if (message.serverContent?.inputTranscription) {
                setCurrentTurn(prev => ({...prev, user: prev.user + message.serverContent!.inputTranscription!.text}));
            }
            if (message.serverContent?.outputTranscription) {
                setCurrentTurn(prev => ({...prev, model: prev.model + message.serverContent!.outputTranscription!.text}));
            }
            if (message.serverContent?.turnComplete) {
                setTranscript(prev => [...prev, currentTurn]);
                setCurrentTurn({ user: '', model: ''});
            }

            const audioData = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
            if (audioData) {
              const currentTime = outputAudioContext.currentTime;
              nextStartTimeRef.current = Math.max(nextStartTimeRef.current, currentTime);
              
              const audioBuffer = await decodeAudioData(decode(audioData), outputAudioContext, 24000, 1);
              const source = outputAudioContext.createBufferSource();
              source.buffer = audioBuffer;
              source.connect(outputAudioContext.destination);

              source.addEventListener('ended', () => {
                audioSourcesRef.current.delete(source);
              });

              source.start(nextStartTimeRef.current);
              nextStartTimeRef.current += audioBuffer.duration;
              audioSourcesRef.current.add(source);
            }
          },
          onerror: (e: ErrorEvent) => {
            console.error('Session error:', e);
            setStatus('error');
            handleStop();
          },
          onclose: () => {
             if (status !== 'stopped') {
                setStatus('inactive');
                cleanup();
             }
          },
        },
        config: {
          responseModalities: [Modality.AUDIO],
          inputAudioTranscription: {},
          outputAudioTranscription: {},
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } },
          },
        },
      });
      sessionPromiseRef.current = sessionPromise;

    } catch (error) {
      console.error('Failed to start session:', error);
      setStatus('error');
      cleanup();
    }
  };

  return (
    <div className="bg-surface rounded-lg shadow-lg h-full flex flex-col">
      <h2 className="text-3xl font-bold text-on-surface p-6">Live Conversation</h2>
      <div className="flex-grow p-6 flex flex-col items-center justify-center space-y-6">
        <button
          onClick={status === 'active' ? handleStop : handleStart}
          disabled={status === 'connecting'}
          className={`relative w-40 h-40 rounded-full flex items-center justify-center transition-all duration-300 ${status === 'active' ? 'bg-red-500 hover:bg-red-600' : 'bg-secondary hover:bg-emerald-500'} disabled:bg-gray-500`}
        >
          <MicrophoneIcon className="w-16 h-16 text-white" />
          {status === 'active' && <div className="absolute inset-0 rounded-full border-4 border-white animate-pulse"></div>}
        </button>
        <p className="text-on-surface-variant capitalize text-lg font-medium">{status}</p>
      </div>
      <div className="h-64 bg-slate-800 rounded-b-lg p-4 overflow-y-auto">
        <h3 className="text-xl font-semibold text-secondary mb-3">Transcript</h3>
        <div className="space-y-3">
            {transcript.map((turn, i) => (
                <div key={i}>
                    <p><strong className="text-on-surface-variant">You:</strong> {turn.user}</p>
                    <p><strong className="text-secondary">AI:</strong> {turn.model}</p>
                </div>
            ))}
            {(currentTurn.user || currentTurn.model) && (
                 <div>
                    <p className="text-gray-400"><strong className="text-on-surface-variant">You:</strong> {currentTurn.user}</p>
                    <p className="text-gray-400"><strong className="text-secondary">AI:</strong> {currentTurn.model}</p>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};
