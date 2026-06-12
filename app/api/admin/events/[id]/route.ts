import { isAdminRequest } from "@/lib/admin/auth";
import { getSql, hasDatabaseConfig } from "@/lib/db";
import { redirectAfterPost } from "@/lib/redirect";

const eventStatuses = new Set(["draft", "pending", "published", "rejected"]);

const toIso = (value: FormDataEntryValue | null) => {
  const date = new Date(String(value ?? ""));
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
};

const optionalString = (value: FormDataEntryValue | null) => {
  const text = String(value ?? "").trim();
  return text ? text : null;
};

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdminRequest())) return redirectAfterPost("/admin/login", request.url);
  const { id } = await params;
  const form = await request.formData();
  const action = String(form.get("action") ?? "");

  if (hasDatabaseConfig) {
    const sql = getSql();
    if (action === "delete") {
      await sql`delete from events where id = ${id}`;
    } else if (action === "approve") {
      await sql`update events set status = 'published' where id = ${id}`;
    } else if (action === "reject") {
      await sql`update events set status = 'rejected' where id = ${id}`;
    } else if (action === "feature") {
      await sql`update events set is_featured = true where id = ${id}`;
    } else if (action === "save") {
      const status = String(form.get("status") ?? "pending");
      const start = toIso(form.get("start_datetime"));
      const end = toIso(form.get("end_datetime"));

      if (!start || !end || !eventStatuses.has(status)) {
        return redirectAfterPost("/admin?event=invalid", request.url);
      }

      await sql`
        update events set
          title = ${String(form.get("title") ?? "")},
          description = ${String(form.get("description") ?? "")},
          start_datetime = ${start},
          end_datetime = ${end},
          has_start_time = ${form.get("has_start_time") === "1"},
          has_end_time = ${form.get("has_end_time") === "1"},
          venue_name = ${optionalString(form.get("venue_name"))},
          address = ${optionalString(form.get("address"))},
          city_id = ${String(form.get("city_id") ?? "")},
          category_id = ${String(form.get("category_id") ?? "")},
          price_text = ${optionalString(form.get("price_text"))},
          is_free = ${form.get("is_free") === "1"},
          is_family_friendly = ${form.get("is_family_friendly") === "1"},
          event_url = ${optionalString(form.get("event_url"))},
          organizer_name = ${optionalString(form.get("organizer_name"))},
          organizer_email = ${optionalString(form.get("organizer_email"))},
          status = ${status},
          is_featured = ${form.get("is_featured") === "1"}
        where id = ${id}
      `;

      return redirectAfterPost("/admin?event=saved", request.url);
    }
  }

  return redirectAfterPost("/admin", request.url);
}
