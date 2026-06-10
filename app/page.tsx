import Link from "next/link";
import { ArrowRight, MapPin, Newspaper } from "lucide-react";
import { EventCard } from "@/components/event-card";
import { FilterBar } from "@/components/filter-bar";
import { NewsletterForm } from "@/components/newsletter-form";
import { PageShell } from "@/components/page-shell";
import { getCategories, getCities, getEvents } from "@/lib/data";

export default async function HomePage() {
  const [cities, categories, events] = await Promise.all([getCities(), getCategories(), getEvents({ date: "next-7-days" })]);
  const featured = events.filter((event) => event.is_featured).slice(0, 3);
  const weekend = events.slice(0, 6);

  return (
    <PageShell className="grid gap-12">
      <section className="grid gap-8 py-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
        <div>
          <p className="inline-flex rounded bg-lake/12 px-3 py-1 text-sm font-semibold text-lake">North Ridgeville launch area</p>
          <h1 className="mt-4 max-w-3xl text-4xl font-bold tracking-tight text-ink sm:text-5xl lg:text-6xl">
            Find things to do this weekend in Northeast Ohio
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-ink/72">
            A clean local guide for festivals, food, music, family activities, markets, fitness, arts, and community events across the west side and Cleveland.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/events" className="inline-flex min-h-11 items-center gap-2 rounded bg-lake px-4 py-2 font-semibold text-white">View Events <ArrowRight size={18} /></Link>
            <Link href="/submit-event" className="inline-flex min-h-11 items-center rounded border border-ink/15 bg-white px-4 py-2 font-semibold text-ink">Submit an Event</Link>
          </div>
        </div>
        <div className="rounded border border-ink/10 bg-white p-4 shadow-soft">
          <div className="flex items-center gap-2 text-sm font-semibold text-berry"><Newspaper size={18} /> Weekend editor picks</div>
          <div className="mt-4 grid gap-3">
            {featured.map((event) => <EventCard key={event.id} event={event} compact />)}
          </div>
        </div>
      </section>

      <section>
        <FilterBar cities={cities} categories={categories} />
      </section>

      <section className="grid gap-5">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-ink/50">Featured events</p>
            <h2 className="text-2xl font-bold">Worth putting on the calendar</h2>
          </div>
          <Link href="/events" className="text-sm font-semibold text-lake">View all</Link>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {featured.map((event) => <EventCard key={event.id} event={event} />)}
        </div>
      </section>

      <section className="grid gap-5">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-ink/50">This weekend</p>
          <h2 className="text-2xl font-bold">Fresh events nearby</h2>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {weekend.map((event) => <EventCard key={event.id} event={event} />)}
        </div>
      </section>

      <section className="grid gap-4">
        <div className="flex items-center gap-2">
          <MapPin className="text-berry" size={20} />
          <h2 className="text-2xl font-bold">Popular cities</h2>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {cities.map((city) => (
            <Link key={city.id} href={`/cities/${city.slug}`} className="rounded border border-ink/10 bg-white p-4 shadow-sm hover:shadow-soft">
              <span className="font-semibold">{city.name}</span>
              <span className="mt-1 block text-sm text-ink/60">{city.county} County</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="grid gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-ink/50">Newsletter</p>
          <h2 className="text-2xl font-bold">Get weekend events by email</h2>
        </div>
        <NewsletterForm cities={cities} categories={categories} />
      </section>
    </PageShell>
  );
}
