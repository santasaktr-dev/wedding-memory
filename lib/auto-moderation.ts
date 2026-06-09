import type { SubmissionStatus } from "@/lib/types";

type ModerationDecision = {
  status: SubmissionStatus;
  reason: string;
};

type ModerationResult = {
  results?: Array<{
    flagged?: boolean;
    categories?: Record<string, boolean>;
    category_scores?: Record<string, number>;
  }>;
};

type GuardDecision = "approve" | "review" | "block";

type GuardResult = {
  decision?: GuardDecision;
  risk?: "low" | "medium" | "high";
  reason?: string;
};

const moderationEndpoint = "https://api.openai.com/v1/moderations";
const responsesEndpoint = "https://api.openai.com/v1/responses";
const moderationModel = process.env.OPENAI_MODERATION_MODEL || "omni-moderation-latest";
const moderationMode = process.env.AUTO_MODERATION_MODE || "openai";
const guardMode = process.env.AI_GUARD_MODE || "openai";
const guardModel = process.env.OPENAI_GUARD_MODEL || "gpt-5.4-nano";

const defaultBlockedTerms = [
  "asshole",
  "bastard",
  "b!tch",
  "bitch",
  "boobs",
  "casino",
  "dick",
  "fck",
  "fuck",
  "fucking",
  "fuk",
  "gamble",
  "hookup",
  "horny",
  "kill",
  "naked",
  "nude",
  "one night stand",
  "porn",
  "pussy",
  "shit",
  "slut",
  "slutty",
  "stfu",
  "whore",
  "wtf",
  "เครดิตฟรี",
  "กดลิงก์",
  "จัญไร",
  "แจกเครดิตฟรี",
  "แทง",
  "แทงบอล",
  "บรรลัย",
  "บาคาร่า",
  "บัญชี",
  "ปัญญาอ่อน",
  "พนัน",
  "พินาศ",
  "พร้อมเพย์",
  "ฟัค",
  "แม่ง",
  "แมร่ง",
  "รับงาน",
  "ร่าน",
  "เลขบัญชี",
  "วิบัติ",
  "สมัครเลย",
  "สมองน้อย",
  "หายนะ",
  "อัปมงคล",
  "อัปรีย์",
  "อุบาทว์",
  "โอนเงิน",
  "ใจหมา",
  "ขอให้ซวย",
  "ขอให้ตาย",
  "ขอให้พัง",
  "ขอให้เลิก",
  "ขอให้หย่า",
  "ขยะ",
  "ข่มขู่",
  "ควาย",
  "เหี้ย",
  "เชี่ย",
  "เชี้ย",
  "เฮี้ย",
  "สัส",
  "สัตว์",
  "ไอ้สัตว์",
  "อีสัตว์",
  "ควย",
  "กระเจี๊ยว",
  "จิ๋ม",
  "จู๋",
  "ชั่ว",
  "ซั่ม",
  "สี้",
  "เด้า",
  "ตอแหล",
  "ตายห่า",
  "ต่ำตม",
  "นอนด้วยกัน",
  "น่าเกลียด",
  "ปากหมา",
  "โป๊",
  "ปอกลอก",
  "เผา",
  "เย็ด",
  "เยด",
  "เลว",
  "สารเลว",
  "สถุน",
  "ส้นตีน",
  "หนังโป๊",
  "หน้าด้าน",
  "หลอกเอาเงิน",
  "หลั่ง",
  "หรรม",
  "หำ",
  "หี",
  "ไอ้ชาติหมา",
  "อีชาติหมา",
  "ไอ้ระยำ",
  "อีระยำ",
  "ไอ้สวะ",
  "อีสวะ",
  "สวะ"
];

