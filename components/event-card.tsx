import Link from "next/link";
import { Calendar, ExternalLink, MapPin, Tag } from "lucide-react";
import { formatEventDate } from "@/lib/format";
import type { EventWithRelations } from "@/lib/types";

export function EventCard({ event, compact = false }: { event: EventWithRelations; compact?: boolean }) {
  return (
    <article className="rounded border border-ink/10 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-soft">
      <div className="flex flex-wrap gap-2 text-xs font-semibold uppercase tracking-wide text-ink/60">
        {event.is_featured && <span className="rounded bg-amber/15 px-2 py-1 text-amber">Featured</span>}
        {event.is_free && <span className="rounded bg-leaf/15 px-2 py-1 text-leaf">Free</span>}
        {event.is_family_friendly && <span className="rounded bg-lake/15 px-2 py-1 text-lake">Family</span>}
      </div>
      <h3 className="mt-3 text-lg font-semibold leading-snug text-ink">
        <Link href={`/events/${event.slug}`}>{event.title}</Link>
      </h3>
      <div className="mt-3 grid gap-2 text-sm text-ink/70">
        <p className="flex gap-2"><Calendar className="mt-0.5 shrink-0 text-lake" size={16} /> {formatEventDate(event)}</p>
        <p className="flex gap-2"><MapPin className="mt-0.5 shrink-0 text-berry" size={16} /> {event.city.name} · {event.venue_name}</p>
        <p className="flex gap-2"><Tag className="mt-0.5 shrink-0 text-leaf" size={16} /> {event.category.name} · {event.price_text}</p>
      </div>
      {!compact && <p className="mt-3 line-clamp-3 text-sm leading-6 text-ink/72">{event.description}</p>}
      <div className="mt-4 flex flex-wrap gap-2">
        <Link href={`/events/${event.slug}`} className="inline-flex min-h-10 items-center rounded bg-ink px-3 py-2 text-sm font-semibold text-white">
          View Event
        </Link>
        {event.event_url && (
          <a href={event.event_url} target="_blank" rel="noreferrer" className="inline-flex min-h-10 items-center gap-2 rounded border border-ink/15 bg-white px-3 py-2 text-sm font-semibold text-lake">
            <ExternalLink size={16} /> Original Page
          </a>
        )}
      </div>
    </article>
  );
}
