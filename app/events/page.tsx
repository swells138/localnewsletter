import type { Metadata } from "next";
import { EventCard } from "@/components/event-card";
import { FilterBar } from "@/components/filter-bar";
import { PageShell } from "@/components/page-shell";
import { getCategories, getCities, getEvents } from "@/lib/data";

export const metadata: Metadata = {
  title: "Events",
  description: "Filter Northeast Ohio events by city, date, category, free admission, and family-friendly options."
};

export default async function EventsPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const params = await searchParams;
  const [cities, categories, events] = await Promise.all([
    getCities(),
    getCategories(),
    getEvents({
      city: typeof params.city === "string" ? params.city : undefined,
      category: typeof params.category === "string" ? params.category : undefined,
      date: typeof params.date === "string" ? params.date : "next-7-days",
      free: params.free === "1",
      family: params.family === "1",
      q: typeof params.q === "string" ? params.q : undefined
    })
  ]);

  return (
    <PageShell className="grid gap-8">
      <div>
        <p className="text-sm font-semibold uppercase tracking-wide text-ink/50">Events</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">Find Northeast Ohio events</h1>
      </div>
      <FilterBar cities={cities} categories={categories} />
      <div className="flex items-center justify-between text-sm text-ink/60">
        <p>{events.length} event{events.length === 1 ? "" : "s"} found</p>
        <p>Sorted by date</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {events.map((event) => <EventCard key={event.id} event={event} />)}
        {!events.length && <p className="rounded border border-ink/10 bg-white p-4 text-sm text-ink/60 md:col-span-2 lg:col-span-3">No approved events match these filters yet.</p>}
      </div>
    </PageShell>
  );
}
