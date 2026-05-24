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
  const now = new Date();
  const end = now.toISOString().slice(0, 19);
  const start = new Date(now.getTime() - 6 * 60 * 60 * 1000)
    .toISOString()
    .slice(0, 19);

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

    res.setHeader("Cache-Control", "public, max-age=120");
    res.json({ gust, wind, direction });
  } catch {
    res.status(502).json({ error: "fetch failed" });
  }
}
