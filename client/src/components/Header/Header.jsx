import styles from './Header.module.css';
import { useTheme } from '../../context/ThemeContext.jsx';

function Header({ currentPage, onNavigate, user, onLogout }) {
  // Получаем тему и функцию переключения
  const { theme, toggleTheme } = useTheme();

  // Базовые пункты навигации для всех пользователей
  const navItems = [
    { id: 'dashboard', label: 'Главная' },
    { id: 'history', label: 'История' },
    { id: 'analytics', label: 'Аналитика' },
  ];

  // Пункт «Админ» добавляется ТОЛЬКО для роли admin.
  // Это косметика для интерфейса: настоящая проверка роли — на бэкенде.
  if (user?.role === 'admin') {
    navItems.push({ id: 'admin', label: '⚙️ Админ' });
  }

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
          {user?.role === 'admin' && (
            <span className={styles.adminBadge} title="Администратор">
              ★
            </span>
          )}
        </span>

        {/* Кнопка переключения темы */}
        <button
          className={styles.themeToggle}
          onClick={toggleTheme}
          title={theme === 'dark' ? 'Включить светлую тему' : 'Включить тёмную тему'}
        >
          {theme === 'dark' ? '☀️' : '🌙'}
        </button>

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