import type { Metadata } from "next";
import "./globals.css";
import Link from "next/link";

export const metadata: Metadata = {
  title: { default: "Ibeku League 2026", template: "%s · Ibeku League 2026" },
  description: "Official platform for Ibeku League 2026 — fixtures, standings & results",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <header className="border-b border-slate-800 bg-slate-950/90 sticky top-0 z-20">
          <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-3">
            <Link href="/" className="text-lg font-bold tracking-tight text-emerald-400">
              Ibeku League 2026
            </Link>
            <nav className="flex flex-wrap gap-3 text-sm">
              <Link href="/" className="text-slate-300 hover:text-white">Home</Link>
              <Link href="/fixtures" className="text-slate-300 hover:text-white">Fixtures</Link>
              <Link href="/standings" className="text-slate-300 hover:text-white">Standings</Link>
              <Link href="/knockout" className="text-slate-300 hover:text-white">Knockout</Link>
              <Link href="/admin" className="text-emerald-400 hover:text-emerald-300">Admin</Link>
            </nav>
          </div>
        </header>
        <main className="mx-auto max-w-5xl px-4 py-6">{children}</main>
        <footer className="border-t border-slate-800 py-6 text-center text-xs text-slate-500">
          Sponsored by High Chief Dickson Oguguo Nzenwa · Aku Bara-Oha 1 Of Ibeku Ancient Kingdom
        </footer>
      </body>
    </html>
  );
}
