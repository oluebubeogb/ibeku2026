const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];

function formatDate(iso) {
  try {
    return new Date(iso + "T15:00:00Z").toLocaleDateString("en-GB", {
      weekday: "short",
      day: "numeric",
      month: "short",
      timeZone: "Africa/Lagos",
    });
  } catch {
    return iso;
  }
}

function matchCard(m) {
  const live = m.status === "LIVE" || m.status === "HALF_TIME";
  const hasScore = m.ft_h != null || live;
  const h = m.ft_h ?? m.ht_h ?? 0;
  const a = m.ft_a ?? m.ht_a ?? 0;

  let meta = `<span>${formatDate(m.date)}</span>`;
  if (m.grp) meta += `<span class="pill">Group ${m.grp}</span>`;
  if (m.md) meta += `<span>MD${m.md}</span>`;
  if (m.stage && m.stage !== "GROUP") meta += `<span class="pill">${m.stage.replace(/_/g, " ")}</span>`;
  if (m.slot) meta += `<span>${m.slot}</span>`;
  if (live) meta += `<span class="pill live">LIVE</span>`;

  let body;
  if (hasScore) {
    body = `
      <div class="match-teams">
        <div class="team-line"><span>${m.homeName}</span><span>${h}</span></div>
        <div class="team-line"><span>${m.awayName}</span><span>${a}</span></div>
      </div>`;
  } else {
    body = `
      <div class="match-teams">
        <div class="team-line"><span>${m.homeName}</span></div>
        <div class="vs-only">vs</div>
        <div class="team-line"><span>${m.awayName}</span></div>
      </div>`;
  }

  return `<article class="card match">
    <div>
      <div class="match-meta">${meta}</div>
      ${body}
    </div>
    ${hasScore && !live && m.status === "FULL_TIME" ? `<div class="score-big">${h}–${a}</div>` : ""}
  </article>`;
}

