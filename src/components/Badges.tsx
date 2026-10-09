import type { ComplaintStatus, Priority } from '@/lib/types';

export function StatusBadge({ status }: { status: ComplaintStatus }) {
  const colors: Record<ComplaintStatus, string> = {
    Pending: 'bg-amber-100 text-amber-800 border-amber-300',
    'In Progress': 'bg-blue-100 text-blue-800 border-blue-300',
    Resolved: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    Overdue: 'bg-red-100 text-red-800 border-red-300',
  };
  const dots: Record<ComplaintStatus, string> = {
    Pending: 'bg-amber-500',
    'In Progress': 'bg-blue-500',
    Resolved: 'bg-emerald-500',
    Overdue: 'bg-red-500',
  };
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${colors[status]}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${dots[status]}`} />
      {status}
    </span>
  );
}

export function PriorityBadge({ priority }: { priority: Priority }) {
  const colors: Record<Priority, string> = {
    Critical: 'bg-red-600 text-white',
    High: 'bg-orange-500 text-white',
    Medium: 'bg-yellow-400 text-yellow-900',
    Low: 'bg-gray-200 text-gray-700',
  };
  return (
    <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-bold ${colors[priority]}`}>
      {priority}
    </span>
  );
}

export function CategoryIcon({ category }: { category: string }) {
  const icons: Record<string, string> = {
    Potholes: '🛣️',
    Garbage: '🗑️',
    Streetlight: '💡',
    'Water Leakage': '🚰',
    Drainage: '🌊',
  };
  return <span className="text-lg">{icons[category] || '📋'}</span>;
}
