import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function MatchPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const match = await prisma.match.findUnique({
    where: { id },
    include: { homeTeam: true, awayTeam: true, group: true },
  });
  if (!match || !match.published) notFound();

  const home = match.homeTeam?.name || match.homeSlot || "TBD";
  const away = match.awayTeam?.name || match.awaySlot || "TBD";
  const date = new Date(match.kickoffAt).toLocaleString("en-GB", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
    hour: "2-digit", minute: "2-digit", timeZone: "Africa/Lagos",
  });

  return (
    <div className="space-y-6">
      <Link href="/fixtures" className="text-sm text-emerald-400 hover:underline">← Fixtures</Link>
      <div className="card text-center">
        <div className="text-xs text-slate-500">
          {date}
          {match.group && ` · Group ${match.group.code}`}
          {match.matchday && ` · Matchday ${match.matchday}`}
          {match.stage !== "GROUP" && ` · ${match.stage.replace(/_/g, " ")}`}
        </div>
        <div className="mt-4 flex items-center justify-center gap-6">
          <div className="flex-1 text-right text-xl font-bold">{home}</div>
          <div className="text-3xl font-black tabular-nums text-emerald-400">
            {match.fullTimeHomeScore != null
              ? `${match.fullTimeHomeScore} – ${match.fullTimeAwayScore}`
              : "vs"}
          </div>
          <div className="flex-1 text-left text-xl font-bold">{away}</div>
        </div>
        {match.halfTimeHomeScore != null && (
          <div className="mt-2 text-sm text-slate-500">
            HT: {match.halfTimeHomeScore} – {match.halfTimeAwayScore}
          </div>
        )}
        <div className="mt-3">
          <span className={`rounded px-2 py-1 text-xs font-semibold ${
            match.status === "LIVE" || match.status === "HALF_TIME" ? "bg-red-600 text-white" :
            match.status === "FULL_TIME" ? "bg-slate-700 text-slate-200" :
            "bg-slate-800 text-slate-400"
          }`}>{match.status.replace(/_/g, " ")}</span>
        </div>
      </div>
    </div>
  );
}
