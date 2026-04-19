"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useTheme } from "next-themes";
import type { WeeklyScore } from "@/lib/types";

interface PerformanceChartProps {
  data: WeeklyScore[];
}

export function PerformanceChart({ data }: PerformanceChartProps) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const gridColor = isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.04)";
  const textColor = isDark ? "#6b7280" : "#9ca3af";
  const strokeColor = isDark
    ? "oklch(0.68 0.17 264)"
    : "oklch(0.55 0.18 264)";

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="mb-5">
        <h3 className="text-sm font-semibold">Performance trend</h3>
        <p className="text-xs text-muted-foreground mt-0.5">
          Average score per week
        </p>
      </div>

      <div className="h-56 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{ top: 4, right: 4, left: -24, bottom: 0 }}
          >
            <defs>
              <linearGradient id="scoreGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={strokeColor} stopOpacity={0.12} />
                <stop offset="95%" stopColor={strokeColor} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke={gridColor}
              vertical={false}
            />
            <XAxis
              dataKey="week"
              tick={{ fill: textColor, fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: textColor, fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              domain={[0, 100]}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: isDark ? "#1c1c22" : "#ffffff",
                border: `1px solid ${isDark ? "#2a2a32" : "#e5e7eb"}`,
                borderRadius: "8px",
                boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                fontSize: "12px",
                padding: "8px 12px",
              }}
              labelStyle={{
                color: isDark ? "#f3f4f6" : "#111827",
                fontWeight: 500,
                marginBottom: 2,
              }}
            />
            <Area
              type="monotone"
              dataKey="score"
              stroke={strokeColor}
              strokeWidth={1.5}
              fill="url(#scoreGrad)"
              dot={false}
              activeDot={{
                r: 4,
                fill: strokeColor,
                strokeWidth: 0,
              }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
