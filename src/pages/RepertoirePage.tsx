import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRepertoire } from '../hooks/useRepertoire';
import { useProgress } from '../hooks/useProgress';
import { useRepertoireStats } from '../hooks/useRepertoireStats';
import type { RepertoireItem, RepertoireGroup } from '../types/repertoire';
import {
  QuickStatsBar,
  RepertoireGroupSection,
  OpeningSelectionModal,
  GroupManagementModal,
} from '../components/repertoire';
import styles from './RepertoirePage.module.css';

export default function RepertoirePage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'white' | 'black'>('white');
  const [showSelectionModal, setShowSelectionModal] = useState(false);
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [editingGroup, setEditingGroup] = useState<RepertoireGroup | undefined>();

  const {
    repertoire,
    addToRepertoire,
    removeFromRepertoire,
    moveToGroup,
    createGroup,
    updateGroup,
    deleteGroup,
    getItemsByGroup,
  } = useRepertoire();

  const { progress, getVariationProgress } = useProgress();
  const stats = useRepertoireStats(activeTab);

  // Build progress map for quick lookup
  const progressMap = useMemo(() => {
    const map = new Map();
    const items = repertoire[activeTab];

    items.forEach((item) => {
      const key = `${item.openingId}-${item.variationId}`;
      const variationProgress = getVariationProgress(item.openingId, item.variationId);
      if (variationProgress) {
        map.set(key, variationProgress);
      }
    });

    return map;
  }, [repertoire, activeTab, progress, getVariationProgress]);

  // Build existing items set for selection modal
  const existingItemsSet = useMemo(() => {
    const set = new Set<string>();
    repertoire[activeTab].forEach((item) => {
      set.add(`${item.openingId}-${item.variationId}`);
    });
    return set;
  }, [repertoire, activeTab]);

  const handleTrainItem = (item: RepertoireItem) => {
    navigate(`/train/${item.openingId}/${item.variationId}`);
  };

  const handleRemoveItem = (item: RepertoireItem) => {
    if (confirm(`Remove this variation from your repertoire?`)) {
      removeFromRepertoire(activeTab, item.openingId, item.variationId);
    }
  };

  const handleMoveItem = (item: RepertoireItem, newGroupId: string) => {
    moveToGroup(activeTab, item.openingId, item.variationId, newGroupId);
  };

  const handlePracticeAll = () => {
    const items = repertoire[activeTab];
    if (items.length === 0) return;

    // Start with first item
    const firstItem = items[0];
    navigate(`/train/${firstItem.openingId}/${firstItem.variationId}`);
  };

  const handleAddOpenings = (
    items: Array<{ openingId: string; variationId: string }>,
    groupId: string
  ) => {
    items.forEach((item) => {
      addToRepertoire(activeTab, item.openingId, item.variationId, groupId);
    });
  };

  const handleTrainGroup = (groupId: string) => {
    const items = getItemsByGroup(activeTab, groupId);
    if (items.length === 0) return;

    const firstItem = items[0];
    navigate(`/train/${firstItem.openingId}/${firstItem.variationId}`);
  };

  const handleEditGroup = (group: RepertoireGroup) => {
    setEditingGroup(group);
    setShowGroupModal(true);
  };

  const handleDeleteGroup = (groupId: string) => {
    if (confirm('Delete this group? Items will be moved to Uncategorized.')) {
      deleteGroup(groupId);
    }
  };

  // Sort groups by sortOrder
  const sortedGroups = useMemo(() => {
    return [...repertoire.groups].sort((a, b) => a.sortOrder - b.sortOrder);
  }, [repertoire.groups]);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>My Repertoire</h1>
        <p className={styles.subtitle}>
          Build and practice your opening repertoire. Track progress and master your games.
        </p>
      </div>

      <div className={styles.tabs}>
        <button
          className={activeTab === 'white' ? styles.activeTab : styles.tab}
          onClick={() => setActiveTab('white')}
        >
          White Openings
        </button>
        <button
          className={activeTab === 'black' ? styles.activeTab : styles.tab}
          onClick={() => setActiveTab('black')}
        >
          Black Openings
        </button>
      </div>

      <QuickStatsBar
        totalItems={stats.totalItems}
        completionRate={stats.completionRate}
        averageAccuracy={stats.averageAccuracy}
        lastPracticed={stats.lastPracticed}
        onPracticeAll={handlePracticeAll}
        onAddOpenings={() => setShowSelectionModal(true)}
      />

      {stats.totalItems === 0 ? (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>📚</div>
          <h2>Your {activeTab === 'white' ? 'White' : 'Black'} repertoire is empty</h2>
          <p>Add openings to start building your training repertoire</p>
          <button className={styles.emptyButton} onClick={() => setShowSelectionModal(true)}>
            Add Your First Opening
          </button>
        </div>
      ) : (
        <div className={styles.groups}>
          {sortedGroups.map((group) => {
            const items = getItemsByGroup(activeTab, group.id);

            // Only show groups that have items (except priority which is always shown)
            if (items.length === 0 && group.id !== 'priority') return null;

            return (
              <RepertoireGroupSection
                key={group.id}
                group={group}
                items={items}
                color={activeTab}
                progressMap={progressMap}
                groups={sortedGroups}
                onTrainItem={handleTrainItem}
                onRemoveItem={handleRemoveItem}
                onMoveItem={handleMoveItem}
                onTrainAll={() => handleTrainGroup(group.id)}
                onEditGroup={
                  !['priority', 'learning', 'mastered', 'uncategorized'].includes(group.id)
                    ? () => handleEditGroup(group)
                    : undefined
                }
                onDeleteGroup={
                  !['priority', 'learning', 'mastered', 'uncategorized'].includes(group.id)
                    ? () => handleDeleteGroup(group.id)
                    : undefined
                }
                defaultExpanded={group.id === 'priority'}
              />
            );
          })}
        </div>
      )}

      <OpeningSelectionModal
        isOpen={showSelectionModal}
        color={activeTab}
        groups={sortedGroups}
        existingItems={existingItemsSet}
        onClose={() => setShowSelectionModal(false)}
        onAdd={handleAddOpenings}
      />

      <GroupManagementModal
        isOpen={showGroupModal}
        group={editingGroup}
        onClose={() => {
          setShowGroupModal(false);
          setEditingGroup(undefined);
        }}
        onCreate={createGroup}
        onUpdate={updateGroup}
      />
    </div>
  );
}
