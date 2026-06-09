# Wedding Memory Moderation Summary

This project now uses a conservative moderation pipeline so guest submissions do not appear on the public wall, gallery, or live screen unless they are considered safe.

## Goal

Prevent negative, inappropriate, sarcastic, sexual, spam, or relationship-drama content from appearing on the wedding live wall.

Core rule:

```text
Not sure = do not show live
```

## Submission Flow

```text
Guest submits wish/photo
  -> local rule checks
  -> OpenAI Moderation API
  -> wedding-specific AI guard
  -> save status to Google Sheet
  -> public pages show only approved content
```

Statuses:

- `approved`: safe to show publicly.
- `pending`: needs review; not shown publicly.
- `hidden`: blocked; not shown publicly. The UI labels this as `Blocked`.
- `deleted`: removed from public/admin views where appropriate.

## Local Rule Checks

Implemented in:

- `lib/auto-moderation.ts`

The local checks run before any AI call. They catch deterministic risks cheaply and quickly:

- Profanity and abusive terms
- Sexual terms and innuendo
- Relationship-drama phrases
- Ex/old-partner references
- Sarcastic negative wishes
- Political/social-drama terms
- Alcohol/drug/gambling terms
- Spam, URLs, payment/account numbers
- Risky emoji
- Obfuscated words such as spaced, symbol-separated, repeated, or leetspeak profanity

Examples that should not show live:

- `คนเก่าเขาทำไว้ดี`
- `เมื่อวานไม่ใช่คนนี้หนิ`
- `ไม่เอาคนนี้`
- `เอาคนนี้เหรอ`
- `ค-ว-ย`
- `f u c k`
- `bit.ly/...`

Local rule outcomes:

- Clear block risk -> `hidden`
- Ambiguous or wedding-risk phrase -> `pending`
- No local risk -> continue to AI checks

## OpenAI Moderation

The project uses OpenAI's moderation endpoint for text and image safety.

Default model:

```bash
OPENAI_MODERATION_MODEL=omni-moderation-latest
```

For wishes:

- The guest name, relationship, table number, message type, and message are checked.

For photos:

- Caption/context and the uploaded image are checked.

If OpenAI moderation flags content:

- The submission becomes `hidden`.

If OpenAI moderation fails in production:

- The submission becomes `pending`.

## Wedding-Specific AI Guard

The project also calls a paid, low-cost AI classifier after content passes local rules and OpenAI moderation.

Default model:

```bash
OPENAI_GUARD_MODEL=gpt-5.4-nano
AI_GUARD_MODE=openai
```

The guard is instructed to approve only clearly positive and respectful wedding-safe submissions.

It returns JSON:

```json
{
  "decision": "approve | review | block",
  "risk": "low | medium | high",
  "reason": "short reason"
}
```

Mapping:

- `approve` + `low` -> `approved`
- `review` or medium/uncertain -> `pending`
- `block` or high risk -> `hidden`

To disable the paid wedding-specific classifier while keeping local checks and OpenAI moderation:

```bash
AI_GUARD_MODE=off
```

## Cost Notes

OpenAI Moderation API is used for text/image moderation. The wedding-specific AI guard uses a paid model.

The guard is configured to use a small model and short JSON output to keep cost low. For a typical wedding, this should be inexpensive. Photos without captions skip the paid text guard after passing image moderation, which helps control cost.

## Public Safety Filter

Public APIs apply an additional local safety filter before returning content:

- `app/api/wall/route.ts`
- `app/api/gallery/route.ts`

This means even if an old Google Sheet row is incorrectly marked `approved`, risky content can still be filtered out before reaching public pages.

## Google Sheet Status Hardening

After creating a wish or photo, if the moderation result is not `approved`, the app calls the Google moderation action again to force the saved Sheet row to the correct status.

Implemented in:

- `app/api/wishes/route.ts`
- `app/api/photos/route.ts`

This protects against an older Apps Script deployment that might still write `approved` during creation.

The admin submissions API also reconciles older unsafe `approved` rows when the dashboard loads:

- `app/api/admin/submissions/route.ts`

If local rules detect that an approved row is risky, it is updated to `pending` or `hidden`.

## Dashboard Changes

Implemented in:

- `app/dashboard/page.tsx`
- `app/admin/dashboard/page.tsx`
- `components/ui.tsx`

Dashboard UI now shows status colors:

- Green: `Approved`
- Yellow: `Pending`
- Red: `Blocked` (`hidden` in the database)
- Gray: `Deleted`

The main dashboard also has a `Blocked` / `บล็อกไว้` tab for hidden items.

## Browser Cache Handling

The wall and gallery client feeds only read recent session-storage items if their status is `approved`.

Implemented in:

- `components/memory-wall-feed.tsx`
- `components/photo-gallery-feed.tsx`

When testing moderation changes, clear site data or use an incognito window to avoid seeing old session-storage items.

## Required Environment Variables

```bash
GOOGLE_APPS_SCRIPT_URL=
GOOGLE_APPS_SCRIPT_SECRET=
ADMIN_PASSWORD=
OPENAI_API_KEY=
OPENAI_MODERATION_MODEL=omni-moderation-latest
OPENAI_GUARD_MODEL=gpt-5.4-nano
AI_GUARD_MODE=openai
WEDDING_BLOCKLIST=
WEDDING_REVIEWLIST=
```

Optional lists:

- `WEDDING_BLOCKLIST`: comma-separated extra terms that should be blocked.
- `WEDDING_REVIEWLIST`: comma-separated extra terms that should become pending.

## Deploy Checklist

1. Set all environment variables on the hosting platform.
2. Redeploy the latest `google-apps-script/Code.gs`.
3. Set Apps Script property `SHARED_SECRET` to match `GOOGLE_APPS_SCRIPT_SECRET`.
4. Deploy Apps Script as a Web App.
5. Put the Web App URL in `GOOGLE_APPS_SCRIPT_URL`.
6. Deploy the Next.js app.
7. Smoke test:
   - Positive wish should become `approved`.
   - Ex/old-partner phrase should become `pending`.
   - Profanity/link/spam should become `hidden`.
   - Normal photo should pass image moderation.
   - Dashboard should show color-coded statuses.

## Test Commands

Build check:

```bash
npm run build
```

Local dev:

```bash
npm run dev
```

After changing `.env.local`, restart the dev server.

## Operational Notes

- For live wedding use, display `/live`.
- Keep `/dashboard` or `/admin/dashboard` open on an admin phone or laptop.
- Pending items are intentionally not shown live.
- Blocked items are hidden but visible in dashboard for audit and restore/delete.
- If something unsafe appears, first check whether the server was restarted and whether Apps Script was redeployed.
