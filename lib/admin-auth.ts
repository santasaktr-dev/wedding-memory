import { cookies } from "next/headers";

const cookieName = "wedding-admin";

export function isAdminPasswordConfigured() {
  return Boolean(process.env.ADMIN_PASSWORD);
}

export async function isAdminAuthenticated() {
  const password = process.env.ADMIN_PASSWORD;

  if (!password) {
    return true;
  }

  const cookieStore = await cookies();
  return cookieStore.get(cookieName)?.value === password;
}

export async function setAdminSession(password: string) {
  const cookieStore = await cookies();
  cookieStore.set(cookieName, password, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 12
  });
}

export async function clearAdminSession() {
  const cookieStore = await cookies();
  cookieStore.delete(cookieName);
}
