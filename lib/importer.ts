import { addHours, parseISO } from "date-fns";
import { createSupabaseAdminClient } from "@/lib/supabase";
import type { Category, City, EventSourceWithRelations } from "@/lib/types";

type ImportedCandidate = {
  title: string;
  description: string;
  start_datetime: string;
  end_datetime?: string;
  venue_name?: string;
  address?: string;
  city?: string;
  category?: string;
  price_text?: string;
  is_free?: boolean;
  is_family_friendly?: boolean;
  event_url?: string;
  organizer_name?: string;
  image_url?: string | null;
  confidence?: number;
};

export type ImportResult = {
  checked: number;
  created: number;
  skipped: number;
  errors: string[];
};

const slugify = (value: string) =>
  value
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

const toIso = (value?: string) => {
  if (!value) return null;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString();
};

const stripHtml = (html: string) =>
  html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const extractJsonLdEvents = (html: string): ImportedCandidate[] => {
  const matches = html.match(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi) ?? [];

  const flatten = (value: unknown): unknown[] => {
    if (Array.isArray(value)) return value.flatMap(flatten);
    if (value && typeof value === "object" && "@graph" in value) return flatten((value as { "@graph": unknown })["@graph"]);
    return [value];
  };

  return matches.flatMap((script) => {
    const jsonText = script.replace(/^<script[^>]*>/i, "").replace(/<\/script>$/i, "").trim();
    try {
      return flatten(JSON.parse(jsonText))
        .filter((item): item is Record<string, unknown> => {
          if (!item || typeof item !== "object") return false;
          const type = (item as Record<string, unknown>)["@type"];
          return type === "Event" || (Array.isArray(type) && type.includes("Event"));
        })
        .map((item) => {
          const location = item.location && typeof item.location === "object" ? (item.location as Record<string, unknown>) : {};
          const address = location.address && typeof location.address === "object" ? (location.address as Record<string, unknown>) : location.address;
          const offers = item.offers && typeof item.offers === "object" ? (item.offers as Record<string, unknown>) : {};
          const organizer = item.organizer && typeof item.organizer === "object" ? (item.organizer as Record<string, unknown>) : {};

          return {
            title: String(item.name ?? ""),
            description: String(item.description ?? ""),
            start_datetime: String(item.startDate ?? ""),
            end_datetime: String(item.endDate ?? ""),
            venue_name: String(location.name ?? ""),
            address: typeof address === "string" ? address : Object.values(address ?? {}).filter(Boolean).join(", "),
            price_text: item.isAccessibleForFree === true ? "Free" : String(offers.price ?? offers.name ?? "See event page"),
            is_free: item.isAccessibleForFree === true || String(offers.price ?? "").trim() === "0",
            event_url: String(item.url ?? offers.url ?? ""),
            organizer_name: String(organizer.name ?? "Imported source"),
            image_url: Array.isArray(item.image) ? String(item.image[0] ?? "") : item.image ? String(item.image) : null,
            confidence: 0.9
          };
        });
    } catch {
      return [];
    }
  });
};

const extractWithAi = async (html: string, sourceUrl: string): Promise<ImportedCandidate[]> => {
  if (!process.env.OPENAI_API_KEY || !process.env.OPENAI_MODEL) return [];

  const text = stripHtml(html).slice(0, 18000);
  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL,
      input: [
        {
          role: "system",
          content: "Extract only real public events from the provided page text. Return compact JSON with an events array. Use ISO date strings when dates are present. Do not invent missing events."
        },
        {
          role: "user",
          content: `Source URL: ${sourceUrl}\n\nPage text:\n${text}`
        }
      ],
      text: {
        format: {
          type: "json_schema",
          name: "event_import",
          schema: {
            type: "object",
            additionalProperties: false,
            properties: {
              events: {
                type: "array",
                items: {
                  type: "object",
                  additionalProperties: false,
                  properties: {
                    title: { type: "string" },
                    description: { type: "string" },
                    start_datetime: { type: "string" },
                    end_datetime: { type: "string" },
                    venue_name: { type: "string" },
                    address: { type: "string" },
                    city: { type: "string" },
                    category: { type: "string" },
                    price_text: { type: "string" },
                    is_free: { type: "boolean" },
                    is_family_friendly: { type: "boolean" },
                    event_url: { type: "string" },
                    organizer_name: { type: "string" },
                    confidence: { type: "number" }
                  },
                  required: ["title", "description", "start_datetime", "end_datetime", "venue_name", "address", "city", "category", "price_text", "is_free", "is_family_friendly", "event_url", "organizer_name", "confidence"]
                }
              }
            },
            required: ["events"]
          }
        }
      }
    })
  });

  if (!response.ok) return [];
  const data = (await response.json()) as { output_text?: string };
  if (!data.output_text) return [];

  try {
    const parsed = JSON.parse(data.output_text) as { events?: ImportedCandidate[] };
    return parsed.events ?? [];
  } catch {
    return [];
  }
};

