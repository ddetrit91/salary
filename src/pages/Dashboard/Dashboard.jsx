import { useState, useEffect } from 'react';
import styles from './Dashboard.module.css';
import BalanceCard from '../../components/BalanceCard/BalanceCard';
import EmptyState from '../../components/EmptyState/EmptyState';
import TransactionList from '../../components/TransactionList/TransactionList';
import Modal from '../../components/Modal/Modal';
import TransactionForm from '../../components/TransactionForm/TransactionForm';
import { getBalance, getRecentTransactions } from '../../services/summaryService';
import { addIncome } from '../../services/incomeService';
import { addExpense } from '../../services/expenseService';

function Dashboard() {
  // Состояния для данных
  const [balance, setBalance] = useState({ totalIncome: 0, totalExpense: 0, balance: 0 });
  const [recentTransactions, setRecentTransactions] = useState([]);
  
  // Состояние модалки
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Загрузка данных при монтировании компонента
  useEffect(() => {
    loadData();
  }, []);

  // Функция загрузки данных
  const loadData = () => {
    const balanceData = getBalance();
    setBalance(balanceData);
    
    const recent = getRecentTransactions(5);
    setRecentTransactions(recent);
  };

  // Открытие модалки
  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  // Закрытие модалки
  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  // Обработка отправки формы
  const handleSubmit = (data) => {
    if (data.type === 'income') {
      addIncome(data);
    } else {
      addExpense(data);
    }
    
    // Перезагружаем данные после добавления
    loadData();
    handleCloseModal();
  };

  return (
    <div className={styles.dashboard}>
      <h1 className={styles.title}>Главная</h1>
      
      {/* Сетка карточек с балансом */}
      <div className={styles.cardsGrid}>
        <BalanceCard 
          title="Доходы" 
          amount={balance.totalIncome} 
          type="income" 
        />
        <BalanceCard 
          title="Расходы" 
          amount={balance.totalExpense} 
          type="expense" 
        />
        <BalanceCard 
          title="Баланс" 
          amount={balance.balance} 
          type="balance" 
        />
      </div>

      {/* Секция последних операций */}
      <div className={styles.recentSection}>
        <h2 className={styles.recentTitle}>Последние операции</h2>
        <TransactionList 
          transactions={recentTransactions}
        />
      </div>

      {/* Плавающая кнопка добавления */}
      <button 
        className={styles.addButton} 
        title="Добавить операцию"
        onClick={handleOpenModal}
      >
        +
      </button>

      {/* Модальное окно с формой */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title="Новая операция"
      >
        <TransactionForm
          onSubmit={handleSubmit}
          onCancel={handleCloseModal}
        />
      </Modal>
    </div>
  );
}

export default Dashboard;