import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import type { ProgressState, VariationProgress, OpeningProgress } from '../types/progress';
import { defaultProgress } from '../types/progress';
import { loadFromStorage, saveToStorage, STORAGE_KEYS } from '../utils/localStorage';

interface ProgressContextType {
  progress: ProgressState;
  getVariationProgress: (openingId: string, variationId: string) => VariationProgress | undefined;
  recordAttempt: (openingId: string, variationId: string, score: number) => void;
  markCompleted: (openingId: string, variationId: string) => void;
  getCompletionPercentage: (openingId: string, variationId: string) => number;
  getTotalCompleted: () => number;
}

const ProgressContext = createContext<ProgressContextType | undefined>(undefined);

export function ProgressProvider({ children }: { children: ReactNode }) {
  const [progress, setProgress] = useState<ProgressState>(() =>
    loadFromStorage(STORAGE_KEYS.PROGRESS, defaultProgress)
  );

  // Save to localStorage whenever progress changes
  useEffect(() => {
    saveToStorage(STORAGE_KEYS.PROGRESS, progress);
  }, [progress]);

  const getVariationProgress = useCallback(
    (openingId: string, variationId: string): VariationProgress | undefined => {
      return progress.openings[openingId]?.variations[variationId];
    },
    [progress]
  );

  const recordAttempt = useCallback(
    (openingId: string, variationId: string, score: number) => {
      setProgress((prev) => {
        const openingProgress = prev.openings[openingId] || {
          openingId,
          variations: {},
        };

        const variationProgress = openingProgress.variations[variationId] || {
          variationId,
          attempts: 0,
          bestScore: 0,
          lastAttemptAt: new Date().toISOString(),
        };

        const newVariationProgress: VariationProgress = {
          ...variationProgress,
          attempts: variationProgress.attempts + 1,
          bestScore: Math.max(variationProgress.bestScore, score),
          lastAttemptAt: new Date().toISOString(),
        };

        const newOpeningProgress: OpeningProgress = {
          ...openingProgress,
          variations: {
            ...openingProgress.variations,
            [variationId]: newVariationProgress,
          },
        };

        return {
          ...prev,
          openings: {
            ...prev.openings,
            [openingId]: newOpeningProgress,
          },
          lastPracticed: new Date().toISOString(),
        };
      });
    },
    []
  );

  const markCompleted = useCallback(
    (openingId: string, variationId: string) => {
      setProgress((prev) => {
        const openingProgress = prev.openings[openingId];
        if (!openingProgress) return prev;

        const variationProgress = openingProgress.variations[variationId];
        if (!variationProgress) return prev;

        const wasCompleted = !!variationProgress.completedAt;
        const now = new Date().toISOString();

        const newVariationProgress: VariationProgress = {
          ...variationProgress,
          completedAt: now,
        };

        const newOpeningProgress: OpeningProgress = {
          ...openingProgress,
          variations: {
            ...openingProgress.variations,
            [variationId]: newVariationProgress,
          },
        };

        return {
          ...prev,
          openings: {
            ...prev.openings,
            [openingId]: newOpeningProgress,
          },
          totalCompleted: wasCompleted ? prev.totalCompleted : prev.totalCompleted + 1,
        };
      });
    },
    []
  );

  const getCompletionPercentage = useCallback(
    (openingId: string, variationId: string): number => {
      const variationProgress = getVariationProgress(openingId, variationId);
      return variationProgress?.bestScore || 0;
    },
    [getVariationProgress]
  );

  const getTotalCompleted = useCallback(() => {
    return progress.totalCompleted;
  }, [progress.totalCompleted]);

  return (
    <ProgressContext.Provider
      value={{
        progress,
        getVariationProgress,
        recordAttempt,
        markCompleted,
        getCompletionPercentage,
        getTotalCompleted,
      }}
    >
      {children}
    </ProgressContext.Provider>
  );
}

export function useProgress(): ProgressContextType {
  const context = useContext(ProgressContext);
  if (!context) {
    throw new Error('useProgress must be used within a ProgressProvider');
  }
  return context;
}
