import type { Complaint, Department } from '@/lib/types';

interface BarChartProps {
  data: { label: string; value: number; color: string }[];
  maxValue?: number;
}

export function BarChart({ data, maxValue }: BarChartProps) {
  const max = maxValue || Math.max(...data.map((d) => d.value), 1);
  return (
    <div className="space-y-3">
      {data.map((d) => (
        <div key={d.label} className="flex items-center gap-3">
          <div className="w-28 flex-shrink-0 text-right text-xs font-medium text-gray-600 truncate">
            {d.label}
          </div>
          <div className="flex-1 h-7 bg-gray-100 rounded-md overflow-hidden relative group">
            <div
              className="h-full rounded-md transition-all duration-700 ease-out flex items-center justify-end pr-2"
              style={{ width: `${(d.value / max) * 100}%`, backgroundColor: d.color }}
            >
              <span className="text-xs font-bold text-white opacity-0 group-hover:opacity-100 transition-opacity">
                {d.value}
              </span>
            </div>
          </div>
          <div className="w-8 text-xs font-bold text-gray-700 text-right">{d.value}</div>
        </div>
      ))}
    </div>
  );
}

interface DonutChartProps {
  segments: { label: string; value: number; color: string }[];
  total: number;
}

export function DonutChart({ segments, total }: DonutChartProps) {
  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  let offset = 0;

  return (
    <div className="flex items-center gap-6">
      <div className="relative">
        <svg width="160" height="160" viewBox="0 0 160 160">
          <circle cx="80" cy="80" r={radius} fill="none" stroke="#f3f4f6" strokeWidth="20" />
          {segments.map((seg) => {
            const len = (seg.value / total) * circumference;
            const circle = (
              <circle
                key={seg.label}
                cx="80" cy="80" r={radius}
                fill="none"
                stroke={seg.color}
                strokeWidth="20"
                strokeDasharray={`${len} ${circumference - len}`}
                strokeDashoffset={-offset}
                transform="rotate(-90 80 80)"
                className="transition-all duration-700"
              />
            );
            offset += len;
            return circle;
          })}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold text-gray-800">{total}</span>
          <span className="text-[10px] text-gray-400 uppercase tracking-wider">Total</span>
        </div>
      </div>
      <div className="space-y-2">
        {segments.map((seg) => (
          <div key={seg.label} className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-sm" style={{ backgroundColor: seg.color }} />
            <span className="text-xs font-medium text-gray-600">{seg.label}</span>
            <span className="text-xs font-bold text-gray-800">{seg.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

interface TrendChartProps {
  complaints: Complaint[];
}

export function TrendChart({ complaints }: TrendChartProps) {
  // Group by day for last 7 days
  const days: { date: string; label: string; count: number }[] = [];
  const now = new Date();
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    d.setHours(0, 0, 0, 0);
    const next = new Date(d);
    next.setDate(next.getDate() + 1);
    const count = complaints.filter((c) => {
      const created = new Date(c.createdAt);
      return created >= d && created < next;
    }).length;
    days.push({
      date: d.toDateString(),
      label: d.toLocaleDateString('en', { weekday: 'short' }),
      count,
    });
  }

  const max = Math.max(...days.map((d) => d.count), 1);
  const chartHeight = 140;
  const barWidth = 100 / days.length;

  return (
    <div>
      <svg viewBox={`0 0 100 ${chartHeight}`} preserveAspectRatio="none" className="w-full" style={{ height: chartHeight }}>
        <line x1="0" y1={chartHeight - 20} x2="100" y2={chartHeight - 20} stroke="#e5e7eb" strokeWidth="0.5" />
        {days.map((d, i) => {
          const h = (d.count / max) * (chartHeight - 30);
          const x = i * barWidth + barWidth * 0.2;
          const w = barWidth * 0.6;
          return (
            <g key={i}>
              <rect
                x={x} y={chartHeight - 20 - h}
                width={w} height={h}
                rx="1.5"
                fill="#0d9488"
                className="transition-all duration-700"
              />
            </g>
          );
        })}
      </svg>
      <div className="flex justify-between mt-2 px-1">
        {days.map((d, i) => (
          <div key={i} className="text-center" style={{ width: `${100 / days.length}%` }}>
            <span className="text-[10px] text-gray-400 font-medium">{d.label}</span>
            <div className="text-xs font-bold text-gray-700">{d.count}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

interface DeptPerformanceProps {
  departments: { department: Department; total: number; resolved: number; avgDays: number }[];
}

export function DeptPerformanceTable({ departments }: DeptPerformanceProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-200 text-left">
            <th className="pb-2 pr-4 font-semibold text-gray-500 text-xs uppercase tracking-wider">Department</th>
            <th className="pb-2 pr-4 font-semibold text-gray-500 text-xs uppercase tracking-wider text-center">Total</th>
            <th className="pb-2 pr-4 font-semibold text-gray-500 text-xs uppercase tracking-wider text-center">Resolved</th>
            <th className="pb-2 pr-4 font-semibold text-gray-500 text-xs uppercase tracking-wider text-center">Rate</th>
            <th className="pb-2 font-semibold text-gray-500 text-xs uppercase tracking-wider text-center">Avg Days</th>
          </tr>
        </thead>
        <tbody>
          {departments.map((d) => {
            const rate = d.total > 0 ? Math.round((d.resolved / d.total) * 100) : 0;
            const rateColor = rate >= 70 ? 'text-emerald-600' : rate >= 40 ? 'text-amber-600' : 'text-red-600';
            return (
              <tr key={d.department} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                <td className="py-2.5 pr-4 font-medium text-gray-800">{d.department}</td>
                <td className="py-2.5 pr-4 text-center text-gray-600">{d.total}</td>
                <td className="py-2.5 pr-4 text-center text-gray-600">{d.resolved}</td>
                <td className={`py-2.5 pr-4 text-center font-bold ${rateColor}`}>{rate}%</td>
                <td className="py-2.5 text-center text-gray-500">{d.avgDays || '—'}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
