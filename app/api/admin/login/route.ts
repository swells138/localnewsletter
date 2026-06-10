import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { adminCookieName, getAdminPassword } from "@/lib/admin/auth";

export async function POST(request: Request) {
  const form = await request.formData();
  const token = String(form.get("token") ?? "");
  const expected = getAdminPassword();

  if (!token || token !== expected) {
    return NextResponse.redirect(new URL("/admin/login?error=1", request.url));
  }

  (await cookies()).set(adminCookieName, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/"
  });

  return NextResponse.redirect(new URL("/admin", request.url));
}
