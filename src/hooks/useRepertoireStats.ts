import { useMemo } from 'react';
import { useRepertoire } from './useRepertoire';
import { useProgress } from './useProgress';

export interface RepertoireStats {
  totalItems: number;
  whiteCount: number;
  blackCount: number;
  completionRate: number;
  averageAccuracy: number;
  lastPracticed?: string;
  itemsByGroup: Record<string, number>;
}

export function useRepertoireStats(color?: 'white' | 'black'): RepertoireStats {
  const { repertoire } = useRepertoire();
  const { progress } = useProgress();

  return useMemo(() => {
    const whiteItems = repertoire.white;
    const blackItems = repertoire.black;
    const items = color ? repertoire[color] : [...whiteItems, ...blackItems];

    let totalCompleted = 0;
    let totalScores = 0;
    let countWithProgress = 0;
    let mostRecentPractice: string | undefined;

    items.forEach((item) => {
      const variationProgress =
        progress.openings[item.openingId]?.variations[item.variationId];

      if (variationProgress) {
        if (variationProgress.completedAt) {
          totalCompleted++;
        }
        totalScores += variationProgress.bestScore;
        countWithProgress++;

        if (
          !mostRecentPractice ||
          new Date(variationProgress.lastAttemptAt) > new Date(mostRecentPractice)
        ) {
          mostRecentPractice = variationProgress.lastAttemptAt;
        }
      }
    });

    const completionRate = items.length > 0 ? (totalCompleted / items.length) * 100 : 0;
    const averageAccuracy = countWithProgress > 0 ? totalScores / countWithProgress : 0;

    // Count items by group
    const itemsByGroup: Record<string, number> = {};
    items.forEach((item) => {
      const groupId = item.customGroup || 'uncategorized';
      itemsByGroup[groupId] = (itemsByGroup[groupId] || 0) + 1;
    });

    return {
      totalItems: items.length,
      whiteCount: whiteItems.length,
      blackCount: blackItems.length,
      completionRate: Math.round(completionRate),
      averageAccuracy: Math.round(averageAccuracy),
      lastPracticed: mostRecentPractice,
      itemsByGroup,
    };
  }, [repertoire, progress, color]);
}
