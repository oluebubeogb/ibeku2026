# Ibeku League 2026 (SQLite)

Lightweight single-process app: Express + SQLite. No Postgres, no Prisma, no Next.js.

Typical memory: well under 100–150 MB.

## Features
- Full fixtures (group + knockout)
- Live / HT / FT scores
- Auto standings (top 2 qualify)
- Beautiful light UI
- Admin score updates

## Coolify
1. Push this repo
2. Docker Compose application
3. Set `ADMIN_USERNAME` / `ADMIN_PASSWORD`
4. Deploy

Data persists in the `ibeku_sqlite` volume.

## Migrate results from old app
Use Admin to enter existing full-time scores, or open a shell and update SQLite:

```sql
UPDATE matches SET status='FULL_TIME', ft_h=2, ft_a=1 WHERE id='g1';
```