const pickCity = (candidate: ImportedCandidate, fallback: City | null, cities: City[]) => {
  if (fallback) return fallback;
  const text = `${candidate.city ?? ""} ${candidate.address ?? ""}`.toLowerCase();
  return cities.find((city) => text.includes(city.name.toLowerCase())) ?? null;
};

const pickCategory = (candidate: ImportedCandidate, fallback: Category | null, categories: Category[]) => {
  if (fallback) return fallback;
  const text = `${candidate.category ?? ""} ${candidate.title} ${candidate.description}`.toLowerCase();
  return categories.find((category) => text.includes(category.name.toLowerCase()) || text.includes(category.slug.replace("-", " "))) ?? categories.find((category) => category.slug === "community") ?? null;
};

export const runEventImport = async (sources: EventSourceWithRelations[], cities: City[], categories: Category[]): Promise<ImportResult> => {
  const supabase = createSupabaseAdminClient();
  const result: ImportResult = { checked: 0, created: 0, skipped: 0, errors: [] };

  for (const source of sources.filter((item) => item.is_active)) {
    result.checked += 1;

    try {
      const response = await fetch(source.url, {
        headers: { "User-Agent": "NEO Weekend Guide event review bot; contact site owner" },
        cache: "no-store"
      });

      if (!response.ok) {
        result.errors.push(`${source.name}: ${response.status}`);
        continue;
      }

      const html = await response.text();
      const candidates = [...extractJsonLdEvents(html), ...(await extractWithAi(html, source.url))];
      const dedupe = new Set<string>();

      for (const candidate of candidates) {
        const start = toIso(candidate.start_datetime);
        const title = candidate.title?.trim();
        if (!title || !start) {
          result.skipped += 1;
          continue;
        }

        const key = `${title.toLowerCase()}-${start}`;
        if (dedupe.has(key)) {
          result.skipped += 1;
          continue;
        }
        dedupe.add(key);

        const city = pickCity(candidate, source.city, cities);
        const category = pickCategory(candidate, source.category, categories);
        if (!city || !category) {
          result.skipped += 1;
          continue;
        }

        const eventUrl = candidate.event_url?.startsWith("http") ? candidate.event_url : source.url;
        const slugBase = slugify(`${title}-${city.slug}-${start.slice(0, 10)}`);
        const { data: existing } = await supabase
          .from("events")
          .select("id")
          .or(`event_url.eq.${eventUrl},slug.eq.${slugBase}`)
          .limit(1);

        if (existing?.length) {
          result.skipped += 1;
          continue;
        }

        const end = toIso(candidate.end_datetime) ?? addHours(parseISO(start), 2).toISOString();
        const { error } = await supabase.from("events").insert({
          title,
          slug: slugBase,
          description: candidate.description?.trim() || `Imported event from ${source.name}. Review details before publishing.`,
          start_datetime: start,
          end_datetime: end,
          venue_name: candidate.venue_name?.trim() || "Venue to confirm",
          address: candidate.address?.trim() || `${city.name}, ${city.state}`,
          city_id: city.id,
          category_id: category.id,
          price_text: candidate.price_text?.trim() || "See event page",
          is_free: Boolean(candidate.is_free),
          is_family_friendly: Boolean(candidate.is_family_friendly),
          event_url: eventUrl,
          organizer_name: candidate.organizer_name?.trim() || source.name,
          organizer_email: "imports@example.com",
          image_url: candidate.image_url || null,
          status: "pending",
          is_featured: false,
          source_url: source.url,
          imported_at: new Date().toISOString(),
          import_confidence: candidate.confidence ?? 0.7,
          raw_import_data: candidate
        });

        if (error) {
          result.errors.push(`${title}: ${error.message}`);
        } else {
          result.created += 1;
        }
      }

      await supabase.from("event_sources").update({ last_checked_at: new Date().toISOString() }).eq("id", source.id);
    } catch (error) {
      result.errors.push(`${source.name}: ${error instanceof Error ? error.message : "unknown error"}`);
    }
  }

  return result;
};
