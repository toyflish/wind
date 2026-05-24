import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  _req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const upstream = await fetch(
      "https://liveweather.apdl.pt/api/weather/latest/apdl/PTVDC",
      {
        headers: {
          "User-Agent": "Mozilla/5.0",
          Referer: "https://liveweather.apdl.pt/ptvdc?lang=en",
          Accept: "application/json",
        },
      }
    );

    if (!upstream.ok) {
      res.status(upstream.status).end();
      return;
    }

    const data = await upstream.json();
    const sensors: Record<string, { value: string; unit: string }> = {};
    for (const s of data.sensors) {
      sensors[s.code] = { value: s.value, unit: s.unit };
    }

    // last_datetime is in Europe/Lisbon local time (e.g. "2026-05-24 13:32:40")
    // Convert to ISO 8601 by finding the current Lisbon UTC offset
    let timestamp: string;
    if (data.last_datetime) {
      const now = new Date();
      const utcH = now.getUTCHours();
      const utcM = now.getUTCMinutes();
      const lisbonStr = now.toLocaleString("en-GB", {
        timeZone: "Europe/Lisbon",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      });
      const [lH, lM] = lisbonStr.split(":").map(Number);
      const offsetMin = (lH * 60 + lM) - (utcH * 60 + utcM);
      const sign = offsetMin >= 0 ? "+" : "-";
      const absH = String(Math.floor(Math.abs(offsetMin) / 60)).padStart(2, "0");
      const absM = String(Math.abs(offsetMin) % 60).padStart(2, "0");
      timestamp = `${data.last_datetime.replace(" ", "T")}${sign}${absH}:${absM}`;
    } else {
      timestamp = new Date().toISOString();
    }

    res.setHeader("Cache-Control", "public, max-age=60");
    res.json({
      wind: sensors.VVT,
      gust: sensors.RVT,
      direction: sensors.DVT,
      timestamp,
    });
  } catch {
    res.status(502).json({ error: "fetch failed" });
  }
}
