import { formatEventDate, siteUrl, validExternalUrl } from "@/lib/format";
import type { EventWithRelations, NewsletterSubscriber } from "@/lib/types";

type SendNewsletterInput = {
  events: EventWithRelations[];
  subscribers: NewsletterSubscriber[];
};

const fromEmail = () => process.env.SENDGRID_FROM_EMAIL || process.env.NEWSLETTER_FROM_EMAIL;

export const hasSendGridConfig = () => Boolean(process.env.SENDGRID_API_KEY && fromEmail());

const eventLink = (event: EventWithRelations) => validExternalUrl(event.event_url) ?? `${siteUrl()}/events/${event.slug}`;

const renderHtml = (events: EventWithRelations[]) => {
  const items = events
    .map((event) => {
      const url = eventLink(event);
      return `
        <li style="margin:0 0 18px;padding:0 0 18px;border-bottom:1px solid #e5e0d8;">
          <h2 style="margin:0 0 6px;font-size:18px;line-height:1.3;">
            <a href="${url}" style="color:#216f80;text-decoration:none;">${event.title}</a>
          </h2>
          <p style="margin:0 0 4px;color:#42514d;">${formatEventDate(event)}</p>
          <p style="margin:0 0 4px;color:#42514d;">${event.venue_name} · ${event.city.name}</p>
          <p style="margin:0;color:#42514d;">${event.price_text} · ${event.category.name}</p>
        </li>
      `;
    })
    .join("");

  return `
    <div style="font-family:Arial,sans-serif;max-width:640px;margin:0 auto;color:#18211f;">
      <h1 style="font-size:28px;line-height:1.2;margin:0 0 8px;">Top Northeast Ohio events this week</h1>
      <p style="margin:0 0 24px;color:#42514d;">A quick weekend guide from NEO Weekend Guide.</p>
      <ul style="list-style:none;margin:0;padding:0;">${items}</ul>
      <p style="margin:24px 0 0;color:#66736f;font-size:13px;">You are receiving this because you subscribed to NEO Weekend Guide.</p>
    </div>
  `;
};

const renderText = (events: EventWithRelations[]) =>
  [
    "Top Northeast Ohio events this week",
    "",
    ...events.flatMap((event) => [
      event.title,
      formatEventDate(event),
      `${event.venue_name} · ${event.city.name}`,
      `${event.price_text} · ${event.category.name}`,
      eventLink(event),
      ""
    ])
  ].join("\n");

export const sendWeeklyNewsletter = async ({ events, subscribers }: SendNewsletterInput) => {
  if (!hasSendGridConfig()) {
    throw new Error("Missing SENDGRID_API_KEY or SENDGRID_FROM_EMAIL.");
  }

  if (!subscribers.length) {
    return { sent: 0 };
  }

  if (!events.length) {
    throw new Error("No published events available to send.");
  }

  const response = await fetch("https://api.sendgrid.com/v3/mail/send", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.SENDGRID_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      personalizations: subscribers.map((subscriber) => ({
        to: [{ email: subscriber.email }]
      })),
      from: { email: fromEmail(), name: "NEO Weekend Guide" },
      subject: "Top Northeast Ohio events this week",
      content: [
        { type: "text/plain", value: renderText(events) },
        { type: "text/html", value: renderHtml(events) }
      ]
    })
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(`SendGrid error ${response.status}: ${message}`);
  }

  return { sent: subscribers.length };
};
