import { AlertTriangle } from "lucide-react";
import { fileRiskData, USE_REAL_DATA } from "@/data/mock-data";
import { useDevFlowData } from "@/hooks/useDevFlowData";

function riskColor(score: number) {
  if (score >= 85) return "bg-destructive";
  if (score >= 65) return "bg-primary";
  return "bg-muted-foreground";
}

export function FileRiskIntelligence() {
  // Load real data if enabled
  const { fileRiskData: realData, loading } = useDevFlowData();
  const data = USE_REAL_DATA && realData.length > 0 ? realData : fileRiskData;
  
  const [featured, ...rest] = data;

  return (
    <section id="risk" className="relative py-16 px-8">
      <h2 className="font-display text-3xl lg:text-4xl text-foreground mb-2 animate-fade-lift stagger-3">
        File Risk Intelligence
      </h2>
      <p className="text-muted-foreground text-sm mb-10 animate-fade-lift stagger-3">
        Hotspots ranked by change frequency, contributors, and churn
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-6 animate-fade-lift stagger-3">
        {/* Featured risky file */}
        <div className="relative border border-border rounded-lg p-8 bg-card overflow-hidden">
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-destructive" />
          <div className="flex items-start justify-between mb-6">
            <div>
              <p className="text-muted-foreground text-xs uppercase tracking-widest mb-2">
                Highest Risk
              </p>
              <code className="font-mono text-sm text-foreground bg-muted/50 px-2 py-1 rounded">
                {featured.path}
              </code>
            </div>
            <AlertTriangle className="h-5 w-5 text-destructive shrink-0 mt-1" />
          </div>
          <div className="grid grid-cols-3 gap-6">
            <div>
              <p className="font-data text-3xl font-bold text-foreground">{featured.riskScore}</p>
              <p className="text-muted-foreground text-xs mt-1">Risk Score</p>
            </div>
            <div>
              <p className="font-data text-3xl font-bold text-foreground">{featured.changeCount}</p>
              <p className="text-muted-foreground text-xs mt-1">Changes</p>
            </div>
            <div>
              <p className="font-data text-3xl font-bold text-foreground">{featured.contributors}</p>
              <p className="text-muted-foreground text-xs mt-1">Contributors</p>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-border">
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span className="px-2 py-1 rounded bg-muted/50 font-mono">{featured.language}</span>
              <span>{featured.lastModifiedDaysAgo >= 0 ? `${featured.lastModifiedDaysAgo}d ago` : 'Unknown'}</span>
            </div>
          </div>
        </div>

        {/* Stacked risk entries */}
        <div className="flex flex-col gap-2">
          {rest.map((file) => (
            <div
              key={file.path}
              className="relative flex items-center gap-4 border border-border rounded-lg p-4 bg-card hover:bg-muted/50 transition-colors"
            >
              <div className={`w-0.5 self-stretch rounded-full shrink-0 ${riskColor(file.riskScore)}`} />
              <div className="flex-1 min-w-0">
                <code className="text-sm text-foreground truncate font-mono block">{file.path}</code>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-xs px-1.5 py-0.5 rounded bg-muted/50 font-mono text-muted-foreground">
                    {file.language}
                  </span>
                  <p className="text-xs text-muted-foreground">
                    {file.lastModifiedDaysAgo >= 0 ? `${file.lastModifiedDaysAgo}d ago` : 'Unknown'}
                  </p>
                </div>
              </div>
              <span className="font-data text-sm text-foreground shrink-0">{file.riskScore}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
