import type { Metadata } from "next";
import { PageShell } from "@/components/page-shell";

export const metadata: Metadata = {
  title: "Admin Login"
};

export default function AdminLoginPage() {
  return (
    <PageShell className="grid place-items-center">
      <form action="/api/admin/login" method="post" className="w-full max-w-md rounded border border-ink/10 bg-white p-5 shadow-sm">
        <h1 className="text-2xl font-bold">Admin login</h1>
        <p className="mt-2 text-sm text-ink/65">Use your admin password. A full auth system can replace this placeholder later.</p>
        <label className="mt-5 block">Admin password<input required type="password" name="token" className="focus-ring mt-1 min-h-11 w-full rounded border border-ink/15 px-3" /></label>
        <button className="mt-4 min-h-11 rounded bg-ink px-4 py-2 font-semibold text-white">Sign in</button>
      </form>
    </PageShell>
  );
}
