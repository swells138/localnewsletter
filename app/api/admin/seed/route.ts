import { isAdminRequest } from "@/lib/admin/auth";
import { hasDatabaseConfig } from "@/lib/db";
import { redirectAfterPost } from "@/lib/redirect";
import { seedDatabase } from "@/lib/seed";

export async function POST(request: Request) {
  if (!(await isAdminRequest())) return redirectAfterPost("/admin/login", request.url);
  if (!hasDatabaseConfig) return redirectAfterPost("/admin?seed=needs-database", request.url);

  try {
    const result = await seedDatabase();
    return redirectAfterPost(`/admin?seed=complete&cities=${result.cities}&categories=${result.categories}&events=${result.events}`, request.url);
  } catch (error) {
    console.error("Failed to seed database", error);
    return redirectAfterPost("/admin?seed=error", request.url);
  }
}
