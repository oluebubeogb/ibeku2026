import Link from "next/link";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function KnockoutPage() {
  const matches = await prisma.match.findMany({
    where: { stage: { not: "GROUP" }, published: true },
    include: { homeTeam: true, awayTeam: true },
    orderBy: { kickoffAt: "asc" },
  });

  const stages = ["QUARTER_FINAL", "SEMI_FINAL", "THIRD_PLACE", "FINAL"];

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">Knockout Stage</h1>
      {stages.map((stage) => {
        const list = matches.filter((m) => m.stage === stage);
        if (list.length === 0) return null;
        return (
          <section key={stage}>
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-slate-400">
              {stage.replace(/_/g, " ")}
            </h2>
            <div className="space-y-2">
              {list.map((m) => {
                const home = m.homeTeam?.name || m.homeSlot || "TBD";
                const away = m.awayTeam?.name || m.awaySlot || "TBD";
                const date = new Date(m.kickoffAt).toLocaleDateString("en-GB", {
                  weekday: "short", day: "numeric", month: "short", timeZone: "Africa/Lagos",
                });
                const score = m.fullTimeHomeScore != null ? `${m.fullTimeHomeScore} – ${m.fullTimeAwayScore}` : null;
                return (
                  <Link key={m.id} href={`/matches/${m.id}`} className="card flex items-center justify-between hover:border-slate-600">
                    <div>
                      <div className="text-xs text-slate-500">{date} · {m.slotCode}</div>
                      <div className="mt-1 font-medium">{home} vs {away}</div>
                    </div>
                    {score && <div className="text-lg font-bold tabular-nums text-emerald-400">{score}</div>}
                  </Link>
                );
              })}
            </div>
          </section>
        );
      })}
    </div>
  );
}
