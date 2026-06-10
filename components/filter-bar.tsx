import { Search } from "lucide-react";
import type { Category, City } from "@/lib/types";

export function FilterBar({ cities, categories, showSearch = true }: { cities: City[]; categories: Category[]; showSearch?: boolean }) {
  return (
    <form action="/events" className="grid gap-3 rounded border border-ink/10 bg-white p-3 shadow-sm md:grid-cols-[1.2fr_1fr_1fr_1fr_auto]">
      {showSearch && (
        <label className="relative">
          <span className="sr-only">Search events</span>
          <Search className="pointer-events-none absolute left-3 top-3 text-ink/45" size={18} />
          <input name="q" placeholder="Search events" className="focus-ring min-h-11 w-full rounded border border-ink/15 bg-paper py-2 pl-10 pr-3" />
        </label>
      )}
      <select name="city" aria-label="City" className="focus-ring min-h-11 rounded border border-ink/15 bg-paper px-3">
        <option value="">All cities</option>
        {cities.map((city) => <option key={city.id} value={city.slug}>{city.name}</option>)}
      </select>
      <select name="date" aria-label="Date" className="focus-ring min-h-11 rounded border border-ink/15 bg-paper px-3">
        <option value="this-weekend">This weekend</option>
        <option value="today">Today</option>
        <option value="tomorrow">Tomorrow</option>
        <option value="next-7-days">Next 7 days</option>
      </select>
      <select name="category" aria-label="Category" className="focus-ring min-h-11 rounded border border-ink/15 bg-paper px-3">
        <option value="">All categories</option>
        {categories.map((category) => <option key={category.id} value={category.slug}>{category.name}</option>)}
      </select>
      <div className="flex flex-wrap items-center gap-3 text-sm">
        <label className="flex min-h-10 items-center gap-2"><input type="checkbox" name="free" value="1" /> Free</label>
        <label className="flex min-h-10 items-center gap-2"><input type="checkbox" name="family" value="1" /> Family</label>
        <button className="focus-ring min-h-10 rounded bg-lake px-4 py-2 font-semibold text-white">View Events</button>
      </div>
    </form>
  );
}
