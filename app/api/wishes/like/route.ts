import { NextResponse } from "next/server";
import { likeSubmission, isGoogleStoreConfigured } from "@/lib/google-store";

export async function POST(request: Request) {
  try {
    const { id, unlike } = (await request.json()) as { id: string; unlike?: boolean };

    if (!id) {
      return NextResponse.json({ error: "Missing wish ID" }, { status: 400 });
    }

    if (!isGoogleStoreConfigured) {
      return NextResponse.json({ ok: true, likes_count: unlike ? 0 : 1 });
    }

    const result = await likeSubmission({
      content_type: "wish",
      id,
      unlike
    });

    if (!result?.ok) {
      return NextResponse.json({ error: "Failed to update likes" }, { status: 500 });
    }

    return NextResponse.json({ ok: true, likes_count: result.likes_count ?? (unlike ? 0 : 1) });
  } catch (error) {
    console.error("Error liking wish:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
