import styles from './Dashboard.module.css';

// --- Временные заглушки компонентов ---
// Они нужны, чтобы увидеть layout страницы до создания реальных компонентов в Фазе D.
// Позже мы заменим их на импорты из components/.

const BalanceCardStub = ({ title, amount, color }) => (
  <div style={{ 
    padding: '20px', 
    background: 'var(--color-surface)', 
    borderRadius: 'var(--border-radius)', 
    boxShadow: 'var(--shadow)',
    borderLeft: `4px solid ${color}` 
  }}>
    <h3 style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', marginBottom: '8px' }}>{title}</h3>
    <p style={{ fontSize: 'var(--font-size-xl)', fontWeight: 'bold', color: 'var(--color-text)' }}>
      {amount ?? 0} ₽
    </p>
  </div>
);

const EmptyStateStub = () => (
  <div style={{ 
    textAlign: 'center', 
    padding: '40px', 
    color: 'var(--color-text-secondary)',
    background: 'var(--color-surface)',
    borderRadius: 'var(--border-radius)',
    border: '1px dashed var(--color-border)'
  }}>
    <p style={{ fontSize: 'var(--font-size-lg)', marginBottom: '8px' }}>Нет операций</p>
    <p>Нажмите «+», чтобы добавить первую запись</p>
  </div>
);
// ------------------------------------

function Dashboard() {
  return (
    <div className={styles.dashboard}>
      <h1 className={styles.title}>Главная</h1>
      
      {/* Сетка карточек с балансом */}
      <div className={styles.cardsGrid}>
        <BalanceCardStub title="Доходы" amount={0} color="var(--color-income)" />
        <BalanceCardStub title="Расходы" amount={0} color="var(--color-expense)" />
        <BalanceCardStub title="Баланс" amount={0} color="var(--color-primary)" />
      </div>

      {/* Секция последних операций */}
      <div className={styles.recentSection}>
        <h2 className={styles.recentTitle}>Последние операции</h2>
        <EmptyStateStub />
      </div>

      {/* Плавающая кнопка добавления */}
      <button className={styles.addButton} title="Добавить операцию">
        +
      </button>
    </div>
  );
}

export default Dashboard;