const defaultReviewTerms = [
  "affair",
  "bet",
  "break up",
  "breakup",
  "broke",
  "cheat",
  "cheating",
  "cheater",
  "damn",
  "die",
  "divorce",
  "drug",
  "drunk",
  "ex",
  "ex-boyfriend",
  "ex-girlfriend",
  "fat",
  "gold digger",
  "hell",
  "idiot",
  "loser",
  "mistress",
  "moron",
  "playboy",
  "poor",
  "pregnant",
  "red flag",
  "sexy",
  "sex",
  "shotgun wedding",
  "stupid",
  "suck",
  "sucks",
  "toxic",
  "trash",
  "ugly",
  "weed",
  "กัญชา",
  "กิ๊ก",
  "กู",
  "การเมือง",
  "กินตับ",
  "กินเหล้า",
  "เกาะกิน",
  "แก่",
  "ขี้เหร่",
  "ของเก่า",
  "ของตาย",
  "ของดี",
  "ของมือสอง",
  "ขอให้อยู่กันให้รอด",
  "ขอให้ไม่ทะเลาะ",
  "ขอให้ไม่เลิก",
  "ขอให้ไม่หย่า",
  "ขอให้ไม่เลิกกันเร็ว ๆ",
  "ขอให้อดทนกันไปนาน ๆ",
  "ขอให้ทนกันไหว",
  "ขายของ",
  "ขึ้นห้อง",
  "เข้ากรง",
  "เข้าหอ",
  "คบซ้อน",
  "คนเก่า",
  "คนคุย",
  "คนก่อน",
  "คนก่อนหน้า",
  "คนล่าสุด",
  "คนนี้เหรอ",
  "ครอบครัวจน",
  "ครอบครัวรวย",
  "ควายแดง",
  "คืนส่งตัว",
  "คืนนี้ยาว",
  "จน",
  "ชนแก้ว",
  "ชีวิตจบแล้ว",
  "ชู้",
  "ซวย",
  "ซวยแล้ว",
  "ดำ",
  "ดีกว่าแฟนเก่า",
  "เด็ด",
  "เด็ดจริง",
  "เด็ดมาก",
  "โดนจับแต่ง",
  "โดนจอง",
  "เตี้ย",
  "แตกใน",
  "ต่างชั้น",
  "ต่างระดับ",
  "ตัวจริง",
  "ตัวพ่อ",
  "ตัวแม่",
  "ตัวสำรอง",
  "ถ่านไฟเก่า",
  "ทน ๆ กันไป",
  "ท้องก่อนแต่ง",
  "นักโทษ",
  "นอกใจ",
  "นัว",
  "นัวมาก",
  "นายก",
  "บ้า",
  "บาป",
  "บ้านแตก",
  "บ้านนอก",
  "บ้านเจ้าบ่าว",
  "บ้านเจ้าสาว",
  "บุหรี่",
  "ประชาธิปไตย",
  "ประสาท",
  "ประวัติเยอะ",
  "เป็นหนี้",
  "เปิดโต๊ะ",
  "เปิดห้อง",
  "พ่อตา",
  "พ่อแม่ไม่ปลื้ม",
  "ผ่านเยอะ",
  "ผอมแห้ง",
  "ผัวเก่า",
  "ผัวใหม่",
  "พรรค",
  "แพง",
  "แฟนเก่า",
  "แฟนเก่ายังสวยกว่า",
  "แฟนเก่ายังหล่อกว่า",
  "แม่ผัว",
  "แม่ยาย",
  "แม่ยายโหด",
  "เมียน้อย",
  "เมียเก่า",
  "เมียใหม่",
  "เมา",
  "เมาเละ",
  "เมาแล้ว",
  "เมาหัวราน้ำ",
  "มือที่สาม",
  "มึง",
  "มีลูกก่อนแต่ง",
  "มั่ว",
  "ไม่คู่ควร",
  "ไม่คุ้ม",
  "ไม่บริสุทธิ์",
  "ไม่สด",
  "ไม่เอาคนนี้",
  "ไม่เหมาะกัน",
  "ไม่เหมาะสมกัน",
  "ไม่น่าแต่ง",
  "ยาเสพติด",
  "ยังกลับตัวทัน",
  "ยังรักอยู่",
  "ยังคิดถึงไหม",
  "ยาเสพติด",
  "ญาติน่ารำคาญ",
  "ญาติบ้านนอก",
  "ญาติเยอะ",
  "ญาติวุ่นวาย",
  "รัฐบาล",
  "รอดไหม",
  "ร่าน",
  "ระเบิด",
  "รีบแต่ง",
  "รวย",
  "รับงาน",
  "รวย",
  "ไร้ค่า",
  "ลัทธิ",
  "ล่มจม",
  "ล้างแค้น",
  "เลิกกัน",
  "เลือกตั้ง",
  "ศาสนา",
  "สายเปย์",
  "สายแซ่บ",
  "สายเมา",
  "สลิ่ม",
  "สวยกว่าแฟนเก่า",
  "สามกีบ",
  "สินสอด",
  "เสียดาย",
  "เสียตัว",
  "เสียพนัน",
  "เสียสาว",
  "เสียหนุ่ม",
  "เสือผู้หญิง",
  "เสือสาว",
  "แซ่บ",
  "แซ่บมาก",
  "แซ่บเวอร์",
  "หย่า",
  "หย่ากัน",
  "หนีทันไหม",
  "หมดตัว",
  "หมดรัก",
  "หมดอนาคต",
  "หมดอิสระ",
  "หมดแก้ว",
  "หล่อกว่าแฟนเก่า",
  "หลายใจ",
  "หน้าเงิน",
  "หนี้",
  "ห้องเชือด",
  "อยู่กันได้นานไหม",
  "อยู่ไม่ยืด",
  "อ้วน",
  "อย่าตีกัน",
  "อย่านอกใจกัน",
  "อย่ามีกิ๊ก",
  "อย่ามีชู้",
  "อย่าเบื่อกันก่อน",
  "อดทนไว้นะ",
  "แอบกิน",
  "แอบคบ",
  "แอบแซ่บ",
  "แอดไลน์",
  "เผด็จการ",
  "เอาคืน",
  "เลือกแล้วก็รับกรรมไป",
  "ขอให้กรรมตามทัน",
  "สมควรแล้ว",
  "สุดท้ายก็เอาคนนี้",
  "ในที่สุดก็มีคนเอา",
  "หาได้แค่นี้เหรอ",
  "ขอแสดงความเสียใจด้วย",
  "เสียใจด้วยนะ",
  "ไม่น่าเลย",
  "คิดดีแล้วใช่ไหม",
  "คิดดีแล้วเหรอ",
  "คนเมื่อวาน",
  "ไหวไหม",
  "เบา ๆ นะ",
  "อย่าหักโหม",
  "พรุ่งนี้เดินไหวไหม",
  "เปลี่ยนคน",
  "เปลี่ยนแฟน",
  "ส่งตัว",
  "จัดหนัก",
  "จัดเต็ม",
  "จัดไป",
  "ฟิต",
  "แน่น",
  "ใหญ่",
  "เสร็จ",
  "เหล้า",
  "เบียร์",
  "เมื่อวานไม่ใช่คนนี้",
  "เมื่อวานยังเป็นอีกคน",
  "ไม่ใช่คนนี้",
  "ใช่คนนี้เหรอ"
];

