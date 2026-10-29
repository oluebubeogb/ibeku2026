import { prisma } from "@/lib/db";
import { calculateTable } from "@/lib/standings";

export const dynamic = "force-dynamic";

export default async function StandingsPage() {
  const groups = await prisma.group.findMany({
    orderBy: { displayOrder: "asc" },
    include: { teams: true },
  });
  const finished = await prisma.match.findMany({
    where: { status: "FULL_TIME", stage: "GROUP" },
    select: {
      homeTeamId: true, awayTeamId: true,
      fullTimeHomeScore: true, fullTimeAwayScore: true, status: true,
    },
  });

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-slate-900">Group Standings</h1>
      {groups.map((g) => {
        const table = calculateTable(
          g.teams.map((t) => ({ id: t.id, name: t.name, shortName: t.shortName, slug: t.slug })),
          finished
        );
        return (
          <section key={g.id} className="card overflow-x-auto">
            <h2 className="mb-3 font-semibold text-emerald-700">{g.name}</h2>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-left text-xs text-slate-500">
                  <th className="pb-2 pr-2">#</th>
                  <th className="pb-2 pr-2">Team</th>
                  <th className="pb-2 px-1 text-center">P</th>
                  <th className="pb-2 px-1 text-center">W</th>
                  <th className="pb-2 px-1 text-center">D</th>
                  <th className="pb-2 px-1 text-center">L</th>
                  <th className="pb-2 px-1 text-center">GF</th>
                  <th className="pb-2 px-1 text-center">GA</th>
                  <th className="pb-2 px-1 text-center">GD</th>
                  <th className="pb-2 pl-1 text-center">Pts</th>
                </tr>
              </thead>
              <tbody>
                {table.map((row, i) => (
                  <tr key={row.teamId} className={i < 2 ? "bg-emerald-50" : ""}>
                    <td className="py-2 pr-2 text-slate-500">{i + 1}</td>
                    <td className="py-2 pr-2 font-medium text-slate-900">{row.name}</td>
                    <td className="py-2 px-1 text-center tabular-nums">{row.played}</td>
                    <td className="py-2 px-1 text-center tabular-nums">{row.won}</td>
                    <td className="py-2 px-1 text-center tabular-nums">{row.drawn}</td>
                    <td className="py-2 px-1 text-center tabular-nums">{row.lost}</td>
                    <td className="py-2 px-1 text-center tabular-nums">{row.gf}</td>
                    <td className="py-2 px-1 text-center tabular-nums">{row.ga}</td>
                    <td className="py-2 px-1 text-center tabular-nums">{row.gd > 0 ? `+${row.gd}` : row.gd}</td>
                    <td className="py-2 pl-1 text-center font-bold tabular-nums text-emerald-700">{row.points}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="mt-2 text-xs text-slate-500">Top 2 advance to knockout</p>
          </section>
        );
      })}
    </div>
  );
}
