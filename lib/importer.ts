import { addHours, parseISO } from "date-fns";
import { getSql } from "@/lib/db";
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
  found: number;
  aiSources: number;
  created: number;
  skipped: number;
  missingRequired: number;
  duplicates: number;
  unmatchedLocation: number;
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

const getResponseText = (data: unknown) => {
  if (!data || typeof data !== "object") return "";
  const response = data as { output_text?: string; output?: Array<{ content?: Array<{ text?: string; type?: string }> }> };
  if (response.output_text) return response.output_text;

  return (
    response.output
      ?.flatMap((item) => item.content ?? [])
      .map((content) => content.text ?? "")
      .join("")
      .trim() ?? ""
  );
};

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
  if (!process.env.OPENAI_API_KEY) return [];

  const text = stripHtml(html).slice(0, 18000);
  const model = process.env.OPENAI_MODEL || "gpt-4o-mini";
  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model,
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
            strict: true,
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
  const responseText = getResponseText(await response.json());
  if (!responseText) return [];

  try {
    const parsed = JSON.parse(responseText) as { events?: ImportedCandidate[] };
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
  const sql = getSql();
  const result: ImportResult = {
    checked: 0,
    found: 0,
    aiSources: 0,
    created: 0,
    skipped: 0,
    missingRequired: 0,
    duplicates: 0,
    unmatchedLocation: 0,
    errors: []
  };

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
      const structuredCandidates = extractJsonLdEvents(html);
      const aiCandidates = await extractWithAi(html, source.url);
      if (aiCandidates.length) result.aiSources += 1;

      const candidates = [...structuredCandidates, ...aiCandidates];
      result.found += candidates.length;
      const dedupe = new Set<string>();

      for (const candidate of candidates) {
        const start = toIso(candidate.start_datetime);
        const title = candidate.title?.trim();
        if (!title || !start) {
          result.skipped += 1;
          result.missingRequired += 1;
          continue;
        }

        const key = `${title.toLowerCase()}-${start}`;
        if (dedupe.has(key)) {
          result.skipped += 1;
          result.duplicates += 1;
          continue;
        }
        dedupe.add(key);

        const city = pickCity(candidate, source.city, cities);
        const category = pickCategory(candidate, source.category, categories);
        if (!city || !category) {
          result.skipped += 1;
          result.unmatchedLocation += 1;
          continue;
        }

        const eventUrl = candidate.event_url?.startsWith("http") ? candidate.event_url : source.url;
        const slugBase = slugify(`${title}-${city.slug}-${start.slice(0, 10)}`);
        const existing = await sql`select id from events where event_url = ${eventUrl} or slug = ${slugBase} limit 1`;

        if (existing?.length) {
          result.skipped += 1;
          result.duplicates += 1;
          continue;
        }

        const end = toIso(candidate.end_datetime) ?? addHours(parseISO(start), 2).toISOString();
        try {
          await sql`
            insert into events (
              title, slug, description, start_datetime, end_datetime, venue_name, address,
              city_id, category_id, price_text, is_free, is_family_friendly, event_url,
              organizer_name, organizer_email, image_url, status, is_featured, source_url,
              imported_at, import_confidence, raw_import_data
            ) values (
              ${title}, ${slugBase}, ${candidate.description?.trim() || `Imported event from ${source.name}. Review details before publishing.`},
              ${start}, ${end}, ${candidate.venue_name?.trim() || "Venue to confirm"}, ${candidate.address?.trim() || `${city.name}, ${city.state}`},
              ${city.id}, ${category.id}, ${candidate.price_text?.trim() || "See event page"}, ${Boolean(candidate.is_free)},
              ${Boolean(candidate.is_family_friendly)}, ${eventUrl}, ${candidate.organizer_name?.trim() || source.name},
              ${"imports@example.com"}, ${candidate.image_url || null}, ${"pending"}, ${false}, ${source.url},
              ${new Date().toISOString()}, ${candidate.confidence ?? 0.7}, ${JSON.stringify(candidate)}::jsonb
            )
          `;
          result.created += 1;
        } catch (error) {
          result.errors.push(`${title}: ${error instanceof Error ? error.message : "insert failed"}`);
        }
      }

      await sql`update event_sources set last_checked_at = now() where id = ${source.id}`;
    } catch (error) {
      result.errors.push(`${source.name}: ${error instanceof Error ? error.message : "unknown error"}`);
    }
  }

  return result;
};
