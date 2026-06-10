import type { Metadata } from "next";
import { PageShell } from "@/components/page-shell";
import { getCategories, getCities } from "@/lib/data";

export const metadata: Metadata = {
  title: "Submit an Event",
  description: "Submit a Northeast Ohio event for editorial review."
};

export default async function SubmitEventPage() {
  const [cities, categories] = await Promise.all([getCities(), getCategories()]);

  return (
    <PageShell className="grid gap-8">
      <section className="max-w-3xl">
        <p className="text-sm font-semibold uppercase tracking-wide text-lake">Organizer submissions</p>
        <h1 className="mt-2 text-4xl font-bold tracking-tight">Submit an Event</h1>
        <p className="mt-4 text-lg leading-8 text-ink/72">Send local events for review. Approved events appear in the public guide after an editor checks the details.</p>
      </section>
      <form action="/api/submit-event" method="post" className="grid gap-4 rounded border border-ink/10 bg-white p-5 shadow-sm md:grid-cols-2">
        <label className="md:col-span-2">Event title<input required name="title" className="focus-ring mt-1 min-h-11 w-full rounded border border-ink/15 px-3" /></label>
        <label className="md:col-span-2">Description<textarea required name="description" rows={5} className="focus-ring mt-1 w-full rounded border border-ink/15 px-3 py-2" /></label>
        <label>Start date/time<input required type="datetime-local" name="start_datetime" className="focus-ring mt-1 min-h-11 w-full rounded border border-ink/15 px-3" /></label>
        <label>End date/time<input required type="datetime-local" name="end_datetime" className="focus-ring mt-1 min-h-11 w-full rounded border border-ink/15 px-3" /></label>
        <label>Venue name<input required name="venue_name" className="focus-ring mt-1 min-h-11 w-full rounded border border-ink/15 px-3" /></label>
        <label>Address<input required name="address" className="focus-ring mt-1 min-h-11 w-full rounded border border-ink/15 px-3" /></label>
        <label>City<select required name="city_id" className="focus-ring mt-1 min-h-11 w-full rounded border border-ink/15 px-3"><option value="">Choose city</option>{cities.map((city) => <option key={city.id} value={city.id}>{city.name}</option>)}</select></label>
        <label>Category<select required name="category_id" className="focus-ring mt-1 min-h-11 w-full rounded border border-ink/15 px-3"><option value="">Choose category</option>{categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select></label>
        <label>Cost<input required name="price_text" placeholder="Free, $10, donation, etc." className="focus-ring mt-1 min-h-11 w-full rounded border border-ink/15 px-3" /></label>
        <label>Event URL<input required type="url" name="event_url" className="focus-ring mt-1 min-h-11 w-full rounded border border-ink/15 px-3" /></label>
        <label>Organizer name<input required name="organizer_name" className="focus-ring mt-1 min-h-11 w-full rounded border border-ink/15 px-3" /></label>
        <label>Organizer email<input required type="email" name="organizer_email" className="focus-ring mt-1 min-h-11 w-full rounded border border-ink/15 px-3" /></label>
        <label className="flex items-center gap-2"><input type="checkbox" name="is_free" value="1" /> Free event</label>
        <label className="flex items-center gap-2"><input type="checkbox" name="is_family_friendly" value="1" /> Family-friendly</label>
        <label className="hidden">Leave blank<input name="website" tabIndex={-1} autoComplete="off" /></label>
        <div className="md:col-span-2">
          <button className="min-h-11 rounded bg-lake px-4 py-2 font-semibold text-white">Submit for Review</button>
        </div>
      </form>
    </PageShell>
  );
}
