import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Calendar, ExternalLink, MapPin, Tag, User } from "lucide-react";
import { EventCard } from "@/components/event-card";
import { PageShell } from "@/components/page-shell";
import { calendarUrl, formatEventDate, siteUrl, validExternalUrl } from "@/lib/format";
import { getEventBySlug, getEvents } from "@/lib/data";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const event = await getEventBySlug(slug);
  if (!event) return {};
  return {
    title: event.title,
    description: `${event.title} in ${event.city.name} at ${event.venue_name}. ${formatEventDate(event)}.`,
    alternates: { canonical: `/events/${event.slug}` }
  };
}

export default async function EventDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const event = await getEventBySlug(slug);
  if (!event || event.status !== "published") notFound();

  const related = (await getEvents({ city: event.city.slug }))
    .filter((item) => item.id !== event.id)
    .slice(0, 3);
  const eventUrl = validExternalUrl(event.event_url);

  const schema = {
    "@context": "https://schema.org",
    "@type": "Event",
    name: event.title,
    startDate: event.start_datetime,
    endDate: event.end_datetime,
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    eventStatus: "https://schema.org/EventScheduled",
    location: {
      "@type": "Place",
      name: event.venue_name,
      address: event.address
    },
    image: event.image_url ? [event.image_url] : undefined,
    description: event.description,
    offers: {
      "@type": "Offer",
      price: event.is_free ? "0" : event.price_text,
      url: eventUrl
    },
    organizer: {
      "@type": "Organization",
      name: event.organizer_name,
      url: siteUrl()
    }
  };

  return (
    <PageShell className="grid gap-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <article className="grid gap-8 lg:grid-cols-[1fr_360px]">
        <div>
          <Link href={`/categories/${event.category.slug}`} className="text-sm font-semibold uppercase tracking-wide text-lake">{event.category.name}</Link>
          <h1 className="mt-3 text-4xl font-bold tracking-tight">{event.title}</h1>
          <p className="mt-4 max-w-3xl text-lg leading-8 text-ink/72">{event.description}</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <a href={calendarUrl(event)} target="_blank" rel="noreferrer" className="inline-flex min-h-11 items-center gap-2 rounded bg-lake px-4 py-2 font-semibold text-white">
              <Calendar size={18} /> Add to calendar
            </a>
            {eventUrl && (
              <a href={eventUrl} target="_blank" rel="noreferrer" className="inline-flex min-h-11 items-center gap-2 rounded border border-ink/15 bg-white px-4 py-2 font-semibold">
                <ExternalLink size={18} /> Event link
              </a>
            )}
          </div>
        </div>
        <aside className="rounded border border-ink/10 bg-white p-5 shadow-sm">
          <dl className="grid gap-4 text-sm">
            <div><dt className="font-semibold text-ink">Date/time</dt><dd className="mt-1 flex gap-2 text-ink/70"><Calendar size={16} /> {formatEventDate(event)}</dd></div>
            <div><dt className="font-semibold text-ink">Venue</dt><dd className="mt-1 flex gap-2 text-ink/70"><MapPin size={16} /> {event.venue_name}<br />{event.address}</dd></div>
            <div><dt className="font-semibold text-ink">City</dt><dd className="mt-1"><Link className="text-lake" href={`/cities/${event.city.slug}`}>{event.city.name}</Link></dd></div>
            <div><dt className="font-semibold text-ink">Cost</dt><dd className="mt-1 text-ink/70">{event.price_text}</dd></div>
            <div><dt className="font-semibold text-ink">Organizer</dt><dd className="mt-1 flex gap-2 text-ink/70"><User size={16} /> {event.organizer_name}</dd></div>
            <div><dt className="font-semibold text-ink">Tags</dt><dd className="mt-1 flex gap-2 text-ink/70"><Tag size={16} /> {event.is_family_friendly ? "Family-friendly" : "Adults"} · {event.is_free ? "Free" : "Paid"}</dd></div>
          </dl>
        </aside>
      </article>
      <section className="grid gap-4">
        <h2 className="text-2xl font-bold">Related events nearby</h2>
        <div className="grid gap-4 md:grid-cols-3">
          {related.map((item) => <EventCard key={item.id} event={item} compact />)}
        </div>
      </section>
    </PageShell>
  );
}
