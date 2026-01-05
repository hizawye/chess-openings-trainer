import { useState } from 'react';
import { Play, Trash2, MoreVertical, ChevronDown } from 'lucide-react';
import type { RepertoireItem as RepertoireItemType } from '../../types/repertoire';
import type { VariationProgress } from '../../types/progress';
import { getOpeningById } from '../../data/openings';
import { formatRelativeTime } from '../../utils/dateFormatter';
import styles from './RepertoireItem.module.css';

interface RepertoireItemProps {
  item: RepertoireItemType;
  color: 'white' | 'black';
  progress?: VariationProgress;
  groups: Array<{ id: string; name: string; color?: string }>;
  onTrain: () => void;
  onRemove: () => void;
  onMoveToGroup: (groupId: string) => void;
  onEditNotes?: () => void;
}

export default function RepertoireItem({
  item,
  progress,
  groups,
  onTrain,
  onRemove,
  onMoveToGroup,
}: RepertoireItemProps) {
  const [showGroupMenu, setShowGroupMenu] = useState(false);
  const [showNotes, setShowNotes] = useState(false);

  const opening = getOpeningById(item.openingId);
  if (!opening) return null;

  const variation = opening.variations.find((v) => v.id === item.variationId);
  if (!variation) return null;

  const percentage = progress?.bestScore || 0;
  const lastPracticed = progress?.lastAttemptAt;
  const attempts = progress?.attempts || 0;
  const isCompleted = !!progress?.completedAt;

  return (
    <div className={styles.item}>
      <div className={styles.content}>
        <div className={styles.header}>
          <div className={styles.names}>
            <span className={styles.openingName}>{opening.name}</span>
            <span className={styles.separator}>—</span>
            <span className={styles.variationName}>{variation.name}</span>
          </div>
          <div className={styles.badges}>
            {variation.eco && <span className={styles.eco}>{variation.eco}</span>}
            {isCompleted && <span className={styles.completedBadge}>✓</span>}
          </div>
        </div>

        <div className={styles.progressSection}>
          <div className={styles.progressBar}>
            <div
              className={styles.progressFill}
              style={{
                width: `${percentage}%`,
                backgroundColor:
                  percentage >= 80 ? '#4caf50' : percentage >= 40 ? '#ff9800' : '#f44336',
              }}
            />
          </div>
          <div className={styles.stats}>
            <span className={styles.percentage}>{percentage}%</span>
            {lastPracticed && (
              <span className={styles.lastPracticed}>
                Last: {formatRelativeTime(lastPracticed)}
              </span>
            )}
            {attempts > 0 && <span className={styles.attempts}>{attempts}×</span>}
          </div>
        </div>

        <div className={styles.actions}>
          <button className={styles.trainButton} onClick={onTrain}>
            <Play size={16} />
            Train
          </button>

          <div className={styles.groupMenu}>
            <button
              className={styles.moveButton}
              onClick={() => setShowGroupMenu(!showGroupMenu)}
            >
              Move to...
              <ChevronDown size={14} />
            </button>
            {showGroupMenu && (
              <div className={styles.groupDropdown}>
                {groups.map((group) => (
                  <button
                    key={group.id}
                    className={styles.groupOption}
                    onClick={() => {
                      onMoveToGroup(group.id);
                      setShowGroupMenu(false);
                    }}
                  >
                    {group.color && (
                      <span
                        className={styles.groupColorDot}
                        style={{ backgroundColor: group.color }}
                      />
                    )}
                    {group.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          <button className={styles.removeButton} onClick={onRemove} title="Remove from repertoire">
            <Trash2 size={16} />
          </button>

          {item.notes && (
            <button
              className={styles.notesToggle}
              onClick={() => setShowNotes(!showNotes)}
              title="Toggle notes"
            >
              <MoreVertical size={16} />
            </button>
          )}
        </div>
      </div>

      {showNotes && item.notes && (
        <div className={styles.notes}>
          <div className={styles.notesContent}>{item.notes}</div>
        </div>
      )}
    </div>
  );
}
