import type { Category, City } from "@/lib/types";

export function NewsletterForm({ cities, categories }: { cities: City[]; categories: Category[] }) {
  return (
    <form action="/api/newsletter" method="post" className="grid gap-3 rounded border border-ink/10 bg-ink p-4 text-white md:grid-cols-[1.4fr_1fr_1.2fr_auto]">
      <label>
        <span className="mb-1 block text-sm font-medium text-white/80">Email</span>
        <input required type="email" name="email" placeholder="you@example.com" className="focus-ring min-h-11 w-full rounded border border-white/20 bg-white px-3 text-ink" />
      </label>
      <label>
        <span className="mb-1 block text-sm font-medium text-white/80">Preferred city</span>
        <select name="preferred_city_id" className="focus-ring min-h-11 w-full rounded border border-white/20 bg-white px-3 text-ink">
          <option value="">Any city</option>
          {cities.map((city) => <option key={city.id} value={city.id}>{city.name}</option>)}
        </select>
      </label>
      <label>
        <span className="mb-1 block text-sm font-medium text-white/80">Interests</span>
        <select name="interests" className="focus-ring min-h-11 w-full rounded border border-white/20 bg-white px-3 text-ink">
          <option value="">All events</option>
          {categories.map((category) => <option key={category.id} value={category.slug}>{category.name}</option>)}
        </select>
      </label>
      <button className="focus-ring self-end rounded bg-amber px-4 py-3 font-semibold text-ink">Get Weekend Events by Email</button>
    </form>
  );
}
