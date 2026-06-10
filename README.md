# NEO Weekend Guide

A local events directory MVP for Northeast Ohio, focused first on North Ridgeville and nearby cities.

## Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- Supabase database/auth/storage-ready architecture
- Vercel-ready environment configuration

## Local Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Copy environment variables:

   ```bash
   cp .env.example .env.local
   ```

3. Start the app:

   ```bash
   npm run dev
   ```

The app renders with built-in sample data when Supabase variables are empty.

## Supabase Setup

1. Create a Supabase project.
2. Run `supabase/schema.sql` in the SQL editor.
3. Add `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, and `SUPABASE_SERVICE_ROLE_KEY` to `.env.local`.
4. Seed data:

   ```bash
   npm run seed
   ```

Public pages read published events. Route handlers use the service role key for event submissions, newsletter signups, and admin actions.

## Admin

Set `ADMIN_ACCESS_TOKEN` in `.env.local`. Visit `/admin/login`, enter the token, then open `/admin`.

The current admin auth is intentionally simple for the MVP. It is structured so Supabase Auth can replace the token gate later.

## Core Routes

- `/` home page
- `/events` filterable event listing
- `/events/[slug]` event details with Schema.org Event JSON-LD
- `/cities/[citySlug]` city SEO pages
- `/categories/[categorySlug]` category SEO pages
- `/submit-event` public organizer submission form
- `/admin` event review dashboard
- `/sitemap.xml` dynamic sitemap
- `/robots.txt` robots rules

## Vercel Notes

Add these environment variables in Vercel:

- `NEXT_PUBLIC_SITE_URL`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `ADMIN_ACCESS_TOKEN`

Use the default Next.js build command:

```bash
npm run build
```

## Future TODOs

- Replace token admin gate with Supabase Auth roles.
- Add event image uploads with Supabase Storage.
- Add automated event imports from approved source URLs.
- Add paid featured listings and sponsor placements.
- Add weekly newsletter sending through Mailchimp, ConvertKit, or Resend.
- Add map view for city and event pages.
- Add organizer profile claiming.
- Expand beyond the launch cities across all of Northeast Ohio.