const blockedEmojiPattern = /[🖕🔞🍆🍑💦👅🤮💩🔪🩸💣⚰]/u;
const reviewEmojiPattern = /[😈]/u;

function configuredBlockedTerms() {
  const extraTerms = (process.env.WEDDING_BLOCKLIST || "")
    .split(",")
    .map((term) => term.trim())
    .filter(Boolean);

  return Array.from(new Set([...defaultBlockedTerms, ...extraTerms]));
}

function configuredReviewTerms() {
  const extraTerms = (process.env.WEDDING_REVIEWLIST || "")
    .split(",")
    .map((term) => term.trim())
    .filter(Boolean);

  return Array.from(new Set([...defaultReviewTerms, ...extraTerms]));
}

function normalizeForMatch(value: string) {
  return value
    .toLowerCase()
    .replace(/[\u0e47-\u0e4e]/g, "")
    .replace(/[0๐]/g, "o")
    .replace(/[1๑!|]/g, "i")
    .replace(/[3๓]/g, "e")
    .replace(/[4๔@]/g, "a")
    .replace(/[5๕$]/g, "s")
    .replace(/[7๗]/g, "t")
    .replace(/[._\-*~|/\\()[\]{}"'`!?@#$%^&+=:;<>၊、，。]/g, "")
    .replace(/\s+/g, " ")
    .replace(/(.)\1{2,}/g, "$1$1")
    .trim();
}

function compactForMatch(value: string) {
  return normalizeForMatch(value).replace(/\s+/g, "");
}

function isLatinTerm(term: string) {
  return /^[a-z0-9\s-]+$/i.test(term);
}

function includesTerm(haystack: string, compactHaystack: string, term: string) {
  const normalizedTerm = normalizeForMatch(term);
  const compactTerm = compactForMatch(term);

  if (!normalizedTerm || !compactTerm) return false;

  if (isLatinTerm(normalizedTerm)) {
    const escaped = normalizedTerm.replace(/[.*+?^${}()|[\]\\]/g, "\\$&").replace(/\s+/g, "\\s+");
    return (
      new RegExp(`(^|[^a-z0-9])${escaped}([^a-z0-9]|$)`, "i").test(haystack) ||
      (compactTerm.length >= 3 && compactHaystack.includes(compactTerm))
    );
  }

  return haystack.includes(normalizedTerm) || compactHaystack.includes(compactTerm);
}

function findTerm(values: Array<string | null | undefined>, terms: string[]) {
  const haystack = normalizeForMatch(values.filter(Boolean).join(" "));
  const compactHaystack = compactForMatch(values.filter(Boolean).join(""));
  return terms.find((term) => includesTerm(haystack, compactHaystack, term));
}

function textVariants(values: Array<string | null | undefined>) {
  const raw = values.filter(Boolean).join(" ").toLowerCase();
  const normalized = normalizeForMatch(raw);
  const compact = compactForMatch(raw);
  return { raw, normalized, compact };
}

function findBlockedPattern(values: Array<string | null | undefined>) {
  const { raw, normalized, compact } = textVariants(values);
  if (/(https?:\/\/|www\.|bit\.ly|line\.me|t\.me|telegram|[a-z0-9-]+\.(com|net|org)\b)/i.test(raw)) {
    return "url-or-link";
  }

  if (blockedEmojiPattern.test(raw)) {
    return "blocked-emoji";
  }

  const rawPatterns: Array<[RegExp, string]> = [
    [/ค[\s._\-*~!@#$%^&]*[วwυv][\s._\-*~!@#$%^&]*ย/u, "obfuscated-kuay"],
    [/เ?[\s._\-*~!@#$%^&]*ห[\s._\-*~!@#$%^&]*[ีิ]?[\s._\-*~!@#$%^&]*[้๊๋]?[\s._\-*~!@#$%^&]*ย/u, "obfuscated-hia"],
    [/ส[\s._\-*~!@#$%^&]*[ั่๊]?[\s._\-*~!@#$%^&]*[สs5]/u, "obfuscated-sus"],
    [/เ?[\s._\-*~!@#$%^&]*ย[\s._\-*~!@#$%^&]*[็้]?[\s._\-*~!@#$%^&]*ด/u, "obfuscated-yed"],
    [/f[\W_]*[uυv]+[\W_]*[cซx]+[\W_]*k/i, "obfuscated-fuck"],
    [/s[\W_]*h[\W_]*[i1!|]+[\W_]*t/i, "obfuscated-shit"],
    [/b[\W_]*[i1!|]+[\W_]*t[\W_]*c[\W_]*h/i, "obfuscated-bitch"],
    [/d[\W_]*[i1!|]+[\W_]*c[\W_]*k/i, "obfuscated-dick"],
    [/p[\W_]*[o0]+[\W_]*r[\W_]*n/i, "obfuscated-porn"],
    [/s[\W_]*[e3]+[\W_]*x/i, "obfuscated-sex"]
  ];

  const compactPatterns: Array<[RegExp, string]> = [
    [/ค[วwυv]ย/u, "compact-kuay"],
    [/เห[ีิ]?ย/u, "compact-hia"],
    [/สั?[สs]/u, "compact-sus"],
    [/เย[็้]?ด/u, "compact-yed"],
    [/ชิ[บพ]ห[า]?ย/u, "compact-chiphai"],
    [/ฉิบหาย/u, "compact-chiphai"],
    [/f[uυv]+[cซx]+k/i, "compact-fuck"],
    [/phuck/i, "compact-fuck"],
    [/sh[i1!|]+t/i, "compact-shit"],
    [/b[i1!|]+tch/i, "compact-bitch"],
    [/d[i1!|]+ck/i, "compact-dick"],
    [/p[o0]+rn/i, "compact-porn"],
    [/s[e3]+x/i, "compact-sex"]
  ];

  const matchedRawPattern = rawPatterns.find(([pattern]) => pattern.test(raw));
  if (matchedRawPattern) return matchedRawPattern[1];

  const matchedCompactPattern = compactPatterns.find(([pattern]) => pattern.test(compact));
  if (matchedCompactPattern) return matchedCompactPattern[1];

  if (/(เบอร|โทร|tel|phone|พร้อมเพย|บัญช|เลขบัญช)/i.test(normalized) && /\d{6,}/.test(raw)) {
    return "contact-or-payment-number";
  }

  return null;
}

function findReviewPattern(values: Array<string | null | undefined>) {
  const { raw, normalized, compact } = textVariants(values);

  if (reviewEmojiPattern.test(raw)) {
    return "review-emoji";
  }

  const reviewPatterns: Array<[RegExp, string]> = [
    [/เหย{1,}/u, "softened-hia"],
    [/ขอให.*(รอด|ไม่เลิก|ไม่หย่า|ไม่ทะเลาะ|ทน|อดทน)/u, "negative-wish"],
    [/(หนีทัน|กลับตัวทัน|คิดดีแล้ว|รับกรรม|กรรมตามทัน|หาได้แค่นี้|มีคนเอา)/u, "sarcastic-intent"],
    [/(เดินไหว|อย่าหักโหม|เบาๆ|เบา ๆ|คืนนี้ยาว|คืนส่งตัว|เข้าหอ|ส่งตัว)/u, "sexual-innuendo"],
    [/(แฟนเก่า|คนเก่า|คนคุย|คนก่อน|คนก่อนหน้า|คนเมื่อวาน|ตัวจริง|ตัวสำรอง|ทีมแฟนเก่า)/u, "third-party-relationship"],
    [/(เมื่อวาน.*(ไม่ใช่คนนี้|อีกคน|คนละคน)|ไม่ใช่คนนี้|ไม่เอาคนนี้|เอาคนนี้เหรอ|ใช่คนนี้เหรอ|เปลี่ยน(คน|แฟน))/u, "implied-other-partner"],
    [/(ขอแสดงความเสียใจ|เสียใจด้วย|ไม่น่าเลย|สมควรแล้ว)/u, "negative-sentiment"]
  ];

  const matchedReviewPattern = reviewPatterns.find(([pattern]) => pattern.test(normalized) || pattern.test(compact));
  return matchedReviewPattern?.[1] || null;
}

function localDecisionFromValues(values: Array<string | null | undefined>): ModerationDecision {
  const blockedPattern = findBlockedPattern(values);
  if (blockedPattern) {
    return { status: "hidden", reason: `blocked-pattern:${blockedPattern}` };
  }

  const blockedTerm = findTerm(values, configuredBlockedTerms());
  if (blockedTerm) {
    return { status: "hidden", reason: `blocked-term:${blockedTerm}` };
  }

  const reviewPattern = findReviewPattern(values);
  if (reviewPattern) {
    return { status: "pending", reason: `review-pattern:${reviewPattern}` };
  }

  const reviewTerm = findTerm(values, configuredReviewTerms());
  if (reviewTerm) {
    return { status: "pending", reason: `review-term:${reviewTerm}` };
  }

  return { status: "approved", reason: "local-check-approved" };
}

export function getWishLocalModerationDecision(payload: {
  guestName: string;
  relationship: string | null;
  tableNumber: string | null;
  messageType: string;
  message: string;
}) {
  return localDecisionFromValues([
    payload.guestName,
    payload.relationship,
    payload.tableNumber,
    payload.messageType,
    payload.message
  ]);
}

export function getPhotoLocalModerationDecision(payload: {
  guestName: string;
  tableNumber: string | null;
  caption: string | null;
  category: string;
}) {
  return localDecisionFromValues([
    payload.guestName,
    payload.tableNumber,
    payload.caption,
    payload.category
  ]);
}

export function isWishLocallySafeForPublic(payload: {
  guestName: string;
  relationship: string | null;
  tableNumber: string | null;
  messageType: string;
  message: string;
}) {
  return getWishLocalModerationDecision(payload).status === "approved";
}

export function isPhotoLocallySafeForPublic(payload: {
  guestName: string;
  tableNumber: string | null;
  caption: string | null;
  category: string;
}) {
  return getPhotoLocalModerationDecision(payload).status === "approved";
}

function openAiKey() {
  return process.env.OPENAI_API_KEY?.trim();
}

function guardEnabled() {
  return guardMode !== "off";
}

async function callOpenAiModeration(input: unknown): Promise<ModerationResult | null> {
  const apiKey = openAiKey();
  if (!apiKey || moderationMode === "off") return null;

  const response = await fetch(moderationEndpoint, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: moderationModel,
      input
    }),
    cache: "no-store"
  });

  if (!response.ok) {
    throw new Error(`OpenAI moderation failed: ${response.status}`);
  }

  return (await response.json()) as ModerationResult;
}

function statusFromOpenAiResult(result: ModerationResult | null): ModerationDecision {
  if (!result) {
    return {
      status: "pending",
      reason: openAiKey() ? "auto-moderation-disabled" : "openai-api-key-missing"
    };
  }

  const first = result.results?.[0];
  if (!first) {
    return { status: "pending", reason: "moderation-result-empty" };
  }

  if (first.flagged) {
    return { status: "hidden", reason: "openai-flagged" };
  }

  return { status: "approved", reason: "auto-approved" };
}

function shouldStopBeforeGuard(decision: ModerationDecision) {
  return decision.status !== "approved";
}

function safeFallbackDecision(reason: string): ModerationDecision {
  if (process.env.NODE_ENV !== "production" && !openAiKey()) {
    return { status: "approved", reason: `${reason}-dev-approved` };
  }

  return { status: "pending", reason };
}

function parseJsonObject(value: unknown): GuardResult | null {
  if (typeof value !== "string") return null;

  try {
    return JSON.parse(value) as GuardResult;
  } catch {
    const match = value.match(/\{[\s\S]*\}/);
    if (!match) return null;

    try {
      return JSON.parse(match[0]) as GuardResult;
    } catch {
      return null;
    }
  }
}

function extractResponseText(payload: unknown): string {
  if (!payload || typeof payload !== "object") return "";
  const maybeOutputText = (payload as { output_text?: unknown }).output_text;
  if (typeof maybeOutputText === "string") return maybeOutputText;

  const output = (payload as { output?: unknown }).output;
  if (!Array.isArray(output)) return "";

  return output
    .flatMap((item) => {
      if (!item || typeof item !== "object") return [];
      const content = (item as { content?: unknown }).content;
      return Array.isArray(content) ? content : [];
    })
    .map((content) => {
      if (!content || typeof content !== "object") return "";
      const text = (content as { text?: unknown }).text;
      return typeof text === "string" ? text : "";
    })
    .join("\n")
    .trim();
}

function guardStatus(result: GuardResult | null): ModerationDecision {
  if (!result?.decision) {
    return { status: "pending", reason: "ai-guard-unparseable" };
  }

  if (result.decision === "approve" && result.risk === "low") {
    return { status: "approved", reason: "ai-guard-approved" };
  }

  if (result.decision === "block" || result.risk === "high") {
    return { status: "hidden", reason: `ai-guard-blocked:${result.reason || "high-risk"}` };
  }

  return { status: "pending", reason: `ai-guard-review:${result.reason || result.risk || "uncertain"}` };
}

async function callWeddingAiGuard(payload: {
  contentType: "wish" | "photo";
  text: string;
  context: Record<string, string | null>;
}): Promise<ModerationDecision> {
  const apiKey = openAiKey();
  if (!apiKey || !guardEnabled()) {
    return safeFallbackDecision(apiKey ? "ai-guard-disabled" : "openai-api-key-missing");
  }

  const response = await fetch(responsesEndpoint, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: guardModel,
      input: [
        {
          role: "system",
          content:
            "You are a conservative Thai/English wedding live-wall safety reviewer. " +
            "Approve only clearly positive, respectful wedding submissions that are safe on a large live screen. " +
            "Review sarcasm, ambiguity, adult innuendo, alcohol/drug/gambling, ex or relationship drama, money or sinsod, family conflict, politics, negative sentiment, or anything uncertain. " +
            "Block profanity, sexual content, threats, harassment, spam, URLs, payment solicitation, hate, or explicit attacks. " +
            "When unsure, choose review. Return JSON only."
        },
        {
          role: "user",
          content: JSON.stringify({
            content_type: payload.contentType,
            context: payload.context,
            submission: payload.text,
            allowed_decisions: ["approve", "review", "block"],
            required_json_shape: {
              decision: "approve | review | block",
              risk: "low | medium | high",
              reason: "short English reason"
            }
          })
        }
      ],
      text: {
        format: {
          type: "json_schema",
          name: "wedding_live_wall_guard",
          schema: {
            type: "object",
            additionalProperties: false,
            properties: {
              decision: { type: "string", enum: ["approve", "review", "block"] },
              risk: { type: "string", enum: ["low", "medium", "high"] },
              reason: { type: "string", maxLength: 160 }
            },
            required: ["decision", "risk", "reason"]
          }
        }
      },
      max_output_tokens: 80
    }),
    cache: "no-store"
  });

  if (!response.ok) {
    throw new Error(`OpenAI guard failed: ${response.status}`);
  }

  const body = await response.json();
  return guardStatus(parseJsonObject(extractResponseText(body)));
}

export async function moderateWishSubmission(payload: {
  guestName: string;
  relationship: string | null;
  tableNumber: string | null;
  messageType: string;
  message: string;
}): Promise<ModerationDecision> {
  const values = [
    payload.guestName,
    payload.relationship,
    payload.tableNumber,
    payload.messageType,
    payload.message
  ];
  const localDecision = localDecisionFromValues(values);
  if (localDecision.status !== "approved") return localDecision;

  try {
    const result = await callOpenAiModeration(
      [
        `Guest name: ${payload.guestName}`,
        `Relationship: ${payload.relationship || "-"}`,
        `Table: ${payload.tableNumber || "-"}`,
        `Message type: ${payload.messageType}`,
        `Message: ${payload.message}`
      ].join("\n")
    );

    const moderationDecision = statusFromOpenAiResult(result);
    if (shouldStopBeforeGuard(moderationDecision)) return moderationDecision;

    return await callWeddingAiGuard({
      contentType: "wish",
      text: payload.message,
      context: {
        guest_name: payload.guestName,
        relationship: payload.relationship,
        table_number: payload.tableNumber,
        message_type: payload.messageType
      }
    });
  } catch (error) {
    console.error("Wish auto-moderation failed:", error);
    return safeFallbackDecision("openai-moderation-error");
  }
}

export async function moderatePhotoSubmission(payload: {
  guestName: string;
  tableNumber: string | null;
  caption: string | null;
  category: string;
  fileType: string;
  fileBase64: string;
}): Promise<ModerationDecision> {
  const values = [
    payload.guestName,
    payload.tableNumber,
    payload.caption,
    payload.category
  ];
  const localDecision = localDecisionFromValues(values);
  if (localDecision.status !== "approved") return localDecision;

  try {
    const dataUrl = `data:${payload.fileType};base64,${payload.fileBase64}`;
    const result = await callOpenAiModeration([
      {
        type: "text",
        text: [
          `Guest name: ${payload.guestName}`,
          `Table: ${payload.tableNumber || "-"}`,
          `Category: ${payload.category}`,
          `Caption: ${payload.caption || "-"}`
        ].join("\n")
      },
      {
        type: "image_url",
        image_url: {
          url: dataUrl
        }
      }
    ]);

    const moderationDecision = statusFromOpenAiResult(result);
    if (shouldStopBeforeGuard(moderationDecision)) return moderationDecision;
    if (!payload.caption?.trim()) return moderationDecision;

    return await callWeddingAiGuard({
      contentType: "photo",
      text: payload.caption || "",
      context: {
        guest_name: payload.guestName,
        table_number: payload.tableNumber,
        category: payload.category
      }
    });
  } catch (error) {
    console.error("Photo auto-moderation failed:", error);
    return safeFallbackDecision("openai-moderation-error");
  }
}
