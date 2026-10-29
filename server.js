import express from "express";
import cookieParser from "cookie-parser";
import bcrypt from "bcryptjs";
import Database from "better-sqlite3";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = process.env.PORT || 3000;
const DB_PATH = process.env.DB_PATH || path.join(__dirname, "data", "ibeku.db");
const ADMIN_USER = process.env.ADMIN_USERNAME || "admin";
const ADMIN_PASS = process.env.ADMIN_PASSWORD || "ibeku2026";
const COOKIE_SECURE = process.env.COOKIE_SECURE === "true";

fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
const db = new Database(DB_PATH);
db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

function initDb() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS teams (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      short TEXT NOT NULL,
      grp TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS matches (
      id TEXT PRIMARY KEY,
      md INTEGER,
      date TEXT NOT NULL,
      grp TEXT,
      home TEXT,
      away TEXT,
      home_slot TEXT,
      away_slot TEXT,
      stage TEXT NOT NULL DEFAULT 'GROUP',
      slot TEXT,
      status TEXT NOT NULL DEFAULT 'SCHEDULED',
      ht_h INTEGER,
      ht_a INTEGER,
      ft_h INTEGER,
      ft_a INTEGER
    );
    CREATE TABLE IF NOT EXISTS admin (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      username TEXT NOT NULL,
      password_hash TEXT NOT NULL
    );
  `);

  const teamCount = db.prepare("SELECT COUNT(*) AS c FROM teams").get().c;
  if (teamCount === 0) seed();
  const admin = db.prepare("SELECT 1 FROM admin WHERE id = 1").get();
  if (!admin) {
    const hash = bcrypt.hashSync(ADMIN_PASS, 10);
    db.prepare("INSERT INTO admin (id, username, password_hash) VALUES (1, ?, ?)").run(ADMIN_USER, hash);
    console.log("[seed] Admin:", ADMIN_USER);
  }
}

function seed() {
  const teams = [
    ["amuzukwu", "Amuzukwu", "AMZ", "A"],
    ["umuhu-ajata", "Umuhu Ajata", "UAJ", "A"],
    ["ikeaha-fc", "Ikeaha FC", "IKE", "A"],
    ["ossah-fc", "Ossah FC", "OSS", "A"],
    ["ndume-okpu-fc", "Ndume Okpu FC", "NDO", "B"],
    ["umuajiji-fc", "Umuajiji FC", "UMJ", "B"],
    ["umuana-fc", "Umuana FC", "UMN", "B"],
    ["ugba-fc", "Ugba FC", "UGB", "B"],
    ["nkata-fc", "Nkata FC", "NKA", "C"],
    ["afaraukwu-fc", "Afaraukwu FC", "AFA", "C"],
    ["okwuta-fc", "Okwuta FC", "OKW", "C"],
    ["iyienyi-fc", "Iyienyi FC", "IYI", "C"],
    ["ajata-okwuru-fc", "Ajata Okwuru FC", "AJT", "D"],
    ["amuzuoro-fc", "Amuzuoro FC", "AMZ", "D"],
    ["avonkwu-fc", "Avonkwu FC", "AVO", "D"],
    ["amatoh-fc", "Amatoh FC", "AMT", "D"],
  ];
  const insT = db.prepare("INSERT INTO teams (id, name, short, grp) VALUES (?, ?, ?, ?)");
  for (const t of teams) insT.run(...t);

  // [md, date, group, home, away, status, ftH, ftA]
  const groupMatches = [
    [1, "2026-10-11", "A", "amuzukwu", "ossah-fc", "FULL_TIME", 2, 2],
    [2, "2026-10-15", "B", "ndume-okpu-fc", "umuajiji-fc", "FULL_TIME", 2, 2],
    [3, "2026-10-17", "C", "nkata-fc", "afaraukwu-fc", "FULL_TIME", 1, 1],
    [4, "2026-10-22", "D", "ajata-okwuru-fc", "amuzuoro-fc", "FULL_TIME", 1, 0],
    [5, "2026-10-24", "A", "umuhu-ajata", "ikeaha-fc", "FULL_TIME", 3, 0],
    [6, "2026-10-25", "B", "umuana-fc", "ugba-fc", "FULL_TIME", 0, 1],
    [7, "2026-10-29", "C", "okwuta-fc", "iyienyi-fc", "SCHEDULED", null, null],
    [8, "2026-10-31", "D", "avonkwu-fc", "amatoh-fc", "SCHEDULED", null, null],
    [9, "2026-11-01", "A", "amuzukwu", "umuhu-ajata", "SCHEDULED", null, null],
    [10, "2026-11-05", "B", "ndume-okpu-fc", "umuana-fc", "SCHEDULED", null, null],
    [11, "2026-11-07", "C", "nkata-fc", "okwuta-fc", "SCHEDULED", null, null],
    [12, "2026-11-08", "D", "ajata-okwuru-fc", "avonkwu-fc", "SCHEDULED", null, null],
    [13, "2026-11-12", "A", "ikeaha-fc", "ossah-fc", "SCHEDULED", null, null],
    [14, "2026-11-14", "B", "umuajiji-fc", "ugba-fc", "SCHEDULED", null, null],
    [15, "2026-11-19", "C", "afaraukwu-fc", "iyienyi-fc", "SCHEDULED", null, null],
    [16, "2026-11-26", "D", "amuzuoro-fc", "amatoh-fc", "SCHEDULED", null, null],
    [17, "2026-11-28", "A", "amuzukwu", "ikeaha-fc", "SCHEDULED", null, null],
    [18, "2026-12-03", "B", "ndume-okpu-fc", "ugba-fc", "SCHEDULED", null, null],
    [19, "2026-12-05", "C", "nkata-fc", "iyienyi-fc", "SCHEDULED", null, null],
    [20, "2026-12-06", "D", "ajata-okwuru-fc", "amatoh-fc", "SCHEDULED", null, null],
    [21, "2026-12-10", "A", "umuhu-ajata", "ossah-fc", "SCHEDULED", null, null],
    [22, "2026-12-12", "B", "umuajiji-fc", "umuana-fc", "SCHEDULED", null, null],
    [23, "2026-12-13", "C", "afaraukwu-fc", "okwuta-fc", "SCHEDULED", null, null],
    [24, "2026-12-17", "D", "amuzuoro-fc", "avonkwu-fc", "SCHEDULED", null, null],
  ];
  const insM = db.prepare(`
    INSERT INTO matches (id, md, date, grp, home, away, stage, status, ft_h, ft_a)
    VALUES (?, ?, ?, ?, ?, ?, 'GROUP', ?, ?, ?)
  `);
  groupMatches.forEach((m, i) => {
    const [md, date, grp, home, away, status, ftH, ftA] = m;
    insM.run("g" + (i + 1), md, date, grp, home, away, status, ftH, ftA);
  });

  const ko = [
    ["qf1", "2026-12-19", "QUARTER_FINAL", "QF1", "Winner Group A", "Runner-up Group B"],
    ["qf2", "2026-12-20", "QUARTER_FINAL", "QF2", "Winner Group B", "Runner-up Group A"],
    ["qf3", "2026-12-24", "QUARTER_FINAL", "QF3", "Winner Group C", "Runner-up Group D"],
    ["qf4", "2026-12-26", "QUARTER_FINAL", "QF4", "Winner Group D", "Runner-up Group C"],
    ["sf1", "2026-12-27", "SEMI_FINAL", "SF1", "Winner QF1", "Winner QF3"],
    ["sf2", "2026-12-31", "SEMI_FINAL", "SF2", "Winner QF2", "Winner QF4"],
    ["third", "2027-01-02", "THIRD_PLACE", "ThirdPlace", "Loser SF1", "Loser SF2"],
    ["final", "2027-01-03", "FINAL", "Final", "Winner SF1", "Winner SF2"],
  ];
  const insK = db.prepare(`
    INSERT INTO matches (id, date, stage, slot, home_slot, away_slot, status)
    VALUES (?, ?, ?, ?, ?, ?, 'SCHEDULED')
  `);
  for (const k of ko) insK.run(...k);
  console.log("[seed] Teams + fixtures loaded");
}

/** Apply known results if DB already existed without scores */
function migrateResults() {
  const results = [
    ["g1", 2, 2],
    ["g2", 2, 2],
    ["g3", 1, 1],
    ["g4", 1, 0],
    ["g5", 3, 0],
    ["g6", 0, 1],
  ];
  const upd = db.prepare(
    `UPDATE matches SET status = 'FULL_TIME', ft_h = ?, ft_a = ?
     WHERE id = ? AND (ft_h IS NULL OR status = 'SCHEDULED')`
  );
  for (const [id, h, a] of results) upd.run(h, a, id);
}


initDb();
migrateResults();

function calculateTable(grp) {
  const teams = db.prepare("SELECT * FROM teams WHERE grp = ?").all(grp);
  const map = Object.fromEntries(
    teams.map((t) => [
      t.id,
      { id: t.id, name: t.name, short: t.short, p: 0, w: 0, d: 0, l: 0, gf: 0, ga: 0, gd: 0, pts: 0 },
    ])
  );
  const matches = db
    .prepare(
      "SELECT * FROM matches WHERE stage = 'GROUP' AND grp = ? AND status = 'FULL_TIME' AND ft_h IS NOT NULL AND ft_a IS NOT NULL"
    )
    .all(grp);
  for (const m of matches) {
    const home = map[m.home];
    const away = map[m.away];
    if (!home || !away) continue;
    home.p++; away.p++;
    home.gf += m.ft_h; home.ga += m.ft_a;
    away.gf += m.ft_a; away.ga += m.ft_h;
    home.gd = home.gf - home.ga;
    away.gd = away.gf - away.ga;
    if (m.ft_h > m.ft_a) {
      home.w++; home.pts += 3; away.l++;
    } else if (m.ft_h < m.ft_a) {
      away.w++; away.pts += 3; home.l++;
    } else {
      home.d++; away.d++; home.pts++; away.pts++;
    }
  }
  return Object.values(map).sort((a, b) => {
    if (b.pts !== a.pts) return b.pts - a.pts;
    if (b.gd !== a.gd) return b.gd - a.gd;
    if (b.gf !== a.gf) return b.gf - a.gf;
    return a.name.localeCompare(b.name);
  });
}

function enrichMatch(m) {
  const homeTeam = m.home ? db.prepare("SELECT name, short FROM teams WHERE id = ?").get(m.home) : null;
  const awayTeam = m.away ? db.prepare("SELECT name, short FROM teams WHERE id = ?").get(m.away) : null;
  return {
    ...m,
    homeName: homeTeam?.name || m.home_slot || "TBD",
    awayName: awayTeam?.name || m.away_slot || "TBD",
    homeShort: homeTeam?.short || null,
    awayShort: awayTeam?.short || null,
  };
}

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

function isAuthed(req) {
  const token = req.cookies?.ibeku_admin;
  if (!token) return false;
  const row = db.prepare("SELECT username FROM admin WHERE id = 1").get();
  return token === row?.username;
}

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", db: "sqlite" });
});

app.get("/api/matches", (req, res) => {
  const stage = req.query.stage;
  let rows;
  if (stage === "GROUP") {
    rows = db.prepare("SELECT * FROM matches WHERE stage = 'GROUP' ORDER BY date, md").all();
  } else if (stage === "KO") {
    rows = db.prepare("SELECT * FROM matches WHERE stage != 'GROUP' ORDER BY date").all();
  } else {
    rows = db.prepare("SELECT * FROM matches ORDER BY date, md").all();
  }
  res.json(rows.map(enrichMatch));
});

app.get("/api/standings", (_req, res) => {
  const groups = ["A", "B", "C", "D"].map((g) => ({
    code: g,
    name: "Group " + g,
    table: calculateTable(g),
  }));
  res.json(groups);
});

app.post("/api/auth/login", (req, res) => {
  const { username, password } = req.body || {};
  const row = db.prepare("SELECT * FROM admin WHERE id = 1").get();
  if (!row || username !== row.username || !bcrypt.compareSync(String(password || ""), row.password_hash)) {
    return res.status(401).json({ error: "Invalid credentials" });
  }
  res.cookie("ibeku_admin", row.username, {
    httpOnly: true,
    sameSite: "lax",
    secure: COOKIE_SECURE,
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
  res.json({ ok: true });
});

app.post("/api/auth/logout", (_req, res) => {
  res.clearCookie("ibeku_admin");
  res.json({ ok: true });
});

app.get("/api/auth/me", (req, res) => {
  res.json({ admin: isAuthed(req) });
});

app.post("/api/admin/matches", (req, res) => {
  if (!isAuthed(req)) return res.status(401).json({ error: "Unauthorized" });
  const { id, status, ht_h, ht_a, ft_h, ft_a, home, away } = req.body || {};
  if (!id) return res.status(400).json({ error: "Missing id" });
  const allowed = ["SCHEDULED", "LIVE", "HALF_TIME", "FULL_TIME", "POSTPONED"];
  if (status && !allowed.includes(status)) return res.status(400).json({ error: "Bad status" });

  db.prepare(
    `UPDATE matches SET
      status = COALESCE(?, status),
      ht_h = ?, ht_a = ?, ft_h = ?, ft_a = ?,
      home = COALESCE(?, home),
      away = COALESCE(?, away)
    WHERE id = ?`
  ).run(
    status || null,
    ht_h === "" || ht_h == null ? null : Number(ht_h),
    ht_a === "" || ht_a == null ? null : Number(ht_a),
    ft_h === "" || ft_h == null ? null : Number(ft_h),
    ft_a === "" || ft_a == null ? null : Number(ft_a),
    home || null,
    away || null,
    id
  );
  res.json({ ok: true });
});

app.get("*", (_req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.listen(PORT, "0.0.0.0", () => {
  console.log("Ibeku League on :" + PORT + " (SQLite)");
});
