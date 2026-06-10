import type { Metadata } from "next";
import Link from "next/link";
import { CalendarDays, MailPlus, PlusCircle } from "lucide-react";
import "@/app/globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: {
    default: "NEO Weekend Guide | Northeast Ohio Events",
    template: "%s | NEO Weekend Guide"
  },
  description: "Find things to do this weekend around North Ridgeville, Avon, Elyria, Westlake, Lakewood, Cleveland, and nearby Northeast Ohio cities.",
  openGraph: {
    title: "NEO Weekend Guide",
    description: "A local events directory for Northeast Ohio weekends.",
    type: "website"
  }
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="min-h-screen font-sans antialiased">
        <header className="sticky top-0 z-40 border-b border-ink/10 bg-paper/95 backdrop-blur">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
            <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight">
              <span className="grid h-9 w-9 place-items-center rounded bg-lake text-white">
                <CalendarDays size={19} />
              </span>
              <span>NEO Weekend Guide</span>
            </Link>
            <nav className="hidden items-center gap-5 text-sm font-medium text-ink/75 md:flex">
              <Link href="/events">Events</Link>
              <Link href="/cities/north-ridgeville">Cities</Link>
              <Link href="/categories/live-music">Categories</Link>
              <Link href="/admin">Admin</Link>
            </nav>
            <Link href="/submit-event" className="focus-ring inline-flex min-h-10 items-center gap-2 rounded bg-berry px-3 py-2 text-sm font-semibold text-white shadow-sm">
              <PlusCircle size={17} />
              <span>Submit</span>
            </Link>
          </div>
        </header>
        {children}
        <footer className="border-t border-ink/10 bg-white">
          <div className="mx-auto grid max-w-7xl gap-6 px-4 py-8 text-sm text-ink/70 sm:px-6 md:grid-cols-[1fr_auto_auto] lg:px-8">
            <p>
              <strong className="text-ink">NEO Weekend Guide</strong> is a manually curated MVP for local Northeast Ohio events.
            </p>
            <Link href="/submit-event" className="inline-flex items-center gap-2 font-semibold text-lake">
              <PlusCircle size={16} /> Submit an Event
            </Link>
            <a href="mailto:hello@example.com" className="inline-flex items-center gap-2 font-semibold text-lake">
              <MailPlus size={16} /> Newsletter partnerships
            </a>
          </div>
        </footer>
      </body>
    </html>
  );
}
