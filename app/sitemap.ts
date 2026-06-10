import type { MetadataRoute } from "next";
import { getCategories, getCities, getEvents } from "@/lib/data";
import { siteUrl } from "@/lib/format";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [cities, categories, events] = await Promise.all([getCities(), getCategories(), getEvents()]);
  const base = siteUrl();

  return [
    { url: base, lastModified: new Date() },
    { url: `${base}/events`, lastModified: new Date() },
    { url: `${base}/submit-event`, lastModified: new Date() },
    ...cities.map((city) => ({ url: `${base}/cities/${city.slug}`, lastModified: new Date() })),
    ...categories.map((category) => ({ url: `${base}/categories/${category.slug}`, lastModified: new Date() })),
    ...events.map((event) => ({ url: `${base}/events/${event.slug}`, lastModified: new Date(event.updated_at) }))
  ];
}
