import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { EventCard } from "@/components/event-card";
import { PageShell } from "@/components/page-shell";
import { getCategoryBySlug, getEvents } from "@/lib/data";

export async function generateMetadata({ params }: { params: Promise<{ categorySlug: string }> }): Promise<Metadata> {
  const { categorySlug } = await params;
  const category = await getCategoryBySlug(categorySlug);
  if (!category) return {};
  return {
    title: `${category.name} Events in Northeast Ohio`,
    description: category.description,
    alternates: { canonical: `/categories/${category.slug}` }
  };
}

export default async function CategoryPage({ params }: { params: Promise<{ categorySlug: string }> }) {
  const { categorySlug } = await params;
  const category = await getCategoryBySlug(categorySlug);
  if (!category) notFound();
  const events = await getEvents({ category: category.slug, date: "next-7-days" });

  return (
    <PageShell className="grid gap-8">
      <section className="max-w-3xl">
        <p className="text-sm font-semibold uppercase tracking-wide text-lake">Category</p>
        <h1 className="mt-2 text-4xl font-bold tracking-tight">{category.name} Events in Northeast Ohio</h1>
        <p className="mt-4 text-lg leading-8 text-ink/72">{category.description}</p>
      </section>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {events.map((event) => <EventCard key={event.id} event={event} />)}
      </div>
    </PageShell>
  );
}
