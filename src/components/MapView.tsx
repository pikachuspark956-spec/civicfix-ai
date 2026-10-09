import { useState } from 'react';
import type { Complaint, ComplaintStatus } from '@/lib/types';
import { StatusBadge, PriorityBadge, CategoryIcon } from './Badges';

interface MapViewProps {
  complaints: Complaint[];
  onSelect?: (complaint: Complaint) => void;
}

const statusColors: Record<ComplaintStatus, string> = {
  Pending: '#f59e0b',
  'In Progress': '#3b82f6',
  Resolved: '#10b981',
  Overdue: '#ef4444',
};

export function MapView({ complaints, onSelect }: MapViewProps) {
  const [selected, setSelected] = useState<Complaint | null>(null);
  const [hovered, setHovered] = useState<string | null>(null);

  // Normalize lat/lng to a 0-100 grid
  const lats = complaints.map((c) => c.lat);
  const lngs = complaints.map((c) => c.lng);
  const minLat = Math.min(...lats) - 0.02;
  const maxLat = Math.max(...lats) + 0.02;
  const minLng = Math.min(...lngs) - 0.02;
  const maxLng = Math.max(...lngs) + 0.02;

  const toX = (lng: number) => ((lng - minLng) / (maxLng - minLng)) * 100;
  const toY = (lat: number) => 100 - ((lat - minLat) / (maxLat - minLat)) * 100;

  const handleSelect = (c: Complaint) => {
    setSelected(c);
    onSelect?.(c);
  };

  return (
    <div className="relative overflow-hidden rounded-2xl border border-gray-200 bg-gradient-to-br from-slate-50 via-blue-50/30 to-teal-50/20" style={{ height: 500 }}>
      {/* Grid background */}
      <svg className="absolute inset-0 h-full w-full opacity-[0.07]" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#0a1e3f" strokeWidth="1" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
      </svg>

      {/* Simulated roads */}
      <svg className="absolute inset-0 h-full w-full" preserveAspectRatio="none">
        <line x1="0" y1="35%" x2="100%" y2="30%" stroke="#cbd5e1" strokeWidth="3" opacity="0.5" />
        <line x1="10%" y1="0" x2="50%" y2="100%" stroke="#cbd5e1" strokeWidth="2.5" opacity="0.4" />
        <line x1="60%" y1="0" x2="80%" y2="100%" stroke="#cbd5e1" strokeWidth="2.5" opacity="0.4" />
        <line x1="0" y1="70%" x2="100%" y2="75%" stroke="#cbd5e1" strokeWidth="3" opacity="0.5" />
        <line x1="0" y1="50%" x2="100%" y2="50%" stroke="#e2e8f0" strokeWidth="6" opacity="0.3" />
      </svg>

      {/* Label */}
      <div className="absolute top-3 left-3 z-10 flex items-center gap-2 rounded-lg bg-white/90 backdrop-blur px-3 py-1.5 shadow-sm border border-gray-200">
        <span className="text-xs font-bold text-gray-700">Civic Map</span>
        <span className="text-[10px] text-gray-400">Sample Locations</span>
      </div>

      {/* Legend */}
      <div className="absolute top-3 right-3 z-10 flex flex-col gap-1.5 rounded-lg bg-white/90 backdrop-blur px-3 py-2 shadow-sm border border-gray-200">
        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-0.5">Status</span>
        {(Object.keys(statusColors) as ComplaintStatus[]).map((s) => (
          <div key={s} className="flex items-center gap-1.5">
            <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: statusColors[s] }} />
            <span className="text-[10px] text-gray-600 font-medium">{s}</span>
          </div>
        ))}
      </div>

      {/* Pins */}
      {complaints.map((c) => {
        const x = toX(c.lng);
        const y = toY(c.lat);
        const isHovered = hovered === c.id;
        const isSelected = selected?.id === c.id;
        const color = statusColors[c.status];
        return (
          <button
            key={c.id}
            onClick={() => handleSelect(c)}
            onMouseEnter={() => setHovered(c.id)}
            onMouseLeave={() => setHovered(null)}
            className="absolute -translate-x-1/2 -translate-y-1/2 transition-all duration-200"
            style={{ left: `${x}%`, top: `${y}%`, zIndex: isHovered || isSelected ? 20 : 10 }}
          >
            {/* Pulse for critical/overdue */}
            {(c.priority === 'Critical' || c.status === 'Overdue') && (
              <span
                className="absolute inset-0 rounded-full animate-ping opacity-60"
                style={{ backgroundColor: color }}
              />
            )}
            <div
              className={`relative rounded-full border-2 border-white shadow-lg transition-transform duration-200 flex items-center justify-center ${
                isHovered || isSelected ? 'scale-150' : 'scale-100'
              }`}
              style={{
                backgroundColor: color,
                width: isHovered || isSelected ? 28 : 18,
                height: isHovered || isSelected ? 28 : 18,
              }}
            />
            {isHovered && (
              <div className="absolute left-1/2 -translate-x-1/2 mt-2 whitespace-nowrap rounded-lg bg-white px-2.5 py-1.5 shadow-xl border border-gray-200 z-30">
                <div className="flex items-center gap-1.5">
                  <CategoryIcon category={c.category} />
                  <span className="text-xs font-bold text-gray-800">{c.id}</span>
                </div>
                <p className="text-[10px] text-gray-500 mt-0.5">{c.location}</p>
              </div>
            )}
          </button>
        );
      })}

      {/* Detail panel */}
      {selected && (
        <div className="absolute bottom-3 left-3 right-3 z-20 rounded-xl bg-white shadow-2xl border border-gray-200 p-4 max-w-md">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <CategoryIcon category={selected.category} />
                <span className="text-xs font-bold text-gray-400">{selected.id}</span>
              </div>
              <h3 className="text-sm font-bold text-gray-800 truncate">{selected.title}</h3>
              <p className="text-xs text-gray-500 mt-0.5">{selected.location}</p>
              <div className="flex items-center gap-2 mt-2">
                <StatusBadge status={selected.status} />
                <PriorityBadge priority={selected.priority} />
              </div>
            </div>
            <button
              onClick={() => setSelected(null)}
              className="text-gray-300 hover:text-gray-500 flex-shrink-0"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" />
              </svg>
            </button>
          </div>
          {selected.assignedOfficer && (
            <div className="mt-2 pt-2 border-t border-gray-100 text-xs text-gray-500">
              Assigned to <span className="font-semibold text-gray-700">{selected.assignedOfficer}</span> · {selected.department}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
