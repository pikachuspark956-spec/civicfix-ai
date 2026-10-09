import { useEffect, useState, useCallback } from 'react';
import type { Complaint, StatusUpdate, Role } from './types';
import { SAMPLE_COMPLAINTS } from './sampleData';

const STORAGE_KEY = 'civic-pilot-complaints';
const ROLE_KEY = 'civic-pilot-role';
const USER_KEY = 'civic-pilot-user';

function loadComplaints(): Complaint[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {
    // ignore
  }
  return SAMPLE_COMPLAINTS;
}

function saveComplaints(data: Complaint[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // ignore
  }
}

export function loadRole(): Role {
  try {
    return (localStorage.getItem(ROLE_KEY) as Role) || null;
  } catch {
    return null;
  }
}

export function saveRole(role: Role) {
  try {
    if (role) localStorage.setItem(ROLE_KEY, role);
    else localStorage.removeItem(ROLE_KEY);
  } catch {
    // ignore
  }
}

export function loadUser(): string {
  try {
    return localStorage.getItem(USER_KEY) || '';
  } catch {
    return '';
  }
}

export function saveUser(user: string) {
  try {
    localStorage.setItem(USER_KEY, user);
  } catch {
    // ignore
  }
}

let listeners: (() => void)[] = [];
let currentComplaints: Complaint[] = loadComplaints();

function notify() {
  saveComplaints(currentComplaints);
  listeners.forEach((l) => l());
}

export function useComplaints() {
  const [, setTick] = useState(0);

  useEffect(() => {
    const listener = () => setTick((t) => t + 1);
    listeners.push(listener);
    return () => {
      listeners = listeners.filter((l) => l !== listener);
    };
  }, []);

  const addComplaint = useCallback((complaint: Complaint) => {
    currentComplaints = [complaint, ...currentComplaints];
    notify();
  }, []);

  const updateComplaint = useCallback((id: string, updates: Partial<Complaint>) => {
    currentComplaints = currentComplaints.map((c) =>
      c.id === id ? { ...c, ...updates } : c
    );
    notify();
  }, []);

  const assignComplaint = useCallback(
    (id: string, officer: string, department: string, deadline: string, priority: string) => {
      currentComplaints = currentComplaints.map((c) => {
        if (c.id !== id) return c;
        const newUpdate: StatusUpdate = {
          id: `u${Date.now()}`,
          status: 'In Progress',
          message: `Assigned to ${officer} (${department}). Deadline set.`,
          timestamp: new Date().toISOString(),
          by: 'Admin Office',
        };
        return {
          ...c,
          assignedOfficer: officer,
          department: department as Complaint['department'],
          deadline,
          priority: priority as Complaint['priority'],
          status: 'In Progress',
          updates: [...c.updates, newUpdate],
        };
      });
      notify();
    },
    []
  );

  const changeStatus = useCallback((id: string, status: Complaint['status'], message?: string) => {
    currentComplaints = currentComplaints.map((c) => {
      if (c.id !== id) return c;
      const newUpdate: StatusUpdate = {
        id: `u${Date.now()}`,
        status,
        message: message || `Status updated to ${status}.`,
        timestamp: new Date().toISOString(),
        by: c.assignedOfficer || 'Admin Office',
      };
      return { ...c, status, updates: [...c.updates, newUpdate] };
    });
    notify();
  }, []);

  const resetData = useCallback(() => {
    currentComplaints = SAMPLE_COMPLAINTS;
    notify();
  }, []);

  return {
    complaints: currentComplaints,
    addComplaint,
    updateComplaint,
    assignComplaint,
    changeStatus,
    resetData,
  };
}
