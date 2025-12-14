# Next.js Email Drafter Application - Complete Build Prompt

Build a full-stack email outreach automation application using **Next.js 14 (App Router)**, **Prisma**, **MySQL**, and **Gmail API** with the following complete specifications:

---

## 🎯 Application Overview

Create an email drafter application that allows users to:

1. Upload Excel files with prospect data
2. Select email templates with dynamic placeholders
3. Generate personalized Gmail drafts automatically via Gmail API
4. Embed screenshot images inline in emails
5. Manage templates and user access

---

## 🏗️ Tech Stack Requirements

- **Framework**: Next.js (App Router)
- **Database**: MySQL with Prisma ORM
- **Authentication**: NextAuth.js v5 with Google OAuth 2.0
- **File Processing**: XLSX library for Excel parsing
- **Email**: Gmail API (googleapis package) for draft creation
- **Styling**: Tailwind CSS + shadcn/ui components
- **State Management**: React hooks + Server Actions
- **Deployment**: Vercel-ready configuration

---

## 📋 Database Schema (Prisma)

### User Model

```prisma
model User {
  id                  String    @id @default(cuid())
  email               String    @unique
  name                String?
  isAdmin             Boolean   @default(false)
  isApproved          Boolean   @default(false)
  gmailConnected      Boolean   @default(false)
  gmailAccessToken    String?   @db.Text
  gmailRefreshToken   String?   @db.Text
  gmailTokenExpiry    DateTime?
  createdAt           DateTime  @default(now())
  updatedAt           DateTime  @updatedAt
}

model EmailTemplate {
  id        Int      @id @default(autoincrement())
  name      String   @unique
  subject   String   @db.Text
  body      String   @db.Text
  createdAt DateTime @default(now())
}

model UploadedRow {
  id                      Int       @id @default(autoincrement())
  fileId                  String
  firstName               String?
  clientBusinessName      String?
  clientTraffic           Int?
  website                 String?   @db.Text
  competitorName          String?
  competitorTraffic       Int?
  competitorWebsite       String?
  competitorName2         String?
  competitorTraffic2      Int?
  competitorWebsite2      String?
  clientScreenshotUrl     String?   @db.Text
  competitorScreenshotUrl String?   @db.Text
  sendingAccountName      String?
  createdAt               DateTime  @default(now())

  @@index([fileId])
}
```

---

## 🔐 Authentication & Authorization

### NextAuth Configuration

- **Provider**: Google OAuth 2.0 with Gmail API scopes
- **Required Scopes**:

  - `openid`
  - `email`
  - `profile`
  - `https://www.googleapis.com/auth/gmail.compose`
  - `https://www.googleapis.com/auth/gmail.modify`

- **Session Strategy**: JWT
- **Callbacks**:
  - Store Gmail tokens (access_token, refresh_token, expiry) in database
  - Check user approval status on sign-in
  - Set admin flag in session

### Access Control

- **Public Routes**: `/`, `/login`
- **Protected Routes**: All other routes require authentication
- **Approval Required**: Non-admin users need `isApproved = true` to access dashboard
- **Admin Routes**: `/admin` - only for users with `isAdmin = true`

---

## 📱 Application Pages & Features

### 1. Landing Page (`/`)

- Hero section with app description
- "Get Started with Google" CTA button
- Features showcase
- Redirect to dashboard if already logged in

### 2. Authentication Pages

- **Login (`/login`)**: Google OAuth button
- **Callback**: `/api/auth/callback/google`
- **Pending Approval**: Show message if user not yet approved

### 3. Dashboard (`/dashboard`)

**Top Section - Gmail Connection**

- Display connection status (Connected/Not Connected)
- "Connect Gmail" button if not connected
- Opens Google OAuth consent for Gmail API scopes
- Shows user's connected email

**Main Features**

- Excel file upload area (drag & drop + click to browse)
- Template selector dropdown (fetches from database)
- "Generate Drafts" button
- Progress indicator during draft generation
- Success/failure summary after completion

### 4. Admin Panel (`/admin`)

**User Management Table**

- List all users with columns: Name, Email, Status (Approved/Pending), Created Date
- Approve/Reject buttons for each pending user
- Filter by status (All/Approved/Pending)
- Real-time updates after approval actions

**Template Management**

- Create new email templates
- Edit existing templates
- Delete templates
- Preview templates with placeholder examples

---

## 🛠️ Core Functionality Implementation

### Excel File Upload & Processing

**Endpoint**: Server Action `/app/actions/uploadExcel.ts`

