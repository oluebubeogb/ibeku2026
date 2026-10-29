# Ibeku League 2026 (clean)

Minimal league platform: fixtures, standings, knockout, results, admin score updates.

## Features
- Full group stage (24 matches) + knockout bracket
- Live / HT / FT status + scores
- Auto-calculated group standings (top 2 advance)
- Simple admin login to update any match score
- Lightweight (Prisma singleton + connection limits + 512 MB Node heap)

## Coolify / Docker
1. Push this repo
2. Create Docker Compose application
3. Set env vars from `.env.example` (especially strong `POSTGRES_PASSWORD` and `ADMIN_PASSWORD`)
4. Deploy

Admin: `/admin` with `ADMIN_USERNAME` / `ADMIN_PASSWORD`

Health: `/api/health`
