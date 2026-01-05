import { useState } from 'react';
import { X } from 'lucide-react';
import type { RepertoireGroup } from '../../types/repertoire';
import styles from './GroupManagementModal.module.css';

interface GroupManagementModalProps {
  isOpen: boolean;
  group?: RepertoireGroup; // If provided, edit mode; otherwise, create mode
  onClose: () => void;
  onCreate?: (name: string, color?: string) => void;
  onUpdate?: (groupId: string, updates: Partial<RepertoireGroup>) => void;
}

const PRESET_COLORS = [
  '#f44336', // Red
  '#e91e63', // Pink
  '#9c27b0', // Purple
  '#673ab7', // Deep Purple
  '#3f51b5', // Indigo
  '#2196f3', // Blue
  '#03a9f4', // Light Blue
  '#00bcd4', // Cyan
  '#009688', // Teal
  '#4caf50', // Green
  '#8bc34a', // Light Green
  '#cddc39', // Lime
  '#ffeb3b', // Yellow
  '#ffc107', // Amber
  '#ff9800', // Orange
  '#ff5722', // Deep Orange
];

export default function GroupManagementModal({
  isOpen,
  group,
  onClose,
  onCreate,
  onUpdate,
}: GroupManagementModalProps) {
  const [name, setName] = useState(group?.name || '');
  const [selectedColor, setSelectedColor] = useState(group?.color || PRESET_COLORS[0]);

  const isEditMode = !!group;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) return;

    if (isEditMode && onUpdate && group) {
      onUpdate(group.id, { name, color: selectedColor });
    } else if (!isEditMode && onCreate) {
      onCreate(name, selectedColor);
    }

    setName('');
    setSelectedColor(PRESET_COLORS[0]);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2>{isEditMode ? 'Edit Group' : 'Create New Group'}</h2>
          <button className={styles.closeButton} onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.field}>
            <label htmlFor="group-name">Group Name</label>
            <input
              id="group-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Urgent, Advanced, Fun Openings"
              className={styles.input}
              autoFocus
              required
            />
          </div>

          <div className={styles.field}>
            <label>Color</label>
            <div className={styles.colorGrid}>
              {PRESET_COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  className={`${styles.colorOption} ${selectedColor === color ? styles.selected : ''}`}
                  style={{ backgroundColor: color }}
                  onClick={() => setSelectedColor(color)}
                  title={color}
                />
              ))}
            </div>
          </div>

          <div className={styles.actions}>
            <button type="button" className={styles.cancelButton} onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className={styles.submitButton} disabled={!name.trim()}>
              {isEditMode ? 'Save Changes' : 'Create Group'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
