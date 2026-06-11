"use client";

import { useEffect, useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { WeeklyScore } from "@/lib/types";

interface PerformanceChartProps {
  data: WeeklyScore[];
}

export function PerformanceChart({ data }: PerformanceChartProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const gridColor = "var(--border)";
  const textColor = "var(--muted-foreground)";
  const primaryColor = "var(--primary)";

  if (!isMounted) {
    return <div className="h-[180px] w-full bg-card/50 rounded-xl animate-pulse" />;
  }

  return (
    <div className="h-[180px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{ top: 5, right: 10, left: -20, bottom: 0 }}
        >
          <defs>
            <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" style={{ stopColor: "var(--primary)" }} stopOpacity={0.25} />
              <stop offset="95%" style={{ stopColor: "var(--primary)" }} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid
            strokeDasharray="4 4"
            stroke={gridColor}
            vertical={false}
            opacity={0.15}
          />
          <XAxis
            dataKey="day"
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
                  <div className="bg-card border border-border rounded-lg px-3 py-2 shadow-lg text-xs">
                    <p className="text-muted-foreground mb-0.5">{label}</p>
                    <p className="text-sm font-bold text-foreground tabular-nums">{payload[0].value}%</p>
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
            strokeWidth={2.5}
            fillOpacity={1}
            fill="url(#scoreGradient)"
            activeDot={{
              r: 5,
              fill: "var(--background)",
              stroke: "var(--primary)",
              strokeWidth: 2.5,
            }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
