import { useState } from 'react';
import { Landing } from '@/components/Landing';
import { Sidebar } from '@/components/Sidebar';
import { NewComplaint, MyComplaints, ComplaintDetail, TrackStatus } from '@/components/CitizenPortal';
import { OfficerDashboard, AllComplaints, DepartmentsView, OfficerMapPage, EscalationAlerts } from '@/components/OfficerPortal';
import { useComplaints, loadRole, saveRole, loadUser, saveUser } from '@/lib/store';
import type { Role, Complaint } from '@/lib/types';

function App() {
  const [role, setRole] = useState<Role>(loadRole());
  const [userName, setUserName] = useState<string>(loadUser());
  const [view, setView] = useState('dashboard');
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);

  const { complaints, addComplaint, assignComplaint, changeStatus, resetData } = useComplaints();

  const handleLogin = (r: Role, name: string) => {
    setRole(r);
    setUserName(name);
    saveRole(r);
    saveUser(name);
    setView(r === 'officer' ? 'dashboard' : 'my-complaints');
  };

  const handleLogout = () => {
    setRole(null);
    setUserName('');
    saveRole(null);
    setView('dashboard');
  };

  const handleReset = () => {
    resetData();
    setView(role === 'officer' ? 'dashboard' : 'my-complaints');
  };

  const handleNavigate = (v: string) => {
    setView(v);
    setSelectedComplaint(null);
  };

  if (!role) {
    return <Landing onLogin={handleLogin} />;
  }

  const myComplaints = complaints.filter((c) => c.citizenName === userName);

  const renderView = () => {
    if (role === 'citizen') {
      if (selectedComplaint) {
        return <ComplaintDetail complaint={selectedComplaint} onBack={() => setSelectedComplaint(null)} />;
      }
      switch (view) {
        case 'new-complaint':
          return <NewComplaint citizenName={userName} onAdd={addComplaint} allComplaints={complaints} />;
        case 'track':
          return <TrackStatus complaints={complaints} onSelect={(c) => setSelectedComplaint(c)} />;
        case 'my-complaints':
        default:
          return <MyComplaints complaints={myComplaints} onSelect={(c) => setSelectedComplaint(c)} />;
      }
    }

    if (role === 'officer') {
      switch (view) {
        case 'complaints':
          return <AllComplaints complaints={complaints} onAssign={assignComplaint} onStatusChange={changeStatus} />;
        case 'departments':
          return <DepartmentsView complaints={complaints} />;
        case 'map':
          return <OfficerMapPage complaints={complaints} />;
        case 'escalations':
          return <EscalationAlerts complaints={complaints} />;
        case 'dashboard':
        default:
          return <OfficerDashboard complaints={complaints} onNavigate={handleNavigate} />;
      }
    }

    return null;
  };

  const viewTitles: Record<string, string> = {
    dashboard: 'Dashboard Overview',
    complaints: 'All Complaints',
    departments: 'Department Management',
    map: 'Interactive Map',
    escalations: 'Escalation Alerts',
    'my-complaints': 'My Complaints',
    'new-complaint': 'Submit New Complaint',
    track: 'Track Complaint Status',
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar
        role={role}
        activeView={view}
        onNavigate={handleNavigate}
        onLogout={handleLogout}
        onReset={handleReset}
        userName={userName}
      />

      {/* Mobile top bar */}
      <div className="lg:pl-64">
        <div className="sticky top-0 z-20 flex items-center justify-between border-b border-gray-200 bg-white px-4 py-3 lg:hidden">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-teal-400 to-teal-600">
              <svg viewBox="0 0 24 24" className="h-5 w-5 text-white" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M12 2L2 7v10l10 5 10-5V7L12 2z" strokeLinejoin="round" />
              </svg>
            </div>
            <span className="text-sm font-bold text-gray-800">Civic Pilot AI</span>
          </div>
          <button
            onClick={() => {
              const sidebar = document.querySelector('aside');
              if (sidebar) sidebar.classList.toggle('translate-x-0');
            }}
            className="rounded-lg p-2 text-gray-500 hover:bg-gray-100"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 12h18M3 6h18M3 18h18" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {/* Page header */}
        <div className="border-b border-gray-200 bg-white px-6 py-4 hidden lg:block">
          <h2 className="text-lg font-bold text-gray-800">{viewTitles[view] || 'Dashboard'}</h2>
          <p className="text-xs text-gray-400">
            {role === 'officer'
              ? 'Manage civic complaints, assignments, and monitor performance across departments.'
              : 'Report civic issues and track their resolution in real-time.'}
          </p>
        </div>

        {/* Main content */}
        <main className="p-4 lg:p-6 pt-6">
          {renderView()}
        </main>
      </div>
    </div>
  );
}

export default App;
