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

  const gridColor = isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.03)";
  const textColor = isDark ? "#64748b" : "#94a3b8";
  // Updated primary to match Stitch primary if possible, or use standard
  const primaryColor = "#4648d4"; 

  return (
    <div className="rounded-2xl border border-border bg-card p-8 shadow-sm h-full">
      <div className="flex items-center justify-between mb-10">
        <div>
          <h3 className="text-xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">Performance Trend</h3>
          <p className="text-[13px] text-slate-400 font-medium">
            Weekly assessment progress
          </p>
        </div>
        <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-100 dark:border-slate-800">
          <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">Last 7 Days</span>
          <span className="material-symbols-outlined text-[16px] text-slate-400">expand_more</span>
        </div>
      </div>

      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
          >
            <defs>
              <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={primaryColor} stopOpacity={0.15} />
                <stop offset="95%" stopColor={primaryColor} stopOpacity={0.01} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="4 4"
              stroke={gridColor}
              vertical={false}
            />
            <XAxis
              dataKey="week"
              tick={{ fill: textColor, fontSize: 10, fontWeight: 600 }}
              axisLine={false}
              tickLine={false}
              dy={10}
            />
            <YAxis
              tick={{ fill: textColor, fontSize: 10, fontWeight: 600 }}
              axisLine={false}
              tickLine={false}
              domain={[0, 100]}
              dx={-5}
            />
            <Tooltip
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="bg-card border border-border rounded-xl p-3 shadow-xl backdrop-blur-md">
                      <p className="text-[10px] font-bold text-foreground/50 uppercase mb-1">{label}</p>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-primary"></div>
                        <p className="text-sm font-semibold text-foreground">{payload[0].value}%</p>
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Area
              type="monotone"
              dataKey="score"
              stroke={primaryColor}
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#scoreGradient)"
              activeDot={{
                r: 6,
                fill: "#fff",
                stroke: primaryColor,
                strokeWidth: 3,
              }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
