import { loadEnvConfig } from "@next/env";
import { seedDatabase } from "../lib/seed";

loadEnvConfig(process.cwd());

if (!process.env.DATABASE_URL) {
  throw new Error("Set DATABASE_URL before running npm run seed.");
}

seedDatabase()
  .then((result) => {
    console.log(`Seeded ${result.cities} cities, ${result.categories} categories, and ${result.events} events.`);
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
