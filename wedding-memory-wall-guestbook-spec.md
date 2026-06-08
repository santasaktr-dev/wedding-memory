# Wedding Memory Wall + Guestbook Website Specification

## 1. Project Overview

This website is a separate interactive wedding website for **Smart & Jajah**.

The main wedding website already provides event information such as venue, schedule, dress code, and RSVP.  
This new website will focus on guest participation, memories, wishes, and photo sharing.

The goal is to create a beautiful digital guestbook where guests can:

- Write wedding wishes
- Share memories
- Upload photos from the wedding day
- View a live memory wall
- Browse guest-submitted photos
- Leave heartfelt messages for the couple

The website should feel elegant, warm, personal, and timeless.

---

## 2. Website Concept

### Website Name

**Letters to Smart & Jajah**

Alternative names:

- Our Memory Wall
- Smart & Jajah Guestbook
- Wedding Wishes
- Moments for Smart & Jajah

### Tagline

**A digital guestbook for wishes, memories, and moments from our wedding day.**

### Main Purpose

This website should act as a digital memory wall and guestbook that can be accessed before, during, and after the wedding.

Guests can scan a QR code at the wedding venue or click from LINE Official Account Rich Menu to access the site.

---

## 3. Wedding Details

### Couple

- Groom: Smart
- Bride: Jajah

### Wedding Date

- Sunday, 1 November 2026

### Venue

- Pearl Wedding Avenue

### Theme

- Old Money Elegance
- Minimal
- Modern luxury
- Editorial wedding style
- Warm, timeless, and refined

---

## 4. Design Direction

### Overall Mood

The design should feel:

- Elegant
- Warm
- Romantic
- Minimal
- Premium
- Editorial
- Timeless
- Not too playful
- Not too colorful
- Not overly decorative

The website should feel like a luxury wedding stationery piece combined with a modern digital guestbook.

---

## 5. Color Palette

Use the following wedding color palette:

| Color Name | Hex Code | Usage |
|---|---|---|
| Oxford Navy | `#0A1F44` | Main text, headings, buttons |
| Tweed Brown | `#7C5C3B` | Borders, accents, dividers |
| Camel Beige | `#D6C8A5` | Secondary accents, soft backgrounds |
| Ash Grey | `#B8B8B8` | Supporting text, subtle lines |
| Off White | `#F8F5EF` | Main background |
| Warm White | `#FFFDF8` | Card background |

### Color Usage

- Background should mainly be off-white or warm white.
- Text should mainly use Oxford Navy.
- Borders and small decorative details should use Tweed Brown.
- Camel Beige can be used for soft highlight areas.
- Avoid bright colors, neon colors, or overly saturated tones.

---

## 6. Typography Direction

Use elegant and readable typography.

### Recommended Font Style

For English:

- Elegant serif font for headings
- Clean sans-serif font for body text

For Thai:

- Clean and readable Thai sans-serif font
- Avoid overly decorative Thai fonts

### Suggested Font Pairing

Option 1:

- Heading: Playfair Display / Cormorant Garamond / Libre Baskerville
- Body: Inter / IBM Plex Sans Thai / Noto Sans Thai

Option 2:

- Heading: Cormorant Garamond
- Body: Noto Sans Thai

### Typography Rules

- Use large elegant headings.
- Body text must be easy to read on mobile.
- Avoid using too many font styles.
- Use generous spacing and clean layout.

---

## 7. Target Users

### Primary Users

Wedding guests who want to:

- Leave wishes
- Upload photos
- Read other guests’ messages
- Join the memory wall experience

### Secondary Users

Bride and groom who want to:

- Collect all messages and photos
- Approve or hide inappropriate content
- Export memories after the wedding
- Keep the website as a digital wedding archive

---

## 8. Main User Journey

### Guest Journey

1. Guest scans QR code or clicks link from LINE Rich Menu.
2. Guest lands on the homepage.
3. Guest sees a welcome message from Smart & Jajah.
4. Guest chooses one of the following actions:
   - Write a wish
   - Upload a photo
   - View memory wall
   - Browse gallery
5. Guest submits message or photo.
6. Website shows a thank-you confirmation.
7. Submitted content appears on the wall after approval or immediately, depending on admin setting.

### Admin Journey

