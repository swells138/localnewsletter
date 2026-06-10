import { NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/admin/auth";
import { getSql, hasDatabaseConfig } from "@/lib/db";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdminRequest())) return NextResponse.redirect(new URL("/admin/login", request.url));
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
    }
  }

  return NextResponse.redirect(new URL("/admin", request.url));
}
