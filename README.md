# MyMusic Lounge 🎵 (MongoDB Edition)

> *Your Music. Your Mood. Your Space.*

A modern, immersive, full-stack music listening platform inspired by the atmosphere and aesthetic of DeluxSalon.in, featuring a dual listening model: an **Owner-Controlled Live Radio Station** synchronized across all visitors, plus a **Personal Music Mode** for custom streaming and curation, powered by **MongoDB**.

---

## ✨ Features & Highlights

### 📻 Mode A: Owner-Controlled Station Radio
- **Full Owner Authority**: The site owner/admin selects the featured track, manages the global queue, and controls playback (play, pause, skip, seek).
- **Synchronized Broadcast**: Connected visitors receive real-time playback updates and track transitions via Socket.IO.
- **Accurate Presence Tracking**: Deduplicates multiple browser tabs per user or guest session for real, verifiable listener counts.
- **Dedicated Listening Room**: Ambient visualizer waveforms, live community chat, and current queue view.

### 🎧 Mode B: Personal Music Mode
- **Independent Sandbox**: Visitors can switch from the owner's broadcast to personal mode anytime.
- **Direct YouTube URL Streaming**: Paste any YouTube video link or video ID to stream instantly in your private session.
- **Custom Playlists**: Create, reorder, and curate personal playlists with custom titles and artwork.
- **Favorites & History**: Save tracks to your library and review your recent listening journey.

### 🛡️ Security & Enterprise Foundations
- **Role-Based Access Control (RBAC)**: Strict `USER`, `MODERATOR`, and `ADMIN` roles enforced on the backend.
- **Rate-Limiting & Validation**: Protection against brute-force authentication and spam flooding in chat.
- **Official YouTube IFrame Player**: Complies with YouTube Terms of Service without ripping, downloading, or violating copyright terms.
- **PWA Ready**: Includes web app manifest, custom SVG icons, service worker, and dedicated offline fallback.

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 18, Vite, React Router 6, Framer Motion, Lucide Icons, Pure Responsive CSS Variables (No Tailwind CSS) |
| **Backend** | Node.js, Express.js, REST API, Socket.IO WebSockets |
| **Database** | MongoDB (Mongoose ODM / MongoDB Atlas / Local MongoDB) |
| **Cache & Presence**| In-memory deduplicator with optional Redis fallback |
| **Audio Source** | Official YouTube IFrame Player API |

---

## 🚀 Quick Start Guide

### 1. Install Dependencies
```bash
# Install backend packages
cd server
npm install

# Install frontend packages
cd ../client
npm install
```

### 2. Configure MongoDB Database & Seed
```bash
cd ../server
npm run db:seed
```

### 3. Run Automated Tests
```bash
npm test
```
All 17 server tests will run and verify endpoints, authentication, and YouTube validators.

### 4. Start the Application
```bash
# Terminal 1 - Backend Server (Port 5000)
cd server
npm start

# Terminal 2 - Frontend Client (Port 5173)
cd client
npm run dev
```

Visit `http://localhost:5173` in your browser.

---

## 🔑 Default Administrator Credentials
- **Username / Email**: `admin@mymusiclounge.com`
- **Password**: `AdminLounge2026!`

---

## 📖 Documentation
- [Architecture & Design Decisions](docs/architecture.md)
- [REST & WebSocket API Reference](docs/api.md)
- [Local Development Setup](docs/setup.md)
- [Production Deployment Guide](docs/deployment.md)
