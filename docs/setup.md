# MyMusic Lounge - Local Setup Guide (MongoDB)

Follow this guide to run MyMusic Lounge locally for development or testing with MongoDB.

## Prerequisites
- Node.js (v18.0.0 or higher, tested on Node.js v24.11)
- npm or pnpm
- MongoDB (Optional: local MongoDB daemon, Docker MongoDB, or MongoDB Atlas; the application includes an automatic zero-config fallback if MongoDB is not running locally).

---

## 1. Quick Start

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
Copy `.env.example` to `.env` in `server/`:
```bash
cp server/.env.example server/.env
```
Ensure your `MONGODB_URI` is set:
```env
MONGODB_URI="mongodb://127.0.0.1:27017/mymusic_lounge"
```
*(Or point to your MongoDB Atlas connection string `mongodb+srv://...`)*

### Step 3: Seed MongoDB Database
```bash
cd server
npm run db:seed
```
The database seeder creates:
- Initial administrator account: `admin@mymusiclounge.com` / `AdminLounge2026!`
- 8 high-quality catalog tracks with valid YouTube IDs
- 6 curated playlists ("Chill & Relax", "Coding Focus", "Lo-Fi Sessions", etc.)
- Active station state and broadcast queue in MongoDB

### Step 4: Run Automated Tests
```bash
cd server
npm test
```
All 17 integration & unit tests will run and verify endpoints, auth, and MongoDB operations.

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

After logging in, click the **Admin** shield button in the top navigation bar to open the Owner Control Room (`/admin`).
