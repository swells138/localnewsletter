import { NextResponse } from "next/server";
import { z } from "zod";
import { createSupabaseAdminClient, hasSupabaseConfig } from "@/lib/supabase";

const schema = z.object({
  title: z.string().min(3),
  description: z.string().min(20),
  start_datetime: z.string().min(1),
  end_datetime: z.string().min(1),
  venue_name: z.string().min(2),
  address: z.string().min(5),
  city_id: z.string().min(1),
  category_id: z.string().min(1),
  price_text: z.string().min(1),
  event_url: z.string().url(),
  organizer_name: z.string().min(2),
  organizer_email: z.string().email(),
  is_free: z.boolean(),
  is_family_friendly: z.boolean()
});

const slugify = (value: string) =>
  value
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

export async function POST(request: Request) {
  const form = await request.formData();
  if (String(form.get("website") ?? "")) {
    return NextResponse.redirect(new URL("/submit-event?submitted=1", request.url));
  }

  const parsed = schema.safeParse({
    title: form.get("title"),
    description: form.get("description"),
    start_datetime: form.get("start_datetime"),
    end_datetime: form.get("end_datetime"),
    venue_name: form.get("venue_name"),
    address: form.get("address"),
    city_id: form.get("city_id"),
    category_id: form.get("category_id"),
    price_text: form.get("price_text"),
    event_url: form.get("event_url"),
    organizer_name: form.get("organizer_name"),
    organizer_email: form.get("organizer_email"),
    is_free: form.get("is_free") === "1",
    is_family_friendly: form.get("is_family_friendly") === "1"
  });

  if (!parsed.success) {
    return NextResponse.json({ error: "Please check the event details and try again." }, { status: 400 });
  }

  const payload = {
    ...parsed.data,
    slug: `${slugify(parsed.data.title)}-${Date.now().toString(36)}`,
    start_datetime: new Date(parsed.data.start_datetime).toISOString(),
    end_datetime: new Date(parsed.data.end_datetime).toISOString(),
    status: "pending",
    is_featured: false
  };

  if (hasSupabaseConfig && process.env.SUPABASE_SERVICE_ROLE_KEY) {
    const supabase = createSupabaseAdminClient();
    const { error } = await supabase.from("events").insert(payload);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.redirect(new URL("/submit-event?submitted=1", request.url));
}
