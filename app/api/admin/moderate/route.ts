import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { moderateSubmission } from "@/lib/google-store";
import type { SubmissionStatus } from "@/lib/types";

export async function POST(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const payload = (await request.json()) as {
    content_type?: "wish" | "photo";
    id?: string;
    status?: SubmissionStatus;
  };

  if (!payload.content_type || !payload.id || !payload.status) {
    return NextResponse.json({ error: "Invalid moderation request" }, { status: 400 });
  }

  await moderateSubmission({
    content_type: payload.content_type,
    id: payload.id,
    status: payload.status
  });

  return NextResponse.json({ ok: true });
}
