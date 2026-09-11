"use client";

import React, { useState, useEffect } from "react";
import { fetchApi } from "@/lib/api";
import { 
  Zap, 
  CheckCircle, 
  XCircle, 
  Mail, 
  Edit3, 
  Send, 
  Clock, 
  ShieldCheck,
  AlertTriangle
} from "lucide-react";

export default function AgentActionsPage() {
  const [actions, setActions] = useState<any[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editSubject, setEditSubject] = useState("");
  const [editBody, setEditBody] = useState("");

  const loadActions = async () => {
    try {
      const data = await fetchApi("/agent/actions");
      setActions(data);
    } catch (e) {
      console.error("Failed to load agent actions", e);
    }
  };

  useEffect(() => {
    loadActions();
  }, []);

  const handleApprove = async (action: any) => {
    try {
      await fetchApi(`/agent/actions/${action.id}/approve`, { method: "POST" });
      
      // If action is email_draft, trigger mailto pre-fill handoff
      if (action.action_type === "email_draft" && action.payload_json) {
        const to = action.payload_json.to || "";
        const subject = encodeURIComponent(editSubject || action.payload_json.subject || "Notice");
        const body = encodeURIComponent(editBody || action.payload_json.body || "");
        const mailtoUrl = `mailto:${to}?subject=${subject}&body=${body}`;
        
        window.open(mailtoUrl, "_blank");
      }

      await loadActions();
    } catch (err: any) {
      alert(err.message || "Failed to approve action");
    }
  };

  const handleReject = async (id: number) => {
    try {
      await fetchApi(`/agent/actions/${id}/reject`, { method: "POST" });
      await loadActions();
    } catch (err: any) {
      alert(err.message || "Failed to reject action");
    }
  };

  const startEditing = (action: any) => {
    setEditingId(action.id);
    setEditSubject(action.payload_json?.subject || "");
    setEditBody(action.payload_json?.body || "");
  };

  const pendingList = actions.filter((a) => a.status === "pending_approval");
  const resolvedList = actions.filter((a) => a.status !== "pending_approval");

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl bg-slate-900 border border-slate-800">
        <div>
          <h1 className="text-2xl font-extrabold text-white flex items-center space-x-2">
            <Zap className="w-7 h-7 text-sky-400" />
            <span>Automation Agent — Approval Queue & Audit Log</span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Human-in-the-Loop Safety Guardrail: Every drafted action requires explicit manual one-click approval.
          </p>
        </div>

        <div className="flex items-center space-x-2 bg-emerald-500/10 px-4 py-2 rounded-xl border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
          <ShieldCheck className="w-4 h-4" />
          <span>100% Safe: No Outbound Auto-Sending</span>
        </div>
      </div>

      {/* Pending Approval Section */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-white flex items-center space-x-2">
          <Clock className="w-5 h-5 text-sky-400" />
          <span>Awaiting Approval ({pendingList.length})</span>
        </h2>

        {pendingList.length === 0 ? (
          <div className="p-8 rounded-2xl bg-slate-900 border border-slate-800 text-center space-y-2">
            <CheckCircle className="w-10 h-10 text-emerald-400 mx-auto" />
            <h3 className="text-base font-bold text-white">No pending actions</h3>
            <p className="text-sm text-slate-400">Run 'Scan My Life' from the dashboard to analyze your vault for issues.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {pendingList.map((act) => {
              const isEditing = editingId === act.id;
              const payload = act.payload_json || {};

              return (
                <div key={act.id} className="p-6 rounded-2xl bg-slate-900 border border-sky-500/30 space-y-4 shadow-xl">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
                    <div className="flex items-center space-x-2">
                      <span className="px-3 py-1 rounded-md bg-sky-500/20 text-sky-300 text-xs font-mono font-semibold border border-sky-500/40 uppercase">
                        {act.action_type}
                      </span>
                      <span className="text-xs text-slate-400 font-mono">
                        Created {new Date(act.created_at).toLocaleString()}
                      </span>
                    </div>

                    <div className="flex items-center space-x-2">
                      {!isEditing && act.action_type === "email_draft" && (
                        <button
                          onClick={() => startEditing(act)}
                          className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 text-xs hover:bg-slate-700 flex items-center space-x-1"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span>Edit Draft</span>
                        </button>
                      )}
                      <button
                        onClick={() => handleReject(act.id)}
                        className="px-3 py-1.5 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 border border-rose-500/30 text-xs font-semibold flex items-center space-x-1"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        <span>Reject</span>
                      </button>
                      <button
                        onClick={() => handleApprove(act)}
                        className="px-4 py-1.5 rounded-lg bg-emerald-500 text-white hover:bg-emerald-400 text-xs font-bold shadow-lg shadow-emerald-500/25 flex items-center space-x-1.5"
                      >
                        <CheckCircle className="w-4 h-4" />
                        <span>Approve & Launch Draft</span>
                      </button>
                    </div>
                  </div>

                  {/* Agent Reasoning */}
                  <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-300 space-y-1">
                    <span className="font-semibold text-amber-400">Agent Reasoning & Evidence:</span>
                    <p>{act.reasoning}</p>
                  </div>

                  {/* Action Draft Box */}
                  {act.action_type === "email_draft" && (
                    <div className="space-y-3 bg-slate-950 p-4 rounded-xl border border-slate-800">
                      <div className="flex items-center space-x-2 text-xs text-slate-400">
                        <Mail className="w-4 h-4 text-sky-400" />
                        <span>Recipient: <strong className="text-slate-200">{payload.to || "support@company.com"}</strong></span>
                      </div>

                      {isEditing ? (
                        <div className="space-y-2">
                          <input
                            type="text"
                            value={editSubject}
                            onChange={(e) => setEditSubject(e.target.value)}
                            className="w-full px-3 py-2 rounded bg-slate-900 border border-slate-700 text-white text-xs font-medium"
                          />
                          <textarea
                            rows={5}
                            value={editBody}
                            onChange={(e) => setEditBody(e.target.value)}
                            className="w-full px-3 py-2 rounded bg-slate-900 border border-slate-700 text-white text-xs font-mono"
                          />
                        </div>
                      ) : (
                        <div className="space-y-1.5">
                          <p className="text-xs font-bold text-white">Subject: {payload.subject}</p>
                          <pre className="text-xs text-slate-300 font-mono whitespace-pre-wrap bg-slate-900/60 p-3 rounded border border-slate-800/80">
                            {payload.body}
                          </pre>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Audit Log (Resolved Actions) */}
      <div className="space-y-4 pt-4 border-t border-slate-800">
        <h2 className="text-lg font-bold text-white">Audit Log & Resolution History ({resolvedList.length})</h2>

        <div className="space-y-2">
          {resolvedList.map((act) => (
            <div key={act.id} className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between text-xs text-slate-400">
              <div className="space-y-0.5">
                <span className="font-semibold text-slate-200">{act.reasoning}</span>
                <p>Resolved at {act.resolved_at ? new Date(act.resolved_at).toLocaleString() : "N/A"}</p>
              </div>

              <span
                className={`px-2.5 py-1 rounded-full font-bold uppercase ${
                  act.status === "approved"
                    ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                    : "bg-rose-500/10 text-rose-400 border border-rose-500/30"
                }`}
              >
                {act.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
