import { NavLink } from 'react-router-dom';
import styles from './Header.module.css';

function Header() {
  return (
    <header className={styles.header}>
      <div className={styles.wrapper}>
        <div className={styles.logo}>💰 Salary Tracker</div>
        <nav className={styles.nav}>
          {/* Атрибут end нужен для точного совпадения с корневым путём "/" */}
          <NavLink 
            to="/" 
            end 
            className={({ isActive }) => isActive ? `${styles.link} ${styles.active}` : styles.link}
          >
            Главная
          </NavLink>
          <NavLink 
            to="/history" 
            className={({ isActive }) => isActive ? `${styles.link} ${styles.active}` : styles.link}
          >
            История
          </NavLink>
          <NavLink 
            to="/analytics" 
            className={({ isActive }) => isActive ? `${styles.link} ${styles.active}` : styles.link}
          >
            Аналитика
          </NavLink>
        </nav>
      </div>
    </header>
  );
}

export default Header;