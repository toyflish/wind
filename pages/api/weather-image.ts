import type { NextApiRequest, NextApiResponse } from "next";

const UPSTREAM_URL = "https://weather.vianalocals.com/ecowitt.png";

export default async function handler(
  _req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const upstream = await fetch(`${UPSTREAM_URL}?ver=${Date.now()}`);

    if (!upstream.ok) {
      res.status(upstream.status).end();
      return;
    }

    const lastModified = upstream.headers.get("last-modified");
    const buffer = Buffer.from(await upstream.arrayBuffer());

    res.setHeader("Content-Type", "image/png");
    res.setHeader("Cache-Control", "no-store, must-revalidate");
    if (lastModified) {
      res.setHeader("X-Last-Modified", lastModified);
    }
    res.send(buffer);
  } catch {
    res.status(502).end();
  }
}
