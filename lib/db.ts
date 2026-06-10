import { neon } from "@neondatabase/serverless";

export const hasDatabaseConfig = Boolean(process.env.DATABASE_URL);

export const getSql = () => {
  if (!process.env.DATABASE_URL) {
    throw new Error("Missing DATABASE_URL.");
  }

  return neon(process.env.DATABASE_URL);
};
