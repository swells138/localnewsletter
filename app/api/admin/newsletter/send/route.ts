import { addDays } from "date-fns";
import { isAdminRequest } from "@/lib/admin/auth";
import { getEvents, getNewsletterSubscribers } from "@/lib/data";
import { hasSendGridConfig, sendGridErrorCode, sendWeeklyNewsletter } from "@/lib/newsletter";
import { redirectAfterPost } from "@/lib/redirect";

export async function POST(request: Request) {
  if (!(await isAdminRequest())) return redirectAfterPost("/admin/login", request.url);
  if (!hasSendGridConfig()) return redirectAfterPost("/admin?newsletter=needs-sendgrid", request.url);

  const [events, subscribers] = await Promise.all([
    getEvents({ date: "next-7-days" }),
    getNewsletterSubscribers()
  ]);
  const end = addDays(new Date(), 7);
  const topEvents = events
    .filter((event) => new Date(event.start_datetime) <= end)
    .sort((a, b) => Number(b.is_featured) - Number(a.is_featured) || a.start_datetime.localeCompare(b.start_datetime))
    .slice(0, 8);

  try {
    const result = await sendWeeklyNewsletter({ events: topEvents, subscribers });
    return redirectAfterPost(`/admin?newsletter=sent&count=${result.sent}&events=${topEvents.length}`, request.url);
  } catch (error) {
    console.error("Failed to send newsletter", error);
    return redirectAfterPost(`/admin?newsletter=${sendGridErrorCode(error)}`, request.url);
  }
}
