import { useState, useMemo } from 'react';
import { X, Search, ChevronDown, ChevronRight } from 'lucide-react';
import { openings } from '../../data/openings';
import type { Opening, Variation } from '../../types';
import type { RepertoireGroup } from '../../types/repertoire';
import styles from './OpeningSelectionModal.module.css';

interface OpeningSelectionModalProps {
  isOpen: boolean;
  color: 'white' | 'black';
  groups: RepertoireGroup[];
  existingItems: Set<string>; // Set of "openingId-variationId" strings
  onClose: () => void;
  onAdd: (items: Array<{ openingId: string; variationId: string }>, groupId: string) => void;
}

export default function OpeningSelectionModal({
  isOpen,
  color,
  groups,
  existingItems,
  onClose,
  onAdd,
}: OpeningSelectionModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGroupId, setSelectedGroupId] = useState('learning');
  const [selectedVariations, setSelectedVariations] = useState<Set<string>>(new Set());
  const [expandedOpenings, setExpandedOpenings] = useState<Set<string>>(new Set());

  const filteredOpenings = useMemo(() => {
    return openings.filter((opening) => {
      // Filter by color
      if (opening.color !== color) return false;

      // Filter by search query
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          opening.name.toLowerCase().includes(query) ||
          opening.eco.toLowerCase().includes(query) ||
          opening.tags?.some((tag) => tag.toLowerCase().includes(query))
        );
      }

      return true;
    });
  }, [color, searchQuery]);

  const toggleOpeningExpansion = (openingId: string) => {
    setExpandedOpenings((prev) => {
      const next = new Set(prev);
      if (next.has(openingId)) {
        next.delete(openingId);
      } else {
        next.add(openingId);
      }
      return next;
    });
  };

  const toggleVariation = (openingId: string, variationId: string) => {
    const key = `${openingId}-${variationId}`;

    // Don't allow selecting already existing items
    if (existingItems.has(key)) return;

    setSelectedVariations((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

  const handleAdd = () => {
    const items = Array.from(selectedVariations).map((key) => {
      const [openingId, variationId] = key.split('-');
      return { openingId, variationId };
    });

    onAdd(items, selectedGroupId);
    setSelectedVariations(new Set());
    setSearchQuery('');
    setExpandedOpenings(new Set());
    onClose();
  };

  const renderVariation = (opening: Opening, variation: Variation, depth = 0) => {
    const key = `${opening.id}-${variation.id}`;
    const isSelected = selectedVariations.has(key);
    const isExisting = existingItems.has(key);

    return (
      <div key={variation.id} style={{ marginLeft: depth * 16 }}>
        <label className={`${styles.variationLabel} ${isExisting ? styles.existing : ''}`}>
          <input
            type="checkbox"
            checked={isSelected}
            onChange={() => toggleVariation(opening.id, variation.id)}
            disabled={isExisting}
          />
          <span className={styles.variationName}>{variation.name}</span>
          {variation.eco && <span className={styles.eco}>{variation.eco}</span>}
          {isExisting && <span className={styles.existingBadge}>Already in repertoire</span>}
        </label>

        {variation.subVariations?.map((subVar) => renderVariation(opening, subVar, depth + 1))}
      </div>
    );
  };

  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2>Add to {color === 'white' ? 'White' : 'Black'} Repertoire</h2>
          <button className={styles.closeButton} onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <div className={styles.searchBox}>
          <Search size={20} className={styles.searchIcon} />
          <input
            type="text"
            placeholder="Search openings..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={styles.searchInput}
          />
        </div>

        <div className={styles.content}>
          {filteredOpenings.length === 0 ? (
            <div className={styles.empty}>
              <p>No openings found</p>
            </div>
          ) : (
            filteredOpenings.map((opening) => {
              const isExpanded = expandedOpenings.has(opening.id);

              return (
                <div key={opening.id} className={styles.openingGroup}>
                  <button
                    className={styles.openingHeader}
                    onClick={() => toggleOpeningExpansion(opening.id)}
                  >
                    {isExpanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                    <span className={styles.openingName}>{opening.name}</span>
                    <span className={styles.eco}>{opening.eco}</span>
                  </button>

                  {isExpanded && (
                    <div className={styles.variations}>
                      {opening.variations.map((variation) => renderVariation(opening, variation))}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        <div className={styles.footer}>
          <div className={styles.groupSelector}>
            <label htmlFor="group-select">Add to:</label>
            <select
              id="group-select"
              value={selectedGroupId}
              onChange={(e) => setSelectedGroupId(e.target.value)}
              className={styles.groupSelect}
            >
              {groups.map((group) => (
                <option key={group.id} value={group.id}>
                  {group.name}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.footerActions}>
            <button className={styles.cancelButton} onClick={onClose}>
              Cancel
            </button>
            <button
              className={styles.addButton}
              onClick={handleAdd}
              disabled={selectedVariations.size === 0}
            >
              Add ({selectedVariations.size})
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
