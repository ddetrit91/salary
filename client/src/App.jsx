import { useState, useEffect } from 'react';
import styles from './App.module.css';
import Layout from './components/Layout/Layout';
import Dashboard from './pages/Dashboard/Dashboard';
import History from './pages/History/History';
import Analytics from './pages/Analytics/Analytics';
import Auth from './pages/Auth/Auth';
import { getCurrentUser, logout } from './services/authService';

function App() {
  const [user, setUser] = useState(null);
  const [currentPage, setCurrentPage] = useState('dashboard');

  // Проверяем авторизацию при загрузке приложения
  useEffect(() => {
    const currentUser = getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
    }
  }, []);

  // Обработка успешной авторизации
  const handleAuthSuccess = () => {
    const currentUser = getCurrentUser();
    setUser(currentUser);
  };

  // Обработка выхода из системы
  const handleLogout = () => {
    logout();
    setUser(null);
    setCurrentPage('dashboard');
  };

  // Если пользователь не авторизован, показываем страницу входа
  if (!user) {
    return <Auth onAuthSuccess={handleAuthSuccess} />;
  }

  // Рендер текущей страницы
  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard />;
      case 'history':
        return <History />;
      case 'analytics':
        return <Analytics />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <Layout 
      currentPage={currentPage}
      onNavigate={setCurrentPage}
      user={user}
      onLogout={handleLogout}
    >
      <main className={styles.main}>
        {renderPage()}
      </main>
    </Layout>
  );
}

export default App;