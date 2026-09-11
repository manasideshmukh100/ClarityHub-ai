import "./globals.css";
import { AuthProvider } from "@/lib/auth-context";
import { A11yProvider } from "@/lib/a11y-context";
import { Navbar } from "@/components/Navbar";

export const metadata = {
  title: "ClarityHub AI — Personal Life-Admin Copilot",
  description: "Stop quiet money bleed. Manage bills, subscriptions, warranties, and insurance safely with AI & Human-in-the-loop automation.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-slate-950 text-slate-100 min-h-screen flex flex-col">
        <AuthProvider>
          <A11yProvider>
            <Navbar />
            <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
              {children}
            </main>
            <footer className="border-t border-slate-800 py-6 text-center text-xs text-slate-500">
              ClarityHub AI Capstone Project — Built with Next.js, FastAPI, RAG, & Human-in-the-loop Agent Safety.
            </footer>
          </A11yProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
