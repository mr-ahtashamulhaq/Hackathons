// Mock DevFlow analytics data — structured for easy API replacement
// Set USE_REAL_DATA to true to load from JSON files instead of mock data
export const USE_REAL_DATA = true;

export const productivityScore = {
  current: 87,
  previous: 82,
  trend: "up" as const,
  streak: 14,
  period: "7d",
};

export const sparklineData = [
  { day: "Mon", commits: 12 },
  { day: "Tue", commits: 8 },
  { day: "Wed", commits: 19 },
  { day: "Thu", commits: 15 },
  { day: "Fri", commits: 22 },
  { day: "Sat", commits: 6 },
  { day: "Sun", commits: 3 },
  { day: "Mon", commits: 17 },
  { day: "Tue", commits: 21 },
  { day: "Wed", commits: 14 },
  { day: "Thu", commits: 9 },
  { day: "Fri", commits: 25 },
  { day: "Sat", commits: 4 },
  { day: "Sun", commits: 7 },
];

// Heatmap: 52 weeks × 7 days
export const generateHeatmapData = () => {
  const data: { week: number; day: number; count: number; date: string }[] = [];
  const now = new Date();
  for (let w = 51; w >= 0; w--) {
    for (let d = 0; d < 7; d++) {
      const date = new Date(now);
      date.setDate(date.getDate() - (w * 7 + (6 - d)));
      const count = Math.random() > 0.3
        ? Math.floor(Math.random() * Math.random() * 16)
        : 0;
      data.push({
        week: 51 - w,
        day: d,
        count,
        date: date.toISOString().slice(0, 10),
      });
    }
  }
  return data;
};

export const fileRiskData = [
  {
    path: "src/core/engine/pipeline.ts",
    riskScore: 94,
    changeCount: 47,
    contributors: 8,
    language: "typescript",
    lastModifiedDaysAgo: 2,
  },
  {
    path: "src/api/handlers/auth.ts",
    riskScore: 78,
    changeCount: 32,
    contributors: 5,
    language: "typescript",
    lastModifiedDaysAgo: 6,
  },
  {
    path: "src/utils/parser.ts",
    riskScore: 71,
    changeCount: 28,
    contributors: 4,
    language: "typescript",
    lastModifiedDaysAgo: 1,
  },
  {
    path: "src/db/migrations/024.ts",
    riskScore: 65,
    changeCount: 19,
    contributors: 3,
    language: "typescript",
    lastModifiedDaysAgo: 2,
  },
  {
    path: "src/workers/sync.ts",
    riskScore: 58,
    changeCount: 14,
    contributors: 2,
    language: "typescript",
    lastModifiedDaysAgo: 3,
  },
];

export const commandData = [
  { command: "git commit", count: 312, alias: null },
  { command: "git checkout", count: 247, alias: "gco" },
  { command: "git pull", count: 189, alias: "gpl" },
  { command: "git status", count: 176, alias: "gst" },
  { command: "git diff", count: 143, alias: "gd" },
  { command: "git push", count: 128, alias: null },
  { command: "git stash", count: 94, alias: "gsta" },
  { command: "git log", count: 87, alias: "gl" },
  { command: "git rebase", count: 62, alias: "grb" },
  { command: "git merge", count: 51, alias: "gm" },
];

export const aliasSuggestions = [
  { full: "git checkout", alias: "gco", timesTyped: 247, timeSaved: "~12 min/week" },
  { full: "git status", alias: "gst", timesTyped: 176, timeSaved: "~8 min/week" },
  { full: "git diff", alias: "gd", timesTyped: 143, timeSaved: "~6 min/week" },
];

// Legacy insights format (old UI cards)
export const legacyInsights = [
  {
    type: "wide" as const,
    title: "Your most productive window is 9:00 - 11:30am",
    body: "62% of your high-quality commits land in morning sessions. Afternoon commits show 2.3x more reverts.",
    metric: "62%",
    metricLabel: "morning commits",
  },
  {
    type: "tall" as const,
    title: "Deep Work Index",
    body: "Average uninterrupted coding session",
    metric: "47",
    metricLabel: "minutes",
    subMetrics: [
      { label: "Sessions > 1hr", value: "12" },
      { label: "Avg interruptions", value: "3.2" },
      { label: "Focus trend", value: "+8%" },
    ],
  },
  {
    type: "inline" as const,
    title: "Branch lifespan averaging 2.1 days — 34% faster than team median",
    icon: "git-branch",
  },
  {
    type: "inline" as const,
    title: "PR review turnaround: 4.2hrs — top 15% of organization",
    icon: "clock",
  },
  {
    type: "inline" as const,
    title: "Zero force-pushes this week — clean rebase workflow maintained",
    icon: "shield",
  },
];

// New insights format from Insight Engine (Step 11)
export const insights = [
  {
    type: "workflow" as const,
    severity: "low" as const,
    title: "Peak Productivity Hour Identified",
    description: "Most commits occur at 9:00 AM. This appears to be your most productive coding time.",
    recommendation: "Protect this time block from meetings and interruptions for focused coding work.",
    timestamp: new Date().toISOString(),
  },
  {
    type: "risk" as const,
    severity: "high" as const,
    title: "Critical Risk File Detected",
    description: "src/core/engine/pipeline.ts has a risk score of 94 with 47 changes across 8 contributors.",
    recommendation: "Consider refactoring this file or adding additional test coverage to mitigate risk.",
    timestamp: new Date().toISOString(),
  },
  {
    type: "health" as const,
    severity: "medium" as const,
    title: "Low Bus Factor Warning",
    description: "2 critical files are maintained by single contributors, creating knowledge silos.",
    recommendation: "Schedule knowledge sharing sessions and pair programming for these files.",
    timestamp: new Date().toISOString(),
  },
  {
    type: "command" as const,
    severity: "low" as const,
    title: "Efficient Git Workflow",
    description: "No force pushes detected this week, indicating clean rebase practices.",
    recommendation: "Continue maintaining this workflow for team collaboration.",
    timestamp: new Date().toISOString(),
  },
];
