import { NextResponse } from "next/server";
import { z } from "zod";
import { getSql, hasDatabaseConfig } from "@/lib/db";

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

  if (hasDatabaseConfig) {
    try {
      await getSql()`
        insert into newsletter_subscribers (email, preferred_city_id, interests)
        values (${parsed.data.email}, ${parsed.data.preferred_city_id}, ${parsed.data.interests}::text[])
        on conflict (email) do update set
          preferred_city_id = excluded.preferred_city_id,
          interests = excluded.interests
      `;
    } catch (error) {
      return NextResponse.json({ error: error instanceof Error ? error.message : "Database upsert failed." }, { status: 500 });
    }
  }

  return NextResponse.redirect(new URL("/?newsletter=1", request.url));
}
