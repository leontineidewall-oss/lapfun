// GET /api/totd -> the latest Tracks of the Day, newest first (proxy of trackmania.io, which sends no CORS headers)
const UA = "lapfun (+https://github.com/leontineidewall-oss/lapfun)";

async function month(offset) {
  const r = await fetch("https://trackmania.io/api/totd/" + offset, { headers: { "User-Agent": UA, "Accept": "application/json" } });
  if (!r.ok) throw new Error("trackmania.io " + r.status);
  return r.json();
}

function pad(n) { return (n < 10 ? "0" : "") + n; }

function days(j) {
  return (j && j.days ? j.days : []).filter(function (d) { return d && d.map && d.map.mapUid; }).map(function (d) {
    var m = d.map, a = m.authorplayer || {};
    return {
      date: j.year + "-" + pad(j.month) + "-" + pad(d.monthday),
      name: m.name || "",
      mapUid: m.mapUid,
      thumb: m.thumbnailUrl || "",
      authorTime: m.authorScore || null,
      author: { name: a.name || "", zone: (a.zone && a.zone.name) || "" },
      exchangeId: m.exchangeid || null
    };
  });
}

module.exports = async function handler(req, res) {
  try {
    const both = await Promise.all([month(0), month(1).catch(function () { return null; })]);
    const list = days(both[0]).concat(days(both[1])).sort(function (a, b) { return a.date < b.date ? 1 : -1; }).slice(0, 8);
    res.setHeader("Cache-Control", "s-maxage=120, stale-while-revalidate=600");
    res.status(200).json({ tracks: list, fetchedAt: new Date().toISOString() });
  } catch (e) {
    res.setHeader("Cache-Control", "no-store");
    res.status(502).json({ error: "upstream", detail: String(e && e.message || e) });
  }
};
