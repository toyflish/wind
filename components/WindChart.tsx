import { useEffect, useRef, useState, useCallback } from "react";

interface DataPoint {
  datetime: string;
  value: string;
}

interface WindData {
  wind: DataPoint[];
  gust: DataPoint[];
  direction: DataPoint[];
}

interface MergedPoint {
  time: Date;
  wind: number;
  gust: number;
  direction: number;
}

const KMH_TO_KNOTS = 0.539957;

function degToCompass(deg: number): string {
  const dirs = [
    "N","NNE","NE","ENE","E","ESE","SE","SSE",
    "S","SSW","SW","WSW","W","WNW","NW","NNW",
  ];
  return dirs[Math.round(deg / 22.5) % 16];
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Europe/Lisbon",
  });
}

function formatDay(date: Date): string {
  return date.toLocaleDateString("en-GB", {
    weekday: "short",
    timeZone: "Europe/Lisbon",
  });
}

function getLisbonHourMin(date: Date): { hour: number; min: number } {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/Lisbon",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(date);
  const hour = parseInt(parts.find((p) => p.type === "hour")!.value);
  const min = parseInt(parts.find((p) => p.type === "minute")!.value);
  return { hour, min };
}

export default function WindChart() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [data, setData] = useState<MergedPoint[]>([]);
  const [hover, setHover] = useState<{
    x: number;
    y: number;
    point: MergedPoint;
  } | null>(null);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    setLoading(true);
    fetch("/api/wind-data")
      .then((r) => {
        if (!r.ok) throw new Error();
        return r.json();
      })
      .then((d: WindData) => {
        const map = new Map<string, Partial<MergedPoint>>();
        for (const p of d.wind) {
          const key = p.datetime;
          const entry = map.get(key) || { time: new Date(p.datetime) };
          entry.wind = parseFloat(p.value) * KMH_TO_KNOTS;
          map.set(key, entry);
        }
        for (const p of d.gust) {
          const key = p.datetime;
          const entry = map.get(key) || { time: new Date(p.datetime) };
          entry.gust = parseFloat(p.value) * KMH_TO_KNOTS;
          map.set(key, entry);
        }
        for (const p of d.direction) {
          const key = p.datetime;
          const entry = map.get(key) || { time: new Date(p.datetime) };
          entry.direction = parseFloat(p.value);
          map.set(key, entry);
        }
        const merged = [...map.values()]
          .filter((p) => p.time && p.wind != null && p.gust != null && p.direction != null)
          .sort((a, b) => a.time!.getTime() - b.time!.getTime()) as MergedPoint[];
        setData(merged);
        setError(false);
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // Draw chart
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || data.length === 0) return;

    const dpr = window.devicePixelRatio || 1;
    const container = containerRef.current;
    const width = container?.clientWidth || 600;
    const arrowRowH = 36;
    const chartH = 220;
    const bottomPad = 28;
    const leftPad = 40;
    const rightPad = 12;
    const totalH = arrowRowH + chartH + bottomPad;

    canvas.width = width * dpr;
    canvas.height = totalH * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${totalH}px`;

    const ctx = canvas.getContext("2d")!;
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, width, totalH);

    const plotW = width - leftPad - rightPad;
    const maxVal = Math.max(
      ...data.map((p) => Math.max(p.wind, p.gust)),
      20
    );
    const yMax = Math.ceil(maxVal / 5) * 5 + 5;

    const xOf = (i: number) => leftPad + (i / (data.length - 1)) * plotW;
    const yOf = (v: number) => arrowRowH + chartH - (v / yMax) * chartH;

    // Wind strength bands (non-overlapping, subtle colors)
    const bands = [
      { min: 0, max: 5, color: "rgba(180, 210, 240, 0.12)" },
      { min: 5, max: 10, color: "rgba(160, 210, 230, 0.15)" },
      { min: 10, max: 15, color: "rgba(140, 220, 190, 0.15)" },
      { min: 15, max: 20, color: "rgba(140, 230, 160, 0.18)" },
      { min: 20, max: 25, color: "rgba(240, 220, 140, 0.18)" },
      { min: 25, max: yMax, color: "rgba(240, 180, 140, 0.20)" },
    ];
    for (const band of bands) {
      if (band.min >= yMax) continue;
      const y1 = yOf(Math.min(band.max, yMax));
      const y2 = yOf(band.min);
      ctx.fillStyle = band.color;
      ctx.fillRect(leftPad, y1, plotW, y2 - y1);
    }

    // Grid lines and y-axis labels
    ctx.strokeStyle = "rgba(255,255,255,0.12)";
    ctx.lineWidth = 1;
    ctx.fillStyle = "rgba(255,255,255,0.5)";
    ctx.font = "11px system-ui, sans-serif";
    ctx.textAlign = "right";
    for (let v = 0; v <= yMax; v += 5) {
      const y = yOf(v);
      ctx.beginPath();
      ctx.setLineDash([3, 3]);
      ctx.moveTo(leftPad, y);
      ctx.lineTo(width - rightPad, y);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillText(`${v}`, leftPad - 6, y + 4);
    }

    // Y-axis label
    ctx.save();
    ctx.fillStyle = "rgba(255,255,255,0.4)";
    ctx.font = "10px system-ui, sans-serif";
    ctx.textAlign = "center";
    ctx.translate(10, arrowRowH + chartH / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText("kts", 0, 0);
    ctx.restore();

    // X-axis time labels at round hours
    ctx.font = "11px system-ui, sans-serif";
    ctx.textAlign = "center";
    const labeledHours = new Set<number>();
    for (let i = 0; i < data.length; i++) {
      const { hour, min } = getLisbonHourMin(data[i].time);
      if (min < 5 && !labeledHours.has(hour)) {
        labeledHours.add(hour);
        const x = xOf(i);
        // Vertical grid line
        ctx.strokeStyle = "rgba(255,255,255,0.08)";
        ctx.lineWidth = 1;
        ctx.setLineDash([]);
        ctx.beginPath();
        ctx.moveTo(x, arrowRowH);
        ctx.lineTo(x, arrowRowH + chartH);
        ctx.stroke();
        // Label
        ctx.fillStyle = "rgba(255,255,255,0.5)";
        ctx.fillText(`${hour.toString().padStart(2, "0")}:00`, x, arrowRowH + chartH + 16);
      }
    }

    // Draw gust line (red, behind)
    ctx.strokeStyle = "#E5C07B";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    for (let i = 0; i < data.length; i++) {
      const x = xOf(i);
      const y = yOf(data[i].gust);
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.stroke();

    // Draw wind line (blue, front)
    ctx.strokeStyle = "#3b82f6";
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (let i = 0; i < data.length; i++) {
      const x = xOf(i);
      const y = yOf(data[i].wind);
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.stroke();

    // Direction arrows at top
    const arrowStep = Math.max(1, Math.floor(data.length / Math.floor(plotW / 28)));
    for (let i = 0; i < data.length; i += arrowStep) {
      const x = xOf(i);
      const y = arrowRowH / 2;
      const angle = ((data[i].direction + 180) * Math.PI) / 180;

      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(angle);
      ctx.fillStyle = "#61AFF0";
      ctx.beginPath();
      ctx.moveTo(0, -10);
      ctx.lineTo(-5, 6);
      ctx.lineTo(0, 3);
      ctx.lineTo(5, 6);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }

    // Current time vertical line
    const now = new Date();
    const firstTime = data[0].time.getTime();
    const lastTime = data[data.length - 1].time.getTime();
    if (now.getTime() >= firstTime && now.getTime() <= lastTime) {
      const ratio = (now.getTime() - firstTime) / (lastTime - firstTime);
      const nx = leftPad + ratio * plotW;
      ctx.strokeStyle = "rgba(255,255,255,0.4)";
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(nx, arrowRowH);
      ctx.lineTo(nx, arrowRowH + chartH);
      ctx.stroke();
      ctx.setLineDash([]);
    }
  }, [data]);

  // Handle mouse/touch hover
  const handlePointer = useCallback(
    (clientX: number, clientY: number) => {
      const canvas = canvasRef.current;
      if (!canvas || data.length === 0) return;
      const rect = canvas.getBoundingClientRect();
      const x = clientX - rect.left;
      const width = rect.width;
      const leftPad = 40;
      const rightPad = 12;
      const plotW = width - leftPad - rightPad;

      const ratio = (x - leftPad) / plotW;
      const idx = Math.round(ratio * (data.length - 1));
      if (idx < 0 || idx >= data.length) {
        setHover(null);
        return;
      }

      setHover({
        x: clientX - rect.left,
        y: clientY - rect.top,
        point: data[idx],
      });
    },
    [data]
  );

  if (loading) {
    return (
      <div className="w-full max-w-2xl mt-4 text-gray-400 text-sm">
        Loading wind data...
      </div>
    );
  }

  if (error || data.length === 0) {
    return (
      <div className="w-full max-w-2xl mt-4 text-red-400 text-sm">
        Failed to load wind data.{" "}
        <button onClick={load} className="underline">
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl mt-4" ref={containerRef}>
      <div className="relative">
        <canvas
          ref={canvasRef}
          className="cursor-crosshair"
          onMouseMove={(e) => handlePointer(e.clientX, e.clientY)}
          onMouseLeave={() => setHover(null)}
          onTouchMove={(e) => {
            const t = e.touches[0];
            handlePointer(t.clientX, t.clientY);
          }}
          onTouchEnd={() => setHover(null)}
        />
        {hover && (
          <div
            className="absolute pointer-events-none z-10 bg-slate-800/95 border border-slate-600 rounded-lg px-3 py-2 text-left text-sm shadow-lg"
            style={{
              left: Math.min(hover.x + 12, (containerRef.current?.clientWidth || 400) - 190),
              top: Math.max(hover.y - 80, 4),
            }}
          >
            <div className="font-semibold text-white">
              {formatDay(hover.point.time)}, {formatTime(hover.point.time)}
            </div>
            <div className="flex items-center gap-1.5 mt-1 text-gray-300">
              <svg
                width="12"
                height="12"
                viewBox="0 0 12 12"
                className="shrink-0"
                style={{
                  transform: `rotate(${hover.point.direction + 180}deg)`,
                }}
              >
                <path d="M6 0L3 9L6 7L9 9Z" fill="#61AFF0" />
              </svg>
              {Math.round(hover.point.direction)}° /{" "}
              {degToCompass(hover.point.direction)}
            </div>
            <div className="mt-0.5 text-gray-300">
              <span className="inline-block w-2 h-2 rounded-full bg-blue-500 mr-1.5" />
              Wind: {hover.point.wind.toFixed(1)} kts
            </div>
            <div className="mt-0.5 text-gray-300">
              <span className="inline-block w-2 h-2 rounded-full mr-1.5" style={{ backgroundColor: "#E5C07B" }} />
              Gust: {hover.point.gust.toFixed(1)} kts
            </div>
          </div>
        )}
      </div>
      {/* Legend */}
      <div className="flex items-center justify-center gap-6 mt-2 text-xs text-gray-400">
        <div className="flex items-center gap-1.5">
          <span className="inline-block w-2 h-2 rounded-full bg-blue-500" />
          Wind (kts)
        </div>
        <div className="flex items-center gap-1.5">
          <span className="inline-block w-2 h-2 rounded-full" style={{ backgroundColor: "#E5C07B" }} />
          Gust (kts)
        </div>
      </div>
    </div>
  );
}
