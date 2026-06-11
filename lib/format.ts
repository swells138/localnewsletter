import { format, parseISO } from "date-fns";
import type { EventWithRelations } from "@/lib/types";

export const formatEventDate = (event: Pick<EventWithRelations, "start_datetime" | "end_datetime">) => {
  const start = parseISO(event.start_datetime);
  const end = parseISO(event.end_datetime);
  return `${format(start, "EEE, MMM d")} · ${format(start, "h:mm a")} - ${format(end, "h:mm a")}`;
};

export const siteUrl = () => process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ?? "http://localhost:3000";

export const validExternalUrl = (value?: string | null) => {
  if (!value) return null;

  try {
    const url = new URL(value);
    if (!["http:", "https:"].includes(url.protocol)) return null;
    if (url.hostname === "example.com" || url.hostname.endsWith(".example.com")) return null;
    return url.toString();
  } catch {
    return null;
  }
};

export const calendarUrl = (event: EventWithRelations) => {
  const start = event.start_datetime.replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  const end = event.end_datetime.replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: event.title,
    dates: `${start}/${end}`,
    details: [event.description, validExternalUrl(event.event_url)].filter(Boolean).join("\n\n"),
    location: `${event.venue_name}, ${event.address}`
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
};
