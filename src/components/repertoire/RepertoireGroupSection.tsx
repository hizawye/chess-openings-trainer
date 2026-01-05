import { useState } from 'react';
import { ChevronDown, ChevronRight, Flame, MoreVertical } from 'lucide-react';
import type { RepertoireItem, RepertoireGroup } from '../../types/repertoire';
import type { VariationProgress } from '../../types/progress';
import RepertoireItemComponent from './RepertoireItem';
import styles from './RepertoireGroupSection.module.css';

interface RepertoireGroupSectionProps {
  group: RepertoireGroup;
  items: RepertoireItem[];
  color: 'white' | 'black';
  progressMap: Map<string, VariationProgress>; // key: "openingId-variationId"
  groups: RepertoireGroup[];
  onTrainItem: (item: RepertoireItem) => void;
  onRemoveItem: (item: RepertoireItem) => void;
  onMoveItem: (item: RepertoireItem, newGroupId: string) => void;
  onTrainAll?: () => void;
  onEditGroup?: () => void;
  onDeleteGroup?: () => void;
  defaultExpanded?: boolean;
}

export default function RepertoireGroupSection({
  group,
  items,
  color,
  progressMap,
  groups,
  onTrainItem,
  onRemoveItem,
  onMoveItem,
  onTrainAll,
  onEditGroup,
  onDeleteGroup,
  defaultExpanded = false,
}: RepertoireGroupSectionProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const [showMenu, setShowMenu] = useState(false);

  const isDefaultGroup = ['priority', 'learning', 'mastered', 'uncategorized'].includes(group.id);

  return (
    <div className={styles.section}>
      <div className={styles.header}>
        <button
          className={styles.headerButton}
          onClick={() => setIsExpanded(!isExpanded)}
          aria-expanded={isExpanded}
        >
          {isExpanded ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
          {group.color && (
            <span className={styles.colorIndicator} style={{ backgroundColor: group.color }} />
          )}
          <span className={styles.groupName}>{group.name}</span>
          <span className={styles.count}>
            {items.length} {items.length === 1 ? 'item' : 'items'}
          </span>
        </button>

        <div className={styles.headerActions}>
          {items.length > 0 && (
            <button className={styles.trainAllButton} onClick={onTrainAll} title="Train all in this group">
              <Flame size={16} />
              Train All
            </button>
          )}

          {!isDefaultGroup && (
            <div className={styles.menuContainer}>
              <button
                className={styles.menuButton}
                onClick={() => setShowMenu(!showMenu)}
                title="Group settings"
              >
                <MoreVertical size={16} />
              </button>

              {showMenu && (
                <div className={styles.menuDropdown}>
                  <button className={styles.menuItem} onClick={onEditGroup}>
                    Edit Group
                  </button>
                  <button className={`${styles.menuItem} ${styles.danger}`} onClick={onDeleteGroup}>
                    Delete Group
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {isExpanded && (
        <div className={styles.content}>
          {items.length === 0 ? (
            <div className={styles.empty}>
              <p>No openings in this group yet</p>
              <p className={styles.emptyHint}>Use "Move to..." to add items here</p>
            </div>
          ) : (
            <div className={styles.items}>
              {items.map((item) => {
                const key = `${item.openingId}-${item.variationId}`;
                const progress = progressMap.get(key);

                return (
                  <RepertoireItemComponent
                    key={key}
                    item={item}
                    color={color}
                    progress={progress}
                    groups={groups}
                    onTrain={() => onTrainItem(item)}
                    onRemove={() => onRemoveItem(item)}
                    onMoveToGroup={(groupId) => onMoveItem(item, groupId)}
                  />
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
