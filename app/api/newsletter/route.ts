import { NextResponse } from "next/server";
import { z } from "zod";
import { createSupabaseAdminClient, hasSupabaseConfig } from "@/lib/supabase";

const schema = z.object({
  email: z.string().email(),
  preferred_city_id: z.string().nullable(),
  interests: z.array(z.string())
});

export async function POST(request: Request) {
  const form = await request.formData();
  const parsed = schema.safeParse({
    email: form.get("email"),
    preferred_city_id: String(form.get("preferred_city_id") ?? "") || null,
    interests: String(form.get("interests") ?? "") ? [String(form.get("interests"))] : []
  });

  if (!parsed.success) {
    return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
  }

  if (hasSupabaseConfig && process.env.SUPABASE_SERVICE_ROLE_KEY) {
    const supabase = createSupabaseAdminClient();
    const { error } = await supabase.from("newsletter_subscribers").upsert(parsed.data, { onConflict: "email" });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.redirect(new URL("/?newsletter=1", request.url));
}
