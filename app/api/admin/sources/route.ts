import { NextResponse } from "next/server";
import { z } from "zod";
import { isAdminRequest } from "@/lib/admin/auth";
import { createSupabaseAdminClient, hasSupabaseConfig } from "@/lib/supabase";

const sourceSchema = z.object({
  name: z.string().min(2),
  url: z.string().url(),
  city_id: z.string().nullable(),
  category_id: z.string().nullable(),
  notes: z.string().nullable()
});

export async function POST(request: Request) {
  if (!(await isAdminRequest())) return NextResponse.redirect(new URL("/admin/login", request.url));
  if (!hasSupabaseConfig || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.redirect(new URL("/admin?source=needs-supabase", request.url));
  }

  const form = await request.formData();
  const parsed = sourceSchema.safeParse({
    name: form.get("name"),
    url: form.get("url"),
    city_id: String(form.get("city_id") ?? "") || null,
    category_id: String(form.get("category_id") ?? "") || null,
    notes: String(form.get("notes") ?? "") || null
  });

  if (!parsed.success) return NextResponse.redirect(new URL("/admin?source=invalid", request.url));

  const supabase = createSupabaseAdminClient();
  await supabase.from("event_sources").upsert(parsed.data, { onConflict: "url" });
  return NextResponse.redirect(new URL("/admin?source=added", request.url));
}
