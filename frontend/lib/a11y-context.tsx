"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

interface A11yContextType {
  highContrast: boolean;
  textSize: "normal" | "lg" | "xl";
  ttsEnabled: boolean;
  toggleHighContrast: () => void;
  setTextSize: (size: "normal" | "lg" | "xl") => void;
  toggleTTS: () => void;
  speakText: (text: string) => void;
}

const A11yContext = createContext<A11yContextType>({
  highContrast: false,
  textSize: "normal",
  ttsEnabled: false,
  toggleHighContrast: () => {},
  setTextSize: () => {},
  toggleTTS: () => {},
  speakText: () => {},
});

export function A11yProvider({ children }: { children: React.ReactNode }) {
  const [highContrast, setHighContrast] = useState(false);
  const [textSize, setTextSizeState] = useState<"normal" | "lg" | "xl">("normal");
  const [ttsEnabled, setTtsEnabled] = useState(true);

  const toggleHighContrast = () => setHighContrast(!highContrast);
  const setTextSize = (size: "normal" | "lg" | "xl") => setTextSizeState(size);
  const toggleTTS = () => setTtsEnabled(!ttsEnabled);

  const speakText = (text: string) => {
    if (!ttsEnabled || typeof window === "undefined" || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.95;
    window.speechSynthesis.speak(utterance);
  };

  return (
    <A11yContext.Provider
      value={{
        highContrast,
        textSize,
        ttsEnabled,
        toggleHighContrast,
        setTextSize,
        toggleTTS,
        speakText,
      }}
    >
      <div
        className={`${highContrast ? "high-contrast" : ""} ${
          textSize === "lg" ? "text-scale-lg" : textSize === "xl" ? "text-scale-xl" : ""
        }`}
      >
        {children}
      </div>
    </A11yContext.Provider>
  );
}

export const useA11y = () => useContext(A11yContext);
