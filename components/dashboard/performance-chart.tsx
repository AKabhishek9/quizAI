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
  // Use CSS variables for Recharts components
  const gridColor = "var(--border)";
  const textColor = "var(--muted-foreground)";
  const primaryColor = "var(--primary)"; 

  return (
    <div className="rounded-[32px] border border-border/10 bg-card/30 p-10 whisper-shadow h-full backdrop-blur-sm">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div className="space-y-1">
          <h3 className="text-2xl font-black tracking-tighter text-foreground font-heading">Performance Trend</h3>
          <p className="text-[13px] text-muted-foreground font-bold tracking-tight opacity-60">
            High-fidelity assessment progress
          </p>
        </div>
        <div className="flex items-center gap-2 bg-muted/30 px-4 py-2 rounded-full border border-border/40 group cursor-pointer hover:bg-muted/50 transition-colors">
          <span className="text-[11px] font-black text-muted-foreground uppercase tracking-widest">Global Index</span>
          <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
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
                <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.2} />
                <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="4 4"
              stroke={gridColor}
              vertical={false}
              opacity={0.1}
            />
            <XAxis
              dataKey="week"
              tick={{ fill: textColor, fontSize: 10, fontWeight: 900 }}
              axisLine={false}
              tickLine={false}
              dy={15}
            />
            <YAxis
              tick={{ fill: textColor, fontSize: 10, fontWeight: 900 }}
              axisLine={false}
              tickLine={false}
              domain={[0, 100]}
              dx={-10}
            />
            <Tooltip
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="bg-card/90 border border-border/40 rounded-2xl p-4 shadow-2xl backdrop-blur-xl">
                      <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-2">{label}</p>
                      <div className="flex items-center gap-3">
                        <div className="w-2.5 h-2.5 rounded-full bg-primary shadow-glow-primary"></div>
                        <p className="text-lg font-black tracking-tighter text-foreground font-heading">{payload[0].value}%</p>
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
                fill: "var(--background)",
                stroke: "var(--primary)",
                strokeWidth: 3,
              }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