1. Admin logs in to the backend.
2. Admin views all submitted wishes and photos.
3. Admin approves, hides, edits, or deletes submissions.
4. Admin can pin selected messages.
5. Admin can export all messages and photos after the wedding.

---

## 9. Website Structure

The website should include the following pages:

1. Home
2. Write a Wish
3. Memory Wall
4. Upload a Moment
5. Photo Gallery
6. From Smart & Jajah
7. Admin Dashboard

---

# 10. Page Details

## 10.1 Home Page

### Purpose

Introduce the website and guide guests to participate.

### Content

Main heading:

```text
Letters to Smart & Jajah
```

Subtitle:

```text
A digital guestbook for wishes, memories, and moments from our wedding day.
```

Wedding info:

```text
Smart & Jajah
Sunday, 1 November 2026
Pearl Wedding Avenue
```

Primary CTA buttons:

- Write a Wish
- Upload a Moment
- View Memory Wall

### Design Notes

- Elegant hero section
- Off-white background
- Thin border frame
- Couple name in elegant serif font
- Minimal decorative line or monogram
- Possible monogram: `S & J`

---

## 10.2 Write a Wish Page

### Purpose

Allow guests to write wedding wishes or personal messages.

### Form Fields

Required fields:

- Guest name
- Message / wish

Optional fields:

- Relationship to couple
- Table number
- Message type

### Message Type Options

- Wedding Wish
- Memory
- Advice
- Funny Message
- Thank You Note

### Placeholder Text

Guest name:

```text
Your name
```

Message:

```text
Write your message for Smart & Jajah...
```

### Submit Button

```text
Send Your Wish
```

### Success Message

```text
Thank you for sharing your love with us.
Your message has been received.
```

### Validation Rules

- Guest name is required.
- Message is required.
- Message should be at least 5 characters.
- Maximum message length: 1,000 characters.
- Prevent spam or repeated submissions.

---

## 10.3 Memory Wall Page

### Purpose

Display submitted wishes and memories in a beautiful wall layout.

### Display Format

Each message should appear as an elegant card.

Each card may show:

- Guest name
- Message
- Message type
- Submission time
- Optional heart/like button

### Layout

- Masonry grid layout on desktop
- Single-column card layout on mobile
- Soft card shadow or thin border
- Warm white card background
- Oxford Navy text
- Tweed Brown accent line

### Filters

Optional filters:

- All
- Wishes
- Memories
- Advice
- Funny Messages

### Features

- Like / heart message
- Pin featured messages
- Admin-approved content only
- Smooth fade-in animation
- Optional auto-refresh for live event display

---

## 10.4 Upload a Moment Page

### Purpose

Allow guests to upload wedding photos.

### Form Fields

Required fields:

- Guest name
- Photo upload

Optional fields:

- Caption
- Table number
- Category

### Photo Categories

- Couple Moment
- Friends
- Family
- Ceremony
- Reception
- Behind the Scenes
- Outfit / Dress Code
- Funny Moment

### Upload Rules

- Accept image files only.
- Supported formats: JPG, JPEG, PNG, WEBP.
- Maximum file size: 10 MB per image.
- Allow multiple photos per submission if possible.
- Compress image before upload if needed.
- Store original image and optimized thumbnail.

### Submit Button

```text
Upload Moment
```

### Success Message

```text
Thank you for sharing this beautiful moment with us.
```

---

## 10.5 Photo Gallery Page

### Purpose

Display guest-submitted photos in a beautiful gallery.

### Layout

- Responsive image grid
- Masonry or editorial-style gallery
- Image modal/lightbox on click
- Caption shown inside modal
- Guest name displayed subtly

### Filters

Optional filters:

- All Photos
- Couple Moment
- Friends
- Family
- Ceremony
- Reception
- Behind the Scenes

### Features

- Lazy loading
- Image optimization
- Admin approval before public display
- Download image option for admin only
- Optional heart/like photo

---

## 10.6 From Smart & Jajah Page

### Purpose

A personal thank-you note from the couple.

### Suggested Content

```text
Dear family and friends,

Thank you for being part of our special day.

Your presence, love, laughter, and blessings mean so much to us.
We created this space so every wish, memory, and beautiful moment can stay with us forever.

With love,
Smart & Jajah
```

### Design Notes

- Letter-style layout
- Elegant card or paper texture
- Couple signature area
- Minimal decorative border

---

