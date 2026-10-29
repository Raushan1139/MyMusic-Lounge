# MyMusic Lounge - System Architecture (MongoDB Edition)

## Overview
**MyMusic Lounge** is a full-stack, production-ready music listening platform inspired by the luxury atmosphere of DeluxSalon.in, featuring a dual-listening paradigm backed by a **MongoDB database**:
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
| MongoDB Database            |                           | Redis / In-Memory     |
| (Mongoose ODM / Atlas /     |                           | Deduplicated Presence |
| Local MongoDB instance)     |                           | Rate-limiting         |
+-----------------------------+                           +-----------------------+
```

---

## MongoDB Collections & Schema Design

The MongoDB database is organized into the following document collections:

1. **`users`**:
   - `username`, `email`, `passwordHash`, `role` (`USER`, `ADMIN`, `MODERATOR`), `avatarUrl`, `createdAt`, `updatedAt`
   - Unique indexes on `username` and `email`.

2. **`tracks`**:
   - `title`, `artist`, `album`, `thumbnailUrl`, `provider` (`youtube`), `providerVideoId`, `durationSeconds`, `isPublished`
   - Compound unique index on `{ provider: 1, providerVideoId: 1 }`.

3. **`playlists`**:
   - `name`, `description`, `coverUrl`, `owner` (ObjectId ref `users`), `isPublic`, `isPublished`, `tracks` (Array of subdocuments `{ track: ObjectId, position: Number, addedAt: Date }`)
   - Index on `owner` and `{ isPublic: 1, isPublished: 1 }`.

4. **`favorites`**:
   - `user` (ObjectId ref `users`), `track` (ObjectId ref `tracks`), `createdAt`
   - Compound unique index on `{ user: 1, track: 1 }`.

5. **`listeninghistories`**:
   - `user` (ObjectId ref `users`), `track` (ObjectId ref `tracks`), `playedAt`
   - Index on `{ user: 1, playedAt: -1 }`.

6. **`stations`**:
   - `name`, `description`, `currentTrack` (ObjectId ref `tracks`), `defaultPlaylist` (ObjectId ref `playlists`), `playbackState` (`PLAYING`, `PAUSED`, `STOPPED`), `positionSeconds`, `queue` (Array of subdocuments `{ track: ObjectId, position: Number, addedAt: Date }`).

7. **`chatmessages`**:
   - `user` (ObjectId ref `users`), `message`, `createdAt`, `deletedAt`
   - Index on `createdAt`.

8. **`appsettings`**:
   - `key`, `value`, `updatedAt`
   - Unique index on `key`.
