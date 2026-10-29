import Link from "next/link";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [live, upcoming, recent] = await Promise.all([
    prisma.match.findMany({
      where: { status: { in: ["LIVE", "HALF_TIME"] }, published: true },
      include: { homeTeam: true, awayTeam: true, group: true },
      orderBy: { kickoffAt: "asc" },
      take: 5,
    }),
    prisma.match.findMany({
      where: { status: "SCHEDULED", published: true },
      include: { homeTeam: true, awayTeam: true, group: true },
      orderBy: { kickoffAt: "asc" },
      take: 8,
    }),
    prisma.match.findMany({
      where: { status: "FULL_TIME", published: true },
      include: { homeTeam: true, awayTeam: true, group: true },
      orderBy: { kickoffAt: "desc" },
      take: 6,
    }),
  ]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Ibeku League 2026</h1>
        <p className="mt-1 text-sm text-slate-500">Fixtures · Standings · Results</p>
      </div>

      {live.length > 0 && (
        <section>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-red-600">Live</h2>
          <div className="space-y-2">
            {live.map((m) => (
              <MatchRow key={m.id} match={m} />
            ))}
          </div>
        </section>
      )}

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-500">Upcoming</h2>
          <Link href="/fixtures" className="text-xs text-emerald-700 hover:underline">All fixtures →</Link>
        </div>
        <div className="space-y-2">
          {upcoming.length === 0 && <p className="text-sm text-slate-500">No upcoming matches</p>}
          {upcoming.map((m) => (
            <MatchRow key={m.id} match={m} />
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-slate-500">Recent results</h2>
        <div className="space-y-2">
          {recent.length === 0 && <p className="text-sm text-slate-500">No results yet</p>}
          {recent.map((m) => (
            <MatchRow key={m.id} match={m} />
          ))}
        </div>
      </section>
    </div>
  );
}

function MatchRow({ match }: { match: any }) {
  const home = match.homeTeam?.name || match.homeSlot || "TBD";
  const away = match.awayTeam?.name || match.awaySlot || "TBD";
  const date = new Date(match.kickoffAt).toLocaleDateString("en-GB", {
    weekday: "short", day: "numeric", month: "short", timeZone: "Africa/Lagos",
  });
  const score =
    match.status === "FULL_TIME" || match.status === "LIVE" || match.status === "HALF_TIME"
      ? `${match.fullTimeHomeScore ?? match.halfTimeHomeScore ?? 0} – ${match.fullTimeAwayScore ?? match.halfTimeAwayScore ?? 0}`
      : null;

  return (
    <Link href={`/matches/${match.id}`} className="card flex items-center justify-between gap-3 hover:border-slate-300 transition">
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <span>{date}</span>
          {match.group && <span>· Group {match.group.code}</span>}
          {match.stage !== "GROUP" && <span>· {match.stage.replace("_", " ")}</span>}
          {match.status === "LIVE" && <span className="rounded bg-red-600 px-1.5 py-0.5 text-[10px] font-bold text-white">LIVE</span>}
        </div>
        <div className="mt-1 font-medium text-slate-900 truncate">{home} vs {away}</div>
      </div>
      {score && <div className="text-lg font-bold tabular-nums text-emerald-700">{score}</div>}
    </Link>
  );
}