## 10.7 Admin Dashboard

### Purpose

Allow admin to manage guest submissions.

### Admin Features

#### Wish Management

- View all wishes
- Approve wish
- Hide wish
- Delete wish
- Pin wish
- Search by guest name
- Filter by message type
- Export wishes as CSV or PDF

#### Photo Management

- View uploaded photos
- Approve photo
- Hide photo
- Delete photo
- Edit caption
- Download photo
- Filter by category
- Export photo list as CSV

#### Dashboard Summary

Show summary cards:

- Total wishes
- Total photos
- Pending approvals
- Approved wishes
- Approved photos
- Most liked message
- Most liked photo

---

# 11. Content Moderation

The website should include moderation to prevent inappropriate content.

### Moderation Options

Option 1: Manual approval

- New submissions are hidden by default.
- Admin must approve before they appear publicly.

Option 2: Auto publish

- Submissions appear immediately.
- Admin can remove content later.

### Recommended Setting

Use manual approval for public display.

### Content Status

Each submission should have a status:

- Pending
- Approved
- Hidden
- Deleted

---

# 12. Database Structure

## 12.1 Wishes Table

Suggested table name:

```text
wishes
```

Fields:

| Field | Type | Description |
|---|---|---|
| id | UUID / String | Unique wish ID |
| guest_name | String | Name of guest |
| relationship | String | Optional relationship |
| table_number | String | Optional table number |
| message_type | String | Wish, memory, advice, funny, thank you |
| message | Text | Guest message |
| status | String | pending, approved, hidden, deleted |
| likes_count | Number | Number of likes |
| is_pinned | Boolean | Whether message is pinned |
| created_at | DateTime | Submission date |
| updated_at | DateTime | Last update date |

---

## 12.2 Photos Table

Suggested table name:

```text
photos
```

Fields:

| Field | Type | Description |
|---|---|---|
| id | UUID / String | Unique photo ID |
| guest_name | String | Name of guest |
| table_number | String | Optional table number |
| caption | Text | Optional caption |
| category | String | Photo category |
| image_url | String | Original image URL |
| thumbnail_url | String | Optimized thumbnail URL |
| status | String | pending, approved, hidden, deleted |
| likes_count | Number | Number of likes |
| created_at | DateTime | Submission date |
| updated_at | DateTime | Last update date |

---

## 12.3 Likes Table

Suggested table name:

```text
likes
```

Fields:

| Field | Type | Description |
|---|---|---|
| id | UUID / String | Unique like ID |
| content_type | String | wish or photo |
| content_id | String | Wish ID or Photo ID |
| user_identifier | String | Browser/session/IP-based identifier |
| created_at | DateTime | Like date |

---

## 12.4 Admin Users Table

Suggested table name:

```text
admin_users
```

Fields:

| Field | Type | Description |
|---|---|---|
| id | UUID / String | Unique admin ID |
| email | String | Admin email |
| password_hash | String | Hashed password |
| role | String | admin |
| created_at | DateTime | Created date |

---

# 13. Functional Requirements

## 13.1 Guest Features

Guests should be able to:

- View homepage
- Write a wish
- Upload photos
- View approved memory wall
- View approved photo gallery
- Like wishes
- Like photos
- Access website on mobile

## 13.2 Admin Features

Admin should be able to:

- Log in securely
- View submissions
- Approve or hide wishes
- Approve or hide photos
- Delete inappropriate content
- Pin selected wishes
- Export wish data
- Export photo data
- Download uploaded photos

---

# 14. Non-Functional Requirements

## 14.1 Responsive Design

The website must work well on:

- Mobile
- Tablet
- Desktop

Mobile-first design is recommended because many guests will access the website via QR code.

## 14.2 Performance

- Images should be compressed.
- Gallery should use lazy loading.
- Pages should load quickly on mobile networks.
- Avoid heavy animation.

## 14.3 Security

- Admin dashboard must require authentication.
- Prevent spam submissions.
- Validate all form inputs.
- Sanitize user-generated content.
- Limit upload file size.
- Allow only image files.
- Protect storage URLs if needed.
- Prevent duplicate likes.

## 14.4 Privacy

- Do not ask for unnecessary personal data.
- Show a simple consent note before submission.
- Let guests know that their message or photo may be displayed publicly on the wedding memory wall.

Suggested consent text:

