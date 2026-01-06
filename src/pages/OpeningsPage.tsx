import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, BookOpen } from 'lucide-react';
import { OpeningList } from '../components/openings';
import { openings, searchOpenings } from '../data/openings';
import { firstMoveCategories, styleCategories } from '../data/categories';
import { categorizeOpenings } from '../utils/categorizeOpenings';
import type { Opening, Variation } from '../types';
import type { CategoryType } from '../data/categories';
import styles from './OpeningsPage.module.css';

export default function OpeningsPage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [colorFilter, setColorFilter] = useState<'all' | 'white' | 'black'>('all');
  const [categoryType, setCategoryType] = useState<CategoryType>('first-move');

  const filteredOpenings = (() => {
    let result = searchQuery ? searchOpenings(searchQuery) : openings;
    if (colorFilter !== 'all') {
      result = result.filter((o) => o.color === colorFilter);
    }
    return result;
  })();

  const categorizedOpenings = categorizeOpenings(
    filteredOpenings,
    categoryType === 'first-move' ? firstMoveCategories : styleCategories
  );

  const handleSelectVariation = (opening: Opening, variation: Variation) => {
    navigate(`/train/${opening.id}/${variation.id}`);
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Chess Openings</h1>
        <p className={styles.subtitle}>
          Select an opening to practice. Master the moves through repetition.
        </p>

        <button
          onClick={() => navigate('/repertoire')}
          className={styles.repertoireButton}
        >
          <BookOpen size={20} />
          Go to Repertoire
        </button>
      </div>

      <div className={styles.tabs}>
        <button
          className={categoryType === 'first-move' ? styles.activeTab : styles.tab}
          onClick={() => setCategoryType('first-move')}
        >
          By First Move
        </button>
        <button
          className={categoryType === 'style' ? styles.activeTab : styles.tab}
          onClick={() => setCategoryType('style')}
        >
          By Style
        </button>
      </div>

      <div className={styles.filters}>
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

        <div className={styles.colorFilter}>
          <button
            className={`${styles.filterBtn} ${colorFilter === 'all' ? styles.active : ''}`}
            onClick={() => setColorFilter('all')}
          >
            All
          </button>
          <button
            className={`${styles.filterBtn} ${colorFilter === 'white' ? styles.active : ''}`}
            onClick={() => setColorFilter('white')}
          >
            White
          </button>
          <button
            className={`${styles.filterBtn} ${colorFilter === 'black' ? styles.active : ''}`}
            onClick={() => setColorFilter('black')}
          >
            Black
          </button>
        </div>
      </div>

      <OpeningList
        categorizedOpenings={categorizedOpenings}
        onSelectVariation={handleSelectVariation}
      />
    </div>
  );
}
