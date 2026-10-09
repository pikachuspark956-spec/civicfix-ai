import { Building2, BarChart3, Map, AlertTriangle, Settings, LogOut, RefreshCw, ClipboardList } from 'lucide-react';
import type { Role } from '@/lib/types';

interface SidebarProps {
  role: Role;
  activeView: string;
  onNavigate: (view: string) => void;
  onLogout: () => void;
  onReset: () => void;
  userName: string;
}

const officerItems = [
  { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
  { id: 'complaints', label: 'All Complaints', icon: ClipboardList },
  { id: 'departments', label: 'Departments', icon: Building2 },
  { id: 'map', label: 'Map View', icon: Map },
  { id: 'escalations', label: 'Escalation Alerts', icon: AlertTriangle },
];

const citizenItems = [
  { id: 'my-complaints', label: 'My Complaints', icon: ClipboardList },
  { id: 'new-complaint', label: 'New Complaint', icon: Settings },
  { id: 'track', label: 'Track Status', icon: Map },
];

export function Sidebar({ role, activeView, onNavigate, onLogout, onReset, userName }: SidebarProps) {
  const items = role === 'officer' ? officerItems : citizenItems;

  return (
    <aside className="fixed inset-y-0 left-0 z-30 flex w-64 flex-col bg-[#0a1e3f] text-white transition-transform lg:translate-x-0 -translate-x-full">
      {/* Logo */}
      <div className="flex items-center gap-3 border-b border-white/10 px-6 py-5">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-teal-400 to-teal-600 shadow-lg">
          <svg viewBox="0 0 24 24" className="h-6 w-6 text-white" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M12 2L2 7v10l10 5 10-5V7L12 2z" strokeLinejoin="round" />
            <path d="M12 12L2 7M12 12l10-5M12 12v10" strokeLinejoin="round" />
          </svg>
        </div>
        <div>
          <h1 className="text-sm font-bold tracking-tight leading-tight">Civic Pilot AI</h1>
          <p className="text-[10px] text-teal-300 font-medium tracking-wide">Smart Govt. System</p>
        </div>
      </div>

      {/* User badge */}
      <div className="px-4 py-3 border-b border-white/10">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-teal-500/20 text-teal-300 text-sm font-bold">
            {userName.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold truncate">{userName}</p>
            <p className="text-[10px] text-white/50 uppercase tracking-wider">
              {role === 'officer' ? 'Govt. Officer' : 'Citizen'}
            </p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <ul className="space-y-1">
          {items.map((item) => {
            const Icon = item.icon;
            const active = activeView === item.id;
            return (
              <li key={item.id}>
                <button
                  onClick={() => onNavigate(item.id)}
                  className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${
                    active
                      ? 'bg-teal-500/15 text-teal-300 border-l-2 border-teal-400'
                      : 'text-white/60 hover:bg-white/5 hover:text-white border-l-2 border-transparent'
                  }`}
                >
                  <Icon className="h-4.5 w-4.5 flex-shrink-0" size={18} />
                  {item.label}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer */}
      <div className="border-t border-white/10 px-3 py-3 space-y-1">
        <button
          onClick={onReset}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-white/50 hover:bg-white/5 hover:text-white transition-all"
        >
          <RefreshCw size={16} className="flex-shrink-0" />
          Reset Demo Data
        </button>
        <button
          onClick={onLogout}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-white/50 hover:bg-red-500/10 hover:text-red-300 transition-all"
        >
          <LogOut size={16} className="flex-shrink-0" />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
