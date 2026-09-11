"use client";

import React, { useState } from "react";
import { Mic, MicOff } from "lucide-react";

export function VoiceInput({ onTranscript }: { onTranscript: (text: string) => void }) {
  const [isListening, setIsListening] = useState(false);

  const toggleListening = () => {
    if (typeof window === "undefined") return;

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Voice input is not supported by your browser. Try Chrome or Edge.");
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => setIsListening(false);

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      if (transcript) {
        onTranscript(transcript);
      }
    };

    recognition.start();
  };

  return (
    <button
      type="button"
      onClick={toggleListening}
      className={`p-2.5 rounded-lg border transition-colors ${
        isListening
          ? "bg-rose-500/20 border-rose-500/50 text-rose-400 animate-bounce"
          : "bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700"
      }`}
      title={isListening ? "Listening... Speak now" : "Speak to input query"}
    >
      {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5 text-sky-400" />}
    </button>
  );
}
