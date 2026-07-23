import React from 'react';
import { FiTrendingUp, FiTrendingDown } from 'react-icons/fi';

// =============================================================================
// DevSync AI — Admin StatCard Component
// Reusable KPI card with title, primary metric, trend percentage, and icon badge.
// =============================================================================

interface StatCardProps {
  title: string;
  value: string | number;
  subValue?: string;
  trend?: {
    percentage: number;
    isUp: boolean;
  };
  icon: React.ReactNode;
  iconBgColor?: string;
  iconTextColor?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subValue,
  trend,
  icon,
  iconBgColor = 'bg-indigo-500/10 border-indigo-500/20',
  iconTextColor = 'text-indigo-400',
}) => {
  return (
    <div className="p-5 bg-slate-900/90 border border-slate-800/80 rounded-2xl shadow-xl hover:border-slate-700 transition-all group">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          {title}
        </span>
        <div
          className={`p-2.5 rounded-xl border ${iconBgColor} ${iconTextColor} transition-transform group-hover:scale-105`}
        >
          {icon}
        </div>
      </div>

      <div className="mt-3 flex items-baseline justify-between">
        <h3 className="text-2xl font-bold text-slate-100 tracking-tight">{value}</h3>

        {trend && (
          <div
            className={`flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full border ${
              trend.isUp
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
            }`}
          >
            {trend.isUp ? (
              <FiTrendingUp className="w-3 h-3" />
            ) : (
              <FiTrendingDown className="w-3 h-3" />
            )}
            <span>{trend.percentage > 0 ? `+${trend.percentage}%` : `${trend.percentage}%`}</span>
          </div>
        )}
      </div>

      {subValue && <p className="text-xs text-slate-400 mt-1 font-medium">{subValue}</p>}
    </div>
  );
};
