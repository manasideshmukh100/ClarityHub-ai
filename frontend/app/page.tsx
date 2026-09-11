import Link from "next/link";
import { ShieldCheck, FolderLock, Zap, Eye, Users, Volume2, ArrowRight } from "lucide-react";

export default function Home() {
  return (
    <div className="space-y-16 py-8">
      {/* Hero Section */}
      <section className="text-center space-y-6 max-w-4xl mx-auto">
        <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-sky-500/10 border border-sky-500/30 text-sky-400 text-xs font-semibold uppercase tracking-wider">
          <ShieldCheck className="w-4 h-4" />
          <span>Week 4 Capstone — ClarityHub AI</span>
        </div>
        <h1 className="text-4xl sm:text-6xl font-extrabold text-white tracking-tight leading-tight">
          Stop quiet financial bleed with your personal <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-blue-500">Life-Admin Copilot</span>.
        </h1>
        <p className="text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto">
          ClarityHub AI reads your dense bills, insurance policies, and warranties, scans subscriptions for dark patterns & silent price hikes, and drafts action items requiring your explicit approval.
        </p>
        <div className="flex flex-wrap justify-center gap-4 pt-4">
          <Link
            href="/signup"
            className="px-6 py-3.5 rounded-xl bg-sky-500 text-white font-semibold hover:bg-sky-400 transition-all shadow-lg shadow-sky-500/25 flex items-center space-x-2"
          >
            <span>Launch Your Life Vault</span>
            <ArrowRight className="w-5 h-5" />
          </Link>
          <Link
            href="/login"
            className="px-6 py-3.5 rounded-xl bg-slate-800 text-slate-200 font-semibold border border-slate-700 hover:bg-slate-700 transition-all"
          >
            Log In to Existing Vault
          </Link>
        </div>
      </section>

      {/* Feature Grid */}
      <section className="grid md:grid-cols-3 gap-6">
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
          <div className="p-3 w-fit rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20">
            <FolderLock className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-white">1. Vault + RAG Grounding</h3>
          <p className="text-sm text-slate-400 leading-relaxed">
            Upload bills, insurance contracts, and prescriptions. Q&A gives honest answers with expandable inline source citations — never hallucinating.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
          <div className="p-3 w-fit rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Eye className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-white">2. Dark Pattern Detector</h3>
          <p className="text-sm text-slate-400 leading-relaxed">
            Flags hidden cancellation traps, silent price hikes, and low-utilization recurring expenses before they renew.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
          <div className="p-3 w-fit rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <Zap className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-white">3. Human-in-the-Loop Agent</h3>
          <p className="text-sm text-slate-400 leading-relaxed">
            Drafts pre-filled cancellation letters, complaint emails, and reminder schedules. Nothing is ever sent without your one-click approval.
          </p>
        </div>
      </section>

      {/* Unique Capabilities Banner */}
      <section className="p-8 rounded-3xl bg-gradient-to-r from-slate-900 via-sky-950/40 to-slate-900 border border-sky-500/20 grid md:grid-cols-2 gap-8 items-center">
        <div className="space-y-4">
          <div className="flex items-center space-x-2 text-sky-400 text-sm font-semibold">
            <Users className="w-4 h-4" />
            <span>Family & Accessibility First</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-white">
            Built for shared caregiving and accessible life management.
          </h2>
          <p className="text-sm text-slate-400 leading-relaxed">
            Easily grant auditable shared vault access for elderly parents or family members. Built-in Text-to-Speech audio playback and voice commands ensure everyone can navigate their life admin with confidence.
          </p>
        </div>
        <div className="space-y-3 bg-slate-950/80 p-5 rounded-2xl border border-slate-800 text-sm text-slate-300">
          <div className="flex items-center space-x-3 text-sky-300">
            <Volume2 className="w-5 h-5" />
            <span className="font-semibold">Text-to-Speech & Voice Control</span>
          </div>
          <p className="text-xs text-slate-400">
            Listen to document summaries out loud or ask chat questions hands-free.
          </p>
          <div className="flex items-center space-x-3 text-emerald-400 pt-2 border-t border-slate-800">
            <ShieldCheck className="w-5 h-5" />
            <span className="font-semibold">Zero Server-Side Email Risks</span>
          </div>
          <p className="text-xs text-slate-400">
            Approving a draft action opens your local mail client with pre-filled text (mailto: link), giving you 100% control.
          </p>
        </div>
      </section>
    </div>
  );
}
