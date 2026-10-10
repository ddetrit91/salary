import { useState, useEffect } from 'react';
import styles from './App.module.css';
import Layout from './components/Layout/Layout';
import Dashboard from './pages/Dashboard/Dashboard';
import History from './pages/History/History';
import Analytics from './pages/Analytics/Analytics';
import Admin from './pages/Admin/Admin'; // Импорт страницы админ-панели
import Auth from './pages/Auth/Auth';
import OnboardingTour from './components/Onboarding/OnboardingTour';
import { getCurrentUser, logout } from './services/authService';

function App() {
  const [user, setUser] = useState(null);
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [isTourOpen, setIsTourOpen] = useState(false);

  // Проверяем авторизацию при загрузке приложения
  useEffect(() => {
    const currentUser = getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
    }
  }, []);

  // Автоматический запуск онбординга для новых пользователей при первой авторизации
  useEffect(() => {
    if (user) {
      const completed = localStorage.getItem('salary_tracker_onboarding_completed');
      if (!completed) {
        const timer = setTimeout(() => {
          setIsTourOpen(true);
        }, 800);
        return () => clearTimeout(timer);
      }
    }
  }, [user]);

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

  // Запуск тура (всегда переключает на дашборд для корректной подсветки)
  const handleStartTour = () => {
    setCurrentPage('dashboard');
    setIsTourOpen(true);
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
      case 'admin':
        return <Admin />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <>
      <Layout
        currentPage={currentPage}
        onNavigate={setCurrentPage}
        user={user}
        onLogout={handleLogout}
        onStartTour={handleStartTour}
      >
        <main className={styles.main}>
          {renderPage()}
        </main>
      </Layout>

      {user && (
        <OnboardingTour
          isOpen={isTourOpen}
          onClose={() => setIsTourOpen(false)}
          onNavigate={setCurrentPage}
        />
      )}
    </>
  );
}

export default App;