import { redirect } from "next/navigation";
import { isLoggedIn, logout } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { ScoreForm } from "@/components/ScoreForm";
import { LoginForm } from "@/components/LoginForm";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const loggedIn = await isLoggedIn();

  if (!loggedIn) {
    return (
      <div className="mx-auto max-w-sm space-y-6">
        <h1 className="text-2xl font-bold text-slate-900">Admin login</h1>
        <LoginForm />
      </div>
    );
  }

  const matches = await prisma.match.findMany({
    where: { published: true },
    include: { homeTeam: true, awayTeam: true, group: true },
    orderBy: { kickoffAt: "asc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Admin – Update scores</h1>
        <form action={async () => { "use server"; await logout(); redirect("/admin"); }}>
          <button type="submit" className="btn-secondary text-sm">Logout</button>
        </form>
      </div>
      <p className="text-sm text-slate-500">Set status and scores. Standings update automatically.</p>
      <div className="space-y-3">
        {matches.map((m) => (
          <ScoreForm key={m.id} match={m} />
        ))}
      </div>
    </div>
  );
}
