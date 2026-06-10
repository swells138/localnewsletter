import { createClient } from "@supabase/supabase-js";
import { categories, cities, events } from "../lib/sample-data";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceRoleKey) {
  throw new Error("Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY before running npm run seed.");
}

const supabase = createClient(url, serviceRoleKey, {
  auth: { persistSession: false }
});

const main = async () => {
  const { data: cityRows, error: cityError } = await supabase
    .from("cities")
    .upsert(cities.map(({ id: _id, ...city }) => city), { onConflict: "slug" })
    .select("id, slug");
  if (cityError) throw cityError;

  const { data: categoryRows, error: categoryError } = await supabase
    .from("categories")
    .upsert(categories.map(({ id: _id, ...category }) => category), { onConflict: "slug" })
    .select("id, slug");
  if (categoryError) throw categoryError;

  const cityBySlug = new Map(cityRows?.map((city) => [city.slug, city.id]));
  const categoryBySlug = new Map(categoryRows?.map((category) => [category.slug, category.id]));
  const localCityById = new Map(cities.map((city) => [city.id, city.slug]));
  const localCategoryById = new Map(categories.map((category) => [category.id, category.slug]));

  const eventPayload = events.map(({ id: _id, created_at: _createdAt, updated_at: _updatedAt, city_id, category_id, ...event }) => {
    const citySlug = localCityById.get(city_id);
    const categorySlug = localCategoryById.get(category_id);
    return {
      ...event,
      city_id: citySlug ? cityBySlug.get(citySlug) : null,
      category_id: categorySlug ? categoryBySlug.get(categorySlug) : null
    };
  });

  const { error: eventError } = await supabase.from("events").upsert(eventPayload, { onConflict: "slug" });
  if (eventError) throw eventError;

  console.log(`Seeded ${cities.length} cities, ${categories.length} categories, and ${events.length} events.`);
};

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
