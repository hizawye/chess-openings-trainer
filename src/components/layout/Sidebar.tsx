import { NavLink } from 'react-router-dom'
import { BookOpen, Settings, Crown } from 'lucide-react'
import styles from './Sidebar.module.css'

export default function Sidebar() {
  return (
    <aside className={styles.sidebar}>
      <div className={styles.logo}>
        <Crown size={32} />
        <span>Chess Openings</span>
      </div>

      <nav className={styles.nav}>
        <NavLink
          to="/"
          className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}
        >
          <BookOpen size={20} />
          <span>Openings</span>
        </NavLink>

        <NavLink
          to="/settings"
          className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}
        >
          <Settings size={20} />
          <span>Settings</span>
        </NavLink>
      </nav>
    </aside>
  )
}
