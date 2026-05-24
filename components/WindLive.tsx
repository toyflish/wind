import { useCallback, useEffect, useState } from "react";

interface LiveData {
  wind: { value: string; unit: string };
  gust: { value: string; unit: string };
  direction: { value: string; unit: string };
  timestamp: string;
}

function degToCompass(deg: number): string {
  const dirs = [
    "N","NNE","NE","ENE","E","ESE","SE","SSE",
    "S","SSW","SW","WSW","W","WNW","NW","NNW",
  ];
  return dirs[Math.round(deg / 22.5) % 16];
}

function formatTimeAgo(date: Date): string {
  const totalSeconds = Math.floor((Date.now() - date.getTime()) / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  if (minutes === 0) return `${seconds}s ago`;
  return `${minutes}m ${seconds}s ago`;
}

export default function WindLive() {
  const [data, setData] = useState<LiveData | null>(null);
  const [loading, setLoading] = useState(true);
  const [, setTick] = useState(0);

  const load = useCallback(() => {
    setLoading(true);
    fetch(`/api/wind-latest?t=${Date.now()}`)
      .then((r) => {
        if (!r.ok) throw new Error();
        return r.json();
      })
      .then(setData)
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // Tick every second to keep "ago" counter live
  useEffect(() => {
    const interval = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(interval);
  }, []);

  if (loading && !data) {
    return (
      <div className="mt-4 text-gray-400 text-sm">Loading live data...</div>
    );
  }

  if (!data) return null;

  const dir = parseFloat(data.direction.value);
  const compass = degToCompass(dir);
  const timestamp = new Date(data.timestamp);

  return (
    <div className="w-full max-w-2xl mt-6">
      <div className="grid grid-cols-3 gap-3">
        {/* Wind */}
        <div className="bg-slate-700/50 rounded-xl p-4 flex flex-col items-center">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" className="mb-1">
            <path d="M9.5 2L4 14h6v8l5.5-12H10V2z" fill="none" stroke="#3b82f6" strokeWidth="1.5" strokeLinejoin="round"/>
            <path d="M3 18h4M2 21h6M17 18h4M16 21h6" stroke="#3b82f6" strokeWidth="1.2" strokeLinecap="round"/>
          </svg>
          <span className="text-xs text-gray-400 mb-1">Wind</span>
          <span className="text-2xl font-bold">
            {parseFloat(data.wind.value).toFixed(1)}{" "}
            <span className="text-sm font-normal text-gray-400">kn</span>
          </span>
        </div>

        {/* Direction */}
        <div className="bg-slate-700/50 rounded-xl p-4 flex flex-col items-center">
          <svg
            width="28"
            height="28"
            viewBox="0 0 24 24"
            className="mb-1"
            style={{ transform: `rotate(${dir + 180}deg)` }}
          >
            <path
              d="M12 2L6 18l6-4l6 4z"
              fill="#61AFF0"
            />
          </svg>
          <span className="text-xs text-gray-400 mb-1">Direction</span>
          <span className="text-2xl font-bold">
            {Math.round(dir)}°{" "}
            <span className="text-sm font-normal text-gray-400">{compass}</span>
          </span>
        </div>

        {/* Gust */}
        <div className="bg-slate-700/50 rounded-xl p-4 flex flex-col items-center">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" className="mb-1">
            <path d="M2 12h10M5 8h8a3 3 0 1 1 0 6M3 16h7a2.5 2.5 0 1 0 0-5" stroke="#E5C07B" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
          <span className="text-xs text-gray-400 mb-1">Gust</span>
          <span className="text-2xl font-bold">
            {parseFloat(data.gust.value).toFixed(1)}{" "}
            <span className="text-sm font-normal text-gray-400">kn</span>
          </span>
        </div>
      </div>

      {/* Timestamp + reload */}
      <div className="flex items-center justify-center gap-2 mt-3 text-xs text-gray-400">
        <span>{formatTimeAgo(timestamp)}</span>
        <button
          onClick={load}
          disabled={loading}
          className="px-2 py-0.5 rounded bg-slate-600 hover:bg-slate-500 disabled:opacity-50 transition-colors"
        >
          {loading ? "loading…" : "↻ refresh"}
        </button>
      </div>
    </div>
  );
}
