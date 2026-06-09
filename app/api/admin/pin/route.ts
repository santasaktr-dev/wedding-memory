import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { pinSubmission } from "@/lib/google-store";

export async function POST(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const payload = (await request.json()) as {
    content_type?: "wish" | "photo";
    id?: string;
    is_pinned?: boolean;
  };

  if (!payload.content_type || !payload.id || typeof payload.is_pinned !== "boolean") {
    return NextResponse.json({ error: "Invalid pin request" }, { status: 400 });
  }

  await pinSubmission({
    content_type: payload.content_type,
    id: payload.id,
    is_pinned: payload.is_pinned
  });

  return NextResponse.json({ ok: true });
}
