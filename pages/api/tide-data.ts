import type { NextApiRequest, NextApiResponse } from "next";

// Compute the current Europe/Lisbon UTC offset string (e.g. "+01:00")
function getLisbonOffset(): string {
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
  return `${sign}${absH}:${absM}`;
}

// Append timezone offset to a naive "YYYY-MM-DD HH:MM:SS" timestamp
function fixTimestamp(ts: string, offset: string): string {
  return ts.replace(" ", "T") + offset;
}

export default async function handler(
  _req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const upstream = await fetch(
      "https://liveweather.apdl.pt/api/tides/PTVDC/chart",
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
    const offset = getLisbonOffset();

    // Fix all timestamps in the response
    const fixPoints = (arr: { time: string }[]) =>
      arr?.map((p: { time: string }) => ({ ...p, time: fixTimestamp(p.time, offset) })) || [];

    data.tides = fixPoints(data.tides);
    data.observed = fixPoints(data.observed);
    data.highs = fixPoints(data.highs);
    data.lows = fixPoints(data.lows);
    if (data.deviation) data.deviation = fixPoints(data.deviation);
    if (data.forecast?.time) {
      data.forecast.time = fixTimestamp(data.forecast.time, offset);
    }

    res.setHeader("Cache-Control", "public, max-age=300");
    res.json(data);
  } catch {
    res.status(502).json({ error: "fetch failed" });
  }
}
