import React from 'react';
import { motion } from 'framer-motion';

// =============================================================================
// DevSync AI — Admin Chart Components
// Reusable animated SVG charts (Line, Bar, Area, Donut) with responsive layout,
// gradients, tooltips, and Framer Motion animations.
// =============================================================================

// ── 1. LineChart ─────────────────────────────────────────────────────────────
interface LineChartProps {
  title: string;
  data: Array<{ label: string; value: number }>;
  lineColor?: string;
  gradientId?: string;
}

export const LineChart: React.FC<LineChartProps> = ({
  title,
  data,
  lineColor = '#818CF8',
  gradientId = 'lineGrad',
}) => {
  if (!data || data.length === 0) return null;

  const maxValue = Math.max(...data.map((d) => d.value), 1);
  const height = 180;
  const width = 500;
  const padding = 30;

  const points = data
    .map((d, index) => {
      const x = padding + (index / (data.length - 1)) * (width - padding * 2);
      const y = height - padding - (d.value / maxValue) * (height - padding * 2);
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <div className="bg-slate-900/90 border border-slate-800/80 p-5 rounded-2xl shadow-xl flex flex-col justify-between">
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">{title}</h4>
        <span className="text-[11px] text-slate-500 font-mono">Past 7 Days</span>
      </div>

      <div className="w-full relative">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-44 overflow-visible">
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={lineColor} stopOpacity="0.4" />
              <stop offset="100%" stopColor={lineColor} stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          {[0.2, 0.5, 0.8].map((ratio, i) => (
            <line
              key={i}
              x1={padding}
              y1={height * ratio}
              x2={width - padding}
              y2={height * ratio}
              stroke="#334155"
              strokeDasharray="4 4"
              strokeWidth="1"
            />
          ))}

          {/* Area fill */}
          <polygon
            points={`${padding},${height - padding} ${points} ${width - padding},${height - padding}`}
            fill={`url(#${gradientId})`}
          />

          {/* Smooth Polyline */}
          <motion.polyline
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1.2, ease: 'easeInOut' }}
            fill="none"
            stroke={lineColor}
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            points={points}
          />

          {/* Data Points */}
          {data.map((d, index) => {
            const x = padding + (index / (data.length - 1)) * (width - padding * 2);
            const y = height - padding - (d.value / maxValue) * (height - padding * 2);

            return (
              <g key={index} className="group/point">
                <circle cx={x} cy={y} r="5" fill="#0F172A" stroke={lineColor} strokeWidth="3" />
                <text
                  x={x}
                  y={y - 10}
                  textAnchor="middle"
                  fill="#F8FAFC"
                  fontSize="10"
                  fontWeight="bold"
                  className="opacity-0 group-hover/point:opacity-100 transition-opacity"
                >
                  {d.value}
                </text>
              </g>
            );
          })}
        </svg>

        {/* X-Axis Labels */}
        <div className="flex justify-between px-2 text-[10px] font-mono text-slate-400 mt-1">
          {data.map((d, i) => (
            <span key={i}>{d.label}</span>
          ))}
        </div>
      </div>
    </div>
  );
};

// ── 2. BarChart ──────────────────────────────────────────────────────────────
interface BarChartProps {
  title: string;
  data: Array<{ label: string; value: number }>;
  barColor?: string;
}

export const BarChart: React.FC<BarChartProps> = ({ title, data, barColor = 'bg-indigo-500' }) => {
  if (!data || data.length === 0) return null;
  const maxValue = Math.max(...data.map((d) => d.value), 1);

  return (
    <div className="bg-slate-900/90 border border-slate-800/80 p-5 rounded-2xl shadow-xl flex flex-col justify-between">
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">{title}</h4>
        <span className="text-[11px] text-slate-500 font-mono">Usage</span>
      </div>

      <div className="flex items-end justify-between gap-3 h-40 pt-4">
        {data.map((d, idx) => {
          const heightPercent = Math.max(8, Math.round((d.value / maxValue) * 100));

          return (
            <div key={idx} className="flex-1 flex flex-col items-center gap-2 group relative">
              {/* Tooltip */}
              <div className="absolute -top-7 text-[10px] font-bold bg-slate-800 text-white px-2 py-0.5 rounded border border-slate-700 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                {d.value}
              </div>

              {/* Bar */}
              <div className="w-full bg-slate-800/80 rounded-t-lg h-full flex items-end overflow-hidden p-1">
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: `${heightPercent}%` }}
                  transition={{ duration: 0.8, delay: idx * 0.1 }}
                  className={`w-full ${barColor} rounded-t-md shadow-lg shadow-indigo-500/20`}
                />
              </div>

              <span className="text-[10px] font-mono text-slate-400 truncate w-full text-center">
                {d.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ── 3. AreaChart ─────────────────────────────────────────────────────────────
interface AreaChartProps {
  title: string;
  data: Array<{ label: string; value: number }>;
  color?: string;
}

export const AreaChart: React.FC<AreaChartProps> = ({ title, data, color = '#34D399' }) => {
  return <LineChart title={title} data={data} lineColor={color} gradientId="areaGrad" />;
};

// ── 4. DonutChart ────────────────────────────────────────────────────────────
interface DonutChartProps {
  title: string;
  items: Array<{ label: string; value: number; color: string }>;
}

export const DonutChart: React.FC<DonutChartProps> = ({ title, items }) => {
  const total = items.reduce((acc, item) => acc + item.value, 0);

  return (
    <div className="bg-slate-900/90 border border-slate-800/80 p-5 rounded-2xl shadow-xl flex flex-col justify-between">
      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-4">{title}</h4>

      <div className="flex items-center justify-around gap-4">
        {/* Simple Donut SVG */}
        <div className="relative w-32 h-32 flex items-center justify-center">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
            <path
              className="text-slate-800"
              strokeWidth="4"
              stroke="currentColor"
              fill="none"
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            />
            {items.map((item, idx) => {
              const strokeDasharray = `${(item.value / (total || 1)) * 100} 100`;
              return (
                <path
                  key={idx}
                  stroke={item.color}
                  strokeWidth="4"
                  strokeDasharray={strokeDasharray}
                  strokeLinecap="round"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              );
            })}
          </svg>
          <div className="absolute text-center">
            <span className="text-xs text-slate-400 font-mono">Total</span>
            <p className="text-sm font-bold text-slate-100">{total.toLocaleString()}</p>
          </div>
        </div>

        {/* Legend List */}
        <div className="space-y-2 text-xs">
          {items.map((item, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
              <span className="text-slate-300 font-medium">{item.label}:</span>
              <span className="font-bold text-slate-100">{item.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
