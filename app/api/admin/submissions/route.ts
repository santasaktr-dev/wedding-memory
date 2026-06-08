import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { listAdminSubmissions } from "@/lib/google-store";
import { samplePhotos, sampleWishes } from "@/lib/mock-data";

export async function GET() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const submissions = await listAdminSubmissions();

  return NextResponse.json(
    submissions ?? {
      wishes: sampleWishes.map((wish) => ({ ...wish, status: "pending" })),
      photos: samplePhotos.map((photo) => ({ ...photo, status: "pending" }))
    }
  );
}