```text
By submitting, you agree that your message or photo may be displayed on Smart & Jajah’s wedding memory wall and gallery.
```

---

# 15. Suggested Tech Stack

The developer can choose the final stack, but the following stack is recommended.

## Frontend

- Next.js
- React
- Tailwind CSS
- TypeScript

## Backend / Database

Option 1:

- Supabase
- Supabase Auth
- Supabase Database
- Supabase Storage

Option 2:

- Firebase
- Firestore
- Firebase Storage
- Firebase Authentication

## Deployment

- Vercel for frontend
- Supabase or Firebase for backend

---

# 16. Recommended Pages / Routes

```text
/
```

Home page

```text
/write
```

Write a wish page

```text
/wall
```

Memory wall page

```text
/upload
```

Upload a moment page

```text
/gallery
```

Photo gallery page

```text
/from-us
```

Message from Smart & Jajah

```text
/admin
```

Admin dashboard login

```text
/admin/dashboard
```

Admin dashboard main page

```text
/admin/wishes
```

Wish management

```text
/admin/photos
```

Photo management

---

# 17. UI Components

Suggested reusable components:

- Header
- Footer
- Button
- Card
- WishCard
- PhotoCard
- UploadForm
- WishForm
- FilterTabs
- EmptyState
- SuccessModal
- ImageLightbox
- AdminTable
- StatusBadge
- ConfirmDialog
- LoadingSpinner

---

# 18. Homepage Wireframe

```text
 -------------------------------------------------
|                                                 |
|                 S & J                           |
|                                                 |
|           Letters to Smart & Jajah              |
|                                                 |
|  A digital guestbook for wishes, memories,      |
|  and moments from our wedding day.              |
|                                                 |
|       [ Write a Wish ]  [ Upload a Moment ]     |
|                                                 |
|              View Memory Wall                   |
|                                                 |
|        Sunday, 1 November 2026                  |
|        Pearl Wedding Avenue                     |
|                                                 |
 -------------------------------------------------
```

---

# 19. Memory Wall Card Example

```text
 -------------------------------------------------
| Wedding Wish                                    |
|                                                 |
| “Wishing you both a lifetime of love, laughter, |
| and beautiful memories together.”               |
|                                                 |
| — Name of Guest                                 |
|                                                 |
| ♡ 12                                            |
 -------------------------------------------------
```

---

# 20. Form UX Requirements

Forms should be simple and easy to use.

### Wish Form

Use a clean single-column layout.

Fields:

1. Guest name
2. Relationship to couple
3. Message type
4. Message
5. Consent checkbox
6. Submit button

### Photo Upload Form

Fields:

1. Guest name
2. Caption
3. Category
4. Upload image
5. Consent checkbox
6. Submit button

---

# 21. Animation Direction

Use subtle animations only.

Recommended animations:

- Fade in on page load
- Card hover lift
- Smooth modal open
- Gentle button hover
- Soft transition between filters

Avoid:

- Bouncy animation
- Overly playful effects
- Confetti everywhere
- Heavy motion that slows down mobile

---

# 22. QR Code Use Case

This website should be suitable for QR code usage at the wedding venue.

Suggested QR display text:

```text
Leave your wish for Smart & Jajah
Scan to write a message or upload your favorite moment.
```

The QR code may be placed on:

- Welcome sign
- Table cards
- Photo booth area
- Guestbook table
- LINE Official Account Rich Menu

---

# 23. LINE Official Account Integration

The website should be linked from LINE Rich Menu.

Recommended mapping:

- WISHES / คำอวยพร → `/write`
- GALLERY / ภาพในงาน → `/gallery`
- CONTACT / ติดต่อ → main wedding website or LINE chat

If using LINE login is too complex, do not require login.  
Use guest name input instead.

---

# 24. Admin Export Requirements

Admin should be able to export guestbook messages after the wedding.

### Export Format

- CSV
- PDF

### CSV Columns for Wishes

```text
Guest Name, Relationship, Table Number, Message Type, Message, Likes Count, Created At
```

### CSV Columns for Photos

```text
Guest Name, Table Number, Caption, Category, Image URL, Likes Count, Created At
```

---

# 25. SEO and Metadata

Use simple and elegant metadata.

### Page Title

```text
Letters to Smart & Jajah
```

### Description

