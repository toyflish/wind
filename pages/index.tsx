import type { NextPage } from "next";
import { useCallback, useEffect, useState } from "react";
import Head from "next/head";
import ImageClip from "../components/ImageClip";
import Webcam from "../components/Webcam";

function formatTimeAgo(date: Date): string {
  const totalSeconds = Math.floor((Date.now() - date.getTime()) / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  if (minutes === 0) return `${seconds}s ago`;
  return `${minutes}m ${seconds}s ago`;
}

function formatPortugalTime(date: Date): string {
  return date.toLocaleString("en-GB", {
    timeZone: "Europe/Lisbon",
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const Home: NextPage = () => {
  const chartDataWidth = 300;
  const offset = 70;
  const [xByHour, setXByHour] = useState<number>(0);
  const [imgSrc, setImgSrc] = useState<string>("");
  const [lastModified, setLastModified] = useState<Date | null>(null);
  const [, setTick] = useState(0);
  const [loading, setLoading] = useState(false);

  const loadImage = useCallback(() => {
    setLoading(true);
    const currentHour = new Date().getHours();
    setXByHour(Math.round((800 / 24) * (currentHour - 2) + offset));
    setImgSrc(`/api/weather-image?ver=${Date.now()}`);

    fetch("/api/weather-meta")
      .then((res) => {
        if (!res.ok) return null;
        return res.json();
      })
      .then((data) => {
        if (data?.lastModified) {
          setLastModified(new Date(data.lastModified));
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    loadImage();
  }, [loadImage]);

  // Tick every second to keep the "ago" counter live
  useEffect(() => {
    const interval = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(interval);
  }, []);

  const isStale =
    lastModified && Date.now() - lastModified.getTime() > 60 * 1000;

  return (
    <div>
      <Head>
        <title>Viana do Castelo Wind</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="flex flex-col items-center justify-center flex-1 w-full text-center">
        <h1 className="text-6xl font-bold">
          Viana do Castelo
          <br />
          Wind
        </h1>
        {lastModified && (
          Date.now() - lastModified.getTime() > 5 * 60 * 1000 ? (
            <div className="mt-2 px-3 py-1 text-sm text-orange-300 border border-orange-400/30 rounded bg-orange-900/20 flex items-center gap-2">
              <span>{formatTimeAgo(lastModified)}</span>
              <button
                onClick={loadImage}
                disabled={loading}
                className="px-2 py-0.5 text-xs rounded bg-orange-400/20 hover:bg-orange-400/40 disabled:opacity-50"
              >
                {loading ? "loading…" : "refresh"}
              </button>
            </div>
          ) : (
            <div className="mt-2 text-sm text-gray-400 flex items-center gap-2">
              <span>
                Updated: {formatPortugalTime(lastModified)} ({formatTimeAgo(lastModified)})
              </span>
              {isStale && (
                <button
                  onClick={loadImage}
                  disabled={loading}
                  className="px-2 py-0.5 text-xs rounded bg-slate-600 hover:bg-slate-500 disabled:opacity-50"
                >
                  {loading ? "loading…" : "refresh"}
                </button>
              )}
            </div>
          )
        )}
        {imgSrc && (
          <>
            <h3 className="mt-4">Wind</h3>
            <ImageClip x={2} y={70} width={315} height={200} imgSrc={imgSrc} />
            <h3 className="mt-4">Chart</h3>
            <div className="flex flex-row">
              <ImageClip
                x={2}
                y={500}
                width={48}
                height={505}
                imgSrc={imgSrc}
              />
              <ImageClip
                x={xByHour}
                y={500}
                width={chartDataWidth}
                height={505}
                imgSrc={imgSrc}
              />
            </div>
          </>
        )}
        <Webcam />
      </main>
    </div>
  );
};

export default Home;
