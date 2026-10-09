import type { Complaint, ComplaintCategory, Priority, Department } from './types';
import { CATEGORY_TO_DEPARTMENT } from './sampleData';

const CATEGORY_KEYWORDS: Record<ComplaintCategory, string[]> = {
  Potholes: ['pothole', 'road', 'crack', 'tarmac', 'speed breaker', 'ditch', 'broken road'],
  Garbage: ['garbage', 'trash', 'waste', 'bin', 'litter', 'rubbish', 'dump', 'foul smell'],
  Streetlight: ['streetlight', 'street light', 'lamp', 'light', 'pole', 'flicker', 'dark'],
  'Water Leakage': ['water', 'leak', 'pipe', 'tap', 'leakage', 'seepage', 'waterlogging', 'supply'],
  Drainage: ['drainage', 'drain', 'sewage', 'overflow', 'waterlog', 'channel', 'gutter'],
};

export function smartCategorize(title: string, description: string): {
  category: ComplaintCategory;
  confidence: number;
} {
  const text = (title + ' ' + description).toLowerCase();
  let best: ComplaintCategory = 'Garbage';
  let bestScore = 0;

  (Object.keys(CATEGORY_KEYWORDS) as ComplaintCategory[]).forEach((cat) => {
    const keywords = CATEGORY_KEYWORDS[cat];
    let score = 0;
    keywords.forEach((kw) => {
      if (text.includes(kw)) score += 1;
    });
    if (score > bestScore) {
      bestScore = score;
      best = cat;
    }
  });

  const confidence = bestScore === 0 ? 0.65 : Math.min(0.99, 0.75 + bestScore * 0.08);
  return { category: best, confidence };
}

export function recommendPriority(
  complaint: Pick<Complaint, 'category' | 'title' | 'description' | 'location'>
): { priority: Priority; reason: string } {
  const text = (complaint.title + ' ' + complaint.description).toLowerCase();
  const majorRoad = /mg road|anna salai|main road|highway|junction|traffic signal/.test(text);
  const health = /health|foul smell|hygiene|school|hospital|disease|overflow/.test(text);
  const safety = /unsafe|danger|accident|night|dark|flicker|deep/.test(text);
  const water = /water leakage|pipe|wastage|waterlogging/.test(text);
  const multiple = /multiple|three|several|consecutive|every/.test(text);

  if (majorRoad && safety) return { priority: 'Critical', reason: 'Major traffic route with safety hazard detected.' };
  if (water && majorRoad) return { priority: 'Critical', reason: 'Water infrastructure issue on major route, risk of road damage.' };
  if (majorRoad) return { priority: 'High', reason: 'Located on major traffic route, risk of disruption.' };
  if (health) return { priority: 'High', reason: 'Public health and hygiene concern identified.' };
  if (safety && multiple) return { priority: 'High', reason: 'Multiple safety hazards reported in one area.' };
  if (safety) return { priority: 'Medium', reason: 'Safety concern, localized area.' };
  if (multiple) return { priority: 'Medium', reason: 'Multiple instances suggest systemic issue.' };
  return { priority: 'Low', reason: 'Localized issue with limited immediate impact.' };
}

export function suggestDepartment(category: ComplaintCategory): Department {
  return CATEGORY_TO_DEPARTMENT[category] || 'Public Works';
}

export function suggestAction(category: ComplaintCategory, priority: Priority): string {
  const actions: Record<ComplaintCategory, Record<Priority, string>> = {
    Potholes: {
      Critical: 'Emergency road repair with traffic diversion plan.',
      High: 'Immediate road patching during low-traffic hours.',
      Medium: 'Schedule road patching within 48 hours.',
      Low: 'Include in next road maintenance cycle.',
    },
    Garbage: {
      Critical: 'Emergency garbage clearance and disinfection.',
      High: 'Immediate garbage collection and increase frequency.',
      Medium: 'Schedule garbage collection and add bins if needed.',
      Low: 'Include in next regular collection round.',
    },
    Streetlight: {
      Critical: 'Emergency streetlight repair and area lighting.',
      High: 'Replace faulty streetlight units and inspect wiring.',
      Medium: 'Schedule streetlight maintenance within 48 hours.',
      Low: 'Replace bulb during next maintenance round.',
    },
    'Water Leakage': {
      Critical: 'Emergency pipe repair and water supply restoration.',
      High: 'Dispatch repair team and isolate leakage point.',
      Medium: 'Schedule pipe inspection and repair.',
      Low: 'Monitor and schedule during next maintenance window.',
    },
    Drainage: {
      Critical: 'Emergency drainage clearance and flood prevention.',
      High: 'Clear drainage channel and install overflow prevention.',
      Medium: 'Schedule channel clearing and debris removal.',
      Low: 'Include in routine drainage maintenance cycle.',
    },
  };
  return actions[category][priority];
}

export function detectDuplicates(
  newComplaint: Pick<Complaint, 'category' | 'locality' | 'title'>,
  existing: Complaint[]
): { isDuplicate: boolean; duplicateOf: string | null; similar: Complaint[] } {
  const similar = existing.filter(
    (c) =>
      c.category === newComplaint.category &&
      c.locality === newComplaint.locality &&
      c.status !== 'Resolved'
  );

  if (similar.length > 0) {
    return {
      isDuplicate: true,
      duplicateOf: similar[0].id,
      similar,
    };
  }

  // Also check title similarity
  const titleWords = newComplaint.title.toLowerCase().split(/\s+/);
  const closeMatch = existing.filter((c) => {
    if (c.category !== newComplaint.category) return false;
    const cWords = c.title.toLowerCase().split(/\s+/);
    const overlap = cWords.filter((w) => titleWords.includes(w) && w.length > 3);
    return overlap.length >= 2 && c.status !== 'Resolved';
  });

  if (closeMatch.length > 0) {
    return { isDuplicate: true, duplicateOf: closeMatch[0].id, similar: closeMatch };
  }

  return { isDuplicate: false, duplicateOf: null, similar: [] };
}

export function clusterByLocality(complaints: Complaint[]): Map<string, Complaint[]> {
  const clusters = new Map<string, Complaint[]>();
  complaints.forEach((c) => {
    const key = c.locality;
    if (!clusters.has(key)) clusters.set(key, []);
    clusters.get(key)!.push(c);
  });
  return clusters;
}

export function getRecurringProblems(complaints: Complaint[]): {
  locality: string;
  category: ComplaintCategory;
  count: number;
}[] {
  const map = new Map<string, number>();
  complaints.forEach((c) => {
    const key = `${c.locality}|${c.category}`;
    map.set(key, (map.get(key) || 0) + 1);
  });
  return Array.from(map.entries())
    .filter(([, count]) => count > 1)
    .map(([key, count]) => {
      const [locality, category] = key.split('|');
      return { locality, category: category as ComplaintCategory, count };
    })
    .sort((a, b) => b.count - a.count);
}

export function calculateTransparencyScore(complaints: Complaint[]): number {
  if (complaints.length === 0) return 0;
  const resolved = complaints.filter((c) => c.status === 'Resolved').length;
  const hasUpdates = complaints.filter((c) => c.updates.length >= 2).length;
  const resolvedRatio = resolved / complaints.length;
  const updateRatio = hasUpdates / complaints.length;
  const score = (resolvedRatio * 0.6 + updateRatio * 0.4) * 100;
  return Math.round(score);
}
