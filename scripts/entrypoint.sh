#!/bin/sh
set -e

echo "[entrypoint] Waiting for database…"
node <<'WAIT_DB'
const { PrismaClient } = require("@prisma/client");
const p = new PrismaClient();
(async () => {
  for (let i = 0; i < 40; i++) {
    try {
      await p.$queryRaw`SELECT 1`;
      console.log("[entrypoint] Database ready");
      await p.$disconnect();
      process.exit(0);
    } catch (e) {
      console.log("[entrypoint] DB not ready, retry", i + 1);
      await new Promise((r) => setTimeout(r, 2000));
    }
  }
  console.error("[entrypoint] Database timeout");
  process.exit(1);
})();
WAIT_DB

echo "[entrypoint] Running migrations / push…"
PRISMA="/prisma-tools/node_modules/.bin/prisma"
if [ ! -x "$PRISMA" ]; then
  PRISMA="node /prisma-tools/node_modules/prisma/build/index.js"
fi
cd /app
$PRISMA db push --skip-generate --accept-data-loss 2>/dev/null || \
  $PRISMA db push --skip-generate || true

echo "[entrypoint] Seeding…"
export NODE_PATH="/prisma-tools/node_modules:${NODE_PATH:-}"
if [ -f ./prisma/seed.js ]; then
  node ./prisma/seed.js || echo "[entrypoint] Seed warning (continuing)"
fi

echo "[entrypoint] Starting…"
exec "$@"
