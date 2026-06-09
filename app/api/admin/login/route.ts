import { NextResponse } from "next/server";
import { setAdminSession } from "@/lib/admin-auth";

export async function POST(request: Request) {
  const formData = await request.formData();
  const username = String(formData.get("username") || "");
  const password = String(formData.get("password") || "");

  if (!process.env.ADMIN_PASSWORD && process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Admin password is not configured" }, { status: 503 });
  }

  if (process.env.ADMIN_USERNAME && username !== process.env.ADMIN_USERNAME) {
    return NextResponse.json({ error: "Invalid username" }, { status: 401 });
  }

  if (process.env.ADMIN_PASSWORD && password !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: "Invalid password" }, { status: 401 });
  }

  await setAdminSession(password);
  return NextResponse.json({ ok: true });
}