```text
A digital guestbook for wishes, memories, and wedding moments from Smart & Jajah’s special day.
```

### Open Graph Image

Use a simple wedding-themed image with:

```text
Smart & Jajah
1 November 2026
Letters to Smart & Jajah
```

---

# 26. Accessibility Requirements

- Text must have good contrast.
- Buttons must be large enough for mobile tap.
- Forms must have labels.
- Images should have alt text.
- Website should be usable with keyboard navigation.
- Do not rely only on color to communicate status.

---

# 27. Error States

### Wish Submission Error

```text
Sorry, we couldn’t send your wish right now. Please try again.
```

### Photo Upload Error

```text
Sorry, we couldn’t upload your photo. Please check the file size and try again.
```

### Empty Memory Wall

```text
No wishes yet. Be the first to leave a message for Smart & Jajah.
```

### Empty Gallery

```text
No moments uploaded yet. Share your favorite photo from the wedding day.
```

---

# 28. Recommended MVP Scope

For the first version, build only the essential features.

## MVP Features

- Home page
- Write a Wish page
- Memory Wall page
- Upload a Moment page
- Photo Gallery page
- Admin login
- Admin approval for wishes
- Admin approval for photos
- Responsive design
- Supabase/Firebase storage for images

## Nice-to-Have Features

- Like button
- Pin message
- Export PDF
- Auto-refresh wall
- QR code generator
- Photo categories
- Table number field
- Image lightbox
- Search and filter in admin dashboard

---

# 29. Recommended Development Priority

## Phase 1: Basic Website

- Set up project
- Build layout and theme
- Create homepage
- Create wish form
- Create memory wall
- Create photo upload
- Create gallery

## Phase 2: Backend

- Set up database
- Connect wish submission
- Connect photo upload
- Add image storage
- Add status system

## Phase 3: Admin

- Add admin authentication
- Build admin dashboard
- Add approve/hide/delete actions
- Add export feature

## Phase 4: Polish

- Add animation
- Improve mobile layout
- Add loading states
- Add error states
- Add SEO metadata
- Add QR code usage copy

---

# 30. Sample Homepage Copy

```text
S & J

Letters to Smart & Jajah

A digital guestbook for wishes, memories, and moments from our wedding day.

Thank you for being part of our celebration.
Leave us a wish, share a memory, or upload a beautiful moment from the day.

Sunday, 1 November 2026
Pearl Wedding Avenue

[Write a Wish]
[Upload a Moment]
[View Memory Wall]
```

---

# 31. Sample Wish Form Copy

```text
Write a Wish

Leave a message for Smart & Jajah.
Your words will become part of our wedding memories.

Your Name
[Input]

Relationship to the Couple
[Input]

Message Type
[Dropdown]

Your Message
[Textarea]

[ ] I agree that my message may be displayed on the wedding memory wall.

[Send Your Wish]
```

---

# 32. Sample Upload Form Copy

```text
Upload a Moment

Share your favorite photo from our wedding day.

Your Name
[Input]

Caption
[Input]

Category
[Dropdown]

Upload Photo
[File Upload]

[ ] I agree that my photo may be displayed in the wedding gallery.

[Upload Moment]
```

---

# 33. Sample Thank You Message

```text
Thank you for sharing your love with us.

Your message has been received and will be added to our memory wall soon.
```

---

# 34. Codex Implementation Prompt

```text
Please implement this project based on the attached wedding-memory-wall-guestbook-spec.md.
Use Next.js, TypeScript, Tailwind CSS, and Supabase.
Prioritize mobile-first design, elegant old money wedding styling, and a simple admin moderation workflow.
```

---

# 35. Overall Implementation Notes

The final website should feel simple, elegant, and emotionally meaningful.

Do not make the website look like a typical social media feed.  
It should feel like a refined digital wedding guestbook.

The most important experience is:

1. Guests can submit easily.
2. The couple can manage content safely.
3. The memory wall looks beautiful.
4. The website works perfectly on mobile.
5. The design matches Smart & Jajah’s old money wedding theme.

---

# 36. Final Deliverable

The developer should deliver:

- Fully responsive website
- Guest submission forms
- Public memory wall
- Public photo gallery
- Admin dashboard
- Database integration
- Image upload system
- Basic moderation workflow
- Deployment-ready project
- Clear environment variable setup
- README with setup instructions
