"use client";

import React, { useState, useEffect } from "react";
import { fetchApi } from "@/lib/api";
import { Users, UserPlus, FolderLock, Shield, Eye, AlertCircle } from "lucide-react";

export default function FamilyPage() {
  const [vaults, setVaults] = useState<any[]>([]);
  const [email, setEmail] = useState("");
  const [permission, setPermission] = useState("read");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [selectedVaultDocs, setSelectedVaultDocs] = useState<any[] | null>(null);
  const [activeOwnerName, setActiveOwnerName] = useState("");

  const loadVaults = async () => {
    try {
      const data = await fetchApi("/family/vaults");
      setVaults(data);
    } catch (e) {
      console.error("Failed to load accessible family vaults", e);
    }
  };

  useEffect(() => {
    loadVaults();
  }, []);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    setError("");
    try {
      const res = await fetchApi("/family/invite", {
        method: "POST",
        body: JSON.stringify({ email, permission_level: permission }),
      });
      setMessage(res.message);
      setEmail("");
    } catch (err: any) {
      setError(err.message || "Failed to invite family member");
    }
  };

  const viewVaultDocuments = async (ownerId: number, ownerName: string) => {
    try {
      const docs = await fetchApi(`/family/vaults/${ownerId}/documents`);
      setSelectedVaultDocs(docs);
      setActiveOwnerName(ownerName);
    } catch (err: any) {
      alert(err.message || "Access denied to shared vault");
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
        <h1 className="text-2xl font-extrabold text-white flex items-center space-x-2">
          <Users className="w-7 h-7 text-sky-400" />
          <span>Family & Shared Vault Mode</span>
        </h1>
        <p className="text-sm text-slate-400">
          Caregiving & Shared Life Admin: Grant explicit, auditable vault permissions for elderly parents or family members.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Invite Form Card */}
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <h2 className="text-lg font-bold text-white flex items-center space-x-2">
            <UserPlus className="w-5 h-5 text-sky-400" />
            <span>Share My Vault Access</span>
          </h2>

          {message && (
            <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs">
              {message}
            </div>
          )}
          {error && (
            <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center space-x-1">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleInvite} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-300 mb-1">
                Family Member Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="parent@example.com"
                className="w-full px-4 py-2.5 rounded-lg bg-slate-950 border border-slate-800 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-sky-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-slate-300 mb-1">
                Permission Level
              </label>
              <select
                value={permission}
                onChange={(e) => setPermission(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-sky-500"
              >
                <option value="read">Read Only (View summaries & ask Q&A)</option>
                <option value="manage">Manage Access (Upload & edit subscriptions)</option>
              </select>
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-sky-500 text-white font-semibold hover:bg-sky-400 transition-colors text-sm shadow-lg shadow-sky-500/25"
            >
              Grant Shared Access
            </button>
          </form>
        </div>

        {/* Accessible Vaults List */}
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <h2 className="text-lg font-bold text-white flex items-center space-x-2">
            <FolderLock className="w-5 h-5 text-sky-400" />
            <span>Shared Vaults Accessible To You ({vaults.length})</span>
          </h2>

          {vaults.length === 0 ? (
            <p className="text-sm text-slate-500 py-6 text-center">
              No family members have granted you access to their vaults yet.
            </p>
          ) : (
            <div className="space-y-3">
              {vaults.map((v) => (
                <div key={v.id} className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                  <div className="space-y-0.5">
                    <h3 className="text-sm font-bold text-white">{v.owner_name}'s Vault</h3>
                    <p className="text-xs text-slate-400">{v.owner_email}</p>
                    <span className="inline-block px-2 py-0.5 rounded bg-sky-500/10 text-sky-300 text-[10px] uppercase font-mono">
                      {v.permission_level} Level
                    </span>
                  </div>

                  <button
                    onClick={() => viewVaultDocuments(v.owner_user_id, v.owner_name)}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 text-sky-300 text-xs font-semibold hover:bg-slate-700 flex items-center space-x-1"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Open Vault</span>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Shared Vault Document Inspection Modal */}
      {selectedVaultDocs && (
        <div className="p-6 rounded-2xl bg-slate-900 border border-sky-500/30 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-lg font-bold text-white">Viewing Shared Documents: {activeOwnerName}'s Vault</h3>
            <button
              onClick={() => setSelectedVaultDocs(null)}
              className="text-xs text-slate-400 hover:text-white"
            >
              Close
            </button>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {selectedVaultDocs.map((d) => (
              <div key={d.id} className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                <span className="text-xs font-mono uppercase text-sky-400">{d.doc_type}</span>
                <h4 className="text-sm font-bold text-white">{d.filename}</h4>
                <p className="text-xs text-slate-400">{d.summary || "No summary text."}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
