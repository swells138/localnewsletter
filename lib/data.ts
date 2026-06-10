import { addDays, endOfDay, isWithinInterval, parseISO, startOfDay } from "date-fns";
import { categories as sampleCategories, cities as sampleCities, events as sampleEvents } from "@/lib/sample-data";
import { createSupabaseAdminClient, hasSupabaseConfig } from "@/lib/supabase";
import type { Category, City, Event, EventFilters, EventSource, EventSourceWithRelations, EventWithRelations } from "@/lib/types";

const siteNow = () => new Date();

export const getCities = async (): Promise<City[]> => {
  if (!hasSupabaseConfig || !process.env.SUPABASE_SERVICE_ROLE_KEY) return sampleCities;
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase.from("cities").select("*").order("name");
  if (error) return sampleCities;
  return data as City[];
};

export const getCategories = async (): Promise<Category[]> => {
  if (!hasSupabaseConfig || !process.env.SUPABASE_SERVICE_ROLE_KEY) return sampleCategories;
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase.from("categories").select("*").order("name");
  if (error) return sampleCategories;
  return data as Category[];
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
  if (!hasSupabaseConfig || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    rows = sampleEvents;
  } else {
    const supabase = createSupabaseAdminClient();
    const { data, error } = await supabase
      .from("events")
      .select("*")
      .in("status", includePending ? ["pending", "published", "draft", "rejected"] : ["published"])
      .order("start_datetime", { ascending: true });
    rows = error ? sampleEvents : (data as Event[]);
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
  if (!hasSupabaseConfig || !process.env.SUPABASE_SERVICE_ROLE_KEY) return [];
  const [cities, categories] = await Promise.all([getCities(), getCategories()]);
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase.from("event_sources").select("*").order("created_at", { ascending: false });
  if (error) return [];

  return (data as EventSource[]).map((source) => ({
    ...source,
    city: cities.find((city) => city.id === source.city_id) ?? null,
    category: categories.find((category) => category.id === source.category_id) ?? null
  }));
};
