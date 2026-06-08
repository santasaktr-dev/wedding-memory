import { NextResponse } from "next/server";
import { getPhotoBytes, isGoogleStoreConfigured } from "@/lib/google-store";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const fileId = searchParams.get("id");

  if (!fileId) {
    return NextResponse.json({ error: "Missing photo ID" }, { status: 400 });
  }

  if (!isGoogleStoreConfigured) {
    return NextResponse.json({ error: "Google Store not configured" }, { status: 503 });
  }

  try {
    const result = await getPhotoBytes(fileId);
    if (!result || !result.file_base64) {
      return NextResponse.json({ error: "Photo not found" }, { status: 404 });
    }

    const imageBuffer = Buffer.from(result.file_base64, "base64");
    const contentType = result.file_type || "image/jpeg";

    return new Response(imageBuffer, {
      headers: {
        "Content-Type": contentType,
        // Cache for 1 year publicly: immutable and cached by browser/CDN
        "Cache-Control": "public, max-age=31536000, immutable"
      }
    });
  } catch (error) {
    console.error("Error proxying image:", error);
    return NextResponse.json({ error: "Error fetching photo" }, { status: 500 });
  }
}
