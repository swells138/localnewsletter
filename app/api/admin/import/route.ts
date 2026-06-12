import { NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/admin/auth";
import { getCategories, getCities, getEventSources } from "@/lib/data";
import { hasDatabaseConfig } from "@/lib/db";
import { runEventImport } from "@/lib/importer";
import { redirectAfterPost } from "@/lib/redirect";

export async function POST(request: Request) {
  if (!(await isAdminRequest())) return redirectAfterPost("/admin/login", request.url);
  if (!hasDatabaseConfig) {
    return redirectAfterPost("/admin?import=needs-database", request.url);
  }

  const form = await request.formData();
  const sourceId = String(form.get("source_id") ?? "");
  const [sources, cities, categories] = await Promise.all([getEventSources(), getCities(), getCategories()]);
  const selectedSources = sourceId ? sources.filter((source) => source.id === sourceId) : sources;
  const result = await runEventImport(selectedSources, cities, categories);
  const params = new URLSearchParams({
    import: "complete",
    checked: String(result.checked),
    found: String(result.found),
    ai: String(result.aiSources),
    created: String(result.created),
    skipped: String(result.skipped),
    missing: String(result.missingRequired),
    duplicate: String(result.duplicates),
    unmatched: String(result.unmatchedLocation),
    errors: String(result.errors.length)
  });

  return redirectAfterPost(`/admin?${params.toString()}`, request.url);
}
