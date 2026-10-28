# MyMusic Lounge - Local Setup Guide

Follow this guide to run MyMusic Lounge locally for development or testing.

## Prerequisites
- Node.js (v18.0.0 or higher, tested on Node.js v24.11)
- npm or pnpm

---

## 1. Quick Start (Monorepo)

From the project root:

### Step 1: Install Dependencies
```bash
# In server directory
cd server
npm install

# In client directory
cd ../client
npm install
```

### Step 2: Configure Environment Variables
Copy `.env.example` to `.env` in both root and `server/`:
```bash
cp server/.env.example server/.env
```

### Step 3: Initialize Database and Seed Data
```bash
cd server
npx prisma db push
node prisma/seed.js
```
The database seed creates:
- Initial administrator account: `admin@mymusiclounge.com` / `AdminLounge2026!`
- 8 high-quality catalog tracks with valid YouTube IDs
- 6 curated playlists ("Chill & Relax", "Coding Focus", "Lo-Fi Sessions", etc.)
- Active station state and broadcast queue

### Step 4: Run the Automated Tests
```bash
cd server
npm test
```
All 17 integration & unit tests will run and verify endpoints, auth, and validators.

### Step 5: Start Development Servers
Run the backend and frontend concurrently:
```bash
# Terminal 1 (Backend API & Socket.IO server on port 5000):
cd server
npm start

# Terminal 2 (Vite Frontend on port 5173):
cd client
npm run dev
```

Open your browser at:
`http://localhost:5173`

---

## 2. Administrator Access
Log in using the seeded credentials:
- **Identifier**: `admin@mymusiclounge.com`
- **Password**: `AdminLounge2026!`

After logging in, click the **Admin** shield button in the top navigation bar to open the Owner Control Room (`/admin`), where you can:
- Control live station broadcast (play/pause/skip)
- Reorder the station broadcast queue
- Add new songs by URL
- Manage playlists and site branding
