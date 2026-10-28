# MyMusic Lounge - Production Deployment Guide

## 1. Architecture Overview for Production
- **Frontend Client**: Deployable to Vercel, Netlify, Cloudflare Pages, or AWS S3 + CloudFront.
- **Backend API & WebSockets**: Node.js service deployable to Render, Railway, Fly.io, or AWS ECS/DigitalOcean.
- **Database**: Managed PostgreSQL database (Supabase, Neon, Render PostgreSQL, AWS RDS).
- **Optional Cache**: Managed Redis instance (Upstash, Redis Cloud) for distributed rate limiting and presence.

---

## 2. PostgreSQL Configuration

1. Set your `DATABASE_URL` in the production environment:
   ```env
   DATABASE_URL="postgresql://user:password@host:5432/mymusic_lounge?schema=public"
   ```

2. Point Prisma to the PostgreSQL schema or update `prisma/schema.prisma`:
   ```bash
   cp prisma/schema.postgresql.prisma prisma/schema.prisma
   npx prisma migrate deploy
   node prisma/seed.js
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
| `DATABASE_URL` | PostgreSQL connection URL | Yes | `postgresql://...` |
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
