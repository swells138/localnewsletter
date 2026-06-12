import { formatEventDate, siteUrl, validExternalUrl } from "@/lib/format";
import type { EventWithRelations, NewsletterSubscriber } from "@/lib/types";

type SendNewsletterInput = {
  events: EventWithRelations[];
  subscribers: NewsletterSubscriber[];
};

type SendEmailInput = {
  to: string;
  subject: string;
  text: string;
  html: string;
};

const fromEmail = () => process.env.SENDGRID_FROM_EMAIL || process.env.NEWSLETTER_FROM_EMAIL;

export const hasSendGridConfig = () => Boolean(process.env.SENDGRID_API_KEY && fromEmail());

export class SendGridMailError extends Error {
  status: number;
  body: string;

  constructor(status: number, body: string) {
    super(`SendGrid error ${status}: ${body}`);
    this.name = "SendGridMailError";
    this.status = status;
    this.body = body;
  }
}

export const sendGridErrorCode = (error: unknown) => {
  if (error instanceof SendGridMailError) {
    if (error.status === 401) return "sendgrid-auth";
    if (error.status === 403) return "sendgrid-forbidden";
    if (error.status === 400) {
      const body = error.body.toLowerCase();
      if (body.includes("from") || body.includes("sender")) return "sendgrid-sender";
      return "sendgrid-bad-request";
    }
  }

  return "error";
};

const eventLink = (event: EventWithRelations) => validExternalUrl(event.event_url) ?? `${siteUrl()}/events/${event.slug}`;

const renderHtml = (events: EventWithRelations[]) => {
  const items = events
    .map((event) => {
      const url = eventLink(event);
      const location = [event.venue_name, event.city.name].filter(Boolean).join(" · ");
      const category = [event.price_text, event.category.name].filter(Boolean).join(" · ");
      return `
        <li style="margin:0 0 18px;padding:0 0 18px;border-bottom:1px solid #e5e0d8;">
          <h2 style="margin:0 0 6px;font-size:18px;line-height:1.3;">
            <a href="${url}" style="color:#216f80;text-decoration:none;">${event.title}</a>
          </h2>
          <p style="margin:0 0 4px;color:#42514d;">${formatEventDate(event)}</p>
          ${location ? `<p style="margin:0 0 4px;color:#42514d;">${location}</p>` : ""}
          ${category ? `<p style="margin:0;color:#42514d;">${category}</p>` : ""}
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
    ...events.flatMap((event) =>
      [
        event.title,
        formatEventDate(event),
        [event.venue_name, event.city.name].filter(Boolean).join(" · "),
        [event.price_text, event.category.name].filter(Boolean).join(" · "),
        eventLink(event),
        ""
      ].filter((line) => line !== "")
    )
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

  const response = await sendSendGridEmail({
    personalizations: subscribers.map((subscriber) => ({
      to: [{ email: subscriber.email }]
    })),
    subject: "Top Northeast Ohio events this week",
    text: renderText(events),
    html: renderHtml(events)
  });

  if (!response.ok) {
    const message = await response.text();
    throw new SendGridMailError(response.status, message);
  }

  return { sent: subscribers.length };
};

const sendSendGridEmail = async ({
  personalizations,
  subject,
  text,
  html
}: {
  personalizations: Array<{ to: Array<{ email: string }> }>;
  subject: string;
  text: string;
  html: string;
}) => {
  return fetch("https://api.sendgrid.com/v3/mail/send", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.SENDGRID_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      personalizations,
      from: { email: fromEmail(), name: "NEO Weekend Guide" },
      subject,
      content: [
        { type: "text/plain", value: text },
        { type: "text/html", value: html }
      ]
    })
  });
};

export const sendTestEmail = async ({ to, subject, text, html }: SendEmailInput) => {
  if (!hasSendGridConfig()) {
    throw new Error("Missing SENDGRID_API_KEY or SENDGRID_FROM_EMAIL.");
  }

  const response = await sendSendGridEmail({
    personalizations: [{ to: [{ email: to }] }],
    subject,
    text,
    html
  });

  if (!response.ok) {
    const message = await response.text();
    throw new SendGridMailError(response.status, message);
  }

  return { sent: 1 };
};
