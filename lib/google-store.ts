import type { PhotoMoment, SubmissionStatus, Wish } from "@/lib/types";

const googleEndpoint = process.env.GOOGLE_APPS_SCRIPT_URL;
const googleSecret = process.env.GOOGLE_APPS_SCRIPT_SECRET;

export const isGoogleStoreConfigured = Boolean(googleEndpoint);

type GoogleAction =
  | "createWish"
  | "createPhoto"
  | "listWishes"
  | "listPhotos"
  | "adminList"
  | "getPhotoBytes"
  | "moderate"
  | "likeSubmission";

async function callGoogleStore<T>(
  action: GoogleAction,
  payload: Record<string, unknown> = {}
): Promise<T | null> {
  if (!googleEndpoint) {
    return null;
  }

  const response = await fetch(googleEndpoint, {
    method: "POST",
    headers: {
      "Content-Type": "text/plain;charset=utf-8"
    },
    body: JSON.stringify({
      action,
      secret: googleSecret,
      ...payload
    }),
    cache: "no-store"
  });

  if (!response.ok) {
    throw new Error(`Google store request failed: ${response.status}`);
  }

  return (await response.json()) as T;
}

export async function createWish(payload: {
  guest_name: string;
  relationship: string | null;
  table_number: string | null;
  message_type: string;
  message: string;
}) {
  return callGoogleStore<{ ok: boolean; id?: string }>("createWish", payload);
}

export async function createPhoto(payload: {
  guest_name: string;
  table_number: string | null;
  caption: string | null;
  category: string;
  file_name: string;
  file_type: string;
  file_base64: string;
}) {
  return callGoogleStore<{ ok: boolean; id?: string; image_url?: string }>("createPhoto", payload);
}

export async function listApprovedWishes() {
  const result = await callGoogleStore<{ wishes: Wish[] }>("listWishes");
  return result?.wishes ?? null;
}

function mapPhotoUrls(photo: PhotoMoment): PhotoMoment {
  const url = photo.image_url;
  if (url && (url.includes("drive.google.com") || url.includes("lh3.googleusercontent.com") || url.startsWith("https://drive.google.com") || url.startsWith("https://lh3.googleusercontent.com"))) {
    let fileId: string | null = null;
    if (url.includes("id=")) {
      const match = url.match(/id=([^&]+)/);
      fileId = match ? match[1] : null;
    } else {
      const parts = url.split("/");
      fileId = parts[parts.length - 1] || null;
    }

    if (fileId) {
      const directUrl = `https://lh3.googleusercontent.com/d/${fileId}`;
      return {
        ...photo,
        image_url: directUrl,
        thumbnail_url: directUrl
      };
    }
  }
  return photo;
}

export async function getPhotoBytes(id: string) {
  return callGoogleStore<{ ok: boolean; file_base64: string; file_type: string }>("getPhotoBytes", { id });
}

export async function listApprovedPhotos() {
  const result = await callGoogleStore<{ photos: PhotoMoment[] }>("listPhotos");
  if (!result?.photos) return null;
  return result.photos.map(mapPhotoUrls);
}

export async function listVisibleWishes() {
  const result = await listAdminSubmissions();
  if (!result) return null;

  return result.wishes.filter((wish) => wish.status !== "hidden" && wish.status !== "deleted");
}

export async function listVisiblePhotos() {
  const result = await listAdminSubmissions();
  if (!result) return null;

  return result.photos.filter((photo) => photo.status !== "hidden" && photo.status !== "deleted");
}

export async function listAdminSubmissions() {
  const result = await callGoogleStore<{ wishes: Wish[]; photos: PhotoMoment[] }>("adminList");
  if (!result) return null;
  return {
    wishes: result.wishes || [],
    photos: (result.photos || []).map(mapPhotoUrls)
  };
}

export async function moderateSubmission(payload: {
  content_type: "wish" | "photo";
  id: string;
  status: SubmissionStatus;
}) {
  return callGoogleStore<{ ok: boolean }>("moderate", payload);
}

export async function likeSubmission(payload: {
  content_type: "wish" | "photo";
  id: string;
  unlike?: boolean;
}) {
  return callGoogleStore<{ ok: boolean; likes_count?: number }>("likeSubmission", payload);
}
