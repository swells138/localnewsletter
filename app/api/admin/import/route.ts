import { NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/admin/auth";
import { getCategories, getCities, getEventSources } from "@/lib/data";
import { runEventImport } from "@/lib/importer";
import { hasSupabaseConfig } from "@/lib/supabase";

export async function POST(request: Request) {
  if (!(await isAdminRequest())) return NextResponse.redirect(new URL("/admin/login", request.url));
  if (!hasSupabaseConfig || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.redirect(new URL("/admin?import=needs-supabase", request.url));
  }

  const [sources, cities, categories] = await Promise.all([getEventSources(), getCities(), getCategories()]);
  const result = await runEventImport(sources, cities, categories);
  const params = new URLSearchParams({
    import: "complete",
    checked: String(result.checked),
    created: String(result.created),
    skipped: String(result.skipped),
    errors: String(result.errors.length)
  });

  return NextResponse.redirect(new URL(`/admin?${params.toString()}`, request.url));
}
