"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { fetchApi } from "@/lib/api";
import { TTSPlayer } from "@/components/TTSPlayer";
import { 
  Zap, 
  DollarSign, 
  AlertTriangle, 
  Clock, 
  Sparkles, 
  ArrowUpRight,
  ShieldAlert,
  FileCheck,
  CheckCircle
} from "lucide-react";

export default function DashboardPage() {
  const { user } = useAuth();
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [reminders, setReminders] = useState<any[]>([]);
  const [actions, setActions] = useState<any[]>([]);
  const [digest, setDigest] = useState<string>("");
  const [loadingScan, setLoadingScan] = useState(false);
  const [loadingDigest, setLoadingDigest] = useState(false);

  const loadData = async () => {
    try {
      const [subsData, remsData, actsData, digestData] = await Promise.all([
        fetchApi("/subscriptions").catch(() => []),
        fetchApi("/reminders").catch(() => []),
        fetchApi("/agent/actions").catch(() => []),
        fetchApi("/digest/latest").catch(() => ({ digest: "" })),
      ]);
      setSubscriptions(subsData);
      setReminders(remsData);
      setActions(actsData);
      setDigest(digestData.digest || "");
    } catch (e) {
      console.error("Dashboard data load error", e);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const triggerScan = async () => {
    setLoadingScan(true);
    try {
      await fetchApi("/agent/scan", { method: "POST" });
      await loadData();
    } catch (e: any) {
      alert(e.message || "Failed to run life scan");
    } finally {
      setLoadingScan(false);
    }
  };

  const generateDigest = async () => {
    setLoadingDigest(true);
    try {
      const res = await fetchApi("/digest/generate", { method: "POST" });
      setDigest(res.digest);
    } catch (e: any) {
      alert(e.message || "Failed to generate digest");
    } finally {
      setLoadingDigest(false);
    }
  };

  const totalMonthly = subscriptions.reduce((acc, s) => acc + (s.monthly_cost || 0), 0);
  const darkPatterns = subscriptions.filter((s) => s.cancel_difficulty_score >= 4);
  const pendingActions = actions.filter((a) => a.status === "pending_approval");

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-sky-950/50 to-slate-900 border border-slate-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            Welcome back, {user?.name || "Life Admin User"} 👋
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            ClarityHub AI is monitoring your documents, subscriptions, and renewal schedules.
          </p>
        </div>
        <button
          onClick={triggerScan}
          disabled={loadingScan}
          className="px-5 py-3 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 text-white font-semibold hover:from-sky-400 hover:to-blue-500 transition-all shadow-lg shadow-sky-500/25 flex items-center justify-center space-x-2 shrink-0 disabled:opacity-50"
        >
          <Zap className="w-5 h-5" />
          <span>{loadingScan ? "Scanning Life Admin..." : "Run 'Scan My Life'"}</span>
        </button>
      </div>

      {/* Quick Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>Monthly Recurring Spend</span>
            <DollarSign className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-2xl font-extrabold text-white">${totalMonthly.toFixed(2)}</p>
          <p className="text-xs text-slate-500">${(totalMonthly * 12).toFixed(2)}/yr total</p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>Flagged Dark Patterns</span>
            <ShieldAlert className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-2xl font-extrabold text-white">{darkPatterns.length}</p>
          <p className="text-xs text-amber-400/80 font-medium">High cancellation friction</p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>Pending Agent Actions</span>
            <Zap className="w-4 h-4 text-sky-400" />
          </div>
          <p className="text-2xl font-extrabold text-white">{pendingActions.length}</p>
          <p className="text-xs text-sky-400/80 font-medium">Awaiting human approval</p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>Active Reminders</span>
            <Clock className="w-4 h-4 text-indigo-400" />
          </div>
          <p className="text-2xl font-extrabold text-white">{reminders.length}</p>
          <p className="text-xs text-slate-500">Upcoming tasks & refills</p>
        </div>
      </div>

      {/* Main Content Split: Life Digest + Action Queue */}
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Weekly Life Digest Card (2 cols) */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-5 h-5 text-amber-400" />
              <h2 className="text-lg font-bold text-white">Weekly "Life Digest"</h2>
            </div>
            <div className="flex items-center space-x-2">
              {digest && <TTSPlayer text={digest} />}
              <button
                onClick={generateDigest}
                disabled={loadingDigest}
                className="px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-xs font-medium text-slate-300 hover:bg-slate-700"
              >
                {loadingDigest ? "Generating..." : "Refresh Digest"}
              </button>
            </div>
          </div>

          <div className="prose prose-invert max-w-none text-sm text-slate-300 space-y-2 whitespace-pre-line leading-relaxed">
            {digest || "Click 'Refresh Digest' or run 'Scan My Life' to generate your weekly AI summary."}
          </div>
        </div>

        {/* Action Needed Sidebar (1 col) */}
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <h2 className="text-lg font-bold text-white flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5 text-sky-400" />
              <span>Awaiting Approval ({pendingActions.length})</span>
            </h2>
            <Link href="/agent-actions" className="text-xs text-sky-400 hover:underline flex items-center space-x-1">
              <span>View All</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {pendingActions.length === 0 ? (
            <div className="text-center py-8 space-y-2">
              <CheckCircle className="w-8 h-8 text-emerald-400 mx-auto" />
              <p className="text-sm font-medium text-slate-300">All clear!</p>
              <p className="text-xs text-slate-500">No pending agent drafts requiring approval.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {pendingActions.slice(0, 3).map((act) => (
                <div key={act.id} className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-sky-400 uppercase tracking-wider">{act.action_type}</span>
                    <span className="text-slate-500">Pending</span>
                  </div>
                  <p className="text-xs text-slate-300 font-medium line-clamp-2">{act.reasoning}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
