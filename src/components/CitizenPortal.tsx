import { useState } from 'react';
import { Camera, MapPin, Sparkles, AlertTriangle, CheckCircle2, Send, Brain } from 'lucide-react';
import type { Complaint, ComplaintCategory, Role } from '@/lib/types';
import { smartCategorize, recommendPriority, suggestDepartment, suggestAction, detectDuplicates } from '@/lib/ai';
import { StatusBadge, PriorityBadge, CategoryIcon } from './Badges';

interface NewComplaintProps {
  citizenName: string;
  onAdd: (complaint: Complaint) => void;
  allComplaints: Complaint[];
}

const CATEGORIES: ComplaintCategory[] = ['Potholes', 'Garbage', 'Streetlight', 'Water Leakage', 'Drainage'];
const LOCALITIES = ['Sector 14', 'Gandhi Nagar', 'Park Street', 'Indira Nagar', 'Anna Salai', 'Lajpat Nagar'];

export function NewComplaint({ citizenName, onAdd, allComplaints }: NewComplaintProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<ComplaintCategory | ''>('');
  const [locality, setLocality] = useState('');
  const [location, setLocation] = useState('');
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [aiPreview, setAiPreview] = useState<{
    category: ComplaintCategory;
    confidence: number;
    priority: string;
    priorityReason: string;
    department: string;
    action: string;
    duplicate: { isDuplicate: boolean; similar: Complaint[] };
  } | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [submittedId, setSubmittedId] = useState('');

  const runAI = () => {
    if (!title.trim()) return;
    const { category: aiCat, confidence } = smartCategorize(title, description);
    const { priority, reason } = recommendPriority({ category: aiCat, title, description, location });
    const dept = suggestDepartment(aiCat);
    const action = suggestAction(aiCat, priority as Complaint['priority']);
    const dup = detectDuplicates(
      { category: aiCat, locality: locality || 'Unknown', title },
      allComplaints
    );
    setCategory(aiCat);
    setAiPreview({
      category: aiCat,
      confidence,
      priority,
      priorityReason: reason,
      department: dept,
      action,
      duplicate: dup,
    });
  };

  const handlePhoto = () => {
    // Simulate photo upload with a placeholder
    const photos: Record<string, string> = {
      Potholes: '🛣️',
      Garbage: '🗑️',
      Streetlight: '💡',
      'Water Leakage': '🚰',
      Drainage: '🌊',
    };
    setPhotoUrl(photos[category || 'Potholes'] || '📋');
  };

  const handleSubmit = () => {
    if (!title.trim() || !description.trim() || !location.trim()) return;

    const { category: aiCat, confidence } = smartCategorize(title, description);
    const { priority, reason } = recommendPriority({ category: aiCat, title, description, location });
    const dept = suggestDepartment(aiCat);
    const action = suggestAction(aiCat, priority as Complaint['priority']);
    const dup = detectDuplicates(
      { category: aiCat, locality: locality || 'Unknown', title },
      allComplaints
    );

    const id = `CIV-2024-${String(allComplaints.length + 1).padStart(3, '0')}`;
    const newComplaint: Complaint = {
      id,
      title: title.trim(),
      description: description.trim(),
      category: aiCat,
      location: location.trim(),
      locality: locality || location.trim(),
      lat: 28.45 + Math.random() * 0.15,
      lng: 77.02 + Math.random() * 0.15,
      photoUrl: photoUrl,
      status: 'Pending',
      priority: priority as Complaint['priority'],
      department: dept,
      assignedOfficer: null,
      deadline: null,
      createdAt: new Date().toISOString(),
      citizenId: 'c1',
      citizenName,
      updates: [
        {
          id: `u${Date.now()}`,
          status: 'Pending',
          message: `Complaint registered. AI categorized as ${aiCat} (${Math.round(confidence * 100)}% confidence). ${dup.isDuplicate ? 'Potential duplicate detected.' : ''}`,
          timestamp: new Date().toISOString(),
          by: 'Civic Pilot AI',
        },
      ],
      aiCategoryConfidence: confidence,
      aiPriorityReason: reason,
      aiSuggestedAction: action,
      duplicateOf: dup.duplicateOf,
      clusterId: null,
    };

    onAdd(newComplaint);
    setSubmitted(true);
    setSubmittedId(id);

    // Reset form
    setTitle('');
    setDescription('');
    setCategory('');
    setLocality('');
    setLocation('');
    setPhotoUrl(null);
    setAiPreview(null);

    setTimeout(() => setSubmitted(false), 5000);
  };

  const canSubmit = title.trim() && description.trim() && location.trim();

  return (
    <div className="max-w-3xl mx-auto">
      {submitted && (
        <div className="mb-6 rounded-xl border border-emerald-200 bg-emerald-50 p-4 flex items-center gap-3 animate-fadeIn">
          <CheckCircle2 className="text-emerald-600 flex-shrink-0" size={24} />
          <div>
            <p className="text-sm font-bold text-emerald-800">Complaint submitted successfully!</p>
            <p className="text-xs text-emerald-600">Your complaint ID is <span className="font-bold">{submittedId}</span>. Track it in My Complaints.</p>
          </div>
        </div>
      )}

      <div className="rounded-2xl border border-gray-200 bg-white p-6 lg:p-8 shadow-sm">
        <h2 className="text-xl font-bold text-gray-800 mb-1">Submit a New Complaint</h2>
        <p className="text-sm text-gray-500 mb-6">Report a civic issue in your area. Our AI will categorize and prioritize it automatically.</p>

        {/* Title */}
        <div className="mb-5">
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Complaint Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={runAI}
            placeholder="e.g., Large pothole near MG Road junction"
            className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm text-gray-800 focus:outline-none focus:border-teal-400 focus:ring-1 focus:ring-teal-400 transition-colors"
          />
        </div>

        {/* Description */}
        <div className="mb-5">
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            onBlur={runAI}
            rows={3}
            placeholder="Describe the issue in detail..."
            className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm text-gray-800 focus:outline-none focus:border-teal-400 focus:ring-1 focus:ring-teal-400 transition-colors resize-none"
          />
        </div>

        {/* Locality + Location */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Locality</label>
            <select
              value={locality}
              onChange={(e) => setLocality(e.target.value)}
              className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm text-gray-800 focus:outline-none focus:border-teal-400 focus:ring-1 focus:ring-teal-400 transition-colors bg-white"
            >
              <option value="">Select area</option>
              {LOCALITIES.map((l) => <option key={l} value={l}>{l}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Specific Location</label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g., MG Road, Sector 14"
              className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm text-gray-800 focus:outline-none focus:border-teal-400 focus:ring-1 focus:ring-teal-400 transition-colors"
            />
          </div>
        </div>

        {/* Photo upload */}
        <div className="mb-6">
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Photo (Optional)</label>
          <button
            onClick={handlePhoto}
            className="flex items-center gap-3 rounded-lg border-2 border-dashed border-gray-200 px-4 py-4 text-sm text-gray-400 hover:border-teal-300 hover:bg-teal-50/30 transition-colors w-full"
          >
            {photoUrl ? (
              <>
                <span className="text-3xl">{photoUrl}</span>
                <div className="text-left">
                  <p className="font-medium text-gray-700">Photo attached (sample)</p>
                  <p className="text-xs text-gray-400">Click to change</p>
                </div>
              </>
            ) : (
              <>
                <Camera size={20} />
                <span>Click to attach a sample photo</span>
              </>
            )}
          </button>
        </div>

        {/* AI Preview */}
        {aiPreview && (
          <div className="mb-6 rounded-xl border border-teal-200 bg-gradient-to-br from-teal-50 to-blue-50/30 p-5">
            <div className="flex items-center gap-2 mb-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-500 text-white">
                <Brain size={16} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-teal-800">AI Analysis Preview</h3>
                <p className="text-[10px] text-teal-600">Simulated AI · Results are demo data</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="rounded-lg bg-white/70 p-3 border border-teal-100">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Category</p>
                <div className="flex items-center gap-2">
                  <CategoryIcon category={aiPreview.category} />
                  <span className="text-sm font-semibold text-gray-800">{aiPreview.category}</span>
                  <span className="text-xs text-teal-600 font-bold">{Math.round(aiPreview.confidence * 100)}%</span>
                </div>
              </div>
              <div className="rounded-lg bg-white/70 p-3 border border-teal-100">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Suggested Priority</p>
                <div className="flex items-center gap-2">
                  <PriorityBadge priority={aiPreview.priority as Complaint['priority']} />
                  <span className="text-xs text-gray-500">{aiPreview.priorityReason}</span>
                </div>
              </div>
              <div className="rounded-lg bg-white/70 p-3 border border-teal-100">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Routed Department</p>
                <p className="text-sm font-semibold text-gray-800">{aiPreview.department}</p>
              </div>
              <div className="rounded-lg bg-white/70 p-3 border border-teal-100">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Recommended Action</p>
                <p className="text-xs text-gray-600">{aiPreview.action}</p>
              </div>
            </div>

            {aiPreview.duplicate.isDuplicate && (
              <div className="mt-3 rounded-lg bg-amber-50 border border-amber-200 p-3 flex items-start gap-2">
                <AlertTriangle size={16} className="text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-bold text-amber-800">Possible Duplicate Detected</p>
                  <p className="text-xs text-amber-600">
                    {aiPreview.duplicate.similar.length} similar complaint(s) found in {locality || 'this area'}.
                    Your complaint will still be filed and linked for cluster analysis.
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={!canSubmit}
          className="flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-[#0a1e3f] to-[#0d2856] px-6 py-3 text-sm font-bold text-white shadow-lg hover:shadow-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed hover:scale-[1.01] disabled:hover:scale-100"
        >
          <Send size={16} />
          Submit Complaint
        </button>
        {!canSubmit && (
          <p className="mt-2 text-xs text-gray-400">Fill in title, description, and location to submit.</p>
        )}
      </div>
    </div>
  );
}

interface MyComplaintsProps {
  complaints: Complaint[];
  onSelect: (c: Complaint) => void;
}

export function MyComplaints({ complaints, onSelect }: MyComplaintsProps) {
  if (complaints.length === 0) {
    return (
      <div className="max-w-3xl mx-auto rounded-2xl border border-gray-200 bg-white p-12 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-50">
          <MapPin size={28} className="text-gray-300" />
        </div>
        <h3 className="text-lg font-bold text-gray-700 mb-1">No Complaints Yet</h3>
        <p className="text-sm text-gray-400">Submit your first complaint to see it here.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-3">
      {complaints.map((c) => (
        <button
          key={c.id}
          onClick={() => onSelect(c)}
          className="w-full text-left rounded-xl border border-gray-200 bg-white p-4 hover:border-teal-300 hover:shadow-md transition-all group"
        >
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-50 text-xl flex-shrink-0">
              <CategoryIcon category={c.category} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-bold text-gray-400">{c.id}</span>
                <StatusBadge status={c.status} />
                <PriorityBadge priority={c.priority} />
              </div>
              <h3 className="text-sm font-bold text-gray-800 group-hover:text-teal-700 transition-colors">{c.title}</h3>
              <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1">
                <MapPin size={11} /> {c.location} · {c.department}
                {c.assignedOfficer && ` · ${c.assignedOfficer}`}
              </p>
            </div>
            <svg className="text-gray-300 group-hover:text-teal-400 transition-colors flex-shrink-0 mt-2" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 18l6-6-6-6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </button>
      ))}
    </div>
  );
}

interface ComplaintDetailProps {
  complaint: Complaint;
  onBack: () => void;
}

export function ComplaintDetail({ complaint, onBack }: ComplaintDetailProps) {
  return (
    <div className="max-w-3xl mx-auto">
      <button onClick={onBack} className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-4 font-medium">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        Back to complaints
      </button>

      <div className="rounded-2xl border border-gray-200 bg-white p-6 lg:p-8 shadow-sm">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-bold text-gray-400">{complaint.id}</span>
              <StatusBadge status={complaint.status} />
              <PriorityBadge priority={complaint.priority} />
            </div>
            <h2 className="text-xl font-bold text-gray-800 mb-1">{complaint.title}</h2>
            <p className="text-sm text-gray-500 flex items-center gap-1">
              <MapPin size={14} /> {complaint.location}
            </p>
          </div>
          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gray-50 text-2xl flex-shrink-0">
            <CategoryIcon category={complaint.category} />
          </div>
        </div>

        {/* Description */}
        <div className="mb-5">
          <p className="text-sm text-gray-600 leading-relaxed">{complaint.description}</p>
        </div>

        {/* Assignment info */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="rounded-lg bg-gray-50 p-3">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Department</p>
            <p className="text-sm font-semibold text-gray-800">{complaint.department}</p>
          </div>
          <div className="rounded-lg bg-gray-50 p-3">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Assigned Officer</p>
            <p className="text-sm font-semibold text-gray-800">{complaint.assignedOfficer || 'Not yet assigned'}</p>
          </div>
        </div>

        {/* AI Section */}
        <div className="rounded-xl border border-teal-200 bg-teal-50/50 p-4 mb-6">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles size={14} className="text-teal-600" />
            <h3 className="text-xs font-bold text-teal-800 uppercase tracking-wider">AI Insights</h3>
          </div>
          <div className="space-y-2 text-xs">
            <div><span className="font-semibold text-gray-600">Categorization:</span> <span className="text-gray-800">{complaint.category} ({Math.round(complaint.aiCategoryConfidence * 100)}% confidence)</span></div>
            <div><span className="font-semibold text-gray-600">Priority reasoning:</span> <span className="text-gray-800">{complaint.aiPriorityReason}</span></div>
            <div><span className="font-semibold text-gray-600">Recommended action:</span> <span className="text-gray-800">{complaint.aiSuggestedAction}</span></div>
            {complaint.duplicateOf && (
              <div><span className="font-semibold text-gray-600">Linked to:</span> <span className="text-amber-600 font-medium">Possible duplicate of {complaint.duplicateOf}</span></div>
            )}
          </div>
        </div>

        {/* Timeline */}
        <div>
          <h3 className="text-sm font-bold text-gray-700 mb-4">Status Updates</h3>
          <div className="space-y-0">
            {complaint.updates.map((u, i) => (
              <div key={u.id} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className={`h-3 w-3 rounded-full ${i === 0 ? 'bg-gray-300' : 'bg-teal-500'} flex-shrink-0`} />
                  {i < complaint.updates.length - 1 && <div className="w-0.5 flex-1 bg-gray-200 my-1" style={{ minHeight: 24 }} />}
                </div>
                <div className="pb-4 flex-1">
                  <div className="flex items-center gap-2 mb-0.5">
                    <StatusBadge status={u.status} />
                    <span className="text-[10px] text-gray-400">{new Date(u.timestamp).toLocaleString('en', { dateStyle: 'medium', timeStyle: 'short' })}</span>
                  </div>
                  <p className="text-sm text-gray-600">{u.message}</p>
                  <p className="text-[10px] text-gray-400 mt-0.5">— {u.by}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

interface TrackStatusProps {
  complaints: Complaint[];
  onSelect: (c: Complaint) => void;
}

export function TrackStatus({ complaints, onSelect }: TrackStatusProps) {
  const [search, setSearch] = useState('');
  const filtered = complaints.filter(
    (c) => c.id.toLowerCase().includes(search.toLowerCase()) || c.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-3xl mx-auto">
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-bold text-gray-800 mb-1">Track Complaint Status</h2>
        <p className="text-sm text-gray-500 mb-4">Search by complaint ID or title to check the latest status.</p>
        <div className="relative mb-4">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" strokeLinecap="round" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Enter complaint ID (e.g., CIV-2024-001) or title..."
            className="w-full rounded-lg border border-gray-200 pl-10 pr-4 py-2.5 text-sm text-gray-800 focus:outline-none focus:border-teal-400 focus:ring-1 focus:ring-teal-400 transition-colors"
          />
        </div>
        <div className="space-y-2">
          {search && filtered.length === 0 && (
            <p className="text-sm text-gray-400 text-center py-4">No complaints found.</p>
          )}
          {filtered.slice(0, 5).map((c) => (
            <button
              key={c.id}
              onClick={() => onSelect(c)}
              className="w-full text-left rounded-lg border border-gray-100 p-3 hover:border-teal-300 hover:bg-teal-50/30 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-gray-400">{c.id}</span>
                  <p className="text-sm font-semibold text-gray-800 mt-0.5">{c.title}</p>
                </div>
                <StatusBadge status={c.status} />
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
