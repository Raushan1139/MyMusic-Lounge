# MyMusic Lounge - Production Deployment Guide (MongoDB)

## 1. Architecture Overview for Production
- **Frontend Client**: Deployable to Vercel, Netlify, Cloudflare Pages, or AWS S3 + CloudFront.
- **Backend API & WebSockets**: Node.js service deployable to Render, Railway, Fly.io, or AWS ECS/DigitalOcean.
- **Database**: Managed MongoDB (MongoDB Atlas, Render MongoDB, or AWS DocumentDB).
- **Optional Cache**: Managed Redis instance (Upstash, Redis Cloud) for distributed rate limiting and presence.

---

## 2. MongoDB Atlas Configuration

1. Create a free or dedicated cluster on [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Create a database user and whitelist your server's IP address (or `0.0.0.0/0` with secure credentials).
3. Copy your connection string into `MONGODB_URI`:
   ```env
   MONGODB_URI="mongodb+srv://username:password@cluster.mongodb.net/mymusic_lounge?retryWrites=true&w=majority"
   ```
4. Run the seed script:
   ```bash
   npm run db:seed
   ```

---

## 3. Environment Variables Checklist

| Variable | Description | Required | Example |
| :--- | :--- | :--- | :--- |
| `NODE_ENV` | Environment mode | Yes | `production` |
| `PORT` | HTTP Server port | Yes | `5000` |
| `CLIENT_URL` | Frontend URL for CORS | Yes | `https://lounge.yourdomain.com` |
| `JWT_SECRET` | Secret key for JWT auth | Yes | `32+ random characters` |
| `JWT_EXPIRES_IN` | Token lifetime | No | `7d` |
| `MONGODB_URI` | MongoDB connection URI | Yes | `mongodb+srv://...` |
| `REDIS_URL` | Redis caching & presence | Optional | `rediss://...` |
| `ADMIN_EMAIL` | Initial Admin Email | Optional | `admin@yourdomain.com` |
| `ADMIN_PASSWORD` | Initial Admin Password | Optional | `StrongPassword123!` |

---

## 4. Frontend Production Build & PWA
Build the client static assets:
```bash
cd client
npm run build
```
This generates the optimized bundle in `client/dist/`.
- Ensure HTTPS is configured on your domain so the Progressive Web App (PWA) service worker can register and provide offline fallbacks.
