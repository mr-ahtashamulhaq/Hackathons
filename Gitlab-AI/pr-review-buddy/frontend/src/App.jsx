import React from 'react';

const MR_REVIEWS = [
  {
    id: 1,
    title: "Add user authentication endpoint",
    repo: "backend-core-service",
    status: "Changes Requested",
    issuesCount: 6,
    severity: { crit: 2, high: 3, med: 1 },
    timeAgo: "14:02:45 UTC",
    hash: "a4f9b2c",
  },
  {
    id: 2,
    title: "Refactor payment processing module",
    repo: "billing-system",
    status: "Approved",
    issuesCount: 1,
    severity: { low: 1 },
    timeAgo: "13:45:12 UTC",
    hash: "c9d1e4a",
  },
  {
    id: 3,
    title: "Fix N+1 query in user profile load",
    repo: "web-frontend",
    status: "Approved",
    issuesCount: 0,
    severity: null,
    timeAgo: "12:15:00 UTC",
    hash: "b7h8i2o",
  },
  {
    id: 4,
    title: "Update dependency versions for security",
    repo: "auth-gateway",
    status: "Changes Requested",
    issuesCount: 3,
    severity: { crit: 1, med: 2 },
    timeAgo: "10:30:00 UTC",
    hash: "e3j4k5l",
  }
];

