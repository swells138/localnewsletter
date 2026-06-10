import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const form = await request.formData();
  const token = String(form.get("token") ?? "");
  const expected = process.env.ADMIN_ACCESS_TOKEN ?? "change-me-before-deploy";

  if (!token || token !== expected) {
    return NextResponse.redirect(new URL("/admin/login?error=1", request.url));
  }

  (await cookies()).set("neo_admin", token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/"
  });

  return NextResponse.redirect(new URL("/admin", request.url));
}
