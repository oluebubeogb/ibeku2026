"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Match = {
  id: string;
  status: string;
  stage: string;
  matchday: number | null;
  slotCode: string | null;
  homeSlot: string | null;
  awaySlot: string | null;
  halfTimeHomeScore: number | null;
  halfTimeAwayScore: number | null;
  fullTimeHomeScore: number | null;
  fullTimeAwayScore: number | null;
  homeTeam: { name: string } | null;
  awayTeam: { name: string } | null;
  group: { code: string } | null;
  kickoffAt: string | Date;
};

export function ScoreForm({ match }: { match: Match }) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  const home = match.homeTeam?.name || match.homeSlot || "TBD";
  const away = match.awayTeam?.name || match.awaySlot || "TBD";
  const date = new Date(match.kickoffAt).toLocaleDateString("en-GB", {
    day: "numeric", month: "short", timeZone: "Africa/Lagos",
  });

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setMsg("");
    const fd = new FormData(e.currentTarget);
    const body = {
      id: match.id,
      status: fd.get("status"),
      halfTimeHomeScore: fd.get("htHome") === "" ? null : Number(fd.get("htHome")),
      halfTimeAwayScore: fd.get("htAway") === "" ? null : Number(fd.get("htAway")),
      fullTimeHomeScore: fd.get("ftHome") === "" ? null : Number(fd.get("ftHome")),
      fullTimeAwayScore: fd.get("ftAway") === "" ? null : Number(fd.get("ftAway")),
    };
    const res = await fetch("/api/admin/matches", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    setSaving(false);
    if (!res.ok) {
      setMsg("Save failed");
      return;
    }
    setMsg("Saved");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="card space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <div className="text-xs text-slate-500">
            {date}
            {match.group ? ` · G${match.group.code}` : ""}
            {match.matchday ? ` · MD${match.matchday}` : ""}
            {match.slotCode ? ` · ${match.slotCode}` : ""}
          </div>
          <div className="font-medium">{home} vs {away}</div>
        </div>
        <select name="status" defaultValue={match.status} className="input w-auto text-sm">
          <option value="SCHEDULED">SCHEDULED</option>
          <option value="LIVE">LIVE</option>
          <option value="HALF_TIME">HALF_TIME</option>
          <option value="FULL_TIME">FULL_TIME</option>
          <option value="POSTPONED">POSTPONED</option>
        </select>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div>
          <label className="text-xs text-slate-500">HT Home</label>
          <input name="htHome" type="number" min={0} className="input" defaultValue={match.halfTimeHomeScore ?? ""} />
        </div>
        <div>
          <label className="text-xs text-slate-500">HT Away</label>
          <input name="htAway" type="number" min={0} className="input" defaultValue={match.halfTimeAwayScore ?? ""} />
        </div>
        <div>
          <label className="text-xs text-slate-500">FT Home</label>
          <input name="ftHome" type="number" min={0} className="input" defaultValue={match.fullTimeHomeScore ?? ""} />
        </div>
        <div>
          <label className="text-xs text-slate-500">FT Away</label>
          <input name="ftAway" type="number" min={0} className="input" defaultValue={match.fullTimeAwayScore ?? ""} />
        </div>
      </div>
      <div className="flex items-center gap-3">
        <button type="submit" className="btn text-sm" disabled={saving}>
          {saving ? "Saving…" : "Save"}
        </button>
        {msg && <span className="text-xs text-emerald-400">{msg}</span>}
      </div>
    </form>
  );
}
