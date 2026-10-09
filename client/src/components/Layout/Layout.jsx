import styles from './Layout.module.css';
import Header from '../Header/Header';

/**
 * Layout рисует шапку на всю ширину,
 * а контент страниц оборачивает в центрированный контейнер.
 */
function Layout({ children, currentPage, onNavigate, user, onLogout, onStartTour }) {
  return (
    <div className={styles.layout}>
      {/* Шапка на всю ширину экрана */}
      <Header 
        currentPage={currentPage} 
        onNavigate={onNavigate} 
        user={user} 
        onLogout={onLogout} 
        onStartTour={onStartTour}
      />
      
      {/* Центрированный контейнер для контента страниц */}
      <div 
        style={{ 
          maxWidth: '1200px', 
          margin: '0 auto', 
          padding: '24px 16px', 
          width: '100%', 
          boxSizing: 'border-box' 
        }}
      >
        {children}
      </div>
    </div>
  );
}

export default Layout;