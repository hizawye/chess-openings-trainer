import { RotateCcw, RefreshCw } from 'lucide-react';
import styles from './BoardControls.module.css';

interface BoardControlsProps {
  onFlip: () => void;
  onReset: () => void;
  orientation: 'white' | 'black';
}

export default function BoardControls({ onFlip, onReset, orientation }: BoardControlsProps) {
  return (
    <div className={styles.controls}>
      <button
        className={styles.btn}
        onClick={onFlip}
        title={`Flip board (currently ${orientation})`}
      >
        <RotateCcw size={20} />
        <span>Flip</span>
      </button>
      <button className={styles.btn} onClick={onReset} title="Reset board">
        <RefreshCw size={20} />
        <span>Reset</span>
      </button>
    </div>
  );
}
