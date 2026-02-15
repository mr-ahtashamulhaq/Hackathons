/**
 * DevFlow Analytics Data Loader
 * Fetches analytics data from JSON files exported by Python backend
 */

import { useState, useEffect } from 'react';

const DATA_BASE_PATH = '/devflow-data';

// Types matching the exported JSON structures
export interface ProductivityScore {
  current: number;
  previous: number;
  trend: 'up' | 'down' | 'neutral';
  streak: number;
  period: string;
}

export interface SparklineData {
  day: string;
  commits: number;
}

// PART 5: EXPORT SCHEMA LOCK
// This schema is stable and should not change
export interface FileRisk {
  path: string;                    // Repo-relative path
  riskScore: number;               // 0-100
  changeCount: number;             // Number of changes
  contributors: number;            // Unique contributors
  language: string;                // Programming language
  lastModifiedDaysAgo: number;    // Days since last change (-1 if unknown)
}

export interface CommandData {
  command: string;
  count: number;
  alias: string | null;
}

export interface AliasSuggestion {
  full: string;
  alias: string;
  timesTyped: number;
  timeSaved: string;
}

// Old insight format (for backward compatibility with mock data)
export interface LegacyInsight {
  type: 'wide' | 'tall' | 'inline';
  title: string;
  body?: string;
  metric?: string;
  metricLabel?: string;
  subMetrics?: Array<{ label: string; value: string }>;
  icon?: string;
}

// New insight format from Insight Engine (Step 11)
export interface Insight {
  type: 'risk' | 'workflow' | 'health' | 'command';
  severity: 'low' | 'medium' | 'high';
  title: string;
  description: string;
  recommendation: string;
  timestamp: string;
}

// Loader hook
export function useDevFlowData() {
  const [productivityScore, setProductivityScore] = useState<ProductivityScore | null>(null);
  const [sparklineData, setSparklineData] = useState<SparklineData[]>([]);
  const [fileRiskData, setFileRiskData] = useState<FileRisk[]>([]);
  const [commandData, setCommandData] = useState<CommandData[]>([]);
  const [aliasSuggestions, setAliasSuggestions] = useState<AliasSuggestion[]>([]);
  const [insights, setInsights] = useState<Insight[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);

        // Load productivity summary
        try {
          const prodRes = await fetch(`${DATA_BASE_PATH}/productivity-summary.json`);
          if (prodRes.ok) {
            const data = await prodRes.json();
            setProductivityScore(data.productivityScore);
            setSparklineData(data.sparklineData);
          } else {
            console.error(`Failed to load productivity summary: HTTP ${prodRes.status}`);
          }
        } catch (err) {
          console.error('Could not load productivity summary:', err);
        }

        // Load file hotspots
        try {
          const hotspotsRes = await fetch(`${DATA_BASE_PATH}/file-hotspots.json`);
          if (hotspotsRes.ok) {
            const data = await hotspotsRes.json();
            setFileRiskData(data.fileRiskData);
          } else {
            console.error(`Failed to load file hotspots: HTTP ${hotspotsRes.status}`);
          }
        } catch (err) {
          console.error('Could not load file hotspots:', err);
        }

        // Load command usage
        try {
          const cmdRes = await fetch(`${DATA_BASE_PATH}/command-usage.json`);
          if (cmdRes.ok) {
            const data = await cmdRes.json();
            setCommandData(data.commandData);
            setAliasSuggestions(data.aliasSuggestions);
          } else {
            console.error(`Failed to load command usage: HTTP ${cmdRes.status}`);
          }
        } catch (err) {
          console.error('Could not load command usage:', err);
        }

        // Load insights
        try {
          const insightsRes = await fetch(`${DATA_BASE_PATH}/insights.json`);
          if (insightsRes.ok) {
            const data = await insightsRes.json();
            setInsights(data.insights);
          } else {
            console.error(`Failed to load insights: HTTP ${insightsRes.status}`);
          }
        } catch (err) {
          console.error('Could not load insights:', err);
        }

        setLoading(false);
      } catch (err) {
        console.error('Error loading DevFlow data:', err);
        setError(err instanceof Error ? err.message : 'Failed to load data');
        setLoading(false);
      }
    };

    loadData();
  }, []);

  return {
    productivityScore,
    sparklineData,
    fileRiskData,
    commandData,
    aliasSuggestions,
    insights,
    loading,
    error,
  };
}

// Individual data loaders for specific needs

export async function loadProductivitySummary() {
  const res = await fetch(`${DATA_BASE_PATH}/productivity-summary.json`);
  return res.json();
}

export async function loadFileHotspots() {
  const res = await fetch(`${DATA_BASE_PATH}/file-hotspots.json`);
  return res.json();
}

export async function loadCommandUsage() {
  const res = await fetch(`${DATA_BASE_PATH}/command-usage.json`);
  return res.json();
}

export async function loadInsights() {
  const res = await fetch(`${DATA_BASE_PATH}/insights.json`);
  return res.json();
}
