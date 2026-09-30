import Header from '../Header/Header';
import styles from './Layout.module.css';

function Layout({ children }) {
  return (
    <div className={styles.layout}>
      {/* Шапка с навигацией */}
      <Header />
      {/* Основная область для контента страниц */}
      <main className={styles.main}>
        {children}
      </main>
    </div>
  );
}

export default Layout;