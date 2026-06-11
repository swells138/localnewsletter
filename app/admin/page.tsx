import type { Metadata } from "next";
import { cookies } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";
import { PageShell } from "@/components/page-shell";
import { adminCookieName, getAdminPassword } from "@/lib/admin/auth";
import { formatEventDate } from "@/lib/format";
import { getCategories, getCities, getEvents, getEventSources } from "@/lib/data";

export const metadata: Metadata = {
  title: "Admin"
};

export default async function AdminPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const token = (await cookies()).get(adminCookieName)?.value;
  const expected = getAdminPassword();
  const params = await searchParams;
  if (token !== expected) redirect("/admin/login");

  const [events, cities, categories, sources] = await Promise.all([getEvents({}, true), getCities(), getCategories(), getEventSources()]);
  const pendingEvents = events.filter((event) => event.status === "pending");

  return (
    <PageShell className="grid gap-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-lake">Admin</p>
          <h1 className="text-3xl font-bold">Event bot and review dashboard</h1>
        </div>
        <Link href="/submit-event" className="rounded bg-lake px-4 py-2 font-semibold text-white">Create event</Link>
      </div>
      {params.import === "complete" && (
        <div className="rounded border border-leaf/20 bg-leaf/10 p-3 text-sm font-medium text-leaf">
          Bot run complete: checked {params.checked} source{params.checked === "1" ? "" : "s"}, found {params.found ?? "0"} candidate{params.found === "1" ? "" : "s"}, used AI on {params.ai ?? "0"} source{params.ai === "1" ? "" : "s"}, created {params.created} pending card{params.created === "1" ? "" : "s"}, skipped {params.skipped}, missing date/title {params.missing ?? "0"}, duplicates {params.duplicate ?? "0"}, unmatched city/category {params.unmatched ?? "0"}, errors {params.errors}.
        </div>
      )}
      {params.import === "needs-database" && (
        <div className="rounded border border-amber/25 bg-amber/10 p-3 text-sm font-medium text-ink">
          Add your Neon `DATABASE_URL` before running the bot. Local sample data is read-only.
        </div>
      )}
      {params.source === "needs-database" && (
        <div className="rounded border border-amber/25 bg-amber/10 p-3 text-sm font-medium text-ink">
          Add your Neon `DATABASE_URL` before saving source URLs.
        </div>
      )}
      {params.source === "database-error" && (
        <div className="rounded border border-berry/25 bg-berry/10 p-3 text-sm font-medium text-berry">
          Source was not saved. Check that `db/schema.sql` ran successfully in Neon and that `DATABASE_URL` is set in this environment.
        </div>
      )}
      {params.source === "missing-schema" && (
        <div className="rounded border border-berry/25 bg-berry/10 p-3 text-sm font-medium text-berry">
          Source was not saved because the Neon tables are missing. Run the full `db/schema.sql` file in the Neon SQL Editor.
        </div>
      )}
      {params.source === "invalid-relation" && (
        <div className="rounded border border-berry/25 bg-berry/10 p-3 text-sm font-medium text-berry">
          Source was not saved because the selected city or category ID is not in Neon. Run `npm run seed`, then refresh this page and try again.
        </div>
      )}
      {params.source === "connection-error" && (
        <div className="rounded border border-berry/25 bg-berry/10 p-3 text-sm font-medium text-berry">
          Source was not saved because the app could not connect to Neon. Check the `DATABASE_URL` environment variable in Vercel.
        </div>
      )}
      {params.source === "invalid" && (
        <div className="rounded border border-berry/25 bg-berry/10 p-3 text-sm font-medium text-berry">
          Source was not saved. Enter a source name and a valid URL.
        </div>
      )}
      {params.source === "added" && (
        <div className="rounded border border-leaf/20 bg-leaf/10 p-3 text-sm font-medium text-leaf">
          Source saved.
        </div>
      )}
      {params.source === "deleted" && (
        <div className="rounded border border-leaf/20 bg-leaf/10 p-3 text-sm font-medium text-leaf">
          Source deleted.
        </div>
      )}
      <section className="grid gap-4 lg:grid-cols-[1fr_340px]">
        <div className="rounded border border-ink/10 bg-white p-5 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-bold">Run event finder</h2>
              <p className="mt-1 text-sm text-ink/65">Checks active source URLs and creates pending cards for review.</p>
            </div>
            <form action="/api/admin/import" method="post">
              <button className="min-h-11 rounded bg-berry px-4 py-2 font-semibold text-white">Run Bot</button>
            </form>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <div className="rounded bg-paper p-3"><span className="text-2xl font-bold">{sources.length}</span><span className="block text-sm text-ink/60">sources</span></div>
            <div className="rounded bg-paper p-3"><span className="text-2xl font-bold">{pendingEvents.length}</span><span className="block text-sm text-ink/60">pending cards</span></div>
            <div className="rounded bg-paper p-3"><span className="text-2xl font-bold">{events.filter((event) => event.source_url).length}</span><span className="block text-sm text-ink/60">imported</span></div>
          </div>
        </div>
        <form action="/api/admin/sources" method="post" className="rounded border border-ink/10 bg-white p-5 shadow-sm">
          <h2 className="text-xl font-bold">Add source URL</h2>
          <div className="mt-4 grid gap-3">
            <label className="text-sm font-medium">Source name<input required name="name" className="focus-ring mt-1 min-h-10 w-full rounded border border-ink/15 px-3" /></label>
            <label className="text-sm font-medium">URL<input required type="url" name="url" className="focus-ring mt-1 min-h-10 w-full rounded border border-ink/15 px-3" /></label>
            <label className="text-sm font-medium">Default city<select name="city_id" className="focus-ring mt-1 min-h-10 w-full rounded border border-ink/15 px-3"><option value="">Auto-detect</option>{cities.map((city) => <option key={city.id} value={city.id}>{city.name}</option>)}</select></label>
            <label className="text-sm font-medium">Default category<select name="category_id" className="focus-ring mt-1 min-h-10 w-full rounded border border-ink/15 px-3"><option value="">Auto-detect</option>{categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select></label>
            <label className="flex min-h-10 items-center gap-2 text-sm font-medium"><input type="checkbox" name="is_active" value="1" defaultChecked /> Active</label>
            <label className="text-sm font-medium">Notes<textarea name="notes" rows={2} className="focus-ring mt-1 w-full rounded border border-ink/15 px-3 py-2" /></label>
            <input type="hidden" name="action" value="save" />
            <button className="min-h-10 rounded bg-lake px-3 py-2 font-semibold text-white">Save Source</button>
          </div>
        </form>
      </section>
      <section className="rounded border border-ink/10 bg-white shadow-sm">
        <div className="border-b border-ink/10 p-4">
          <h2 className="text-xl font-bold">Source URLs</h2>
        </div>
        <div className="grid gap-4 p-4">
          {sources.map((source) => (
            <div key={source.id} className="rounded border border-ink/10 bg-paper p-4">
              <form action="/api/admin/sources" method="post" className="grid gap-3 lg:grid-cols-[1fr_1.2fr_0.9fr_0.9fr_auto] lg:items-end">
                <input type="hidden" name="id" value={source.id} />
                <input type="hidden" name="action" value="save" />
                <label className="text-sm font-medium">
                  Source name
                  <input required name="name" defaultValue={source.name} className="focus-ring mt-1 min-h-10 w-full rounded border border-ink/15 bg-white px-3" />
                </label>
                <label className="text-sm font-medium">
                  URL
                  <input required type="url" name="url" defaultValue={source.url} className="focus-ring mt-1 min-h-10 w-full rounded border border-ink/15 bg-white px-3" />
                </label>
                <label className="text-sm font-medium">
                  Default city
                  <select name="city_id" defaultValue={source.city_id ?? ""} className="focus-ring mt-1 min-h-10 w-full rounded border border-ink/15 bg-white px-3">
                    <option value="">Auto city</option>
                    {cities.map((city) => <option key={city.id} value={city.id}>{city.name}</option>)}
                  </select>
                </label>
                <label className="text-sm font-medium">
                  Default category
                  <select name="category_id" defaultValue={source.category_id ?? ""} className="focus-ring mt-1 min-h-10 w-full rounded border border-ink/15 bg-white px-3">
                    <option value="">Auto category</option>
                    {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
                  </select>
                </label>
                <button className="min-h-10 rounded bg-lake px-3 py-2 text-sm font-semibold text-white">Save</button>
                <label className="flex min-h-10 items-center gap-2 text-sm font-medium">
                  <input type="checkbox" name="is_active" value="1" defaultChecked={source.is_active} /> Active
                </label>
                <label className="text-sm font-medium lg:col-span-3">
                  Notes
                  <textarea name="notes" rows={2} defaultValue={source.notes ?? ""} className="focus-ring mt-1 w-full rounded border border-ink/15 bg-white px-3 py-2" />
                </label>
                <p className="text-sm text-ink/60 lg:text-right">
                  Last checked: {source.last_checked_at ? new Date(source.last_checked_at).toLocaleString() : "Not checked"}
                </p>
              </form>
              <form action="/api/admin/sources" method="post" className="mt-3">
                <input type="hidden" name="id" value={source.id} />
                <input type="hidden" name="action" value="delete" />
                <input type="hidden" name="name" value={source.name} />
                <input type="hidden" name="url" value={source.url} />
                <input type="hidden" name="city_id" value={source.city_id ?? ""} />
                <input type="hidden" name="category_id" value={source.category_id ?? ""} />
                <button className="rounded border border-berry/30 px-3 py-2 text-xs font-semibold text-berry">Delete Source</button>
              </form>
            </div>
          ))}
          {!sources.length && <p className="text-sm text-ink/60">No sources yet. Add a city, venue, library, chamber, or events calendar URL to start.</p>}
        </div>
      </section>
      <div className="overflow-x-auto rounded border border-ink/10 bg-white shadow-sm">
        <div className="border-b border-ink/10 p-4">
          <h2 className="text-xl font-bold">Event cards</h2>
        </div>
        <table className="w-full min-w-[900px] text-left text-sm">
          <thead className="border-b border-ink/10 bg-paper text-ink/65">
            <tr>
              <th className="p-3">Event</th>
              <th className="p-3">Date</th>
              <th className="p-3">City</th>
              <th className="p-3">Status</th>
              <th className="p-3">Source</th>
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
                <td className="p-3 text-ink/70">{event.source_url ? <a className="text-lake" href={event.source_url} target="_blank" rel="noreferrer">Imported</a> : "Manual"}</td>
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
