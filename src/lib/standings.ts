export type TeamInput = {
  id: string;
  name: string;
  shortName: string;
  slug: string;
};

export type MatchInput = {
  homeTeamId: string | null;
  awayTeamId: string | null;
  fullTimeHomeScore: number | null;
  fullTimeAwayScore: number | null;
  status: string;
};

export type TableRow = {
  teamId: string;
  name: string;
  shortName: string;
  slug: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  gf: number;
  ga: number;
  gd: number;
  points: number;
};

export function calculateTable(teams: TeamInput[], matches: MatchInput[]): TableRow[] {
  const map = new Map<string, TableRow>();
  for (const t of teams) {
    map.set(t.id, {
      teamId: t.id,
      name: t.name,
      shortName: t.shortName,
      slug: t.slug,
      played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, gd: 0, points: 0,
    });
  }

  for (const m of matches) {
    if (m.status !== "FULL_TIME") continue;
    if (m.homeTeamId == null || m.awayTeamId == null) continue;
    if (m.fullTimeHomeScore == null || m.fullTimeAwayScore == null) continue;

    const home = map.get(m.homeTeamId);
    const away = map.get(m.awayTeamId);
    if (!home || !away) continue;

    const hs = m.fullTimeHomeScore;
    const as = m.fullTimeAwayScore;

    home.played++; away.played++;
    home.gf += hs; home.ga += as;
    away.gf += as; away.ga += hs;
    home.gd = home.gf - home.ga;
    away.gd = away.gf - away.ga;

    if (hs > as) {
      home.won++; home.points += 3;
      away.lost++;
    } else if (hs < as) {
      away.won++; away.points += 3;
      home.lost++;
    } else {
      home.drawn++; away.drawn++;
      home.points += 1; away.points += 1;
    }
  }

  return Array.from(map.values()).sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    if (b.gd !== a.gd) return b.gd - a.gd;
    if (b.gf !== a.gf) return b.gf - a.gf;
    return a.name.localeCompare(b.name);
  });
}
