import { NextResponse } from "next/server";
import { z } from "zod";
import { isAdminRequest } from "@/lib/admin/auth";
import { getSql, hasDatabaseConfig } from "@/lib/db";
import { redirectAfterPost } from "@/lib/redirect";

const sourceSchema = z.object({
  id: z.string().nullable(),
  action: z.enum(["save", "delete"]),
  name: z.string().min(2),
  url: z.string().url(),
  city_id: z.string().nullable(),
  category_id: z.string().nullable(),
  is_active: z.boolean(),
  notes: z.string().nullable()
});

const sourceErrorCode = (error: unknown) => {
  const message = error instanceof Error ? error.message.toLowerCase() : String(error).toLowerCase();

  if (message.includes("relation") && message.includes("event_sources")) return "missing-schema";
  if (message.includes("relation") && (message.includes("cities") || message.includes("categories"))) return "missing-schema";
  if (message.includes("invalid input syntax") && message.includes("uuid")) return "invalid-relation";
  if (message.includes("password authentication failed") || message.includes("connection") || message.includes("connect")) return "connection-error";

  return "database-error";
};

export async function POST(request: Request) {
  if (!(await isAdminRequest())) return redirectAfterPost("/admin/login", request.url);
  if (!hasDatabaseConfig) {
    return redirectAfterPost("/admin?source=needs-database", request.url);
  }

  const form = await request.formData();
  const parsed = sourceSchema.safeParse({
    id: String(form.get("id") ?? "") || null,
    action: form.get("action") === "delete" ? "delete" : "save",
    name: form.get("name"),
    url: form.get("url"),
    city_id: String(form.get("city_id") ?? "") || null,
    category_id: String(form.get("category_id") ?? "") || null,
    is_active: form.get("is_active") === "1",
    notes: String(form.get("notes") ?? "") || null
  });

  if (!parsed.success) return redirectAfterPost("/admin?source=invalid", request.url);

  try {
    if (parsed.data.action === "delete" && parsed.data.id) {
      await getSql()`delete from event_sources where id = ${parsed.data.id}`;
      return redirectAfterPost("/admin?source=deleted", request.url);
    }

    if (parsed.data.id) {
      await getSql()`
        update event_sources set
          name = ${parsed.data.name},
          url = ${parsed.data.url},
          city_id = ${parsed.data.city_id},
          category_id = ${parsed.data.category_id},
          is_active = ${parsed.data.is_active},
          notes = ${parsed.data.notes},
          updated_at = now()
        where id = ${parsed.data.id}
      `;
    } else {
      await getSql()`
        insert into event_sources (name, url, city_id, category_id, is_active, notes)
        values (${parsed.data.name}, ${parsed.data.url}, ${parsed.data.city_id}, ${parsed.data.category_id}, ${parsed.data.is_active}, ${parsed.data.notes})
        on conflict (url) do update set
          name = excluded.name,
          city_id = excluded.city_id,
          category_id = excluded.category_id,
          is_active = excluded.is_active,
          notes = excluded.notes,
          updated_at = now()
      `;
    }
  } catch (error) {
    console.error("Failed to save event source", error);
    return redirectAfterPost(`/admin?source=${sourceErrorCode(error)}`, request.url);
  }

  return redirectAfterPost("/admin?source=added", request.url);
}
