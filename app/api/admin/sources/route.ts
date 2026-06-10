import { NextResponse } from "next/server";
import { z } from "zod";
import { isAdminRequest } from "@/lib/admin/auth";
import { getSql, hasDatabaseConfig } from "@/lib/db";
import { redirectAfterPost } from "@/lib/redirect";

const sourceSchema = z.object({
  name: z.string().min(2),
  url: z.string().url(),
  city_id: z.string().nullable(),
  category_id: z.string().nullable(),
  notes: z.string().nullable()
});

export async function POST(request: Request) {
  if (!(await isAdminRequest())) return redirectAfterPost("/admin/login", request.url);
  if (!hasDatabaseConfig) {
    return redirectAfterPost("/admin?source=needs-database", request.url);
  }

  const form = await request.formData();
  const parsed = sourceSchema.safeParse({
    name: form.get("name"),
    url: form.get("url"),
    city_id: String(form.get("city_id") ?? "") || null,
    category_id: String(form.get("category_id") ?? "") || null,
    notes: String(form.get("notes") ?? "") || null
  });

  if (!parsed.success) return redirectAfterPost("/admin?source=invalid", request.url);

  try {
    await getSql()`
      insert into event_sources (name, url, city_id, category_id, notes)
      values (${parsed.data.name}, ${parsed.data.url}, ${parsed.data.city_id}, ${parsed.data.category_id}, ${parsed.data.notes})
      on conflict (url) do update set
        name = excluded.name,
        city_id = excluded.city_id,
        category_id = excluded.category_id,
        notes = excluded.notes,
        updated_at = now()
    `;
  } catch {
    return redirectAfterPost("/admin?source=database-error", request.url);
  }

  return redirectAfterPost("/admin?source=added", request.url);
}
