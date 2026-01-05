export interface RepertoireItem {
  openingId: string;
  variationId: string;
  addedAt: string;           // ISO date
  customGroup?: string;      // Group ID (priority, learning, mastered, etc.)
  notes?: string;
}

export interface RepertoireGroup {
  id: string;
  name: string;
  color?: string;            // Hex color for visual distinction
  sortOrder: number;
}

export interface Repertoire {
  white: RepertoireItem[];
  black: RepertoireItem[];
  groups: RepertoireGroup[];
}

// Default groups that every user starts with
export const DEFAULT_GROUPS: RepertoireGroup[] = [
  { id: 'priority', name: 'Priority', color: '#f44336', sortOrder: 0 },
  { id: 'learning', name: 'Learning', color: '#ff9800', sortOrder: 1 },
  { id: 'mastered', name: 'Mastered', color: '#4caf50', sortOrder: 2 },
  { id: 'uncategorized', name: 'Uncategorized', color: '#9e9e9e', sortOrder: 3 },
];

export const defaultRepertoire: Repertoire = {
  white: [],
  black: [],
  groups: [...DEFAULT_GROUPS],
};
