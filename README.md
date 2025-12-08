# Email Drafter - Authentication System

full authentication + approval flow using express.js, mysql, prisma, react, and daisyui

## quick start

### prerequisites

- node.js and pnpm installed
- mysql server running
- google oauth client id ([get it here](https://console.cloud.google.com/))

### backend setup

```bash
cd server
pnpm install
cp .env.example .env
# edit .env with your credentials
npx prisma generate
npx prisma db push
pnpm run dev
```

### frontend setup

```bash
cd web
pnpm install
cp .env.example .env
# edit .env with your google client id
pnpm run dev
```

## features

✅ google oauth login for users  
✅ hardcoded admin login (email/password)  
✅ approval system - admin approves users  
✅ role-based routing (user vs admin)  
✅ jwt authentication  
✅ daisyui "black" theme  
✅ protected routes

## routes

### user routes

- `/` - login with google
- `/request-approval` - pending approval message
- `/dashboard` - user dashboard (protected, approved users only)

### admin routes

- `/admin` - admin login
- `/admin/dashboard` - admin panel with user table (protected, admin only)

## tech stack

**backend**

- express.js
- mysql + prisma
- jsonwebtoken
- google-auth-library

**frontend**

- react 19
- react router dom
- daisyui v5 + tailwind v4
- axios
- @react-oauth/google

## default credentials

admin (set in backend `.env`):

- email: `admin@example.com`
- password: `admin123`

users: login with any google account

## documentation

see [walkthrough.md](file:///home/raghav-dwivedi/.gemini/antigravity/brain/41b50534-6125-42bb-b7b1-96d05204d1a5/walkthrough.md) for detailed setup instructions and testing guide.
