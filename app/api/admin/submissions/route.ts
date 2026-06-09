import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import {
  getPhotoLocalModerationDecision,
  getWishLocalModerationDecision
} from "@/lib/auto-moderation";
import { listAdminSubmissions, moderateSubmission } from "@/lib/google-store";
import { samplePhotos, sampleWishes } from "@/lib/mock-data";
import type { PhotoMoment, Wish } from "@/lib/types";

const useDevFallback = process.env.NODE_ENV !== "production";

async function reconcileUnsafeApprovedSubmissions(submissions: {
  wishes: Wish[];
  photos: PhotoMoment[];
}) {
  const wishes = await Promise.all(
    submissions.wishes.map(async (wish) => {
      if (wish.status !== "approved") return wish;

      const localDecision = getWishLocalModerationDecision({
        guestName: wish.guest_name,
        relationship: wish.relationship,
        tableNumber: wish.table_number,
        messageType: wish.message_type,
        message: wish.message
      });

      if (localDecision.status === "approved") return wish;

      await moderateSubmission({
        content_type: "wish",
        id: wish.id,
        status: localDecision.status
      });
      return { ...wish, status: localDecision.status };
    })
  );

  const photos = await Promise.all(
    submissions.photos.map(async (photo) => {
      if (photo.status !== "approved") return photo;

      const localDecision = getPhotoLocalModerationDecision({
        guestName: photo.guest_name,
        tableNumber: photo.table_number,
        caption: photo.caption,
        category: photo.category
      });

      if (localDecision.status === "approved") return photo;

      await moderateSubmission({
        content_type: "photo",
        id: photo.id,
        status: localDecision.status
      });
      return { ...photo, status: localDecision.status };
    })
  );

  return { wishes, photos };
}

export async function GET() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const submissions = await listAdminSubmissions();
  const reconciledSubmissions = submissions
    ? await reconcileUnsafeApprovedSubmissions(submissions)
    : null;

  return NextResponse.json(
    reconciledSubmissions ??
      (useDevFallback
        ? {
            wishes: sampleWishes,
            photos: samplePhotos
          }
        : {
            wishes: [],
            photos: []
          })
  );
}