**Expected Excel Columns**:

```
- Website
- Company Name
- Client Traffic
- Competitor website 1
- Competitor Business Name 1
- Competitor traffic 1
- Competitor Website 2
- Competitor Business Name 2
- Competitor Traffic 2
- Client Screenshot
- Competitor Screenshot
- Name
- Email
```

**Process**:

1. Accept file via FormData
2. Parse with XLSX library
3. Validate required columns: Website, Company Name, Client Traffic, Name, Email
4. Generate unique fileId (UUID)
5. Convert Gyazo/screenshot URLs to direct image links:
   - Input: `https://gyazo.com/160a9fe00d05b15e00e0e8f75165d771`
   - Output: `https://i.gyazo.com/160a9fe00d05b15e00e0e8f75165d771.png`
6. Bulk insert rows into database
7. Return fileId and row count

### Email Template System

**Placeholder Support**:

```javascript
{
  '{{First Name}}': firstName,
  '{{Company Name}}': clientBusinessName,
  '{{Website}}': website,
  '{{Client Traffic}}': clientTraffic,
  '{{Competitor Business Name 1}}': competitorName,
  '{{Competitor Traffic 1}}': competitorTraffic,
  '{{Competitor Website 1}}': competitorWebsite,
  '{{Competitor Business Name 2}}': competitorName2,
  '{{Competitor Traffic 2}}': competitorTraffic2,
  '{{Competitor Website 2}}': competitorWebsite2,
  '{{Client Screenshot}}': clientScreenshotUrl (embedded as image),
  '{{Competitor Screenshot}}': competitorScreenshotUrl (embedded as image),
  '{{Email}}': sendingAccountName
}
```

**Template Replacement Logic**:

- Replace all placeholders in subject and body
- Convert screenshot placeholders to HTML `<img>` tags
- Generate clean HTML for email body

### Gmail Draft Generation

**Endpoint**: Server Action `/app/actions/generateDrafts.ts`

**Process**:

1. Verify user has Gmail connected
2. Check token expiry, refresh if needed using refresh token
3. Fetch template by ID
4. Fetch all uploaded rows for fileId
5. For each row:
   - Replace placeholders in subject and body
   - Convert newlines to `<br>` tags
   - Embed screenshots as inline `<img>` tags if URLs present
   - Create RFC 2822 formatted email with nodemailer
   - Base64url encode the message
   - Create draft via Gmail API: `gmail.users.drafts.create()`
6. Return array of results (success/failure per row)

**Gmail API Setup**:

```javascript
import { google } from "googleapis";

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

oauth2Client.setCredentials({
  access_token: user.gmailAccessToken,
  refresh_token: user.gmailRefreshToken,
  expiry_date: user.gmailTokenExpiry,
});

const gmail = google.gmail({ version: "v1", auth: oauth2Client });
```

**Auto-populate Recipient**: Use Email column from Excel as recipient (`to` field)

### Screenshot Embedding

- Replace screenshot URL placeholders with HTML img tags
- Use inline styling: `max-width: 100%; height: auto;`
- Display images in email body (not as attachments)
- Example HTML output:

```html
<div>
  Email text content<br />
  <img
    src="https://i.gyazo.com/xxxxx.png"
    alt="Client Screenshot"
    style="max-width: 100%; height: auto;"
  />
</div>
```

---

## ⚙️ Environment Variables

```env
# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-nextauth-secret

# Google OAuth
GOOGLE_CLIENT_ID=your_client_id
GOOGLE_CLIENT_SECRET=your_client_secret
GOOGLE_REDIRECT_URI=http://localhost:3000/api/auth/callback/google

# Database
DATABASE_URL="mysql://user:password@localhost:3306/email_drafter"

# App Config
NODE_ENV=development
```

---

## 🎨 UI/UX Requirements

### Design System

- Use Tailwind CSS with shadcn/ui components
- Color scheme: Professional (blues, grays)
- Responsive design (mobile, tablet, desktop)
- Loading states for all async operations
- Error boundaries and error messages
- Toast notifications for success/error feedback

### Key Components

1. **FileUpload**: Drag-drop area with file validation
2. **TemplateSelector**: Searchable dropdown
3. **GmailConnectButton**: OAuth flow trigger
4. **StatusBadge**: Connected/Pending/Approved states
5. **DataTable**: Admin user management table
6. **TemplateEditor**: Rich text editor for template body

---

## 🔄 API Routes & Server Actions

### Server Actions (App Router)

