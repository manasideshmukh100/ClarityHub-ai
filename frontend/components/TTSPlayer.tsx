"use client";

import React, { useState } from "react";
import { Volume2, VolumeX } from "lucide-react";

export function TTSPlayer({ text }: { text: string }) {
  const [isSpeaking, setIsSpeaking] = useState(false);

  const handleSpeak = () => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      alert("Text-to-speech is not supported by your browser.");
      return;
    }

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.95;
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
    setIsSpeaking(true);
  };

  return (
    <button
      onClick={handleSpeak}
      className={`inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-xs font-medium border transition-colors ${
        isSpeaking
          ? "bg-amber-500/20 text-amber-300 border-amber-500/40 animate-pulse"
          : "bg-slate-800/80 text-slate-300 border-slate-700 hover:bg-slate-700"
      }`}
      title={isSpeaking ? "Stop playback" : "Listen to document summary"}
    >
      {isSpeaking ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5 text-sky-400" />}
      <span>{isSpeaking ? "Stop Audio" : "Listen (TTS)"}</span>
    </button>
  );
}
