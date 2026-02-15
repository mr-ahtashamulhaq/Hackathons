import { useState } from "react";
import { ArrowUpRight, Flame } from "lucide-react";
import { Area, AreaChart, ResponsiveContainer, Tooltip } from "recharts";
import { productivityScore, sparklineData, USE_REAL_DATA } from "@/data/mock-data";
import { useDevFlowData } from "@/hooks/useDevFlowData";

const periods = ["7d", "30d", "90d"] as const;

export function CommandCenterHero() {
  const [period, setPeriod] = useState<(typeof periods)[number]>("7d");
  
  // Load real data if enabled
  const { productivityScore: realScore, sparklineData: realSparkline } = useDevFlowData();
  const score = USE_REAL_DATA && realScore ? realScore : productivityScore;
  const sparkline = USE_REAL_DATA && realSparkline.length > 0 ? realSparkline : sparklineData;

  return (
    <section id="hero" className="relative py-16 px-8">
      <div className="glow-hero" />
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-12">
        {/* Left — Score */}
        <div className="animate-fade-lift stagger-1">
          <p className="text-muted-foreground text-sm tracking-widest uppercase mb-3 font-body">
            Productivity Score
          </p>
          <div className="flex items-baseline gap-4">
            <span className="font-data text-[5rem] lg:text-[7rem] font-bold leading-none text-foreground">
              {score.current}
            </span>
            <div className="flex items-center gap-1 text-primary">
              <ArrowUpRight className="h-5 w-5" />
              <span className="font-data text-lg">
                +{score.current - score.previous}
              </span>
            </div>
          </div>
          {/* Period selector */}
          <div className="flex gap-1 mt-6">
            {periods.map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-5 py-3 rounded-md text-sm font-medium transition-colors btn-press ${
                  period === p
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:text-foreground"
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        {/* Right — Sparkline + Streak */}
        <div className="flex flex-col items-end gap-6 animate-fade-lift stagger-2">
          <div className="w-64 h-20">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={sparkline}>
                <defs>
                  <linearGradient id="sparkGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(54, 97%, 49%)" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="hsl(54, 97%, 49%)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <Tooltip
                  contentStyle={{
                    background: "hsl(0 0% 8%)",
                    border: "1px solid hsl(0 0% 15%)",
                    borderRadius: "6px",
                    fontSize: "12px",
                    fontFamily: "Orbitron",
                    color: "white",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="commits"
                  stroke="hsl(54, 97%, 49%)"
                  strokeWidth={2}
                  fill="url(#sparkGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="flex items-center gap-3 text-muted-foreground">
            <Flame className="h-4 w-4 text-primary" />
            <span className="font-data text-sm tracking-wide">
              {score.streak} day streak
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
