import { NextResponse } from "next/server";
import { setAdminSession } from "@/lib/admin-auth";

export async function POST(request: Request) {
  const formData = await request.formData();
  const password = String(formData.get("password") || "");

  if (process.env.ADMIN_PASSWORD && password !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: "Invalid password" }, { status: 401 });
  }

  await setAdminSession(password);
  return NextResponse.json({ ok: true });
}
