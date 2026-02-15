/**
 * InsightPanel Component
 * Displays actionable developer insights from the Insight Engine (Step 11)
 */

import { AlertCircle, Info, CheckCircle2, AlertTriangle, TrendingUp, Code, Activity, Terminal } from "lucide-react";
import { USE_REAL_DATA, insights as mockInsights } from "@/data/mock-data";
import { useDevFlowData } from "@/hooks/useDevFlowData";
import type { Insight } from "@/hooks/useDevFlowData";

const severityConfig = {
  high: {
    icon: AlertCircle,
    color: "text-red-500",
    bgColor: "bg-red-500/10",
    borderColor: "border-red-500/20",
    label: "Critical",
  },
  medium: {
    icon: AlertTriangle,
    color: "text-yellow-500",
    bgColor: "bg-yellow-500/10",
    borderColor: "border-yellow-500/20",
    label: "Warning",
  },
  low: {
    icon: Info,
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
    borderColor: "border-blue-500/20",
    label: "Info",
  },
};

const typeConfig = {
  risk: {
    icon: AlertCircle,
    color: "text-red-400",
    label: "Risk",
  },
  workflow: {
    icon: TrendingUp,
    color: "text-blue-400",
    label: "Workflow",
  },
  health: {
    icon: Activity,
    color: "text-green-400",
    label: "Health",
  },
  command: {
    icon: Terminal,
    color: "text-purple-400",
    label: "Command",
  },
};

function InsightCard({ insight }: { insight: Insight }) {
  const severityStyle = severityConfig[insight.severity];
  const typeStyle = typeConfig[insight.type];
  const SeverityIcon = severityStyle.icon;
  const TypeIcon = typeStyle.icon;

  return (
    <div
      className={`border ${severityStyle.borderColor} rounded-lg p-6 ${severityStyle.bgColor} hover:bg-muted/50 transition-colors`}
    >
      <div className="flex items-start gap-4">
        {/* Severity Icon */}
        <div className="shrink-0">
          <SeverityIcon className={`h-5 w-5 ${severityStyle.color}`} />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Header with type badge */}
          <div className="flex items-center gap-2 mb-2">
            <TypeIcon className={`h-4 w-4 ${typeStyle.color}`} />
            <span className={`text-xs font-medium ${typeStyle.color}`}>
              {typeStyle.label}
            </span>
            <span className={`text-xs font-medium ${severityStyle.color}`}>
              • {severityStyle.label}
            </span>
          </div>

          {/* Title */}
          <h3 className="font-display text-lg text-foreground mb-2">
            {insight.title}
          </h3>

          {/* Description */}
          <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
            {insight.description}
          </p>

          {/* Recommendation */}
          <div className="flex items-start gap-2 mt-4 pt-4 border-t border-border/50">
            <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
            <p className="text-sm text-foreground/80">
              <span className="font-medium text-green-500">Recommendation:</span>{" "}
              {insight.recommendation}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export function InsightPanel() {
  const { insights: realInsights, loading } = useDevFlowData();
  const insights = USE_REAL_DATA && realInsights && realInsights.length > 0 ? realInsights : mockInsights;

  // Separate by severity
  const highSeverity = insights.filter((i) => i.severity === "high");
  const mediumSeverity = insights.filter((i) => i.severity === "medium");
  const lowSeverity = insights.filter((i) => i.severity === "low");

  if (loading) {
    return (
      <section id="insights-panel" className="relative py-16 px-8">
        <h2 className="font-display text-3xl lg:text-4xl text-foreground mb-2">
          Insights
        </h2>
        <p className="text-muted-foreground text-sm mb-10">
          Loading actionable developer intelligence...
        </p>
      </section>
    );
  }

  if (!insights || insights.length === 0) {
    return (
      <section id="insights-panel" className="relative py-16 px-8">
        <h2 className="font-display text-3xl lg:text-4xl text-foreground mb-2">
          Insights
        </h2>
        <p className="text-muted-foreground text-sm mb-10">
          No insights available. Run analysis to generate insights.
        </p>
      </section>
    );
  }

  return (
    <section id="insights-panel" className="relative py-16 px-8 pb-24">
      <h2 className="font-display text-3xl lg:text-4xl text-foreground mb-2 animate-fade-lift stagger-5">
        Insights
      </h2>
      <p className="text-muted-foreground text-sm mb-10 animate-fade-lift stagger-5">
        Actionable developer intelligence from {insights.length} insight{insights.length !== 1 ? 's' : ''}
      </p>

      {/* High Severity Insights */}
      {highSeverity.length > 0 && (
        <div className="mb-8">
          <h3 className="font-display text-xl text-foreground mb-4 flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-red-500" />
            Critical ({highSeverity.length})
          </h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {highSeverity.map((insight, idx) => (
              <InsightCard key={idx} insight={insight} />
            ))}
          </div>
        </div>
      )}

      {/* Medium Severity Insights */}
      {mediumSeverity.length > 0 && (
        <div className="mb-8">
          <h3 className="font-display text-xl text-foreground mb-4 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-yellow-500" />
            Warnings ({mediumSeverity.length})
          </h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {mediumSeverity.map((insight, idx) => (
              <InsightCard key={idx} insight={insight} />
            ))}
          </div>
        </div>
      )}

      {/* Low Severity Insights */}
      {lowSeverity.length > 0 && (
        <div>
          <h3 className="font-display text-xl text-foreground mb-4 flex items-center gap-2">
            <Info className="h-5 w-5 text-blue-500" />
            Informational ({lowSeverity.length})
          </h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {lowSeverity.map((insight, idx) => (
              <InsightCard key={idx} insight={insight} />
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
