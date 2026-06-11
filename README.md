# NEO Weekend Guide

A local events directory MVP for Northeast Ohio, focused first on North Ridgeville and nearby cities.

## Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- Neon Postgres database architecture
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

The app renders with built-in sample data when `DATABASE_URL` is empty.

## Neon Setup

1. Create a Neon project.
2. Copy your Neon pooled connection string into `DATABASE_URL`.
3. Run `db/schema.sql` in the Neon SQL editor.
4. Add `DATABASE_URL` to `.env.local`.
5. Seed data:

   ```bash
   npm run seed
   ```

Public pages read published events. Route handlers use `DATABASE_URL` for event submissions, newsletter signups, admin actions, and imports.

## Admin

Set `ADMIN_PASSWORD` in `.env.local`. Visit `/admin/login`, enter the password, then open `/admin`.

The current admin auth is intentionally simple for the MVP. It is structured so a full auth system can replace the token gate later.

## Event Import Bot

The admin dashboard includes a review-first event finder:

1. Add source URLs in `/admin`.
2. Click `Run Bot`.
3. The bot checks active source URLs.
4. It creates imported event cards with `status = pending`.
5. Review, approve, reject, feature, or delete each card in the admin table.

The bot first looks for Schema.org `Event` JSON-LD on source pages. If `OPENAI_API_KEY` is set, it can also use AI extraction for messy pages. `OPENAI_MODEL` defaults to `gpt-4o-mini` when omitted. The bot does not publish events automatically.

For an existing Neon database, run the SQL in `db/migrations/20260610_event_imports.sql`.

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
- `DATABASE_URL`
- `ADMIN_ACCESS_TOKEN`
- `ADMIN_PASSWORD`
- `OPENAI_API_KEY`
- `OPENAI_MODEL`

Use the default Next.js build command:

```bash
npm run build
```

## Future TODOs

- Replace token admin gate with real admin auth.
- Add event image uploads with object storage.
- Add automated event imports from approved source URLs.
- Add paid featured listings and sponsor placements.
- Add weekly newsletter sending through Mailchimp, ConvertKit, or Resend.
- Add map view for city and event pages.
- Add organizer profile claiming.
- Expand beyond the launch cities across all of Northeast Ohio.
