import styles from './Header.module.css';

function Header({ currentPage, onNavigate, user, onLogout }) {
  const navItems = [
    { id: 'dashboard', label: 'Главная' },
    { id: 'history', label: 'История' },
    { id: 'analytics', label: 'Аналитика' },
  ];

  return (
    <header className={styles.header}>
      <div className={styles.logo}>
        💰 Salary Tracker
      </div>
      
      <nav className={styles.nav}>
        {navItems.map((item) => (
          <button
            key={item.id}
            className={`${styles.navButton} ${currentPage === item.id ? styles.active : ''}`}
            onClick={() => onNavigate(item.id)}
          >
            {item.label}
          </button>
        ))}
      </nav>

      <div className={styles.userInfo}>
        <span className={styles.username}>
          👤 {user?.username || 'Пользователь'}
        </span>
        <button 
          className={styles.logoutButton}
          onClick={onLogout}
          title="Выйти из аккаунта"
        >
          Выйти
        </button>
      </div>
    </header>
  );
}

export default Header;