import { Terminal, Zap } from "lucide-react";
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { commandData, aliasSuggestions, USE_REAL_DATA } from "@/data/mock-data";
import { useDevFlowData } from "@/hooks/useDevFlowData";

export function CommandBehavior() {
  // Load real data if enabled
  const { commandData: realCommands, aliasSuggestions: realAliases } = useDevFlowData();
  const commands = USE_REAL_DATA && realCommands.length > 0 ? realCommands : commandData;
  const aliases = USE_REAL_DATA && realAliases.length > 0 ? realAliases : aliasSuggestions;
  
  return (
    <section id="commands" className="relative py-16 px-8">
      <h2 className="font-display text-3xl lg:text-4xl text-foreground mb-2 animate-fade-lift stagger-4">
        Command Intelligence
      </h2>
      <p className="text-muted-foreground text-sm mb-10 animate-fade-lift stagger-4">
        Terminal usage patterns and optimization opportunities
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-8 animate-fade-lift stagger-4">
        {/* Command frequency chart */}
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={commands} layout="vertical" barCategoryGap={6}>
              <XAxis type="number" hide />
              <YAxis
                type="category"
                dataKey="command"
                width={110}
                tick={{ fill: "hsl(0 0% 65%)", fontSize: 12, fontFamily: "DM Sans" }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  background: "hsl(0 0% 8%)",
                  border: "1px solid hsl(0 0% 15%)",
                  borderRadius: "6px",
                  fontSize: "12px",
                  fontFamily: "Orbitron",
                  color: "white",
                }}
                cursor={{ fill: "hsla(0, 0%, 100%, 0.03)" }}
              />
              <Bar dataKey="count" fill="hsl(54, 97%, 49%)" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Alias suggestions floating panel */}
        <div className="w-full lg:w-72 border border-border rounded-lg bg-card p-5">
          <div className="flex items-center gap-2 mb-4">
            <Zap className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-foreground">Alias Suggestions</span>
          </div>
          <div className="flex flex-col gap-3">
            {aliases.map((s) => (
              <div key={s.full} className="border-b border-border pb-3 last:border-0 last:pb-0">
                <div className="flex items-center gap-2">
                  <Terminal className="h-3 w-3 text-muted-foreground" />
                  <code className="text-xs text-muted-foreground font-body">{s.full}</code>
                  <span className="text-muted-foreground text-xs">→</span>
                  <code className="text-xs text-primary font-data">{s.alias}</code>
                </div>
                <p className="text-[11px] text-muted-foreground mt-1.5">
                  Used {s.timesTyped}x · saves {s.timeSaved}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
