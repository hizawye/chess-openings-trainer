import { Menu } from 'lucide-react'
import styles from './Header.module.css'

export default function Header() {
  return (
    <header className={styles.header}>
      <button className={styles.menuBtn}>
        <Menu size={24} />
      </button>
      <h1 className={styles.title}>Chess Openings Trainer</h1>
    </header>
  )
}
