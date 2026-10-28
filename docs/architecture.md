# MyMusic Lounge - System Architecture

## Overview
**MyMusic Lounge** is a full-stack, production-ready music listening platform designed to emulate the sleek, ambient luxury atmosphere of DeluxSalon.in with a dual listening paradigm:
1. **Mode A: Owner-Controlled Station Radio**: The platform owner/admin has full control over the live broadcast, current track selection, and global queue. All connected visitors receive real-time synchronized playback and track changes via WebSockets.
2. **Mode B: Personal Music Mode**: Visitors can explore the catalog, paste direct YouTube video URLs or video IDs, build personal playlists, reorder songs, mark favorites, and review their listening history without ever interfering with the global station broadcast.

---

## High-Level Architecture Diagram

```
+---------------------------------------------------------------------------------+
|                                 CLIENT TIER                                     |
|                                                                                 |
|  +--------------------+   +-----------------------+   +----------------------+  |
|  | React 18 + Vite    |   | Official YouTube API  |   | Socket.IO Client     |  |
|  | Theme & Lounge CSS |   | IFrame Player Bridge  |   | Real-time Presence   |  |
|  +--------------------+   +-----------------------+   +----------------------+  |
|            |                          |                          |              |
+------------|--------------------------|--------------------------|--------------+
             | REST API Requests        | Authorized Embedded Stream| Bi-directional
             v                          v                          v
+---------------------------------------------------------------------------------+
|                                 SERVER TIER                                     |
|  Node.js / Express.js REST API & Real-time Socket.IO Gateway                    |
|                                                                                 |
|  +-----------------------+  +----------------------+  +----------------------+  |
|  | Auth & RBAC (JWT)     |  | Station Sync Engine  |  | Chat Moderation      |  |
|  +-----------------------+  +----------------------+  +----------------------+  |
|  | Catalog & Playlists   |  | Presence Manager     |  | YouTube Validator    |  |
|  +-----------------------+  +----------------------+  +----------------------+  |
+---------------------------------------------------------------------------------+
             |                                                     |
             v                                                     v
+-----------------------------+                           +-----------------------+
|        DATABASE TIER        |                           |     OPTIONAL CACHE    |
| Prisma ORM                  |                           | Redis / In-Memory     |
| (PostgreSQL / SQLite Dev)   |                           | Deduplicated Presence |
+-----------------------------+                           +-----------------------+
```

---

## Core Components

### 1. YouTube Player Integration & ToS Compliance
- Adheres strictly to YouTube Terms of Service by embedding the genuine YouTube IFrame Player API.
- Audio is never ripped, extracted, or stored on the server.
- Supports comprehensive URL formats (`/watch?v=`, `youtu.be/`, `/shorts/`, `/embed/`, and direct 11-char video IDs).
- Detects browser autoplay policy blocking and surfaces an ambient "Join Lounge Audio" button to guarantee user interaction unlocks audio seamlessly.
- Surfaces distinct error states for restricted or region-locked embeddings (error codes 100, 101, 150).

### 2. Station Synchronization & Source of Truth
- The server's `StationService` acts as the single source of truth for the station's track, queue, playback state, and timestamp.
- On connection, late-joining clients receive the current track and calculated elapsed time to seek in synchrony.
- Admin commands (`play`, `pause`, `seek`, `next`, `set-track`, `add-queue`, `remove-queue`, `reorder-queue`) broadcast through Socket.IO room `lounge`.

### 3. Presence Tracking & Listener Count Deduplication
- `PresenceService` tracks active sockets and dedupes multiple tabs from the same user or guest session.
- Stale sockets are cleaned up on disconnect, and updated listener counts are broadcast to all clients.
- Prevents fabricated listener metrics.

### 4. Security & Role-Based Access Control (RBAC)
- Password hashing with Bcrypt.
- Authenticated JWT bearer tokens and HTTP-only cookies.
- Express middleware `protect`, `requireAdmin`, and `requireModeratorOrAdmin`.
- Sockets authenticate using tokens during handshake.
- Non-admin attempts to manipulate station controls return 403 Forbidden.
