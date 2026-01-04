import { useState, useMemo } from 'react';
import { ChevronDown, ChevronRight, CheckCircle } from 'lucide-react';
import type { Opening, Variation } from '../../types';
import BoardDiagram from './BoardDiagram';
import { getFenFromMoves } from '../../utils/fenFromMoves';
import styles from './OpeningCard.module.css';

interface OpeningCardProps {
  opening: Opening;
  onSelectVariation: (opening: Opening, variation: Variation) => void;
  progress?: Record<string, boolean>;
}

export default function OpeningCard({
  opening,
  onSelectVariation,
  progress = {},
}: OpeningCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const fen = useMemo(() => {
    return getFenFromMoves(opening.startingMoves);
  }, [opening.startingMoves]);

  const completed = useMemo(() => {
    return Object.values(progress).filter(Boolean).length;
  }, [progress]);

  const total = useMemo(() => {
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
  }, [opening.variations]);

  return (
    <div className={styles.card}>
      <button
        className={styles.cardHeader}
        onClick={() => setIsExpanded(!isExpanded)}
        aria-expanded={isExpanded}
      >
        <div className={styles.boardContainer}>
          <BoardDiagram
            fen={fen}
            size={280}
            orientation={opening.color === 'white' ? 'white' : 'black'}
          />
        </div>
        <div className={styles.metadata}>
          <h3 className={styles.openingName}>{opening.name}</h3>
          <div className={styles.info}>
            <span className={styles.eco}>{opening.eco}</span>
            <span className={styles.separator}>•</span>
            <span className={`${styles.colorBadge} ${styles[opening.color]}`}>
              {opening.color === 'white' ? 'White' : 'Black'}
            </span>
          </div>
          <div className={styles.footer}>
            <div className={styles.progress}>
              {completed}/{total} completed
            </div>
            <div className={styles.expandIcon}>
              {isExpanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
            </div>
          </div>
        </div>
      </button>

      {isExpanded && (
        <div className={styles.expandedContent}>
          <p className={styles.description}>{opening.description}</p>
          <div className={styles.variations}>
            <h4 className={styles.variationsTitle}>Variations</h4>
            <VariationTree
              variations={opening.variations}
              openingId={opening.id}
              onSelect={(variation) => onSelectVariation(opening, variation)}
              isCompleted={(_, variationId) => progress[variationId] ?? false}
            />
          </div>
        </div>
      )}
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
