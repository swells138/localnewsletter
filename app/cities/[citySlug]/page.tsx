import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { EventCard } from "@/components/event-card";
import { PageShell } from "@/components/page-shell";
import { getCities, getCityBySlug, getEvents } from "@/lib/data";

export async function generateMetadata({ params }: { params: Promise<{ citySlug: string }> }): Promise<Metadata> {
  const { citySlug } = await params;
  const city = await getCityBySlug(citySlug);
  if (!city) return {};
  return {
    title: city.seo_title,
    description: city.seo_description,
    alternates: { canonical: `/cities/${city.slug}` }
  };
}

export default async function CityPage({ params }: { params: Promise<{ citySlug: string }> }) {
  const { citySlug } = await params;
  const [city, cities] = await Promise.all([getCityBySlug(citySlug), getCities()]);
  if (!city) notFound();
  const events = await getEvents({ city: city.slug, date: "next-7-days" });
  const nearby = cities.filter((item) => item.id !== city.id).slice(0, 5);

  return (
    <PageShell className="grid gap-8">
      <section className="max-w-3xl">
        <p className="text-sm font-semibold uppercase tracking-wide text-lake">{city.county} County</p>
        <h1 className="mt-2 text-4xl font-bold tracking-tight">{city.seo_title}</h1>
        <p className="mt-4 text-lg leading-8 text-ink/72">{city.intro_text}</p>
      </section>
      <section className="grid gap-4">
        <h2 className="text-2xl font-bold">Upcoming events in {city.name}</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {events.map((event) => <EventCard key={event.id} event={event} />)}
        </div>
      </section>
      <section className="grid gap-3">
        <h2 className="text-2xl font-bold">Nearby cities</h2>
        <div className="flex flex-wrap gap-2">
          {nearby.map((item) => (
            <Link key={item.id} href={`/cities/${item.slug}`} className="rounded border border-ink/10 bg-white px-3 py-2 text-sm font-semibold text-lake">
              {item.name}
            </Link>
          ))}
        </div>
      </section>
    </PageShell>
  );
}
