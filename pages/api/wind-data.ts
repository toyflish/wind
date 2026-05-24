import type { NextApiRequest, NextApiResponse } from "next";

const BASE = "https://liveweather.apdl.pt/api/weather/history";
const HEADERS = {
  "User-Agent": "Mozilla/5.0",
  Referer: "https://liveweather.apdl.pt/ptvdc?lang=en",
  Accept: "application/json",
};

export default async function handler(
  _req: NextApiRequest,
  res: NextApiResponse
) {
  // The APDL API expects timestamps in Europe/Lisbon local time
  const toLisbonISO = (d: Date) => {
    const parts = new Intl.DateTimeFormat("en-CA", {
      timeZone: "Europe/Lisbon",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    }).formatToParts(d);
    const get = (t: string) => parts.find((p) => p.type === t)!.value;
    return `${get("year")}-${get("month")}-${get("day")}T${get("hour")}:${get("minute")}:${get("second")}`;
  };

  const now = new Date();
  const end = toLisbonISO(now);
  const start = toLisbonISO(new Date(now.getTime() - 6 * 60 * 60 * 1000));

  try {
    const [gustRes, windRes, dirRes] = await Promise.all([
      fetch(`${BASE}/RVT/PTVDC/?start_date=${start}&end_date=${end}`, {
        headers: HEADERS,
      }),
      fetch(`${BASE}/VVT/PTVDC/?start_date=${start}&end_date=${end}`, {
        headers: HEADERS,
      }),
      fetch(`${BASE}/DVT/PTVDC/?start_date=${start}&end_date=${end}`, {
        headers: HEADERS,
      }),
    ]);

    if (!gustRes.ok || !windRes.ok || !dirRes.ok) {
      res.status(502).json({ error: "upstream error" });
      return;
    }

    const [gust, wind, direction] = await Promise.all([
      gustRes.json(),
      windRes.json(),
      dirRes.json(),
    ]);

    // The APDL API returns timestamps with a "Z" suffix, but they are
    // actually Europe/Lisbon local time, not UTC. Compute the current
    // Lisbon offset and rewrite each timestamp with the correct suffix.
    const refDate = new Date();
    const utcMin = refDate.getUTCHours() * 60 + refDate.getUTCMinutes();
    const lisbonStr = refDate.toLocaleString("en-GB", {
      timeZone: "Europe/Lisbon",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
    const [lH, lM] = lisbonStr.split(":").map(Number);
    const offsetMin = lH * 60 + lM - utcMin;
    const sign = offsetMin >= 0 ? "+" : "-";
    const absH = String(Math.floor(Math.abs(offsetMin) / 60)).padStart(2, "0");
    const absM = String(Math.abs(offsetMin) % 60).padStart(2, "0");
    const offsetStr = `${sign}${absH}:${absM}`;

    const fixTimestamps = (arr: { datetime: string; value: string }[]) =>
      arr.map((p) => ({
        ...p,
        datetime: p.datetime.replace(/\.\d+Z$/, "").replace("Z", "") + offsetStr,
      }));

    res.setHeader("Cache-Control", "public, max-age=120");
    res.json({
      gust: fixTimestamps(gust),
      wind: fixTimestamps(wind),
      direction: fixTimestamps(direction),
    });
  } catch {
    res.status(502).json({ error: "fetch failed" });
  }
}
