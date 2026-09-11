"use client";

import React, { useState } from "react";
import { FileText, ChevronDown, ChevronUp } from "lucide-react";

interface Citation {
  doc_id: number;
  filename: str;
  snippet: str;
}

export function CitationChip({ citation }: { citation: Citation }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="inline-block mt-2 mr-2">
      <button
        onClick={() => setExpanded(!expanded)}
        className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-md text-xs font-mono bg-sky-950/80 text-sky-300 border border-sky-500/30 hover:bg-sky-900/80 transition-colors"
      >
        <FileText className="w-3.5 h-3.5" />
        <span>Source: {citation.filename}</span>
        {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
      </button>

      {expanded && (
        <div className="mt-1 p-3 rounded-lg bg-slate-900 border border-sky-500/20 text-xs text-slate-300 font-sans shadow-lg max-w-md">
          <p className="font-semibold text-sky-400 mb-1">Excerpt snippet:</p>
          <p className="italic bg-slate-950/60 p-2 rounded border border-slate-800">"{citation.snippet}"</p>
        </div>
      )}
    </div>
  );
}
