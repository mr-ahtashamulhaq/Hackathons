import { useMemo, useState } from "react";
import { generateHeatmapData } from "@/data/mock-data";

const dayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function getOpacity(count: number): number {
  if (count === 0) return 0.04;
  if (count <= 2) return 0.15;
  if (count <= 5) return 0.3;
  if (count <= 9) return 0.5;
  if (count <= 12) return 0.7;
  return 1;
}

export function CommitHeatmap() {
  const data = useMemo(() => generateHeatmapData(), []);
  const [hovered, setHovered] = useState<{ date: string; count: number } | null>(null);

  const weeks = useMemo(() => {
    const w: (typeof data[0])[][] = [];
    for (let i = 0; i < 52; i++) {
      w.push(data.filter((d) => d.week === i));
    }
    return w;
  }, [data]);

  return (
    <section id="activity" className="relative py-16 px-8">
      <h2 className="font-display text-3xl lg:text-4xl text-foreground mb-2 animate-fade-lift stagger-2">
        Commit Activity
      </h2>
      <p className="text-muted-foreground text-sm mb-10 animate-fade-lift stagger-2">
        52 weeks of contribution density
      </p>

      <div className="animate-fade-lift stagger-3 overflow-x-auto pb-2">
        <div className="flex gap-[3px] min-w-[700px]">
          {/* Day labels */}
          <div className="flex flex-col gap-[3px] pr-2 pt-0">
            {dayLabels.map((d, i) => (
              <div
                key={d}
                className="h-[13px] text-[10px] text-muted-foreground font-body leading-[13px]"
              >
                {i % 2 === 1 ? d : ""}
              </div>
            ))}
          </div>
          {weeks.map((week, wi) => (
            <div key={wi} className="flex flex-col gap-[3px]">
              {week.map((cell) => (
                <div
                  key={cell.date}
                  className="h-[13px] w-[13px] rounded-sm cursor-pointer transition-all duration-150 hover:ring-1 hover:ring-primary/40"
                  style={{
                    backgroundColor: `hsla(54, 97%, 49%, ${getOpacity(cell.count)})`,
                  }}
                  onMouseEnter={() => setHovered({ date: cell.date, count: cell.count })}
                  onMouseLeave={() => setHovered(null)}
                />
              ))}
            </div>
          ))}
        </div>
        {hovered && (
          <div className="mt-3 text-xs text-muted-foreground font-body">
            <span className="font-data text-foreground">{hovered.count}</span> commits on{" "}
            <span className="text-foreground">{hovered.date}</span>
          </div>
        )}
      </div>
    </section>
  );
}
