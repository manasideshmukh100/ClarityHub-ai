"use client";

import React, { useState, useEffect } from "react";
import { fetchApi } from "@/lib/api";
import { 
  CreditCard, 
  Plus, 
  Trash2, 
  AlertTriangle, 
  ShieldAlert, 
  CheckCircle,
  TrendingUp
} from "lucide-react";

export default function SubscriptionsPage() {
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [showAdd, setShowAdd] = useState(false);

  const [name, setName] = useState("");
  const [monthlyCost, setMonthlyCost] = useState("");
  const [lastPrice, setLastPrice] = useState("");
  const [renewalDate, setRenewalDate] = useState("");
  const [difficulty, setDifficulty] = useState("2");

  const loadSubscriptions = async () => {
    try {
      const data = await fetchApi("/subscriptions");
      setSubscriptions(data);
    } catch (e) {
      console.error("Failed to load subscriptions", e);
    }
  };

  useEffect(() => {
    loadSubscriptions();
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetchApi("/subscriptions", {
        method: "POST",
        body: JSON.stringify({
          name,
          monthly_cost: parseFloat(monthlyCost),
          last_price: lastPrice ? parseFloat(lastPrice) : parseFloat(monthlyCost),
          renewal_date: renewalDate,
          cancel_difficulty_score: parseInt(difficulty),
        }),
      });
      setShowAdd(false);
      setName("");
      setMonthlyCost("");
      setLastPrice("");
      setRenewalDate("");
      await loadSubscriptions();
    } catch (err: any) {
      alert(err.message || "Failed to add subscription");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this subscription?")) return;
    try {
      await fetchApi(`/subscriptions/${id}`, { method: "DELETE" });
      setSubscriptions(subscriptions.filter((s) => s.id !== id));
    } catch (e: any) {
      alert(e.message || "Failed to delete subscription");
    }
  };

  const totalMonthly = subscriptions.reduce((acc, s) => acc + (s.monthly_cost || 0), 0);

  return (
    <div className="space-y-8">
      {/* Header & Add Button */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl bg-slate-900 border border-slate-800">
        <div>
          <h1 className="text-2xl font-extrabold text-white flex items-center space-x-2">
            <CreditCard className="w-7 h-7 text-sky-400" />
            <span>Recurring Subscriptions & Dark Pattern Tracker</span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Total Monthly Spend: <span className="text-emerald-400 font-bold">${totalMonthly.toFixed(2)}</span> (${(totalMonthly * 12).toFixed(2)}/yr)
          </p>
        </div>

        <button
          onClick={() => setShowAdd(true)}
          className="px-5 py-2.5 rounded-xl bg-sky-500 text-white text-sm font-semibold hover:bg-sky-400 transition-all shadow-lg shadow-sky-500/25 flex items-center space-x-2 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add Subscription</span>
        </button>
      </div>

      {/* Subscriptions Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-950 text-xs uppercase font-semibold text-slate-400 border-b border-slate-800">
              <tr>
                <th className="p-4">Service Name</th>
                <th className="p-4">Monthly Cost</th>
                <th className="p-4">Price Trend</th>
                <th className="p-4">Renewal Date</th>
                <th className="p-4">Exit Difficulty</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {subscriptions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500">
                    No active subscriptions tracked yet. Add one above or run 'Scan My Life'.
                  </td>
                </tr>
              ) : (
                subscriptions.map((sub) => {
                  const priceIncreased = sub.last_price && sub.monthly_cost > sub.last_price;
                  const isDarkPattern = sub.cancel_difficulty_score >= 4;

                  return (
                    <tr key={sub.id} className="hover:bg-slate-850/50 transition-colors">
                      <td className="p-4 font-semibold text-white flex items-center space-x-2">
                        <span>{sub.name}</span>
                        {isDarkPattern && (
                          <span title="High cancellation friction / dark pattern detected" className="p-1 rounded bg-amber-500/10 text-amber-400">
                            <ShieldAlert className="w-4 h-4" />
                          </span>
                        )}
                      </td>

                      <td className="p-4 font-mono text-emerald-400 font-bold">
                        ${sub.monthly_cost.toFixed(2)}/mo
                      </td>

                      <td className="p-4">
                        {priceIncreased ? (
                          <div className="inline-flex items-center space-x-1 text-xs text-rose-400 font-semibold bg-rose-500/10 px-2.5 py-1 rounded-md border border-rose-500/20">
                            <TrendingUp className="w-3.5 h-3.5" />
                            <span>Increased from ${sub.last_price.toFixed(2)}</span>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-500">Stable</span>
                        )}
                      </td>

                      <td className="p-4 text-slate-300 font-mono text-xs">
                        {sub.renewal_date || "N/A"}
                      </td>

                      <td className="p-4">
                        <span
                          className={`px-2.5 py-1 rounded-full text-xs font-bold border ${
                            sub.cancel_difficulty_score >= 4
                              ? "bg-rose-500/10 text-rose-400 border-rose-500/30"
                              : sub.cancel_difficulty_score >= 3
                              ? "bg-amber-500/10 text-amber-400 border-amber-500/30"
                              : "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                          }`}
                        >
                          Level {sub.cancel_difficulty_score}/5 Difficulty
                        </span>
                      </td>

                      <td className="p-4 text-right">
                        <button
                          onClick={() => handleDelete(sub.id)}
                          className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 border border-rose-500/30"
                          title="Delete subscription"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Subscription Modal */}
      {showAdd && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-6 shadow-2xl">
            <h3 className="text-xl font-bold text-white">Track New Subscription</h3>

            <form onSubmit={handleAdd} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-300 mb-1">
                  Service Name
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. StreamMax Premium"
                  className="w-full px-4 py-2.5 rounded-lg bg-slate-950 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-300 mb-1">
                    Current Monthly Cost ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={monthlyCost}
                    onChange={(e) => setMonthlyCost(e.target.value)}
                    placeholder="18.99"
                    className="w-full px-4 py-2.5 rounded-lg bg-slate-950 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-300 mb-1">
                    Previous Price ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={lastPrice}
                    onChange={(e) => setLastPrice(e.target.value)}
                    placeholder="14.99"
                    className="w-full px-4 py-2.5 rounded-lg bg-slate-950 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-300 mb-1">
                  Renewal Date
                </label>
                <input
                  type="date"
                  value={renewalDate}
                  onChange={(e) => setRenewalDate(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-sky-500 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-300 mb-1">
                  Cancellation Difficulty (1-5)
                </label>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-sky-500 text-sm"
                >
                  <option value="1">1 - One click online cancel</option>
                  <option value="2">2 - Standard settings menu</option>
                  <option value="3">3 - Requires chat with agent</option>
                  <option value="4">4 - Phone call / hidden link (Dark Pattern)</option>
                  <option value="5">5 - Extreme friction / written letter (Dark Pattern)</option>
                </select>
              </div>

              <div className="flex justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAdd(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-sky-500 text-white font-semibold hover:bg-sky-400 text-sm"
                >
                  Save Subscription
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
