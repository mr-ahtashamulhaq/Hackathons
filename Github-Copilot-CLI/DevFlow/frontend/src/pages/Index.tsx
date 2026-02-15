import { useState, useEffect } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { DevFlowSidebar } from "@/components/devflow/DevFlowSidebar";
import { CommandCenterHero } from "@/components/devflow/CommandCenterHero";
import { CommitHeatmap } from "@/components/devflow/CommitHeatmap";
import { FileRiskIntelligence } from "@/components/devflow/FileRiskIntelligence";
import { CommandBehavior } from "@/components/devflow/CommandBehavior";
import { InsightCards } from "@/components/devflow/InsightCards";
import { InsightPanel } from "@/components/devflow/InsightPanel";

const sectionIds = ["hero", "activity", "risk", "commands", "insights", "insights-panel"];

const Index = () => {
  const [activeSection, setActiveSection] = useState("hero");

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.find((e) => e.isIntersecting);
        if (visible?.target.id) setActiveSection(visible.target.id);
      },
      { rootMargin: "-30% 0px -60% 0px" }
    );
    sectionIds.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <DevFlowSidebar activeSection={activeSection} />

        <main className="flex-1 relative overflow-y-auto">
          {/* Atmospheric overlays */}
          <div className="noise-overlay" />
          <div className="grid-overlay" />

          {/* Header trigger */}
          <header className="sticky top-0 z-40 flex items-center h-12 px-4 border-b border-border bg-background/80 backdrop-blur-sm">
            <SidebarTrigger />
          </header>

          <div className="max-w-6xl mx-auto">
            <CommandCenterHero />
            <div className="mx-8 border-t border-border" />
            <CommitHeatmap />
            <div className="mx-8 border-t border-border" />
            <FileRiskIntelligence />
            <div className="mx-8 border-t border-border" />
            <CommandBehavior />
            <div className="mx-8 border-t border-border" />
            <InsightCards />
            <div className="mx-8 border-t border-border" />
            <InsightPanel />
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default Index;
