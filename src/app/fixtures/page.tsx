import Link from "next/link";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function FixturesPage() {
  const matches = await prisma.match.findMany({
    where: { published: true },
    include: { homeTeam: true, awayTeam: true, group: true },
    orderBy: { kickoffAt: "asc" },
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Fixtures</h1>
      <div className="space-y-2">
        {matches.map((m) => {
          const home = m.homeTeam?.name || m.homeSlot || "TBD";
          const away = m.awayTeam?.name || m.awaySlot || "TBD";
          const date = new Date(m.kickoffAt).toLocaleDateString("en-GB", {
            weekday: "short", day: "numeric", month: "short", timeZone: "Africa/Lagos",
          });
          const score = m.fullTimeHomeScore != null ? `${m.fullTimeHomeScore} – ${m.fullTimeAwayScore}` : null;
          return (
            <Link key={m.id} href={`/matches/${m.id}`} className="card flex items-center justify-between gap-3 hover:border-slate-600">
              <div>
                <div className="text-xs text-slate-500">
                  {date}
                  {m.group ? ` · Group ${m.group.code}` : ""}
                  {m.matchday ? ` · MD${m.matchday}` : ""}
                  {m.stage !== "GROUP" ? ` · ${m.stage.replace(/_/g, " ")}` : ""}
                  {m.status === "LIVE" && <span className="ml-2 rounded bg-red-600 px-1.5 text-[10px] font-bold">LIVE</span>}
                </div>
                <div className="mt-1 font-medium">{home} vs {away}</div>
              </div>
              {score && <div className="text-lg font-bold tabular-nums text-emerald-400">{score}</div>}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
