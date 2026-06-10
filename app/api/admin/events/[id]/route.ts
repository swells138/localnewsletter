import { NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/admin/auth";
import { createSupabaseAdminClient, hasSupabaseConfig } from "@/lib/supabase";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdminRequest())) return NextResponse.redirect(new URL("/admin/login", request.url));
  const { id } = await params;
  const form = await request.formData();
  const action = String(form.get("action") ?? "");

  if (hasSupabaseConfig && process.env.SUPABASE_SERVICE_ROLE_KEY) {
    const supabase = createSupabaseAdminClient();
    if (action === "delete") {
      await supabase.from("events").delete().eq("id", id);
    } else if (action === "approve") {
      await supabase.from("events").update({ status: "published" }).eq("id", id);
    } else if (action === "reject") {
      await supabase.from("events").update({ status: "rejected" }).eq("id", id);
    } else if (action === "feature") {
      await supabase.from("events").update({ is_featured: true }).eq("id", id);
    }
  }

  return NextResponse.redirect(new URL("/admin", request.url));
}
