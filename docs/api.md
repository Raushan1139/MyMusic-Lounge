# MyMusic Lounge - REST & WebSocket API Specification

## Base URL
`/api`

---

## 1. Authentication Endpoints

### `POST /api/auth/register`
Creates a new listener account.
- **Body**: `{ username, email, password }`
- **Response**: `{ success: true, token, user }`

### `POST /api/auth/login`
Authenticates a user and sets an HTTP-only cookie.
- **Body**: `{ identifier, password }`
- **Response**: `{ success: true, token, user }`

### `POST /api/auth/logout`
Clears session cookies.
- **Response**: `{ success: true, message: "Logged out successfully." }`

### `GET /api/auth/me`
Retrieves current authenticated profile.
- **Headers**: `Authorization: Bearer <token>`
- **Response**: `{ success: true, user }`

---

## 2. Music Catalog Endpoints

### `GET /api/tracks`
Lists published tracks.
- **Query Params**: `search`, `page`, `limit`
- **Response**: `{ success: true, tracks: [...], pagination: { total, page, pages } }`

### `POST /api/tracks/validate-url`
Validates a YouTube URL or video ID and returns normalized metadata.
- **Body**: `{ url }`
- **Response**: `{ success: true, data: { videoId, watchUrl, embedUrl, thumbnailUrl } }`

### `POST /api/tracks/admin` (Admin Only)
Adds a new song to the catalog.
- **Headers**: `Authorization: Bearer <admin_token>`
- **Body**: `{ title, artist, album, url, thumbnailUrl }`
- **Response**: `{ success: true, track }`

### `PATCH /api/tracks/admin/:id` (Admin Only)
Updates song metadata or published status.

### `DELETE /api/tracks/admin/:id` (Admin Only)
Removes song from the catalog.

---

## 3. Playlists Endpoints

### `GET /api/playlists`
Returns public published playlists or the authenticated user's playlists (`?mine=true`).

### `GET /api/playlists/:id`
Returns a single playlist with ordered tracks.

### `POST /api/playlists` (Authenticated)
Creates a new playlist.
- **Body**: `{ name, description, coverUrl, isPublic }`

### `POST /api/playlists/:id/tracks` (Owner/Admin)
Adds a track to a playlist via catalog `trackId` or direct `youtubeUrl`.

### `DELETE /api/playlists/:id/tracks/:trackId` (Owner/Admin)
Removes a track and re-indexes the playlist order.

### `PUT /api/playlists/:id/tracks/reorder` (Owner/Admin)
Reorders tracks by array of IDs.
- **Body**: `{ orderedTrackIds: [...] }`

---

## 4. Favorites & History Endpoints

### `GET /api/me/favorites` (Authenticated)
Retrieves saved favorite songs.

### `POST /api/me/favorites/:trackId` (Authenticated)
Saves track to favorites.

### `DELETE /api/me/favorites/:trackId` (Authenticated)
Removes track from favorites.

### `GET /api/me/history` (Authenticated)
Retrieves recently played tracks.

---

## 5. Station & Presence Endpoints

### `GET /api/station`
Returns current station broadcast status, active track, queue, and listener count.

### `GET /api/station/queue`
Returns ordered station queue.

### `PATCH /api/station/admin` (Admin Only)
Controls playback (`action: 'play' | 'pause' | 'next' | 'seek'`) or station details.

### `POST /api/station/admin/current-track` (Admin Only)
Immediately switches the broadcast to a given `trackId`.

### `POST /api/station/admin/queue` (Admin Only)
Appends a track to the station broadcast queue.

### `DELETE /api/station/admin/queue/:id` (Admin Only)
Removes a track from the station broadcast queue.

### `GET /api/station/admin/stats` (Admin Only)
Returns accurate platform metrics (total users, tracks, playlists, active listeners).

---

## 6. Socket.IO Real-time Events

### Incoming (Server to Client):
- `station:state`: Broadcasts full station state on connect or update.
- `station:track-changed`: Triggered when the current song transitions.
- `station:playback-updated`: Triggered when playback pauses, plays, or seeks.
- `station:queue-updated`: Triggered when queue items are added, removed, or reordered.
- `listeners:count`: Real-time active deduplicated listeners count `{ count }`.
- `chat:history`: Recent 50 messages sent on initial connection.
- `chat:message`: Broadcast when any listener posts a message.
- `chat:message-deleted`: Broadcast when a moderator removes a message `{ messageId }`.

### Outgoing (Client to Server):
- `chat:send`: `{ message }` (Rate-limited, validated).
- `chat:delete`: `{ messageId }` (Requires ADMIN or MODERATOR).
- `admin:control`: `{ action, trackId, position, queueId }` (Privileged station actions).
