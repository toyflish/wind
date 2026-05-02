import type { NextApiRequest, NextApiResponse } from "next";

const UPSTREAM_URL = "https://weather.vianalocals.com/ecowitt.png";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const upstream = await fetch(`${UPSTREAM_URL}?ver=${Date.now()}`);

    if (!upstream.ok) {
      res.status(upstream.status).json({ lastModified: null });
      return;
    }

    const lastModified = upstream.headers.get("last-modified");
    // Consume the body to avoid connection issues
    await upstream.arrayBuffer();

    res.setHeader("Cache-Control", "no-store, must-revalidate");
    res.json({ lastModified: lastModified || null });
  } catch {
    res.status(502).json({ lastModified: null });
  }
}
