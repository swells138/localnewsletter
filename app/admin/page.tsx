import type { Metadata } from "next";
import { cookies } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";
import { PageShell } from "@/components/page-shell";
import { formatEventDate } from "@/lib/format";
import { getEvents } from "@/lib/data";

export const metadata: Metadata = {
  title: "Admin"
};

export default async function AdminPage() {
  const token = (await cookies()).get("neo_admin")?.value;
  const expected = process.env.ADMIN_ACCESS_TOKEN ?? "change-me-before-deploy";
  if (token !== expected) redirect("/admin/login");

  const events = await getEvents({}, true);

  return (
    <PageShell className="grid gap-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-lake">Admin</p>
          <h1 className="text-3xl font-bold">Event review dashboard</h1>
        </div>
        <Link href="/submit-event" className="rounded bg-lake px-4 py-2 font-semibold text-white">Create event</Link>
      </div>
      <div className="overflow-x-auto rounded border border-ink/10 bg-white shadow-sm">
        <table className="w-full min-w-[900px] text-left text-sm">
          <thead className="border-b border-ink/10 bg-paper text-ink/65">
            <tr>
              <th className="p-3">Event</th>
              <th className="p-3">Date</th>
              <th className="p-3">City</th>
              <th className="p-3">Status</th>
              <th className="p-3">Featured</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {events.map((event) => (
              <tr key={event.id} className="border-b border-ink/10">
                <td className="p-3 font-semibold"><Link href={`/events/${event.slug}`}>{event.title}</Link></td>
                <td className="p-3 text-ink/70">{formatEventDate(event)}</td>
                <td className="p-3">{event.city.name}</td>
                <td className="p-3">{event.status}</td>
                <td className="p-3">{event.is_featured ? "Yes" : "No"}</td>
                <td className="p-3">
                  <form action={`/api/admin/events/${event.id}`} method="post" className="flex flex-wrap gap-2">
                    <button name="action" value="approve" className="rounded bg-leaf px-2 py-1 text-xs font-semibold text-white">Approve</button>
                    <button name="action" value="reject" className="rounded bg-berry px-2 py-1 text-xs font-semibold text-white">Reject</button>
                    <button name="action" value="feature" className="rounded bg-amber px-2 py-1 text-xs font-semibold text-ink">Feature</button>
                    <button name="action" value="delete" className="rounded border border-ink/15 px-2 py-1 text-xs font-semibold">Delete</button>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </PageShell>
  );
}
