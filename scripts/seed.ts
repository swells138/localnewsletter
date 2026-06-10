import { getSql } from "../lib/db";
import { categories, cities, events } from "../lib/sample-data";

if (!process.env.DATABASE_URL) {
  throw new Error("Set DATABASE_URL before running npm run seed.");
}

const sql = getSql();

const main = async () => {
  const cityRows = [];
  for (const { id: _id, ...city } of cities) {
    const [row] = await sql`
      insert into cities (name, slug, county, state, latitude, longitude, seo_title, seo_description, intro_text)
      values (${city.name}, ${city.slug}, ${city.county}, ${city.state}, ${city.latitude}, ${city.longitude}, ${city.seo_title}, ${city.seo_description}, ${city.intro_text})
      on conflict (slug) do update set
        name = excluded.name,
        county = excluded.county,
        state = excluded.state,
        latitude = excluded.latitude,
        longitude = excluded.longitude,
        seo_title = excluded.seo_title,
        seo_description = excluded.seo_description,
        intro_text = excluded.intro_text
      returning id, slug
    `;
    cityRows.push(row as { id: string; slug: string });
  }

  const categoryRows = [];
  for (const { id: _id, ...category } of categories) {
    const [row] = await sql`
      insert into categories (name, slug, description)
      values (${category.name}, ${category.slug}, ${category.description})
      on conflict (slug) do update set
        name = excluded.name,
        description = excluded.description
      returning id, slug
    `;
    categoryRows.push(row as { id: string; slug: string });
  }

  const cityBySlug = new Map(cityRows.map((city) => [city.slug, city.id]));
  const categoryBySlug = new Map(categoryRows.map((category) => [category.slug, category.id]));
  const localCityById = new Map(cities.map((city) => [city.id, city.slug]));
  const localCategoryById = new Map(categories.map((category) => [category.id, category.slug]));

  for (const { id: _id, created_at: _createdAt, updated_at: _updatedAt, city_id, category_id, ...event } of events) {
    const citySlug = localCityById.get(city_id);
    const categorySlug = localCategoryById.get(category_id);
    const realCityId = citySlug ? cityBySlug.get(citySlug) : null;
    const realCategoryId = categorySlug ? categoryBySlug.get(categorySlug) : null;

    if (!realCityId || !realCategoryId) {
      throw new Error(`Missing relation for ${event.title}`);
    }

    await sql`
      insert into events (
        title, slug, description, start_datetime, end_datetime, venue_name, address,
        city_id, category_id, price_text, is_free, is_family_friendly, event_url,
        organizer_name, organizer_email, image_url, status, is_featured
      ) values (
        ${event.title}, ${event.slug}, ${event.description}, ${event.start_datetime}, ${event.end_datetime},
        ${event.venue_name}, ${event.address}, ${realCityId}, ${realCategoryId}, ${event.price_text},
        ${event.is_free}, ${event.is_family_friendly}, ${event.event_url}, ${event.organizer_name},
        ${event.organizer_email}, ${event.image_url}, ${event.status}, ${event.is_featured}
      )
      on conflict (slug) do update set
        title = excluded.title,
        description = excluded.description,
        start_datetime = excluded.start_datetime,
        end_datetime = excluded.end_datetime,
        venue_name = excluded.venue_name,
        address = excluded.address,
        city_id = excluded.city_id,
        category_id = excluded.category_id,
        price_text = excluded.price_text,
        is_free = excluded.is_free,
        is_family_friendly = excluded.is_family_friendly,
        event_url = excluded.event_url,
        organizer_name = excluded.organizer_name,
        organizer_email = excluded.organizer_email,
        image_url = excluded.image_url,
        status = excluded.status,
        is_featured = excluded.is_featured
    `;
  }

  console.log(`Seeded ${cities.length} cities, ${categories.length} categories, and ${events.length} events.`);
};

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
