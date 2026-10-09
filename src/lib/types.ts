export type Role = 'citizen' | 'officer' | null;

export type ComplaintCategory =
  | 'Potholes'
  | 'Garbage'
  | 'Streetlight'
  | 'Water Leakage'
  | 'Drainage';

export type ComplaintStatus =
  | 'Pending'
  | 'In Progress'
  | 'Resolved'
  | 'Overdue';

export type Priority = 'Critical' | 'High' | 'Medium' | 'Low';

export type Department =
  | 'Public Works'
  | 'Sanitation'
  | 'Electrical'
  | 'Water Authority'
  | 'Drainage Board';

export interface StatusUpdate {
  id: string;
  status: ComplaintStatus;
  message: string;
  timestamp: string;
  by: string;
}

export interface Complaint {
  id: string;
  title: string;
  description: string;
  category: ComplaintCategory;
  location: string;
  locality: string;
  lat: number;
  lng: number;
  photoUrl: string | null;
  status: ComplaintStatus;
  priority: Priority;
  department: Department;
  assignedOfficer: string | null;
  deadline: string | null;
  createdAt: string;
  citizenId: string;
  citizenName: string;
  updates: StatusUpdate[];
  aiCategoryConfidence: number;
  aiPriorityReason: string;
  aiSuggestedAction: string;
  duplicateOf: string | null;
  clusterId: string | null;
}

export interface Officer {
  id: string;
  name: string;
  department: Department;
  avatarColor: string;
  activeTasks: number;
}

export interface DepartmentStats {
  department: Department;
  total: number;
  pending: number;
  inProgress: number;
  resolved: number;
  overdue: number;
  avgResolutionDays: number;
}
