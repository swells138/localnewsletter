import { addDays, endOfDay, isWithinInterval, parseISO, startOfDay } from "date-fns";
import { categories as sampleCategories, cities as sampleCities, events as sampleEvents } from "@/lib/sample-data";
import { getSql, hasDatabaseConfig } from "@/lib/db";
import type { Category, City, Event, EventFilters, EventSource, EventSourceWithRelations, EventWithRelations } from "@/lib/types";

const siteNow = () => new Date();

export const getCities = async (): Promise<City[]> => {
  if (!hasDatabaseConfig) return sampleCities;
  try {
    const rows = await getSql()`select * from cities order by name`;
    return rows as City[];
  } catch {
    return sampleCities;
  }
};

export const getCategories = async (): Promise<Category[]> => {
  if (!hasDatabaseConfig) return sampleCategories;
  try {
    const rows = await getSql()`select * from categories order by name`;
    return rows as Category[];
  } catch {
    return sampleCategories;
  }
};

const joinEvents = (events: Event[], cities: City[], categories: Category[]): EventWithRelations[] =>
  events
    .map((event) => {
      const city = cities.find((item) => item.id === event.city_id);
      const category = categories.find((item) => item.id === event.category_id);
      return city && category ? { ...event, city, category } : null;
    })
    .filter((event): event is EventWithRelations => Boolean(event));

export const getEvents = async (filters: EventFilters = {}, includePending = false): Promise<EventWithRelations[]> => {
  const cities = await getCities();
  const categories = await getCategories();

  let rows: Event[];
  if (!hasDatabaseConfig) {
    rows = sampleEvents;
  } else {
    try {
      rows = includePending
        ? ((await getSql()`select * from events where status in ('pending', 'published', 'draft', 'rejected') order by start_datetime asc`) as Event[])
        : ((await getSql()`select * from events where status = 'published' order by start_datetime asc`) as Event[]);
    } catch {
      rows = sampleEvents;
    }
  }

  const start = startOfDay(siteNow());
  let end = addDays(start, 90);
  if (filters.date === "today") end = endOfDay(start);
  if (filters.date === "tomorrow") {
    const tomorrow = addDays(start, 1);
    rows = rows.filter((event) => isWithinInterval(parseISO(event.start_datetime), { start: tomorrow, end: endOfDay(tomorrow) }));
  }
  if (filters.date === "this-weekend") {
    const today = siteNow();
    const saturday = addDays(start, (6 - today.getDay() + 7) % 7);
    rows = rows.filter((event) => isWithinInterval(parseISO(event.start_datetime), { start: saturday, end: endOfDay(addDays(saturday, 1)) }));
  }
  if (filters.date === "next-7-days") end = addDays(start, 7);

  if (!["tomorrow", "this-weekend"].includes(filters.date ?? "")) {
    rows = rows.filter((event) => isWithinInterval(parseISO(event.start_datetime), { start, end }));
  }

  let joined = joinEvents(rows, cities, categories);

  if (!includePending) joined = joined.filter((event) => event.status === "published");
  if (filters.city) joined = joined.filter((event) => event.city.slug === filters.city);
  if (filters.category) joined = joined.filter((event) => event.category.slug === filters.category);
  if (filters.free) joined = joined.filter((event) => event.is_free);
  if (filters.family) joined = joined.filter((event) => event.is_family_friendly);
  if (filters.q) {
    const q = filters.q.toLowerCase();
    joined = joined.filter((event) => `${event.title} ${event.description} ${event.city.name} ${event.category.name}`.toLowerCase().includes(q));
  }

  return joined.sort((a, b) => a.start_datetime.localeCompare(b.start_datetime));
};

export const getEventBySlug = async (slug: string) => (await getEvents({}, true)).find((event) => event.slug === slug);
export const getCityBySlug = async (slug: string) => (await getCities()).find((city) => city.slug === slug);
export const getCategoryBySlug = async (slug: string) => (await getCategories()).find((category) => category.slug === slug);

export const getEventSources = async (): Promise<EventSourceWithRelations[]> => {
  if (!hasDatabaseConfig) return [];
  const [cities, categories] = await Promise.all([getCities(), getCategories()]);
  let data: EventSource[];
  try {
    data = (await getSql()`select * from event_sources order by created_at desc`) as EventSource[];
  } catch {
    return [];
  }

  return data.map((source) => ({
    ...source,
    city: cities.find((city) => city.id === source.city_id) ?? null,
    category: categories.find((category) => category.id === source.category_id) ?? null
  }));
};
