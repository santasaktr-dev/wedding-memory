export type SubmissionStatus = "pending" | "approved" | "hidden" | "deleted";

export type WishType =
  | "Wedding Wish"
  | "Memory"
  | "Advice"
  | "Funny Message"
  | "Thank You Note";

export type PhotoCategory =
  | "Couple Moment"
  | "Friends"
  | "Family"
  | "Ceremony"
  | "Reception"
  | "Behind the Scenes"
  | "Outfit / Dress Code"
  | "Funny Moment";

export type Wish = {
  id: string;
  guest_name: string;
  relationship: string | null;
  table_number: string | null;
  message_type: WishType;
  message: string;
  status: SubmissionStatus;
  likes_count: number;
  is_pinned: boolean;
  created_at: string;
  updated_at: string;
};

export type PhotoMoment = {
  id: string;
  guest_name: string;
  table_number: string | null;
  caption: string | null;
  category: PhotoCategory;
  image_url: string;
  thumbnail_url: string | null;
  status: SubmissionStatus;
  likes_count: number;
  created_at: string;
  updated_at: string;
};

export const wishTypes: WishType[] = [
  "Wedding Wish",
  "Memory",
  "Advice",
  "Funny Message",
  "Thank You Note"
];

export const photoCategories: PhotoCategory[] = [
  "Couple Moment",
  "Friends",
  "Family",
  "Ceremony",
  "Reception",
  "Behind the Scenes",
  "Outfit / Dress Code",
  "Funny Moment"
];
