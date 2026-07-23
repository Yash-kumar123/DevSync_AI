import React, { useEffect } from 'react';
import { FiCpu, FiClock, FiZap, FiAlertCircle } from 'react-icons/fi';
import { useAdminStore } from '../store/admin-store';
import { StatCard } from '../components/StatCard';
import { BarChart, LineChart } from '../components/ChartComponents';

// =============================================================================
// DevSync AI — Admin AI Analytics Page
// Detailed breakdown of AI code completion requests, average response latency,
// token consumption, model distribution, and error rates.
// =============================================================================

export const AIAnalyticsPage: React.FC = () => {
  const { aiAnalytics, isLoadingAiAnalytics, fetchAIAnalytics } = useAdminStore();

  useEffect(() => {
    void fetchAIAnalytics();
  }, [fetchAIAnalytics]);

  if (isLoadingAiAnalytics && !aiAnalytics) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-slate-400 text-xs gap-3">
        <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
        <span>Loading AI Telemetry & Token Analytics...</span>
      </div>
    );
  }

  const modelUsageData =
    aiAnalytics?.modelBreakdown.map((m) => ({ label: m.model, value: m.requests })) || [];

  const dailyTrendData =
    aiAnalytics?.dailyTrends.map((d) => ({ label: d.date, value: d.requests })) || [];

  return (
    <div className="space-y-6">
      {/* 1. Top KPI Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total AI Invocations"
          value={aiAnalytics?.totalRequests.toLocaleString() ?? 0}
          subValue="Past 30 Days"
          trend={{ percentage: 18, isUp: true }}
          icon={<FiCpu className="w-5 h-5" />}
          iconBgColor="bg-purple-500/10 border-purple-500/20"
          iconTextColor="text-purple-400"
        />

        <StatCard
          title="Avg Latency"
          value={`${aiAnalytics?.avgLatencyMs ?? 0} ms`}
          subValue="Fast API Inference"
          trend={{ percentage: -12, isUp: false }}
          icon={<FiClock className="w-5 h-5" />}
          iconBgColor="bg-indigo-500/10 border-indigo-500/20"
          iconTextColor="text-indigo-400"
        />

        <StatCard
          title="Total Tokens Processed"
          value={(aiAnalytics?.totalTokens ?? 0).toLocaleString()}
          subValue="Input + Output tokens"
          trend={{ percentage: 22, isUp: true }}
          icon={<FiZap className="w-5 h-5" />}
          iconBgColor="bg-amber-500/10 border-amber-500/20"
          iconTextColor="text-amber-400"
        />

        <StatCard
          title="AI Error Rate"
          value={`${aiAnalytics?.errorRatePercent ?? 0}%`}
          subValue="Failed inferences"
          trend={{ percentage: -0.4, isUp: false }}
          icon={<FiAlertCircle className="w-5 h-5" />}
          iconBgColor="bg-emerald-500/10 border-emerald-500/20"
          iconTextColor="text-emerald-400"
        />
      </div>

      {/* 2. Model Breakdown Table */}
      <div className="bg-slate-900/90 border border-slate-800/80 rounded-2xl shadow-xl p-5">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-4 flex items-center gap-2">
          <FiCpu className="text-purple-400" />
          <span>AI Model Performance & Consumption</span>
        </h4>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider bg-slate-950/60">
                <th className="py-3 px-4">Model Engine</th>
                <th className="py-3 px-4">Requests</th>
                <th className="py-3 px-4">Tokens Used</th>
                <th className="py-3 px-4">Share %</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-200 font-mono">
              {aiAnalytics?.modelBreakdown.map((m, idx) => {
                const sharePercent = Math.round(
                  (m.requests / (aiAnalytics.totalRequests || 1)) * 100,
                );

                return (
                  <tr key={idx} className="hover:bg-slate-800/50">
                    <td className="py-3 px-4 font-sans font-semibold text-indigo-300">{m.model}</td>
                    <td className="py-3 px-4">{m.requests.toLocaleString()}</td>
                    <td className="py-3 px-4 text-slate-400">{m.tokens.toLocaleString()}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-20 bg-slate-800 rounded-full h-1.5 overflow-hidden">
                          <div
                            className="bg-purple-500 h-full rounded-full"
                            style={{ width: `${sharePercent}%` }}
                          />
                        </div>
                        <span>{sharePercent}%</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 3. Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <BarChart
          title="Invocations by Model Engine"
          data={modelUsageData}
          barColor="bg-purple-500"
        />
        <LineChart title="Daily Request Volume" data={dailyTrendData} lineColor="#C084FC" />
      </div>
    </div>
  );
};
