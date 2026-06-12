import { z } from "zod";
import { isAdminRequest } from "@/lib/admin/auth";
import { hasSendGridConfig, sendGridErrorCode, sendTestEmail } from "@/lib/newsletter";
import { redirectAfterPost } from "@/lib/redirect";

const schema = z.object({
  email: z.string().email()
});

export async function POST(request: Request) {
  if (!(await isAdminRequest())) return redirectAfterPost("/admin/login", request.url);
  if (!hasSendGridConfig()) return redirectAfterPost("/admin?newsletter=needs-sendgrid", request.url);

  const form = await request.formData();
  const parsed = schema.safeParse({ email: form.get("email") });
  if (!parsed.success) return redirectAfterPost("/admin?newsletter=invalid-test-email", request.url);

  try {
    await sendTestEmail({
      to: parsed.data.email,
      subject: "NEO Weekend Guide SendGrid test",
      text: "This is a SendGrid test email from NEO Weekend Guide.",
      html: "<p>This is a SendGrid test email from <strong>NEO Weekend Guide</strong>.</p>"
    });
    return redirectAfterPost(`/admin?newsletter=test-sent&email=${encodeURIComponent(parsed.data.email)}`, request.url);
  } catch (error) {
    console.error("Failed to send test newsletter", error);
    return redirectAfterPost(`/admin?newsletter=${sendGridErrorCode(error)}`, request.url);
  }
}
