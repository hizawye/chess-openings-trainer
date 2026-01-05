import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import type { Repertoire, RepertoireItem, RepertoireGroup } from '../types/repertoire';
import { defaultRepertoire, DEFAULT_GROUPS } from '../types/repertoire';
import { loadFromStorage, saveToStorage, STORAGE_KEYS } from '../utils/localStorage';

interface RepertoireContextType {
  repertoire: Repertoire;
  addToRepertoire: (color: 'white' | 'black', openingId: string, variationId: string, groupId?: string) => void;
  removeFromRepertoire: (color: 'white' | 'black', openingId: string, variationId: string) => void;
  isInRepertoire: (color: 'white' | 'black', openingId: string, variationId: string) => boolean;
  moveToGroup: (color: 'white' | 'black', openingId: string, variationId: string, groupId: string) => void;
  updateNotes: (color: 'white' | 'black', openingId: string, variationId: string, notes: string) => void;
  createGroup: (name: string, color?: string) => void;
  updateGroup: (groupId: string, updates: Partial<RepertoireGroup>) => void;
  deleteGroup: (groupId: string) => void;
  getItemsByGroup: (color: 'white' | 'black', groupId: string) => RepertoireItem[];
  getItemsByColor: (color: 'white' | 'black') => RepertoireItem[];
  getGroupById: (groupId: string) => RepertoireGroup | undefined;
}

const RepertoireContext = createContext<RepertoireContextType | undefined>(undefined);

export function RepertoireProvider({ children }: { children: ReactNode }) {
  const [repertoire, setRepertoire] = useState<Repertoire>(() =>
    loadFromStorage(STORAGE_KEYS.REPERTOIRE, defaultRepertoire)
  );

  // Save to localStorage whenever repertoire changes
  useEffect(() => {
    saveToStorage(STORAGE_KEYS.REPERTOIRE, repertoire);
  }, [repertoire]);

  const addToRepertoire = useCallback(
    (color: 'white' | 'black', openingId: string, variationId: string, groupId?: string) => {
      setRepertoire((prev) => {
        const items = prev[color];

        // Check if already exists
        const exists = items.some(
          (item) => item.openingId === openingId && item.variationId === variationId
        );

        if (exists) return prev;

        const newItem: RepertoireItem = {
          openingId,
          variationId,
          addedAt: new Date().toISOString(),
          customGroup: groupId || 'uncategorized',
        };

        return {
          ...prev,
          [color]: [...items, newItem],
        };
      });
    },
    []
  );

  const removeFromRepertoire = useCallback(
    (color: 'white' | 'black', openingId: string, variationId: string) => {
      setRepertoire((prev) => {
        const items = prev[color];

        return {
          ...prev,
          [color]: items.filter(
            (item) => !(item.openingId === openingId && item.variationId === variationId)
          ),
        };
      });
    },
    []
  );

  const isInRepertoire = useCallback(
    (color: 'white' | 'black', openingId: string, variationId: string): boolean => {
      return repertoire[color].some(
        (item) => item.openingId === openingId && item.variationId === variationId
      );
    },
    [repertoire]
  );

  const moveToGroup = useCallback(
    (color: 'white' | 'black', openingId: string, variationId: string, groupId: string) => {
      setRepertoire((prev) => {
        const items = prev[color];

        return {
          ...prev,
          [color]: items.map((item) =>
            item.openingId === openingId && item.variationId === variationId
              ? { ...item, customGroup: groupId }
              : item
          ),
        };
      });
    },
    []
  );

  const updateNotes = useCallback(
    (color: 'white' | 'black', openingId: string, variationId: string, notes: string) => {
      setRepertoire((prev) => {
        const items = prev[color];

        return {
          ...prev,
          [color]: items.map((item) =>
            item.openingId === openingId && item.variationId === variationId
              ? { ...item, notes }
              : item
          ),
        };
      });
    },
    []
  );

  const createGroup = useCallback((name: string, color?: string) => {
    setRepertoire((prev) => {
      const maxSortOrder = Math.max(...prev.groups.map((g) => g.sortOrder), 0);

      const newGroup: RepertoireGroup = {
        id: name.toLowerCase().replace(/\s+/g, '-'),
        name,
        color,
        sortOrder: maxSortOrder + 1,
      };

      return {
        ...prev,
        groups: [...prev.groups, newGroup],
      };
    });
  }, []);

  const updateGroup = useCallback((groupId: string, updates: Partial<RepertoireGroup>) => {
    setRepertoire((prev) => {
      return {
        ...prev,
        groups: prev.groups.map((group) =>
          group.id === groupId ? { ...group, ...updates } : group
        ),
      };
    });
  }, []);

  const deleteGroup = useCallback((groupId: string) => {
    setRepertoire((prev) => {
      // Move all items to uncategorized
      const moveItemsToUncategorized = (items: RepertoireItem[]) =>
        items.map((item) =>
          item.customGroup === groupId ? { ...item, customGroup: 'uncategorized' } : item
        );

      return {
        ...prev,
        white: moveItemsToUncategorized(prev.white),
        black: moveItemsToUncategorized(prev.black),
        groups: prev.groups.filter((group) => group.id !== groupId),
      };
    });
  }, []);

  const getItemsByGroup = useCallback(
    (color: 'white' | 'black', groupId: string): RepertoireItem[] => {
      return repertoire[color].filter((item) => item.customGroup === groupId);
    },
    [repertoire]
  );

  const getItemsByColor = useCallback(
    (color: 'white' | 'black'): RepertoireItem[] => {
      return repertoire[color];
    },
    [repertoire]
  );

  const getGroupById = useCallback(
    (groupId: string): RepertoireGroup | undefined => {
      return repertoire.groups.find((group) => group.id === groupId);
    },
    [repertoire]
  );

  return (
    <RepertoireContext.Provider
      value={{
        repertoire,
        addToRepertoire,
        removeFromRepertoire,
        isInRepertoire,
        moveToGroup,
        updateNotes,
        createGroup,
        updateGroup,
        deleteGroup,
        getItemsByGroup,
        getItemsByColor,
        getGroupById,
      }}
    >
      {children}
    </RepertoireContext.Provider>
  );
}

export function useRepertoire(): RepertoireContextType {
  const context = useContext(RepertoireContext);
  if (!context) {
    throw new Error('useRepertoire must be used within a RepertoireProvider');
  }
  return context;
}
