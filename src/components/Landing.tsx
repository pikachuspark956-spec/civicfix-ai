import { useState } from 'react';
import { Users, Shield, ArrowRight, Sparkles, MapPin, Zap, BarChart3, CheckCircle2 } from 'lucide-react';
import type { Role } from '@/lib/types';

interface LandingProps {
  onLogin: (role: Role, name: string) => void;
}

export function Landing({ onLogin }: LandingProps) {
  const [selectedRole, setSelectedRole] = useState<Role>(null);
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  const handleLogin = () => {
    if (!selectedRole) {
      setError('Please select a role to continue.');
      return;
    }
    if (!name.trim()) {
      setError('Please enter your name.');
      return;
    }
    onLogin(selectedRole, name.trim());
  };

  const demoCitizen = () => {
    onLogin('citizen', 'Rahul Mehta');
  };
  const demoOfficer = () => {
    onLogin('officer', 'Admin Office');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a1e3f] via-[#0d2856] to-[#0a1e3f] text-white">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-5 lg:px-12">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-teal-400 to-teal-600 shadow-lg">
            <svg viewBox="0 0 24 24" className="h-6 w-6 text-white" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M12 2L2 7v10l10 5 10-5V7L12 2z" strokeLinejoin="round" />
              <path d="M12 12L2 7M12 12l10-5M12 12v10" strokeLinejoin="round" />
            </svg>
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight">Civic Pilot AI</h1>
            <p className="text-[10px] text-teal-300 font-medium tracking-wide">Smart Government Complaint & Work Management</p>
          </div>
        </div>
        <button
          onClick={demoOfficer}
          className="hidden sm:flex items-center gap-2 rounded-lg bg-white/10 hover:bg-white/15 px-4 py-2 text-sm font-medium transition-colors backdrop-blur"
        >
          <Sparkles size={14} className="text-teal-300" />
          Quick Demo Login
        </button>
      </header>

      {/* Hero */}
      <div className="mx-auto max-w-6xl px-6 lg:px-12 pt-8 pb-16">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 rounded-full bg-teal-500/15 border border-teal-400/30 px-4 py-1.5 mb-6">
            <Sparkles size={14} className="text-teal-300" />
            <span className="text-xs font-semibold text-teal-200 tracking-wide">AI-Powered Civic Management Platform</span>
          </div>
          <h2 className="text-4xl lg:text-5xl font-bold tracking-tight leading-tight mb-4">
            Smarter Cities Start With<br />
            <span className="bg-gradient-to-r from-teal-300 to-teal-500 bg-clip-text text-transparent">Better Complaint Management</span>
          </h2>
          <p className="text-base text-white/60 leading-relaxed max-w-2xl mx-auto">
            Citizens report issues in seconds. AI auto-categorizes and prioritizes. Officers manage tasks efficiently.
            Complete transparency from complaint to resolution.
          </p>
        </div>

        {/* Feature highlights */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
          {[
            { icon: Zap, title: 'Smart Categorization', desc: 'AI classifies complaints automatically' },
            { icon: BarChart3, title: 'Live Dashboards', desc: 'Track workload & performance' },
            { icon: MapPin, title: 'Interactive Map', desc: 'See complaint locations visually' },
            { icon: CheckCircle2, title: 'Transparency Score', desc: 'Public accountability metrics' },
          ].map((f) => {
            const Icon = f.icon;
            return (
              <div key={f.title} className="rounded-xl bg-white/5 border border-white/10 p-4 backdrop-blur hover:bg-white/8 transition-colors">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-teal-500/20 mb-3">
                  <Icon size={18} className="text-teal-300" />
                </div>
                <h3 className="text-sm font-bold mb-1">{f.title}</h3>
                <p className="text-xs text-white/50 leading-relaxed">{f.desc}</p>
              </div>
            );
          })}
        </div>

        {/* Role selection */}
        <div className="max-w-2xl mx-auto">
          <h3 className="text-center text-sm font-semibold text-white/70 uppercase tracking-wider mb-5">Choose Your Role to Continue</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            <button
              onClick={() => { setSelectedRole('citizen'); setError(''); }}
              className={`group rounded-2xl border-2 p-6 text-left transition-all ${
                selectedRole === 'citizen'
                  ? 'border-teal-400 bg-teal-500/10 scale-[1.02]'
                  : 'border-white/10 bg-white/5 hover:border-white/20'
              }`}
            >
              <div className="flex items-center gap-3 mb-3">
                <div className={`flex h-12 w-12 items-center justify-center rounded-xl transition-colors ${
                  selectedRole === 'citizen' ? 'bg-teal-400 text-[#0a1e3f]' : 'bg-white/10 text-white'
                }`}>
                  <Users size={22} />
                </div>
                <div>
                  <h4 className="text-base font-bold">Citizen Portal</h4>
                  <p className="text-xs text-white/50">Report and track civic issues</p>
                </div>
              </div>
              <ul className="space-y-1.5 text-xs text-white/60">
                <li className="flex items-center gap-2"><CheckCircle2 size={12} className="text-teal-400" /> Submit complaints with photo</li>
                <li className="flex items-center gap-2"><CheckCircle2 size={12} className="text-teal-400" /> Track status in real-time</li>
                <li className="flex items-center gap-2"><CheckCircle2 size={12} className="text-teal-400" /> View department responses</li>
              </ul>
            </button>

            <button
              onClick={() => { setSelectedRole('officer'); setError(''); }}
              className={`group rounded-2xl border-2 p-6 text-left transition-all ${
                selectedRole === 'officer'
                  ? 'border-teal-400 bg-teal-500/10 scale-[1.02]'
                  : 'border-white/10 bg-white/5 hover:border-white/20'
              }`}
            >
              <div className="flex items-center gap-3 mb-3">
                <div className={`flex h-12 w-12 items-center justify-center rounded-xl transition-colors ${
                  selectedRole === 'officer' ? 'bg-teal-400 text-[#0a1e3f]' : 'bg-white/10 text-white'
                }`}>
                  <Shield size={22} />
                </div>
                <div>
                  <h4 className="text-base font-bold">Govt. Officer Portal</h4>
                  <p className="text-xs text-white/50">Manage and resolve complaints</p>
                </div>
              </div>
              <ul className="space-y-1.5 text-xs text-white/60">
                <li className="flex items-center gap-2"><CheckCircle2 size={12} className="text-teal-400" /> Full dashboard & analytics</li>
                <li className="flex items-center gap-2"><CheckCircle2 size={12} className="text-teal-400" /> Assign tasks to officers</li>
                <li className="flex items-center gap-2"><CheckCircle2 size={12} className="text-teal-400" /> Monitor escalations</li>
              </ul>
            </button>
          </div>

          {/* Name input + login */}
          <div className="rounded-2xl bg-white/5 border border-white/10 p-5 backdrop-blur">
            <label className="block text-xs font-semibold text-white/70 uppercase tracking-wider mb-2">
              {selectedRole === 'officer' ? 'Officer Name' : 'Your Name'}
            </label>
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                value={name}
                onChange={(e) => { setName(e.target.value); setError(''); }}
                onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                placeholder={selectedRole === 'officer' ? 'e.g., Admin Office' : 'e.g., Rahul Mehta'}
                className="flex-1 rounded-lg bg-white/10 border border-white/15 px-4 py-2.5 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-teal-400 focus:ring-1 focus:ring-teal-400 transition-colors"
              />
              <button
                onClick={handleLogin}
                disabled={!selectedRole}
                className="flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-teal-400 to-teal-600 px-6 py-2.5 text-sm font-bold text-white shadow-lg hover:shadow-teal-500/30 transition-all disabled:opacity-40 disabled:cursor-not-allowed hover:scale-[1.02] disabled:hover:scale-100"
              >
                Enter Portal
                <ArrowRight size={16} />
              </button>
            </div>
            {error && <p className="mt-2 text-xs text-red-300">{error}</p>}
            <div className="mt-3 flex items-center gap-4 text-xs">
              <button onClick={demoCitizen} className="text-teal-300 hover:text-teal-200 font-medium underline-offset-2 hover:underline">
                Demo as Citizen (Rahul Mehta)
              </button>
              <button onClick={demoOfficer} className="text-teal-300 hover:text-teal-200 font-medium underline-offset-2 hover:underline">
                Demo as Officer (Admin)
              </button>
            </div>
          </div>

          <p className="text-center text-[10px] text-white/30 mt-6">
            Prototype demo with simulated AI. No real government integration or live tracking.
          </p>
        </div>
      </div>
    </div>
  );
}