function App() {
  return (
    <div className="min-h-screen bg-[#050505] text-[#e5e5e5] font-sans selection:bg-[#333] selection:text-white pb-20">
      
      {/* Header - Minimal, Terminal Inspired */}
      <header className="border-b border-zinc-800 bg-[#050505] sticky top-0 z-50">
        <div className="max-w-[1400px] mx-auto px-6 h-12 flex items-center justify-between text-xs font-mono tracking-tight text-zinc-400">
          <div className="flex items-center gap-6">
            <span className="text-zinc-100 font-semibold uppercase tracking-widest">PR_REVIEW_BUDDY</span>
            <span className="hidden sm:inline-block text-zinc-600">/</span>
            <span className="hidden sm:inline-block">system_status: active</span>
            <span className="hidden sm:inline-block text-zinc-600">/</span>
            <span className="hidden sm:inline-block">version: 1.0.0</span>
          </div>
          <div className="flex items-center gap-2 border border-zinc-700/50 bg-zinc-900/50 px-2 py-0.5">
            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-none animate-pulse"></div>
            <span className="text-zinc-300">LISTENING_FOR_HOOKS</span>
          </div>
        </div>
      </header>

      {/* Main Layout - Asymmetric */}
      <main className="max-w-[1400px] mx-auto px-6 py-12 flex flex-col lg:flex-row gap-12 lg:gap-24">
        
        {/* Left Column: Data Density & Stats */}
        <aside className="lg:w-1/4 flex flex-col gap-8 shrink-0">
          
          <div className="flex flex-col gap-1">
            <h1 className="text-3xl font-medium tracking-tight text-white mb-4">Review Feed</h1>
            <p className="text-sm text-zinc-400 leading-relaxed font-sans mt-2">
              Autonomous PR inspection logs. Data points indicate parsed abstract syntax trees and static analysis output from recent MRs.
            </p>
          </div>

          <div className="h-px w-full bg-zinc-800 my-4"></div>

          {/* Stats: Vertical, brutal layout */}
          <div className="flex flex-col gap-6">
            <div className="flex justify-between items-baseline border-b border-zinc-800/50 pb-2">
              <span className="text-xs uppercase font-mono text-zinc-500">Total_Processed</span>
              <span className="text-2xl font-medium tracking-tighter">24</span>
            </div>
            
            <div className="flex justify-between items-baseline border-b border-zinc-800/50 pb-2">
              <span className="text-xs uppercase font-mono text-zinc-500">Anomalies</span>
              <span className="text-2xl font-medium tracking-tighter text-zinc-100">87</span>
            </div>

            <div className="flex justify-between items-baseline border-b border-zinc-800/50 pb-2">
              <span className="text-xs uppercase font-mono text-zinc-500">Latency_Avg</span>
              <span className="text-2xl font-medium tracking-tighter text-zinc-400">12<span className="text-sm">s</span></span>
            </div>
          </div>
          
        </aside>

        {/* Right Column: Feed log */}
        <section className="flex-1 flex flex-col pt-2 border-t border-zinc-800 lg:border-t-0">
          
          {/* Table Header Row */}
          <div className="hidden sm:grid grid-cols-12 gap-4 pb-4 border-b border-zinc-800 text-xs font-mono text-zinc-500 uppercase">
            <div className="col-span-2">Timestamp</div>
            <div className="col-span-5">Target / Subject</div>
            <div className="col-span-3">Diagnostics</div>
            <div className="col-span-2 text-right">Verdict</div>
          </div>

          {/* Feed Items */}
          <div className="flex flex-col relative">
            {MR_REVIEWS.map((mr, i) => (
              <div key={mr.id} className="grid sm:grid-cols-12 gap-y-4 gap-x-4 py-8 border-b border-zinc-900 hover:bg-zinc-900/10 transition-colors group">
                
                {/* Time & Hash */}
                <div className="sm:col-span-2 flex flex-row sm:flex-col justify-between sm:justify-start">
                  <span className="text-xs font-mono text-zinc-500">{mr.timeAgo}</span>
                  <span className="text-xs font-mono text-zinc-700 bg-zinc-900/50 px-1 py-0.5 inline-block w-max mt-1 border border-zinc-800">#{mr.hash}</span>
                </div>

                {/* PR Meta */}
                <div className="sm:col-span-5 flex flex-col gap-1.5 pr-4">
                  <div className="text-xs font-mono text-zinc-400">{mr.repo}</div>
                  <h3 className="text-lg font-medium tracking-tight text-white/90 leading-snug group-hover:text-white transition-colors">
                    {mr.title}
                  </h3>
                  <div className="pt-2">
                    <button className="text-xs font-sans text-zinc-400 hover:text-white border-b border-zinc-700 hover:border-zinc-300 transition-colors pb-0.5">
                      Explore analysis →
                    </button>
                  </div>
                </div>

                {/* Diagnostics */}
                <div className="sm:col-span-3 flex flex-col gap-2 pt-1 sm:pt-0">
                  <span className="text-xs font-mono text-zinc-500 uppercase">Events_Found: <span className="text-zinc-200">{mr.issuesCount}</span></span>
                  
                  {mr.issuesCount > 0 && (
                    <div className="flex flex-col gap-1 text-[11px] font-mono w-full max-w-[140px]">
                      {mr.severity.crit && (
                        <div className="flex justify-between w-full border-l-[1.5px] border-red-500/50 pl-2">
                          <span className="text-zinc-400">CRITICAL</span>
                          <span className="text-red-400">{mr.severity.crit}</span>
                        </div>
                      )}
                      {mr.severity.high && (
                        <div className="flex justify-between w-full border-l-[1.5px] border-orange-500/50 pl-2">
                          <span className="text-zinc-400">HIGH</span>
                          <span className="text-orange-400">{mr.severity.high}</span>
                        </div>
                      )}
                      {mr.severity.med && (
                        <div className="flex justify-between w-full border-l-[1.5px] border-yellow-500/50 pl-2">
                          <span className="text-zinc-400">MEDIUM</span>
                          <span className="text-yellow-400">{mr.severity.med}</span>
                        </div>
                      )}
                      {mr.severity.low && (
                        <div className="flex justify-between w-full border-l-[1.5px] border-zinc-500/50 pl-2">
                          <span className="text-zinc-400">LOW</span>
                          <span className="text-zinc-300">{mr.severity.low}</span>
                        </div>
                      )}
                    </div>
                  )}
                  {mr.issuesCount === 0 && (
                    <div className="text-[11px] font-mono border-l-[1.5px] border-zinc-700 pl-2 text-zinc-500">
                      NULL
                    </div>
                  )}
                </div>

                {/* Status Column */}
                <div className="sm:col-span-2 sm:text-right mt-2 sm:mt-0 flex">
                  {mr.status === 'Approved' ? (
                    <span className="ml-auto text-xs font-mono tracking-widest text-emerald-400/80 uppercase">
                      Pass
                    </span>
                  ) : (
                    <span className="ml-auto text-xs font-mono tracking-widest text-red-500/80 uppercase">
                      Inspect
                    </span>
                  )}
                </div>

              </div>
            ))}
          </div>
          
        </section>

      </main>
    </div>
  );
}

export default App;