async function api(path, opts) {
  const res = await fetch(path, {
    credentials: "same-origin",
    headers: { "Content-Type": "application/json" },
    ...opts,
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

/* ---------- Pages ---------- */

async function pageHome() {
  const matches = await api("/api/matches");
  const live = matches.filter((m) => m.status === "LIVE" || m.status === "HALF_TIME");
  const upcoming = matches.filter((m) => m.status === "SCHEDULED").slice(0, 8);
  const recent = matches
    .filter((m) => m.status === "FULL_TIME")
    .slice()
    .reverse()
    .slice(0, 6);

  let html = `
    <section class="hero">
      <h1>Ibeku League 2026</h1>
      <p>Community football · Fixtures, standings & results</p>
    </section>`;

  if (live.length) {
    html += `<h2 class="section-title live">Live now</h2>` + live.map(matchCard).join("");
  }
  html += `<h2 class="section-title">Upcoming</h2>`;
  html += upcoming.length ? upcoming.map(matchCard).join("") : `<p class="empty">No upcoming matches</p>`;
  html += `<h2 class="section-title">Recent results</h2>`;
  html += recent.length ? recent.map(matchCard).join("") : `<p class="empty">No results yet — update scores in Admin</p>`;
  return html;
}

async function pageFixtures() {
  const matches = await api("/api/matches");
  return `
    <section class="hero"><h1>Fixtures</h1><p>Full group stage & knockout schedule</p></section>
    <h2 class="section-title">All matches</h2>
    ${matches.map(matchCard).join("")}`;
}

async function pageStandings() {
  const groups = await api("/api/standings");
  let html = `<section class="hero"><h1>Standings</h1><p>Top 2 from each group advance</p></section>`;
  for (const g of groups) {
    html += `<div class="group-card"><h3>${g.name}</h3>
      <table>
        <thead><tr>
          <th>#</th><th>Team</th>
          <th class="n">P</th><th class="n">W</th><th class="n">D</th><th class="n">L</th>
          <th class="n">GF</th><th class="n">GA</th><th class="n">GD</th><th class="n">Pts</th>
        </tr></thead><tbody>`;
    g.table.forEach((r, i) => {
      const gd = r.gd > 0 ? "+" + r.gd : r.gd;
      html += `<tr class="${i < 2 ? "q" : ""}">
        <td>${i + 1}</td><td><strong>${r.name}</strong></td>
        <td class="n">${r.p}</td><td class="n">${r.w}</td><td class="n">${r.d}</td><td class="n">${r.l}</td>
        <td class="n">${r.gf}</td><td class="n">${r.ga}</td><td class="n">${gd}</td>
        <td class="n pts">${r.pts}</td></tr>`;
    });
    html += `</tbody></table><p class="note">Highlighted rows qualify for knockout</p></div>`;
  }
  return html;
}

async function pageKnockout() {
  const matches = await api("/api/matches?stage=KO");
  const stages = ["QUARTER_FINAL", "SEMI_FINAL", "THIRD_PLACE", "FINAL"];
  let html = `<section class="hero"><h1>Knockout</h1><p>Road to the final</p></section>`;
  for (const stage of stages) {
    const list = matches.filter((m) => m.stage === stage);
    if (!list.length) continue;
    html += `<h2 class="section-title">${stage.replace(/_/g, " ")}</h2>` + list.map(matchCard).join("");
  }
  return html;
}

async function pageAdmin() {
  const me = await api("/api/auth/me");
  if (!me.admin) {
    return `<div class="login-box">
      <h2>Admin</h2>
      <p class="hint">Sign in to update match scores</p>
      <label>Username</label>
      <input id="u" autocomplete="username" />
      <label>Password</label>
      <input id="p" type="password" autocomplete="current-password" />
      <button class="btn" style="width:100%;margin-top:8px" id="login-btn">Sign in</button>
      <p class="err" id="login-err"></p>
    </div>`;
  }

  const matches = await api("/api/matches");
  let html = `<div class="admin-bar">
    <div>
      <h1 style="font-size:1.35rem;font-weight:800">Score centre</h1>
      <p style="color:var(--muted);font-size:0.85rem">Standings update when status is FULL_TIME</p>
    </div>
    <button class="btn btn-ghost" id="logout-btn">Logout</button>
  </div>`;

  for (const m of matches) {
    html += `<div class="card admin-form" data-id="${m.id}">
      <div class="match-meta" style="margin-bottom:8px">
        <span>${formatDate(m.date)}</span>
        ${m.grp ? `<span class="pill">G${m.grp}</span>` : ""}
        ${m.md ? `<span>MD${m.md}</span>` : ""}
        ${m.slot ? `<span class="pill">${m.slot}</span>` : ""}
      </div>
      <div style="font-weight:700;margin-bottom:10px">${m.homeName} vs ${m.awayName}</div>
      <label>Status</label>
      <select class="st">
        ${["SCHEDULED", "LIVE", "HALF_TIME", "FULL_TIME", "POSTPONED"]
          .map((s) => `<option value="${s}" ${m.status === s ? "selected" : ""}>${s}</option>`)
          .join("")}
      </select>
      <div class="grid">
        <div><label>HT Home</label><input type="number" min="0" class="htH" value="${m.ht_h ?? ""}" /></div>
        <div><label>HT Away</label><input type="number" min="0" class="htA" value="${m.ht_a ?? ""}" /></div>
        <div><label>FT Home</label><input type="number" min="0" class="ftH" value="${m.ft_h ?? ""}" /></div>
        <div><label>FT Away</label><input type="number" min="0" class="ftA" value="${m.ft_a ?? ""}" /></div>
      </div>
      <button class="btn save-btn">Save</button><span class="ok"></span>
    </div>`;
  }
  return html;
}

/* ---------- Router ---------- */

const pages = {
  home: pageHome,
  fixtures: pageFixtures,
  standings: pageStandings,
  knockout: pageKnockout,
  admin: pageAdmin,
};

async function go(name) {
  $$("#nav button").forEach((b) => b.classList.toggle("active", b.dataset.page === name));
  const app = $("#app");
  app.innerHTML = `<p class="empty">Loading…</p>`;
  try {
    app.innerHTML = await pages[name]();
    bindAdmin();
  } catch (e) {
    app.innerHTML = `<p class="err">Could not load: ${e.message}</p>`;
  }
  history.replaceState(null, "", "#" + name);
}

function bindAdmin() {
  const loginBtn = $("#login-btn");
  if (loginBtn) {
    loginBtn.onclick = async () => {
      try {
        await api("/api/auth/login", {
          method: "POST",
          body: JSON.stringify({ username: $("#u").value, password: $("#p").value }),
        });
        go("admin");
      } catch {
        $("#login-err").textContent = "Invalid username or password";
      }
    };
  }
  const logoutBtn = $("#logout-btn");
  if (logoutBtn) {
    logoutBtn.onclick = async () => {
      await api("/api/auth/logout", { method: "POST" });
      go("admin");
    };
  }
  $$(".save-btn").forEach((btn) => {
    btn.onclick = async () => {
      const card = btn.closest(".admin-form");
      const id = card.dataset.id;
      const body = {
        id,
        status: $(".st", card).value,
        ht_h: $(".htH", card).value,
        ht_a: $(".htA", card).value,
        ft_h: $(".ftH", card).value,
        ft_a: $(".ftA", card).value,
      };
      try {
        await api("/api/admin/matches", { method: "POST", body: JSON.stringify(body) });
        const ok = $(".ok", card);
        ok.textContent = "Saved";
        setTimeout(() => (ok.textContent = ""), 2500);
      } catch {
        $(".ok", card).textContent = "Failed";
      }
    };
  });
}

$("#nav").addEventListener("click", (e) => {
  const btn = e.target.closest("button[data-page]");
  if (btn) go(btn.dataset.page);
});

const start = (location.hash || "#home").slice(1);
go(pages[start] ? start : "home");
