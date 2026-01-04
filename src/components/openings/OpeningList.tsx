import { useState } from 'react';
import { ChevronDown, ChevronRight, BookOpen, CheckCircle } from 'lucide-react';
import type { Opening, Variation } from '../../types';
import type { CategorizedOpenings } from '../../utils/categorizeOpenings';
import styles from './OpeningList.module.css';

interface OpeningListProps {
  categorizedOpenings: CategorizedOpenings[];
  onSelectVariation: (opening: Opening, variation: Variation) => void;
  progress?: Record<string, Record<string, boolean>>;
}

export default function OpeningList({
  categorizedOpenings,
  onSelectVariation,
  progress = {},
}: OpeningListProps) {
  const [expandedOpenings, setExpandedOpenings] = useState<Set<string>>(new Set());

  const toggleOpening = (id: string) => {
    setExpandedOpenings((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const isVariationCompleted = (openingId: string, variationId: string): boolean => {
    return progress[openingId]?.[variationId] ?? false;
  };

  const getCompletedCount = (opening: Opening): number => {
    const openingProgress = progress[opening.id];
    if (!openingProgress) return 0;
    return Object.values(openingProgress).filter(Boolean).length;
  };

  const getTotalVariations = (opening: Opening): number => {
    let count = 0;
    const countVariations = (variations: Variation[]) => {
      for (const v of variations) {
        count++;
        if (v.subVariations) {
          countVariations(v.subVariations);
        }
      }
    };
    countVariations(opening.variations);
    return count;
  };

  return (
    <div className={styles.list}>
      {categorizedOpenings.map((group) => (
        <div key={group.categoryId} className={styles.categoryGroup}>
          <div className={styles.categoryHeader}>
            <h2>{group.categoryName}</h2>
            {group.description && (
              <p className={styles.categoryDesc}>{group.description}</p>
            )}
            <span className={styles.count}>
              {group.openings.length} opening{group.openings.length !== 1 ? 's' : ''}
            </span>
          </div>
          <div className={styles.openingCards}>
            {group.openings.map((opening) => {
              const isExpanded = expandedOpenings.has(opening.id);
              const completed = getCompletedCount(opening);
              const total = getTotalVariations(opening);

              return (
                <div key={opening.id} className={styles.openingItem}>
                  <button
                    className={styles.openingHeader}
                    onClick={() => toggleOpening(opening.id)}
                  >
                    <div className={styles.openingInfo}>
                      {isExpanded ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                      <BookOpen size={20} className={styles.icon} />
                      <div className={styles.openingText}>
                        <span className={styles.openingName}>{opening.name}</span>
                        <span className={styles.openingMeta}>
                          {opening.eco} · {opening.color === 'white' ? 'White' : 'Black'}
                        </span>
                      </div>
                    </div>
                    <div className={styles.progress}>
                      {completed}/{total}
                    </div>
                  </button>

                  {isExpanded && (
                    <div className={styles.variations}>
                      <p className={styles.description}>{opening.description}</p>
                      <VariationTree
                        variations={opening.variations}
                        openingId={opening.id}
                        onSelect={(variation) => onSelectVariation(opening, variation)}
                        isCompleted={isVariationCompleted}
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

interface VariationTreeProps {
  variations: Variation[];
  openingId: string;
  onSelect: (variation: Variation) => void;
  isCompleted: (openingId: string, variationId: string) => boolean;
  depth?: number;
}

function VariationTree({
  variations,
  openingId,
  onSelect,
  isCompleted,
  depth = 0,
}: VariationTreeProps) {
  return (
    <div className={styles.variationList} style={{ marginLeft: depth * 16 }}>
      {variations.map((variation) => (
        <div key={variation.id}>
          <button
            className={styles.variationItem}
            onClick={() => onSelect(variation)}
          >
            <div className={styles.variationInfo}>
              <span className={styles.variationName}>{variation.name}</span>
              {variation.eco && (
                <span className={styles.variationEco}>{variation.eco}</span>
              )}
              {variation.difficulty && (
                <span
                  className={`${styles.difficulty} ${styles[variation.difficulty]}`}
                >
                  {variation.difficulty}
                </span>
              )}
            </div>
            {isCompleted(openingId, variation.id) && (
              <CheckCircle size={18} className={styles.completed} />
            )}
          </button>
          {variation.subVariations && (
            <VariationTree
              variations={variation.subVariations}
              openingId={openingId}
              onSelect={onSelect}
              isCompleted={isCompleted}
              depth={depth + 1}
            />
          )}
        </div>
      ))}
    </div>
  );
}
