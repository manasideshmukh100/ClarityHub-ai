"use client";

import React, { useState, useEffect } from "react";
import { fetchApi } from "@/lib/api";
import { TTSPlayer } from "@/components/TTSPlayer";
import { 
  FolderLock, 
  UploadCloud, 
  FileText, 
  Trash2, 
  Sparkles, 
  Calendar, 
  Eye, 
  X,
  FileCheck
} from "lucide-react";

export default function VaultPage() {
  const [documents, setDocuments] = useState<any[]>([]);
  const [uploading, setUploading] = useState(false);
  const [docType, setDocType] = useState("bill");
  const [selectedDoc, setSelectedDoc] = useState<any | null>(null);

  const loadDocuments = async () => {
    try {
      const data = await fetchApi("/documents");
      setDocuments(data);
    } catch (e) {
      console.error("Failed to load documents", e);
    }
  };

  useEffect(() => {
    loadDocuments();
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("doc_type", docType);

    try {
      await fetchApi("/documents/upload", {
        method: "POST",
        body: formData,
      });
      await loadDocuments();
    } catch (err: any) {
      alert(err.message || "File upload failed");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this document from your vault?")) return;
    try {
      await fetchApi(`/documents/${id}`, { method: "DELETE" });
      setDocuments(documents.filter((d) => d.id !== id));
      if (selectedDoc?.id === id) setSelectedDoc(null);
    } catch (e: any) {
      alert(e.message || "Failed to delete document");
    }
  };

  return (
    <div className="space-y-8">
      {/* Header & Upload Box */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl bg-slate-900 border border-slate-800">
        <div>
          <h1 className="text-2xl font-extrabold text-white flex items-center space-x-2">
            <FolderLock className="w-7 h-7 text-sky-400" />
            <span>Document Vault & RAG Index</span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Upload bills, warranties, insurance contracts, and prescriptions. All files are indexed for grounded Q&A.
          </p>
        </div>

        {/* Upload form controls */}
        <div className="flex flex-wrap items-center gap-3">
          <select
            value={docType}
            onChange={(e) => setDocType(e.target.value)}
            className="px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-200 focus:outline-none focus:border-sky-500"
          >
            <option value="bill">Bill / Invoice</option>
            <option value="insurance">Insurance Policy</option>
            <option value="warranty">Warranty Document</option>
            <option value="prescription">Prescription / Rx</option>
            <option value="rental">Rental Agreement</option>
            <option value="other">Other Document</option>
          </select>

          <label className="px-5 py-2.5 rounded-xl bg-sky-500 text-white text-sm font-semibold hover:bg-sky-400 transition-all shadow-lg shadow-sky-500/25 cursor-pointer flex items-center space-x-2">
            <UploadCloud className="w-4 h-4" />
            <span>{uploading ? "Extracting & Chunking..." : "Upload Document"}</span>
            <input
              type="file"
              onChange={handleFileUpload}
              disabled={uploading}
              accept=".pdf,.txt,.md,.csv"
              className="hidden"
            />
          </label>
        </div>
      </div>

      {/* Documents Grid */}
      {documents.length === 0 ? (
        <div className="text-center py-16 bg-slate-900/50 rounded-2xl border border-slate-800 space-y-3">
          <FileText className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="text-lg font-bold text-slate-300">Your vault is empty</h3>
          <p className="text-sm text-slate-500 max-w-sm mx-auto">
            Upload your first bill or policy above to begin grounded RAG chat and automated dark-pattern detection.
          </p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {documents.map((doc) => (
            <div key={doc.id} className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 flex flex-col justify-between hover:border-slate-700 transition-all">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-1 rounded-md bg-sky-500/10 text-sky-400 text-xs font-semibold uppercase tracking-wider border border-sky-500/20">
                    {doc.doc_type}
                  </span>
                  <button
                    onClick={() => handleDelete(doc.id)}
                    className="text-slate-500 hover:text-rose-400 transition-colors p-1"
                    title="Delete document"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <h3 className="text-base font-bold text-white truncate" title={doc.filename}>
                  {doc.filename}
                </h3>

                <p className="text-xs text-slate-400 line-clamp-3 bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
                  {doc.summary || doc.extracted_text || "No preview text available."}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-500">
                <div className="flex items-center space-x-1">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{new Date(doc.uploaded_at).toLocaleDateString()}</span>
                </div>

                <div className="flex items-center space-x-2">
                  <TTSPlayer text={doc.summary || doc.extracted_text} />
                  <button
                    onClick={() => setSelectedDoc(doc)}
                    className="p-1.5 rounded-md bg-slate-800 text-sky-300 hover:bg-slate-700"
                    title="View full extracted details"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Detail Modal */}
      {selectedDoc && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl">
            <div className="p-5 border-b border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-white">{selectedDoc.filename}</h3>
                <p className="text-xs text-sky-400 uppercase tracking-wider">{selectedDoc.doc_type}</p>
              </div>
              <button
                onClick={() => setSelectedDoc(null)}
                className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4 text-sm text-slate-300">
              <div>
                <h4 className="text-xs font-semibold text-slate-400 uppercase mb-1">AI Executive Summary</h4>
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-200">
                  {selectedDoc.summary}
                </div>
              </div>

              <div>
                <h4 className="text-xs font-semibold text-slate-400 uppercase mb-1">Full Extracted Text</h4>
                <pre className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 font-mono whitespace-pre-wrap max-h-60 overflow-y-auto">
                  {selectedDoc.extracted_text}
                </pre>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
