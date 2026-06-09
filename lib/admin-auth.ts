import { cookies } from "next/headers";
import { createHmac, timingSafeEqual } from "crypto";

const cookieName = "wedding-admin";
const sessionSalt = "jajah-smart-wedding-admin-session";

export function isAdminPasswordConfigured() {
  return Boolean(process.env.ADMIN_PASSWORD);
}

function sessionToken(password: string) {
  return createHmac("sha256", password).update(sessionSalt).digest("hex");
}

function safeCompare(left: string, right: string) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);

  return leftBuffer.length === rightBuffer.length && timingSafeEqual(leftBuffer, rightBuffer);
}

export async function isAdminAuthenticated() {
  const password = process.env.ADMIN_PASSWORD;

  if (!password) {
    return process.env.NODE_ENV !== "production";
  }

  const cookieStore = await cookies();
  const token = cookieStore.get(cookieName)?.value;

  return Boolean(token && safeCompare(token, sessionToken(password)));
}

export async function setAdminSession(password: string) {
  const cookieStore = await cookies();
  cookieStore.set(cookieName, sessionToken(password), {
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
