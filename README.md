# Letters to Jajah & Smart

A Next.js, TypeScript, Tailwind CSS, and Google Drive/Sheets MVP for the wedding memory wall and guestbook.

## MVP Routes

- `/` - Home page
- `/write` - Write a wish
- `/wall` - Public memory wall
- `/upload` - Upload a moment
- `/gallery` - Public photo gallery
- `/from-us` - Note from Jajah & Smart
- `/admin` - Admin login
- `/admin/dashboard` - Moderation dashboard

## Setup

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open `http://localhost:3000`.

## Data Storage

Primary storage is Google:

- Wishes are stored in a Google Sheet.
- Photo metadata is stored in the same Google Sheet.
- Uploaded photos are stored in a Google Drive folder.
- Admin tools can hide, restore, or delete submissions by updating the `status` column in the Sheet.

Use Google account `santasak.tri@gmail.com` to own the Google Sheet, Drive folder, and Apps Script deployment.

## Google Setup

1. Sign in to Google as `santasak.tri@gmail.com`.
2. Open Apps Script and paste `google-apps-script/Code.gs`.
3. In Apps Script, open Project Settings > Script properties and add `SHARED_SECRET`
   with the same value you will use for `GOOGLE_APPS_SCRIPT_SECRET` in the Next.js app.

The script will automatically create these files in Google Drive on first use:

- `J&S Wedding Memory Wall DB`
- `J&S Wedding Moment Uploads`

4. Deploy the Apps Script as a web app:

- Execute as: Me
- Who has access: Anyone

5. Add these values to `.env.local`:

```bash
GOOGLE_APPS_SCRIPT_URL=your-deployed-apps-script-web-app-url
GOOGLE_APPS_SCRIPT_SECRET=the-same-secret-from-Code.gs
ADMIN_PASSWORD=choose-an-admin-password
OPENAI_API_KEY=optional-openai-api-key-for-auto-moderation
OPENAI_MODERATION_MODEL=omni-moderation-latest
OPENAI_GUARD_MODEL=gpt-5.4-nano
AI_GUARD_MODE=openai
WEDDING_BLOCKLIST=optional,comma,separated,extra,blocked,terms
WEDDING_REVIEWLIST=optional,comma,separated,extra,review,terms
```

New wishes and photos go through auto-moderation before appearing publicly. The public wall and gallery show only `approved` submissions. Local wedding blocklist matches are saved as `hidden`; local review-list matches are saved as `pending`; OpenAI moderation flags are saved as `hidden`; the wedding-specific AI guard must approve otherwise the item stays `pending` or `hidden`; moderation failures or missing `OPENAI_API_KEY` in production are saved as `pending` so they do not appear live. Set `AI_GUARD_MODE=off` to disable the paid wedding-specific classifier while keeping rule checks and OpenAI moderation. Admin can approve, hide, or delete submissions from `/admin/dashboard`. If Google Apps Script is not configured yet, the site renders with sample data so the design can be reviewed locally.

## Where Things Are Stored

- DB: Google Sheet owned by `santasak.tri@gmail.com`.
- Photos: Google Drive folder owned by `santasak.tri@gmail.com`.
- Moderation: `/admin/dashboard` calls Apps Script to update Sheet status.
- Likes: not implemented in this MVP, so the public like display has been removed.
