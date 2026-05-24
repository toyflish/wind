import { useEffect, useRef, useState, useCallback } from "react";

interface TidePoint {
  time: string;
  level: number | string;
}

interface TideData {
  tides: TidePoint[];
  observed: TidePoint[];
  forecast: { time: string; level: number } | null;
  highs: TidePoint[];
  lows: TidePoint[];
}

function parseLevel(v: number | string): number {
  return typeof v === "string" ? parseFloat(v) : v;
}

function formatHour(date: Date): string {
  return date.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    hour12: false,
    timeZone: "Europe/Lisbon",
  });
}

export default function TideChart() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [tideData, setTideData] = useState<TideData | null>(null);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    setLoading(true);
    fetch("/api/tide-data")
      .then((r) => {
        if (!r.ok) throw new Error();
        return r.json();
      })
      .then((d: TideData) => {
        setTideData(d);
        setError(false);
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !tideData || !tideData.tides.length) return;

    const dpr = window.devicePixelRatio || 1;
    const container = containerRef.current;
    const width = container?.clientWidth || 600;
    const chartH = 200;
    const topPad = 30;
    const bottomPad = 28;
    const leftPad = 44;
    const rightPad = 12;
    const totalH = topPad + chartH + bottomPad;

    canvas.width = width * dpr;
    canvas.height = totalH * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${totalH}px`;

    const ctx = canvas.getContext("2d")!;
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, width, totalH);

    const plotW = width - leftPad - rightPad;

    // Parse all tide points
    const tides = tideData.tides.map((p) => ({
      time: new Date(p.time),
      level: parseLevel(p.level),
    }));
    const observed = tideData.observed.map((p) => ({
      time: new Date(p.time),
      level: parseLevel(p.level),
    }));

    const allLevels = [
      ...tides.map((p) => p.level),
      ...observed.map((p) => p.level),
    ];
    const minLevel = 0;
    const maxLevel = Math.ceil(Math.max(...allLevels) * 1.08 * 2) / 2;

    const firstTime = tides[0].time.getTime();
    const lastTime = tides[tides.length - 1].time.getTime();
    const timeRange = lastTime - firstTime;

    const xOf = (t: Date) => leftPad + ((t.getTime() - firstTime) / timeRange) * plotW;
    const yOf = (v: number) => topPad + chartH - ((v - minLevel) / (maxLevel - minLevel)) * chartH;

    // Y-axis grid and labels
    ctx.fillStyle = "rgba(255,255,255,0.5)";
    ctx.font = "11px system-ui, sans-serif";
    ctx.textAlign = "right";
    for (let v = 0; v <= maxLevel; v += 0.5) {
      const y = yOf(v);
      ctx.strokeStyle = "rgba(255,255,255,0.08)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.setLineDash([3, 3]);
      ctx.moveTo(leftPad, y);
      ctx.lineTo(width - rightPad, y);
      ctx.stroke();
      ctx.setLineDash([]);
      if (v % 1 === 0) {
        ctx.fillText(`${v.toFixed(1)} m`, leftPad - 6, y + 4);
      }
    }

    // X-axis time labels
    ctx.fillStyle = "rgba(255,255,255,0.5)";
    ctx.textAlign = "center";
    const hoursShown = new Set<number>();
    for (const p of tides) {
      const hour = parseInt(
        p.time.toLocaleString("en-GB", {
          timeZone: "Europe/Lisbon",
          hour: "2-digit",
          hour12: false,
        })
      );
      const min = p.time.getMinutes();
      if (min === 0 && !hoursShown.has(hour) && hour % 2 === 0) {
        hoursShown.add(hour);
        const x = xOf(p.time);
        ctx.strokeStyle = "rgba(255,255,255,0.06)";
        ctx.beginPath();
        ctx.moveTo(x, topPad);
        ctx.lineTo(x, topPad + chartH);
        ctx.stroke();
        ctx.fillStyle = "rgba(255,255,255,0.5)";
        ctx.fillText(formatHour(p.time), x, topPad + chartH + 16);
      }
    }

    // Expected tide (filled gray area)
    ctx.beginPath();
    ctx.moveTo(xOf(tides[0].time), yOf(0));
    for (const p of tides) {
      ctx.lineTo(xOf(p.time), yOf(p.level));
    }
    ctx.lineTo(xOf(tides[tides.length - 1].time), yOf(0));
    ctx.closePath();
    ctx.fillStyle = "rgba(150, 150, 170, 0.2)";
    ctx.fill();

    // Expected tide line
    ctx.strokeStyle = "rgba(150, 150, 170, 0.6)";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    for (let i = 0; i < tides.length; i++) {
      const x = xOf(tides[i].time);
      const y = yOf(tides[i].level);
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.stroke();

    // Observed tide (filled blue area)
    if (observed.length > 0) {
      ctx.beginPath();
      ctx.moveTo(xOf(observed[0].time), yOf(0));
      for (const p of observed) {
        ctx.lineTo(xOf(p.time), yOf(p.level));
      }
      ctx.lineTo(xOf(observed[observed.length - 1].time), yOf(0));
      ctx.closePath();
      ctx.fillStyle = "rgba(59, 130, 246, 0.2)";
      ctx.fill();

      // Observed line
      ctx.strokeStyle = "#3b82f6";
      ctx.lineWidth = 2;
      ctx.beginPath();
      for (let i = 0; i < observed.length; i++) {
        const x = xOf(observed[i].time);
        const y = yOf(observed[i].level);
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      ctx.stroke();
    }

    // Current time line
    const now = new Date();
    if (now.getTime() >= firstTime && now.getTime() <= lastTime) {
      const nx = xOf(now);
      ctx.strokeStyle = "rgba(239, 68, 68, 0.6)";
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(nx, topPad);
      ctx.lineTo(nx, topPad + chartH);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // Forecast point (red dot)
    if (tideData.forecast) {
      const ft = new Date(tideData.forecast.time);
      const fl = tideData.forecast.level;
      const fx = xOf(ft);
      const fy = yOf(fl);
      ctx.fillStyle = "#ef4444";
      ctx.beginPath();
      ctx.arc(fx, fy, 4, 0, Math.PI * 2);
      ctx.fill();
      // Label
      ctx.fillStyle = "#ef4444";
      ctx.font = "bold 10px system-ui, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(`${fl.toFixed(2)} m`, fx, fy - 10);
    }

    // High/low tide markers
    const drawMarker = (
      points: TidePoint[],
      color: string,
      isHigh: boolean
    ) => {
      for (const p of points) {
        const t = new Date(p.time);
        const level = parseLevel(p.level);
        const x = xOf(t);
        const y = yOf(level);

        // Triangle marker
        ctx.fillStyle = color;
        ctx.beginPath();
        if (isHigh) {
          ctx.moveTo(x, y - 8);
          ctx.lineTo(x - 5, y - 2);
          ctx.lineTo(x + 5, y - 2);
        } else {
          ctx.moveTo(x, y + 8);
          ctx.lineTo(x - 5, y + 2);
          ctx.lineTo(x + 5, y + 2);
        }
        ctx.closePath();
        ctx.fill();

        // Label
        ctx.font = "bold 10px system-ui, sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(
          `${level.toFixed(2)} m`,
          x,
          isHigh ? y - 12 : y + 18
        );
      }
    };

    drawMarker(tideData.highs, "#3b82f6", true);
    drawMarker(tideData.lows, "#3b82f6", false);

    // Observed latest marker
    if (observed.length > 0) {
      const last = observed[observed.length - 1];
      const x = xOf(last.time);
      const y = yOf(last.level);
      ctx.fillStyle = "#3b82f6";
      ctx.beginPath();
      ctx.arc(x, y, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.font = "bold 10px system-ui, sans-serif";
      ctx.textAlign = "left";
      ctx.fillText(`${last.level.toFixed(2)} m`, x + 8, y + 4);
    }
  }, [tideData]);

  if (loading) {
    return (
      <div className="w-full max-w-2xl mt-4 text-gray-400 text-sm">
        Loading tide data...
      </div>
    );
  }

  if (error || !tideData) {
    return (
      <div className="w-full max-w-2xl mt-4 text-red-400 text-sm">
        Failed to load tide data.{" "}
        <button onClick={load} className="underline">
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl mt-4" ref={containerRef}>
      <canvas ref={canvasRef} className="w-full" />
      {/* Legend */}
      <div className="flex items-center justify-center gap-4 mt-2 text-xs text-gray-400">
        <div className="flex items-center gap-1.5">
          <span className="inline-block w-3 h-2 rounded-sm bg-gray-500/40" />
          Expected
        </div>
        <div className="flex items-center gap-1.5">
          <span className="inline-block w-3 h-2 rounded-sm bg-blue-500/40" />
          Observed
        </div>
        <div className="flex items-center gap-1.5">
          <span className="inline-block w-2 h-2 rounded-full bg-red-500" />
          Forecast
        </div>
      </div>
    </div>
  );
}
