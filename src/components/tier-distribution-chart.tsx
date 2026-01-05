"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import type { TierType } from "@/lib/types";

interface TierDistributionChartProps {
  distribution: Record<TierType, number>;
  totalRatings: number;
}

const TIER_COLORS: Record<TierType, string> = {
  goat: "#FFD700",
  god: "#FF6B35",
  enjoyable: "#00D4AA",
  mediocre: "#8B8B8B",
  weak: "#4A4A4A",
};

const TIER_LABELS: Record<TierType, string> = {
  goat: "GOAT",
  god: "GOD",
  enjoyable: "Enjoyable",
  mediocre: "Mediocre",
  weak: "Weak",
};

export function TierDistributionChart({
  distribution,
  totalRatings,
}: TierDistributionChartProps) {
  const data = Object.entries(distribution)
    .filter(([, value]) => value > 0)
    .map(([tier, value]) => ({
      name: TIER_LABELS[tier as TierType],
      value,
      tier: tier as TierType,
      percentage: totalRatings > 0 ? Math.round((value / totalRatings) * 100) : 0,
    }));

  if (totalRatings === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-[#8B8B8B]">
        <p className="text-lg">No ratings yet</p>
        <p className="text-sm mt-1">Be the first to rate!</p>
      </div>
    );
  }

  return (
    <div className="relative">
      <ResponsiveContainer width="100%" height={280}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={70}
            outerRadius={100}
            paddingAngle={3}
            dataKey="value"
            stroke="transparent"
            strokeWidth={0}
          >
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill="transparent"
                stroke={TIER_COLORS[entry.tier]}
                strokeWidth={8}
              />
            ))}
          </Pie>
          <Tooltip
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const data = payload[0].payload;
                return (
                  <div className="bg-[#141416] border border-[#2A2A2D] rounded-lg px-3 py-2 shadow-xl">
                    <p className="font-semibold" style={{ color: TIER_COLORS[data.tier as TierType] }}>
                      {data.name}
                    </p>
                    <p className="text-sm text-[#8B8B8B]">
                      {data.value} votes ({data.percentage}%)
                    </p>
                  </div>
                );
              }
              return null;
            }}
          />
        </PieChart>
      </ResponsiveContainer>

      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="text-center">
          <p className="text-3xl font-bold gradient-text">{totalRatings}</p>
          <p className="text-sm text-[#8B8B8B]">ratings</p>
        </div>
      </div>

      <div className="flex flex-wrap justify-center gap-4 mt-4">
        {data.map((entry) => (
          <div key={entry.tier} className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: TIER_COLORS[entry.tier] }}
            />
            <span className="text-sm text-[#8B8B8B]">
              {entry.name} ({entry.percentage}%)
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
