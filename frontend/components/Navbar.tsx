"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { useA11y } from "@/lib/a11y-context";
import { 
  ShieldCheck, 
  LayoutDashboard, 
  FolderLock, 
  MessageSquareText, 
  CreditCard, 
  Zap, 
  Users, 
  Settings, 
  LogOut,
  Sun,
  Volume2
} from "lucide-react";

export function Navbar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { toggleHighContrast, toggleTTS, ttsEnabled } = useA11y();

  const navItems = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/vault", label: "Vault + RAG", icon: FolderLock },
    { href: "/chat", label: "Smart Chat", icon: MessageSquareText },
    { href: "/subscriptions", label: "Subscriptions", icon: CreditCard },
    { href: "/agent-actions", label: "Agent Queue", icon: Zap },
    { href: "/family", label: "Family Shared", icon: Users },
    { href: "/settings", label: "Settings", icon: Settings },
  ];

  return (
    <header className="sticky top-0 z-50 bg-slate-900/90 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center space-x-2">
            <ShieldCheck className="w-8 h-8 text-sky-400" />
            <span className="text-xl font-bold text-white tracking-wide">
              ClarityHub <span className="text-sky-400">AI</span>
            </span>
          </Link>

          {user && (
            <nav className="hidden md:flex items-center space-x-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      active
                        ? "bg-sky-500/20 text-sky-300 border border-sky-500/30"
                        : "text-slate-300 hover:bg-slate-800 hover:text-white"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          )}

          <div className="flex items-center space-x-3">
            <button
              onClick={toggleTTS}
              title="Toggle Audio Reader (TTS)"
              className={`p-2 rounded-lg border transition-colors ${
                ttsEnabled ? "bg-sky-500/20 border-sky-500/40 text-sky-300" : "border-slate-700 text-slate-400"
              }`}
            >
              <Volume2 className="w-4 h-4" />
            </button>
            <button
              onClick={toggleHighContrast}
              title="Toggle High Contrast Mode"
              className="p-2 rounded-lg border border-slate-700 text-slate-300 hover:bg-slate-800"
            >
              <Sun className="w-4 h-4" />
            </button>

            {user ? (
              <div className="flex items-center space-x-3 pl-2 border-l border-slate-800">
                <span className="text-sm font-medium text-slate-300 hidden lg:inline">{user.name}</span>
                <button
                  onClick={logout}
                  className="p-2 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 border border-rose-500/30 transition-colors"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  href="/login"
                  className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white"
                >
                  Log In
                </Link>
                <Link
                  href="/signup"
                  className="px-4 py-2 text-sm font-medium bg-sky-500 text-white rounded-lg hover:bg-sky-400 transition-colors shadow-lg shadow-sky-500/25"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