```
/app/actions/
  - uploadExcel.ts
  - generateDrafts.ts
  - getTemplates.ts
  - createTemplate.ts
  - updateTemplate.ts
  - deleteTemplate.ts
  - approveUser.ts
  - connectGmail.ts
```

### API Routes

```
/app/api/
  - auth/[...nextauth]/route.ts (NextAuth)
  - gmail/callback/route.ts (Gmail OAuth callback)
```

---

## 🧪 Testing & Validation

### Input Validation

- Excel file format (must be .xlsx or .xls)
- Required columns present
- Email format validation
- URL format for screenshots

### Error Handling

- Graceful handling of Gmail API failures
- Token refresh failures → prompt re-connection
- File parsing errors with user-friendly messages
- Database errors with retry logic

---

## 🚀 Deployment Configuration

### Vercel Deployment

- Automatic deployments from main branch
- Environment variables configured in Vercel dashboard
- MySQL database (PlanetScale, Railway, or other)
- Edge runtime for optimal performance

### Database Migration

- Use Prisma migrate for schema changes
- Seed initial email templates
- Create default admin user

---

## 📦 Package.json Dependencies

```json
{
  "dependencies": {
    "next": "^14.0.0",
    "react": "^18.2.0",
    "next-auth": "^5.0.0-beta",
    "prisma": "^5.0.0",
    "@prisma/client": "^5.0.0",
    "googleapis": "^130.0.0",
    "nodemailer": "^6.9.0",
    "xlsx": "^0.18.5",
    "uuid": "^9.0.0",
    "tailwindcss": "^3.4.0",
    "@radix-ui/react-*": "latest",
    "class-variance-authority": "^0.7.0",
    "clsx": "^2.0.0",
    "lucide-react": "^0.300.0"
  }
}
```

---

## 🎯 Sample Email Templates to Seed

### Template 1: Traffic Comparison Outreach

**Subject**: `Boost {{Company Name}}'s Traffic Beyond {{Competitor Business Name 1}}`

**Body**:

```
Hi {{First Name}},

I noticed that {{Company Name}} ({{Website}}) currently has {{Client Traffic}} monthly visitors, while your competitor {{Competitor Business Name 1}} ({{Competitor Website 1}}) is getting {{Competitor Traffic 1}} visits.

I specialize in helping businesses like yours increase their online visibility and outrank competitors. Here's what I found about your website:

{{Client Screenshot}}

And here's what {{Competitor Business Name 1}} is doing:

{{Competitor Screenshot}}

I'd love to show you how we can help {{Company Name}} capture more market share and increase your traffic. Would you be interested in a quick 15-minute call to discuss strategies?

Best regards
```

---

## ✅ Implementation Checklist

1. [ ] Initialize Next.js 14 project with TypeScript
2. [ ] Set up Prisma with MySQL
3. [ ] Configure NextAuth with Google OAuth
4. [ ] Implement Gmail OAuth with required scopes
5. [ ] Create database models and migrations
6. [ ] Build landing page and login flow
7. [ ] Implement dashboard with file upload
8. [ ] Create Excel parsing logic
9. [ ] Build template selector and management
10. [ ] Implement Gmail draft generation with API
11. [ ] Add screenshot URL conversion utility
12. [ ] Create admin panel for user approval
13. [ ] Implement template CRUD operations
14. [ ] Add token refresh logic for Gmail
15. [ ] Style with Tailwind and shadcn/ui
16. [ ] Add error handling and loading states
17. [ ] Test end-to-end workflow
18. [ ] Deploy to Vercel
19. [ ] Configure production environment variables

---

## 🔒 Security Best Practices

1. Never expose API keys in client-side code
2. Store OAuth tokens encrypted in database
3. Use environment variables for all secrets
4. Implement CSRF protection (NextAuth handles this)
5. Validate all user inputs server-side
6. Use parameterized queries (Prisma handles this)
7. Implement rate limiting on API endpoints
8. Add helmet.js headers for security

---

## 📚 Additional Features (Optional Enhancements)

1. **Email analytics**: Track draft creation stats
2. **Bulk template operations**: Apply templates to multiple uploads
3. **Email scheduling**: Schedule draft sends
4. **Team collaboration**: Multiple users, shared teams
5. **A/B testing**: Multiple template variants
6. **Email tracking**: Open rates, click rates (requires webhook)
7. **Export drafts**: Download as CSV
8. **Duplicate detection**: Prevent duplicate emails to same recipient

---

This prompt provides complete specifications to rebuild the entire Email Drafter application as a modern Next.js full-stack application with all existing functionality preserved and properly structured for scalability.
