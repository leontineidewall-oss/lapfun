// GET /api/lb?uid=<mapUid> -> top 10 of that map's leaderboard (proxy of trackmania.io)
const UA = "lapfun (+https://github.com/leontineidewall-oss/lapfun)";

module.exports = async function handler(req, res) {
  var uid = String((req.query && req.query.uid) || "");
  if (!/^[A-Za-z0-9_-]{20,40}$/.test(uid)) {
    res.status(400).json({ error: "bad uid" });
    return;
  }
  try {
    const r = await fetch("https://trackmania.io/api/leaderboard/map/" + uid + "?offset=0&length=10", { headers: { "User-Agent": UA, "Accept": "application/json" } });
    if (r.status === 404) { res.status(404).json({ error: "not found" }); return; }
    if (!r.ok) throw new Error("trackmania.io " + r.status);
    const j = await r.json();
    const tops = (j.tops || []).map(function (t) {
      var p = t.player || {};
      return { pos: t.position, time: t.time, at: t.timestamp, name: p.name || "", id: p.id || "", zone: (p.zone && p.zone.name) || "" };
    });
    res.setHeader("Cache-Control", "s-maxage=60, stale-while-revalidate=300");
    res.status(200).json({ players: j.playercount == null ? null : j.playercount, tops: tops, fetchedAt: new Date().toISOString() });
  } catch (e) {
    res.setHeader("Cache-Control", "no-store");
    res.status(502).json({ error: "upstream", detail: String(e && e.message || e) });
  }
};
