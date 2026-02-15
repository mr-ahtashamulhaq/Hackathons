import { Activity, AlertTriangle, BarChart3, Command, Eye, Lightbulb, Brain } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
} from "@/components/ui/sidebar";

const navItems = [
  { id: "hero", label: "Overview", icon: Eye },
  { id: "activity", label: "Activity", icon: Activity },
  { id: "risk", label: "Risk", icon: AlertTriangle },
  { id: "commands", label: "Commands", icon: Command },
  { id: "insights", label: "Insights", icon: Lightbulb },
  { id: "insights-panel", label: "Intelligence", icon: Brain },
];

interface DevFlowSidebarProps {
  activeSection: string;
}

export function DevFlowSidebar({ activeSection }: DevFlowSidebarProps) {
  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <Sidebar collapsible="icon" className="border-r border-border">
      <SidebarHeader className="p-4 pb-2">
        <div className="flex items-center gap-2 group-data-[collapsible=icon]:justify-center">
          <BarChart3 className="h-5 w-5 text-primary shrink-0" />
          <span className="font-data text-sm font-semibold tracking-wider text-foreground group-data-[collapsible=icon]:hidden">
            DEVFLOW
          </span>
        </div>
      </SidebarHeader>
      <SidebarContent className="px-2 pt-4">
        <SidebarMenu>
          {navItems.map((item) => {
            const isActive = activeSection === item.id;
            return (
              <SidebarMenuItem key={item.id}>
                <SidebarMenuButton
                  onClick={() => scrollTo(item.id)}
                  isActive={isActive}
                  tooltip={item.label}
                  className={
                    isActive
                      ? "bg-primary/10 text-primary shadow-[inset_0_0_12px_hsla(54,97%,49%,0.06)]"
                      : "text-muted-foreground hover:text-foreground"
                  }
                >
                  <item.icon className="h-4 w-4 shrink-0" />
                  <span>{item.label}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarContent>
    </Sidebar>
  );
}
