import type { Opening, Variation } from '../../types';
import type { CategorizedOpenings } from '../../utils/categorizeOpenings';
import OpeningCard from './OpeningCard';
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
            {group.openings.map((opening) => (
              <OpeningCard
                key={opening.id}
                opening={opening}
                onSelectVariation={onSelectVariation}
                progress={progress[opening.id]}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
