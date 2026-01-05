import { Flame, Plus } from 'lucide-react';
import { formatRelativeTime } from '../../utils/dateFormatter';
import styles from './QuickStatsBar.module.css';

interface QuickStatsBarProps {
  totalItems: number;
  completionRate: number;
  averageAccuracy: number;
  lastPracticed?: string;
  onPracticeAll: () => void;
  onAddOpenings: () => void;
}

export default function QuickStatsBar({
  totalItems,
  completionRate,
  averageAccuracy,
  lastPracticed,
  onPracticeAll,
  onAddOpenings,
}: QuickStatsBarProps) {
  return (
    <div className={styles.bar}>
      <div className={styles.stats}>
        <div className={styles.statItem}>
          <span className={styles.statValue}>{totalItems}</span>
          <span className={styles.statLabel}>{totalItems === 1 ? 'opening' : 'openings'}</span>
        </div>
        <span className={styles.separator}>•</span>
        <div className={styles.statItem}>
          <span className={styles.statValue}>{completionRate}%</span>
          <span className={styles.statLabel}>complete</span>
        </div>
        <span className={styles.separator}>•</span>
        <div className={styles.statItem}>
          <span className={styles.statValue}>{averageAccuracy}%</span>
          <span className={styles.statLabel}>avg accuracy</span>
        </div>
        {lastPracticed && (
          <>
            <span className={styles.separator}>•</span>
            <div className={styles.statItem}>
              <span className={styles.statLabel}>Last practiced:</span>
              <span className={styles.statValue}>{formatRelativeTime(lastPracticed)}</span>
            </div>
          </>
        )}
      </div>

      <div className={styles.actions}>
        <button className={styles.practiceAllButton} onClick={onPracticeAll} disabled={totalItems === 0}>
          <Flame size={18} />
          Practice All
        </button>
        <button className={styles.addButton} onClick={onAddOpenings}>
          <Plus size={18} />
          Add Openings
        </button>
      </div>
    </div>
  );
}
