import { cookies } from "next/headers";

export const adminCookieName = "neo_admin";

export const getAdminPassword = () => process.env.ADMIN_PASSWORD ?? process.env.ADMIN_ACCESS_TOKEN ?? "change-me-before-deploy";

export const isAdminRequest = async () => {
  const token = (await cookies()).get(adminCookieName)?.value;
  return Boolean(token && token === getAdminPassword());
};
