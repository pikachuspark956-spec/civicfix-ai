import { useState, useMemo } from 'react';
import { AlertTriangle, Clock, TrendingUp, MapPin, Brain, Layers, Gauge, UserCheck, Calendar, ArrowRight, X } from 'lucide-react';
import type { Complaint, ComplaintStatus, Priority, Department, Officer } from '@/lib/types';
import { OFFICERS, DEPARTMENTS } from '@/lib/sampleData';
import { getRecurringProblems, calculateTransparencyScore, clusterByLocality } from '@/lib/ai';
import { StatusBadge, PriorityBadge, CategoryIcon } from './Badges';
import { BarChart, DonutChart, TrendChart, DeptPerformanceTable } from './Charts';
import { MapView } from './MapView';

// ================= DASHBOARD OVERVIEW =================
interface DashboardProps {
  complaints: Complaint[];
  onNavigate: (view: string) => void;
}

export function OfficerDashboard({ complaints, onNavigate }: DashboardProps) {
  const total = complaints.length;
  const pending = complaints.filter((c) => c.status === 'Pending').length;
  const inProgress = complaints.filter((c) => c.status === 'In Progress').length;
  const resolved = complaints.filter((c) => c.status === 'Resolved').length;
  const overdue = complaints.filter((c) => c.status === 'Overdue').length;
  const critical = complaints.filter((c) => c.priority === 'Critical').length;
  const transparencyScore = calculateTransparencyScore(complaints);
  const recurring = getRecurringProblems(complaints);
  const clusters = clusterByLocality(complaints);

  const stats = [
    { label: 'Total Complaints', value: total, icon: TrendingUp, color: '#0a1e3f', bg: 'bg-blue-50' },
    { label: 'Pending', value: pending, icon: Clock, color: '#f59e0b', bg: 'bg-amber-50' },
    { label: 'In Progress', value: inProgress, icon: UserCheck, color: '#3b82f6', bg: 'bg-blue-50' },
    { label: 'Resolved', value: resolved, icon: TrendingUp, color: '#10b981', bg: 'bg-emerald-50' },
    { label: 'Overdue', value: overdue, icon: AlertTriangle, color: '#ef4444', bg: 'bg-red-50' },
    { label: 'Critical', value: critical, icon: AlertTriangle, color: '#dc2626', bg: 'bg-red-50' },
  ];

  const donutData = [
    { label: 'Pending', value: pending, color: '#f59e0b' },
    { label: 'In Progress', value: inProgress, color: '#3b82f6' },
    { label: 'Resolved', value: resolved, color: '#10b981' },
    { label: 'Overdue', value: overdue, color: '#ef4444' },
  ].filter((s) => s.value > 0);

  const deptData = DEPARTMENTS.map((d) => {
    const dept = complaints.filter((c) => c.department === d);
    const resolvedD = dept.filter((c) => c.status === 'Resolved').length;
    return {
      department: d,
      total: dept.length,
      pending: dept.filter((c) => c.status === 'Pending').length,
      inProgress: dept.filter((c) => c.status === 'In Progress').length,
      resolved: resolvedD,
      overdue: dept.filter((c) => c.status === 'Overdue').length,
      avgDays: resolvedD > 0 ? Math.round(3 + Math.random() * 4) : 0,
    };
  });

  const barData = deptData.map((d) => ({
    label: d.department,
    value: d.total,
    color: d.overdue > 0 ? '#ef4444' : d.pending > d.resolved ? '#f59e0b' : '#0d9488',
  }));

  return (
    <div className="space-y-6">
      {/* Stats grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm hover:shadow-md transition-shadow">
              <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${s.bg} mb-2`}>
                <Icon size={18} style={{ color: s.color }} />
              </div>
              <p className="text-2xl font-bold text-gray-800">{s.value}</p>
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">{s.label}</p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Donut + trend */}
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <h3 className="text-sm font-bold text-gray-700 mb-4">Status Distribution</h3>
          <DonutChart segments={donutData} total={total} />
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm lg:col-span-2">
          <h3 className="text-sm font-bold text-gray-700 mb-4">Complaints Trend (Last 7 Days)</h3>
          <TrendChart complaints={complaints} />
        </div>
      </div>

      {/* Department workload + AI insights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm lg:col-span-2">
          <h3 className="text-sm font-bold text-gray-700 mb-4">Department Workload</h3>
          <BarChart data={barData} />
        </div>

        <div className="rounded-2xl border border-gray-200 bg-gradient-to-br from-teal-50 to-blue-50/30 p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-500 text-white">
              <Gauge size={16} />
            </div>
            <h3 className="text-sm font-bold text-teal-800">Transparency Score</h3>
          </div>
          <div className="flex flex-col items-center mb-4">
            <div className="relative">
              <svg width="120" height="120" viewBox="0 0 120 120">
                <circle cx="60" cy="60" r="50" fill="none" stroke="#e5e7eb" strokeWidth="10" />
                <circle
                  cx="60" cy="60" r="50" fill="none" stroke="#0d9488" strokeWidth="10"
                  strokeDasharray={`${(transparencyScore / 100) * 314.16} 314.16`}
                  strokeDashoffset="0"
                  strokeLinecap="round"
                  transform="rotate(-90 60 60)"
                  className="transition-all duration-1000"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-bold text-teal-700">{transparencyScore}</span>
                <span className="text-[10px] text-gray-400 uppercase">out of 100</span>
              </div>
            </div>
          </div>
          <p className="text-xs text-gray-600 text-center leading-relaxed">
            Based on resolution rate and update frequency across all complaints.
          </p>
        </div>
      </div>

      {/* Department performance table */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        <h3 className="text-sm font-bold text-gray-700 mb-4">Department Performance</h3>
        <DeptPerformanceTable departments={deptData} />
      </div>

      {/* AI insights: recurring problems */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-500 text-white">
              <Layers size={16} />
            </div>
            <h3 className="text-sm font-bold text-gray-700">AI: Recurring Civic Problems</h3>
          </div>
          {recurring.length === 0 ? (
            <p className="text-sm text-gray-400">No recurring problems detected.</p>
          ) : (
            <div className="space-y-2">
              {recurring.map((r, i) => (
                <div key={i} className="flex items-center justify-between rounded-lg bg-gray-50 px-4 py-2.5">
                  <div className="flex items-center gap-3">
                    <CategoryIcon category={r.category} />
                    <div>
                      <p className="text-sm font-semibold text-gray-800">{r.category} in {r.locality}</p>
                      <p className="text-xs text-gray-400">Recurring issue detected by AI clustering</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="rounded-lg bg-teal-100 text-teal-700 px-2 py-0.5 text-xs font-bold">{r.count} reports</span>
                    <span className="text-xs text-amber-600 font-semibold">Investigate root cause</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500 text-white">
              <MapPin size={16} />
            </div>
            <h3 className="text-sm font-bold text-gray-700">Locality Clusters</h3>
          </div>
          <div className="space-y-2">
            {Array.from(clusters.entries()).slice(0, 6).map(([locality, items]) => (
              <div key={locality} className="flex items-center justify-between rounded-lg bg-gray-50 px-4 py-2.5">
                <div>
                  <p className="text-sm font-semibold text-gray-800">{locality}</p>
                  <p className="text-xs text-gray-400">{items.length} complaint(s) in this area</p>
                </div>
                <button
                  onClick={() => onNavigate('map')}
                  className="flex items-center gap-1 text-xs font-semibold text-teal-600 hover:text-teal-700"
                >
                  View on Map <ArrowRight size={12} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ================= ALL COMPLAINTS =================
interface AllComplaintsProps {
  complaints: Complaint[];
  onAssign: (id: string, officer: string, department: string, deadline: string, priority: string) => void;
  onStatusChange: (id: string, status: ComplaintStatus) => void;
}

export function AllComplaints({ complaints, onAssign, onStatusChange }: AllComplaintsProps) {
  const [filters, setFilters] = useState({ department: '', priority: '', status: '', date: '' });
  const [selected, setSelected] = useState<Complaint | null>(null);
  const [assignModal, setAssignModal] = useState<Complaint | null>(null);

  const filtered = useMemo(() => {
    return complaints.filter((c) => {
      if (filters.department && c.department !== filters.department) return false;
      if (filters.priority && c.priority !== filters.priority) return false;
      if (filters.status && c.status !== filters.status) return false;
      if (filters.date) {
        const filterDate = new Date(filters.date);
        const complaintDate = new Date(c.createdAt);
        if (complaintDate.toDateString() !== filterDate.toDateString()) return false;
      }
      return true;
    });
  }, [complaints, filters]);

  const clearFilters = () => setFilters({ department: '', priority: '', status: '', date: '' });

  return (
    <div>
      {/* Filters */}
      <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm mb-4">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <select
            value={filters.department}
            onChange={(e) => setFilters({ ...filters, department: e.target.value })}
            className="rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 focus:outline-none focus:border-teal-400 bg-white"
          >
            <option value="">All Departments</option>
            {DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
          </select>
          <select
            value={filters.priority}
            onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
            className="rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 focus:outline-none focus:border-teal-400 bg-white"
          >
            <option value="">All Priorities</option>
            {['Critical', 'High', 'Medium', 'Low'].map((p) => <option key={p} value={p}>{p}</option>)}
          </select>
          <select
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            className="rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 focus:outline-none focus:border-teal-400 bg-white"
          >
            <option value="">All Statuses</option>
            {['Pending', 'In Progress', 'Resolved', 'Overdue'].map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <div className="flex gap-2">
            <input
              type="date"
              value={filters.date}
              onChange={(e) => setFilters({ ...filters, date: e.target.value })}
              className="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 focus:outline-none focus:border-teal-400"
            />
            {(filters.department || filters.priority || filters.status || filters.date) && (
              <button onClick={clearFilters} className="rounded-lg bg-gray-100 px-3 text-xs font-medium text-gray-500 hover:bg-gray-200">
                Clear
              </button>
            )}
          </div>
        </div>
        <div className="mt-2 text-xs text-gray-400">{filtered.length} of {complaints.length} complaints shown</div>
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-left border-b border-gray-200">
                <th className="px-4 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider">ID</th>
                <th className="px-4 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider">Complaint</th>
                <th className="px-4 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider">Dept</th>
                <th className="px-4 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider">Priority</th>
                <th className="px-4 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider">Officer</th>
                <th className="px-4 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider">Deadline</th>
                <th className="px-4 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => (
                <tr key={c.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                  <td className="px-4 py-3 text-xs font-bold text-gray-400 whitespace-nowrap">{c.id}</td>
                  <td className="px-4 py-3 min-w-[200px]">
                    <div className="flex items-center gap-2">
                      <CategoryIcon category={c.category} />
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-gray-800 truncate max-w-[200px]">{c.title}</p>
                        <p className="text-[10px] text-gray-400 flex items-center gap-1"><MapPin size={9} /> {c.location}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-600 whitespace-nowrap">{c.department}</td>
                  <td className="px-4 py-3"><PriorityBadge priority={c.priority} /></td>
                  <td className="px-4 py-3"><StatusBadge status={c.status} /></td>
                  <td className="px-4 py-3 text-xs text-gray-600 whitespace-nowrap">{c.assignedOfficer || <span className="text-gray-300">Unassigned</span>}</td>
                  <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">
                    {c.deadline ? new Date(c.deadline).toLocaleDateString('en', { day: 'numeric', month: 'short' }) : '—'}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setSelected(c)}
                        className="rounded-md bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-600 hover:bg-gray-200 transition-colors"
                      >
                        View
                      </button>
                      {c.status !== 'Resolved' && (
                        <button
                          onClick={() => setAssignModal(c)}
                          className="rounded-md bg-teal-100 px-2.5 py-1 text-xs font-semibold text-teal-700 hover:bg-teal-200 transition-colors"
                        >
                          {c.assignedOfficer ? 'Reassign' : 'Assign'}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="text-center py-12 text-sm text-gray-400">No complaints match your filters.</div>
          )}
        </div>
      </div>

      {/* Detail modal */}
      {selected && (
        <ComplaintDetailModal
          complaint={selected}
          onClose={() => setSelected(null)}
          onStatusChange={(s) => { onStatusChange(selected.id, s); setSelected(null); }}
        />
      )}

      {/* Assign modal */}
      {assignModal && (
        <AssignModal
          complaint={assignModal}
          onClose={() => setAssignModal(null)}
          onAssign={(officer, dept, deadline, priority) => {
            onAssign(assignModal.id, officer, dept, deadline, priority);
            setAssignModal(null);
          }}
        />
      )}
    </div>
  );
}

// ================= ASSIGN MODAL =================
interface AssignModalProps {
  complaint: Complaint;
  onClose: () => void;
  onAssign: (officer: string, department: string, deadline: string, priority: string) => void;
}

function AssignModal({ complaint, onClose, onAssign }: AssignModalProps) {
  const [officer, setOfficer] = useState(complaint.assignedOfficer || '');
  const [department, setDepartment] = useState(complaint.department);
  const [deadline, setDeadline] = useState('');
  const [priority, setPriority] = useState(complaint.priority);

  const availableOfficers = OFFICERS.filter((o) => o.department === department);

  const handleSubmit = () => {
    if (!officer) return;
    const dl = deadline || new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0];
    onAssign(officer, department, dl, priority);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-gray-800">Assign Task</h3>
            <p className="text-xs text-gray-400">{complaint.id} · {complaint.title}</p>
          </div>
          <button onClick={onClose} className="text-gray-300 hover:text-gray-500"><X size={20} /></button>
        </div>

        {/* AI recommendation */}
        <div className="rounded-lg bg-teal-50 border border-teal-100 p-3 mb-4 flex items-start gap-2">
          <Brain size={14} className="text-teal-600 mt-0.5 flex-shrink-0" />
          <div className="text-xs">
            <p className="font-semibold text-teal-800">AI Recommendation</p>
            <p className="text-teal-600 mt-0.5">Dept: {complaint.department} · Priority: {complaint.priority}</p>
            <p className="text-teal-600">{complaint.aiSuggestedAction}</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Department</label>
            <select value={department} onChange={(e) => { setDepartment(e.target.value as Department); setOfficer(''); }} className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 focus:outline-none focus:border-teal-400 bg-white">
              {DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Officer</label>
            <select value={officer} onChange={(e) => setOfficer(e.target.value)} className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 focus:outline-none focus:border-teal-400 bg-white">
              <option value="">Select officer</option>
              {availableOfficers.map((o) => (
                <option key={o.id} value={o.name}>{o.name} ({o.activeTasks} active)</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Priority</label>
              <select value={priority} onChange={(e) => setPriority(e.target.value as Priority)} className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 focus:outline-none focus:border-teal-400 bg-white">
                {['Critical', 'High', 'Medium', 'Low'].map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Deadline</label>
              <input type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 focus:outline-none focus:border-teal-400" />
            </div>
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button onClick={onClose} className="flex-1 rounded-lg bg-gray-100 px-4 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-200 transition-colors">Cancel</button>
          <button onClick={handleSubmit} disabled={!officer} className="flex-1 rounded-lg bg-gradient-to-r from-teal-400 to-teal-600 px-4 py-2.5 text-sm font-bold text-white hover:shadow-lg transition-all disabled:opacity-40">Assign & Start</button>
        </div>
      </div>
    </div>
  );
}

// ================= DETAIL MODAL =================
interface ComplaintDetailModalProps {
  complaint: Complaint;
  onClose: () => void;
  onStatusChange: (status: ComplaintStatus) => void;
}

function ComplaintDetailModal({ complaint, onClose, onStatusChange }: ComplaintDetailModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl p-6 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <CategoryIcon category={complaint.category} />
            <span className="text-xs font-bold text-gray-400">{complaint.id}</span>
          </div>
          <button onClick={onClose} className="text-gray-300 hover:text-gray-500"><X size={20} /></button>
        </div>

        <h3 className="text-lg font-bold text-gray-800 mb-1">{complaint.title}</h3>
        <p className="text-sm text-gray-500 flex items-center gap-1 mb-3"><MapPin size={14} /> {complaint.location}</p>
        <p className="text-sm text-gray-600 mb-4">{complaint.description}</p>

        <div className="flex items-center gap-2 mb-4">
          <StatusBadge status={complaint.status} />
          <PriorityBadge priority={complaint.priority} />
          <span className="text-xs text-gray-400">· {complaint.department}</span>
        </div>

        {/* AI */}
        <div className="rounded-lg bg-teal-50 border border-teal-100 p-3 mb-4">
          <div className="flex items-center gap-2 mb-2">
            <Brain size={14} className="text-teal-600" />
            <span className="text-xs font-bold text-teal-800 uppercase tracking-wider">AI Insights</span>
          </div>
          <div className="space-y-1 text-xs text-gray-600">
            <p><span className="font-semibold">Category:</span> {complaint.category} ({Math.round(complaint.aiCategoryConfidence * 100)}%)</p>
            <p><span className="font-semibold">Priority reason:</span> {complaint.aiPriorityReason}</p>
            <p><span className="font-semibold">Action:</span> {complaint.aiSuggestedAction}</p>
          </div>
        </div>

        {/* Assignment */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="rounded-lg bg-gray-50 p-3">
            <p className="text-[10px] font-bold text-gray-400 uppercase mb-0.5">Officer</p>
            <p className="text-sm font-semibold text-gray-800">{complaint.assignedOfficer || 'Unassigned'}</p>
          </div>
          <div className="rounded-lg bg-gray-50 p-3">
            <p className="text-[10px] font-bold text-gray-400 uppercase mb-0.5">Deadline</p>
            <p className="text-sm font-semibold text-gray-800">{complaint.deadline ? new Date(complaint.deadline).toLocaleDateString('en', { dateStyle: 'medium' }) : 'Not set'}</p>
          </div>
        </div>

        {/* Timeline */}
        <div className="mb-4">
          <h4 className="text-sm font-bold text-gray-700 mb-3">Updates Timeline</h4>
          <div className="space-y-0">
            {complaint.updates.map((u, i) => (
              <div key={u.id} className="flex gap-3">
                <div className="flex flex-col items-center">
                  <div className={`h-2.5 w-2.5 rounded-full ${i === 0 ? 'bg-gray-300' : 'bg-teal-500'}`} />
                  {i < complaint.updates.length - 1 && <div className="w-0.5 flex-1 bg-gray-200 my-1" style={{ minHeight: 20 }} />}
                </div>
                <div className="pb-3 flex-1">
                  <div className="flex items-center gap-2">
                    <StatusBadge status={u.status} />
                    <span className="text-[10px] text-gray-400">{new Date(u.timestamp).toLocaleDateString('en', { dateStyle: 'medium' })}</span>
                  </div>
                  <p className="text-xs text-gray-600 mt-0.5">{u.message}</p>
                  <p className="text-[10px] text-gray-400">— {u.by}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Status change actions */}
        {complaint.status !== 'Resolved' && (
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Change Status</p>
            <div className="flex flex-wrap gap-2">
              {(['In Progress', 'Resolved'] as ComplaintStatus[]).map((s) => (
                <button
                  key={s}
                  onClick={() => onStatusChange(s)}
                  disabled={complaint.status === s}
                  className="rounded-lg bg-teal-500 px-3 py-1.5 text-xs font-bold text-white hover:bg-teal-600 transition-colors disabled:opacity-30"
                >
                  Mark as {s}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ================= DEPARTMENTS VIEW =================
interface DepartmentsViewProps {
  complaints: Complaint[];
}

export function DepartmentsView({ complaints }: DepartmentsViewProps) {
  const [selectedDept, setSelectedDept] = useState<Department | null>(null);

  if (selectedDept) {
    const deptComplaints = complaints.filter((c) => c.department === selectedDept);
    const officers = OFFICERS.filter((o) => o.department === selectedDept);
    return (
      <div>
        <button onClick={() => setSelectedDept(null)} className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-4 font-medium">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" /></svg>
          Back to departments
        </button>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 space-y-4">
            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
              <h3 className="text-sm font-bold text-gray-700 mb-3">Officers in {selectedDept}</h3>
              <div className="space-y-2">
                {officers.map((o) => (
                  <div key={o.id} className="flex items-center gap-3 rounded-lg bg-gray-50 p-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold text-white" style={{ backgroundColor: o.avatarColor }}>
                      {o.name.charAt(0)}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-gray-800">{o.name}</p>
                      <p className="text-xs text-gray-400">{o.activeTasks} active task(s)</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="lg:col-span-2 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <h3 className="text-sm font-bold text-gray-700 mb-3">Complaints in {selectedDept}</h3>
            <div className="space-y-2">
              {deptComplaints.map((c) => (
                <div key={c.id} className="flex items-center gap-3 rounded-lg border border-gray-100 p-3 hover:bg-gray-50/50 transition-colors">
                  <CategoryIcon category={c.category} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-800 truncate">{c.title}</p>
                    <p className="text-xs text-gray-400">{c.id} · {c.location}</p>
                  </div>
                  <StatusBadge status={c.status} />
                  <PriorityBadge priority={c.priority} />
                </div>
              ))}
              {deptComplaints.length === 0 && <p className="text-sm text-gray-400 text-center py-4">No complaints in this department.</p>}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {DEPARTMENTS.map((d) => {
        const dept = complaints.filter((c) => c.department === d);
        const pending = dept.filter((c) => c.status === 'Pending').length;
        const inProg = dept.filter((c) => c.status === 'In Progress').length;
        const resolved = dept.filter((c) => c.status === 'Resolved').length;
        const overdue = dept.filter((c) => c.status === 'Overdue').length;
        const officers = OFFICERS.filter((o) => o.department === d);
        return (
          <button
            key={d}
            onClick={() => setSelectedDept(d)}
            className="text-left rounded-2xl border border-gray-200 bg-white p-5 shadow-sm hover:shadow-md hover:border-teal-300 transition-all group"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-gray-800 group-hover:text-teal-700 transition-colors">{d}</h3>
              <span className="text-xs font-bold text-gray-400">{dept.length} total</span>
            </div>
            <div className="grid grid-cols-4 gap-2 mb-4">
              <div className="text-center rounded-lg bg-amber-50 py-2"><p className="text-lg font-bold text-amber-600">{pending}</p><p className="text-[9px] text-gray-400 uppercase">Pending</p></div>
              <div className="text-center rounded-lg bg-blue-50 py-2"><p className="text-lg font-bold text-blue-600">{inProg}</p><p className="text-[9px] text-gray-400 uppercase">Active</p></div>
              <div className="text-center rounded-lg bg-emerald-50 py-2"><p className="text-lg font-bold text-emerald-600">{resolved}</p><p className="text-[9px] text-gray-400 uppercase">Done</p></div>
              <div className="text-center rounded-lg bg-red-50 py-2"><p className="text-lg font-bold text-red-600">{overdue}</p><p className="text-[9px] text-gray-400 uppercase">Overdue</p></div>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-400">{officers.length} officer(s)</span>
              <span className="font-semibold text-teal-600 group-hover:teal-700 flex items-center gap-1">View details <ArrowRight size={12} /></span>
            </div>
          </button>
        );
      })}
    </div>
  );
}

// ================= MAP VIEW PAGE =================
export function OfficerMapPage({ complaints }: { complaints: Complaint[] }) {
  return (
    <div>
      <div className="mb-4">
        <h2 className="text-lg font-bold text-gray-800">Interactive Complaint Map</h2>
        <p className="text-sm text-gray-500">Click any pin to view complaint details. Pulsing pins indicate critical or overdue issues.</p>
      </div>
      <MapView complaints={complaints} />
    </div>
  );
}

// ================= ESCALATION ALERTS =================
export function EscalationAlerts({ complaints }: { complaints: Complaint[] }) {
  const overdue = complaints.filter((c) => c.status === 'Overdue');
  const criticalPending = complaints.filter((c) => c.priority === 'Critical' && c.status === 'Pending');
  const criticalInProgress = complaints.filter((c) => c.priority === 'Critical' && c.status === 'In Progress');
  const highPending = complaints.filter((c) => c.priority === 'High' && c.status === 'Pending');

  const alerts = [
    { title: 'Overdue Complaints', items: overdue, severity: 'critical', icon: AlertTriangle },
    { title: 'Critical & Pending', items: criticalPending, severity: 'critical', icon: AlertTriangle },
    { title: 'Critical & In Progress', items: criticalInProgress, severity: 'high', icon: Clock },
    { title: 'High Priority & Pending', items: highPending, severity: 'medium', icon: Clock },
  ];

  const severityColors = {
    critical: 'border-red-200 bg-red-50',
    high: 'border-orange-200 bg-orange-50',
    medium: 'border-amber-200 bg-amber-50',
  };

  const severityText = {
    critical: 'text-red-700',
    high: 'text-orange-700',
    medium: 'text-amber-700',
  };

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-100">
          <AlertTriangle size={20} className="text-red-600" />
        </div>
        <div>
          <h2 className="text-base font-bold text-gray-800">Escalation Alerts</h2>
          <p className="text-sm text-gray-500">Overdue and critical complaints need immediate attention.</p>
        </div>
      </div>

      {alerts.map((alert) => (
        <div key={alert.title} className={`rounded-2xl border p-5 ${severityColors[alert.severity as keyof typeof severityColors]}`}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              {(() => {
                const Icon = alert.icon;
                return <Icon size={18} className={severityText[alert.severity as keyof typeof severityText]} />;
              })()}
              <h3 className={`text-sm font-bold ${severityText[alert.severity as keyof typeof severityText]}`}>{alert.title}</h3>
            </div>
            <span className="rounded-lg bg-white px-2.5 py-0.5 text-xs font-bold text-gray-600">{alert.items.length}</span>
          </div>
          {alert.items.length === 0 ? (
            <p className="text-sm text-gray-400 italic">No alerts in this category.</p>
          ) : (
            <div className="space-y-2">
              {alert.items.map((c) => (
                <div key={c.id} className="flex items-center gap-3 rounded-lg bg-white p-3 border border-gray-100">
                  <CategoryIcon category={c.category} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-800 truncate">{c.title}</p>
                    <p className="text-xs text-gray-400 flex items-center gap-1">
                      <MapPin size={10} /> {c.location} · {c.department}
                      {c.assignedOfficer && ` · ${c.assignedOfficer}`}
                      {c.deadline && ` · Due: ${new Date(c.deadline).toLocaleDateString('en', { day: 'numeric', month: 'short' })}`}
                    </p>
                  </div>
                  <StatusBadge status={c.status} />
                  <PriorityBadge priority={c.priority} />
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
