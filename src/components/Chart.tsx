import { useEffect, useId, useRef, useState } from "react";
import type { Day } from "../data/demo";
import { format, compact } from "../data/demo";
export function TrafficChart({
  data,
  metric = "users",
  mini = false,
}: {
  data: Day[];
  metric?: "users" | "clicks" | "vercel";
  mini?: boolean;
}) {
  const id = useId().replace(/:/g, "");
  const [active, setActive] = useState<number | null>(null);
  const container = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(760);
  useEffect(() => {
    if (mini || !container.current) return;
    const observer = new ResizeObserver(([entry]) => {
      setWidth(Math.max(280, Math.round(entry.contentRect.width)));
    });
    observer.observe(container.current);
    return () => observer.disconnect();
  }, [mini]);
  const height = mini ? 180 : 240,
    left = mini ? 5 : 42,
    bottom = height - 24;
  const max =
    Math.max(
      ...data.map((d) =>
        Math.max(d[metric], metric === "users" ? d.previous : 0),
      ),
      10,
    ) * 1.18;
  const x = (i: number) =>
    left + (i / Math.max(data.length - 1, 1)) * (width - left - 15);
  const y = (n: number) => bottom - (n / max) * (bottom - 18);
  const line = data.map((d, i) => `${x(i)},${y(d[metric])}`).join(" ");
  const previous = data.map((d, i) => `${x(i)},${y(d.previous)}`).join(" ");
  return (
    <div ref={container} className={`traffic-chart ${mini ? "mini" : ""}`} style={mini ? undefined : { aspectRatio: `${width} / ${height}` }}>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        role="img"
        aria-label={`${metric === "users" ? "GA4 user" : metric === "clicks" ? "Search click" : "Vercel visitor"} trend from ${data[0]?.label} to ${data.at(-1)?.label}`}
        onMouseLeave={() => setActive(null)}
      >
        <defs>
          <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#95b571" stopOpacity=".25" />
            <stop offset="100%" stopColor="#95b571" stopOpacity="0" />
          </linearGradient>
        </defs>
        {[0, 1, 2, 3].map((i) => (
          <g key={i}>
            <line
              x1={left}
              x2={width - 10}
              y1={y((max * i) / 3)}
              y2={y((max * i) / 3)}
              stroke="#e9edf0"
              strokeDasharray="3 5"
            />
            {!mini && (
              <text
                x={left - 10}
                y={y((max * i) / 3) + 4}
                textAnchor="end"
                fill="#87919e"
                fontSize="11"
              >
                {compact(Math.round((max * i) / 3))}
              </text>
            )}
          </g>
        ))}
        <polygon
          points={`${left},${bottom} ${line} ${x(data.length - 1)},${bottom}`}
          fill={`url(#${id})`}
        />
        {metric === "users" && (
          <polyline
            points={previous}
            fill="none"
            stroke="#c4cbd3"
            strokeWidth="2"
            strokeDasharray="5 6"
          />
        )}
        <polyline
          points={line}
          fill="none"
          stroke="#293e36"
          strokeWidth={mini ? 2.5 : 3}
          strokeLinejoin="round"
          strokeLinecap="round"
        />
        {[
          0,
          Math.floor((data.length - 1) / 3),
          Math.floor(((data.length - 1) * 2) / 3),
          data.length - 1,
        ].map((i, n) => (
          <text
            key={n}
            x={x(i)}
            y={height - 3}
            textAnchor={n === 0 ? "start" : n === 3 ? "end" : "middle"}
            fill="#87919e"
            fontSize="11"
          >
            {data[i]?.label}
          </text>
        ))}
        {!mini &&
          data.map((d, i) => (
            <rect
              key={d.date}
              x={x(i) - 10}
              y="0"
              width={Math.max(20, (width - left) / data.length)}
              height={bottom}
              fill="transparent"
              onMouseEnter={() => setActive(i)}
            >
              <title>
                {d.label}: {format(d[metric])}
              </title>
            </rect>
          ))}
        {active !== null && (
          <g pointerEvents="none">
            <line
              x1={x(active)}
              x2={x(active)}
              y1="10"
              y2={bottom}
              stroke="#9aa59c"
              strokeDasharray="4 4"
            />
            <circle
              cx={x(active)}
              cy={y(data[active][metric])}
              r="5"
              fill="#293e36"
              stroke="white"
              strokeWidth="2"
            />
          </g>
        )}
      </svg>
      {active !== null && (
        <div className="chart-tooltip">
          {data[active].label} · <strong>{format(data[active][metric])}</strong>
        </div>
      )}
    </div>
  );
}
export function Sparkline({ trend }: { trend: number }) {
  const values = Array.from(
    { length: 18 },
    (_, i) =>
      `${i * 5},${25 - Math.sin(i * 1.4) * 4 - (trend > 0 ? i : -i) * 0.8}`,
  );
  return (
    <svg className="sparkline" viewBox="0 0 90 45" aria-hidden="true">
      <polyline
        points={values.join(" ")}
        stroke={trend >= 0 ? "#598e72" : "#c98275"}
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
      />
    </svg>
  );
}
