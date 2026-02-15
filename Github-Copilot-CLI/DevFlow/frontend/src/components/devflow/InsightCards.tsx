import { GitBranch, Clock, Shield } from "lucide-react";
import { legacyInsights } from "@/data/mock-data";

const iconMap: Record<string, React.FC<{ className?: string }>> = {
  "git-branch": GitBranch,
  clock: Clock,
  shield: Shield,
};

export function InsightCards() {
  // Use legacy insights for backward compatibility
  const data = legacyInsights;
  
  const wide = data.find((i) => i.type === "wide")!;
  const tall = data.find((i) => i.type === "tall")!;
  const inlines = data.filter((i) => i.type === "inline");

  return (
    <section id="insights" className="relative py-16 px-8 pb-24">
      <h2 className="font-display text-3xl lg:text-4xl text-foreground mb-2 animate-fade-lift stagger-5">
        Developer Insights
      </h2>
      <p className="text-muted-foreground text-sm mb-10 animate-fade-lift stagger-5">
        Behavioral patterns and workflow intelligence
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-[1.6fr_1fr] gap-6 animate-fade-lift stagger-5">
        {/* Wide card */}
        <div className="border border-border rounded-lg p-8 bg-card flex flex-col justify-between">
          <div>
            <h3 className="font-display text-2xl lg:text-3xl text-foreground leading-tight mb-4">
              {wide.title}
            </h3>
            <p className="text-muted-foreground text-sm leading-relaxed max-w-lg">
              {wide.body}
            </p>
          </div>
          <div className="mt-8 flex items-baseline gap-2">
            <span className="font-data text-4xl font-bold text-primary">{wide.metric}</span>
            <span className="text-muted-foreground text-sm">{wide.metricLabel}</span>
          </div>
        </div>

        {/* Tall card */}
        <div className="border border-border rounded-lg p-8 bg-card flex flex-col">
          <h3 className="font-display text-2xl text-foreground mb-2">{tall.title}</h3>
          <p className="text-muted-foreground text-sm mb-6">{tall.body}</p>
          <div className="flex items-baseline gap-2 mb-8">
            <span className="font-data text-5xl font-bold text-foreground">{tall.metric}</span>
            <span className="text-muted-foreground text-sm">{tall.metricLabel}</span>
          </div>
          <div className="flex flex-col gap-3 mt-auto">
            {tall.subMetrics?.map((sm) => (
              <div key={sm.label} className="flex justify-between items-center">
                <span className="text-muted-foreground text-xs">{sm.label}</span>
                <span className="font-data text-sm text-foreground">{sm.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Inline insight rows */}
      <div className="mt-6 flex flex-col gap-2">
        {inlines.map((item, i) => {
          const Icon = item.icon ? iconMap[item.icon] : null;
          return (
            <div
              key={i}
              className="flex items-center gap-3 border border-border rounded-lg px-5 py-3.5 bg-card hover:bg-muted/50 transition-colors"
            >
              {Icon && <Icon className="h-4 w-4 text-primary shrink-0" />}
              <p className="text-sm text-foreground font-body">{item.title}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
