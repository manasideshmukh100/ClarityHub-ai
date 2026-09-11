"use client";

import React, { useState } from "react";
import { useA11y } from "@/lib/a11y-context";
import { Settings, Volume2, Sun, Type, Cpu, CheckCircle } from "lucide-react";

export default function SettingsPage() {
  const { highContrast, toggleHighContrast, textSize, setTextSize, ttsEnabled, toggleTTS } = useA11y();
  const [provider, setProvider] = useState("gemini");
  const [saved, setSaved] = useState(false);

  const handleSaveLLM = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {/* Header */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
        <h1 className="text-2xl font-extrabold text-white flex items-center space-x-2">
          <Settings className="w-7 h-7 text-sky-400" />
          <span>App Settings & Accessibility Controls</span>
        </h1>
        <p className="text-sm text-slate-400">
          Customize LLM adapters, audio playback preferences, and visual contrast modes.
        </p>
      </div>

      {/* Accessibility Preferences */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-6">
        <h2 className="text-lg font-bold text-white flex items-center space-x-2">
          <Sun className="w-5 h-5 text-amber-400" />
          <span>Accessibility Preferences (WCAG AA)</span>
        </h2>

        <div className="space-y-4 divide-y divide-slate-800">
          <div className="pt-3 flex items-center justify-between">
            <div className="space-y-0.5">
              <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                <Volume2 className="w-4 h-4 text-sky-400" />
                <span>Text-to-Speech (TTS) Audio Reader</span>
              </h3>
              <p className="text-xs text-slate-400">
                Enables hands-free audio playback of document summaries and Q&A answers.
              </p>
            </div>
            <button
              onClick={toggleTTS}
              className={`px-4 py-2 rounded-xl text-xs font-bold border transition-colors ${
                ttsEnabled
                  ? "bg-sky-500/20 text-sky-300 border-sky-500/40"
                  : "bg-slate-800 text-slate-400 border-slate-700"
              }`}
            >
              {ttsEnabled ? "TTS Enabled" : "TTS Disabled"}
            </button>
          </div>

          <div className="pt-4 flex items-center justify-between">
            <div className="space-y-0.5">
              <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                <Sun className="w-4 h-4 text-amber-400" />
                <span>High Contrast Mode</span>
              </h3>
              <p className="text-xs text-slate-400">
                Increases background & font contrast for enhanced legibility.
              </p>
            </div>
            <button
              onClick={toggleHighContrast}
              className={`px-4 py-2 rounded-xl text-xs font-bold border transition-colors ${
                highContrast
                  ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
                  : "bg-slate-800 text-slate-400 border-slate-700"
              }`}
            >
              {highContrast ? "Active (High Contrast)" : "Standard Contrast"}
            </button>
          </div>

          <div className="pt-4 flex items-center justify-between">
            <div className="space-y-0.5">
              <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                <Type className="w-4 h-4 text-emerald-400" />
                <span>Font Scaling</span>
              </h3>
              <p className="text-xs text-slate-400">Adjust overall UI text sizing.</p>
            </div>
            <div className="flex space-x-2">
              {(["normal", "lg", "xl"] as const).map((size) => (
                <button
                  key={size}
                  onClick={() => setTextSize(size)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold uppercase border ${
                    textSize === size
                      ? "bg-sky-500 text-white border-sky-400"
                      : "bg-slate-800 text-slate-400 border-slate-700"
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Provider-Agnostic LLM Configuration */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
        <h2 className="text-lg font-bold text-white flex items-center space-x-2">
          <Cpu className="w-5 h-5 text-sky-400" />
          <span>LLM Provider Adapter Selection</span>
        </h2>

        {saved && (
          <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center space-x-2">
            <CheckCircle className="w-4 h-4" />
            <span>LLM Provider setting updated successfully!</span>
          </div>
        )}

        <form onSubmit={handleSaveLLM} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase text-slate-300 mb-1">
              Select Active Intelligence Engine
            </label>
            <select
              value={provider}
              onChange={(e) => setProvider(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-sky-500"
            >
              <option value="gemini">Google Gemini (Recommended Capstone Engine)</option>
              <option value="openai">OpenAI GPT-4o / GPT-4o-mini</option>
              <option value="anthropic">Anthropic Claude 3 Haiku / Sonnet</option>
              <option value="mock">Offline / Zero-Config Mock Engine</option>
            </select>
          </div>

          <button
            type="submit"
            className="px-5 py-2.5 rounded-xl bg-sky-500 text-white text-sm font-semibold hover:bg-sky-400 transition-colors shadow-lg shadow-sky-500/25"
          >
            Apply Engine Preference
          </button>
        </form>
      </div>
    </div>
  );
}
