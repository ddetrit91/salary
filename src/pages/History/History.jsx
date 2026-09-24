import { useState, useEffect, useMemo } from 'react';
import styles from './History.module.css';
import TransactionList from '../../components/TransactionList/TransactionList';
import Modal from '../../components/Modal/Modal';
import TransactionForm from '../../components/TransactionForm/TransactionForm';
import { getIncomes, updateIncome, deleteIncome } from '../../services/incomeService';
import { getExpenses, updateExpense, deleteExpense } from '../../services/expenseService';
import { INCOME_CATEGORIES, EXPENSE_CATEGORIES } from '../../utils/constants';

function History() {
  // Состояния для фильтров
  const [typeFilter, setTypeFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  // Состояния для данных
  const [allTransactions, setAllTransactions] = useState([]);
  
  // Состояние модалки
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);

  // Загрузка данных при монтировании
  useEffect(() => {
    loadData();
  }, []);

  // Функция загрузки всех транзакций
  const loadData = () => {
    const incomes = getIncomes();
    const expenses = getExpenses();
    
    // Объединяем и сортируем по дате (новые первыми)
    const combined = [...(incomes || []), ...(expenses || [])].sort((a, b) => {
      return new Date(b.date) - new Date(a.date);
    });
    
    setAllTransactions(combined);
  };

  // Мемоизированная фильтрация транзакций
  const filteredTransactions = useMemo(() => {
    let filtered = allTransactions;

    // Фильтр по типу
    if (typeFilter !== 'all') {
      filtered = filtered.filter((t) => t.type === typeFilter);
    }

    // Фильтр по категории
    if (categoryFilter !== 'all') {
      filtered = filtered.filter((t) => t.category === categoryFilter);
    }

    // Фильтр по дате "с"
    if (dateFrom) {
      filtered = filtered.filter((t) => t.date >= dateFrom);
    }

    // Фильтр по дате "по"
    if (dateTo) {
      filtered = filtered.filter((t) => t.date <= dateTo);
    }

    return filtered;
  }, [allTransactions, typeFilter, categoryFilter, dateFrom, dateTo]);

  // Категории для фильтра в зависимости от выбранного типа
  const availableCategories = useMemo(() => {
    if (typeFilter === 'income') {
      return INCOME_CATEGORIES;
    } else if (typeFilter === 'expense') {
      return EXPENSE_CATEGORIES;
    }
    // Если тип "все" — показываем все категории из обоих списков
    return [...INCOME_CATEGORIES, ...EXPENSE_CATEGORIES];
  }, [typeFilter]);

  // Сброс фильтра категории при смене типа
  useEffect(() => {
    setCategoryFilter('all');
  }, [typeFilter]);

  // Открытие модалки для добавления
  const handleOpenModal = () => {
    setEditingTransaction(null);
    setIsModalOpen(true);
  };

  // Закрытие модалки
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingTransaction(null);
  };

  // Открытие модалки для редактирования
  const handleEdit = (transaction) => {
    setEditingTransaction(transaction);
    setIsModalOpen(true);
  };

  // Удаление транзакции
  const handleDelete = (id) => {
    if (!confirm('Вы уверены, что хотите удалить эту операцию?')) {
      return;
    }

    // Находим транзакцию, чтобы определить её тип
    const transaction = allTransactions.find((t) => t.id === id);
    if (!transaction) return;

    // Удаляем через соответствующий сервис
    if (transaction.type === 'income') {
      deleteIncome(id);
    } else {
      deleteExpense(id);
    }

    // Перезагружаем данные
    loadData();
  };

  // Обработка отправки формы (добавление или редактирование)
  const handleSubmit = (data) => {
    if (editingTransaction) {
      // Режим редактирования
      if (editingTransaction.type === 'income') {
        updateIncome(editingTransaction.id, data);
      } else {
        updateExpense(editingTransaction.id, data);
      }
    } else {
      // Режим добавления
      if (data.type === 'income') {
        addIncome(data);
      } else {
        addExpense(data);
      }
    }

    // Перезагружаем данные и закрываем модалку
    loadData();
    handleCloseModal();
  };

  // Получение названия категории по ID
  const getCategoryLabel = (categoryId, type) => {
    const categories = type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
    const category = (categories || []).find((c) => c.id === categoryId);
    return category?.label || categoryId;
  };

  return (
    <div className={styles.history}>
      <h1 className={styles.title}>История операций</h1>

      {/* Панель фильтров */}
      <div className={styles.filters}>
        <div className={styles.filterGroup}>
          <label className={styles.filterLabel}>Тип операции</label>
          <select 
            className={styles.filterSelect}
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
          >
            <option value="all">Все</option>
            <option value="income">Доходы</option>
            <option value="expense">Расходы</option>
          </select>
        </div>

        <div className={styles.filterGroup}>
          <label className={styles.filterLabel}>Категория</label>
          <select 
            className={styles.filterSelect}
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <option value="all">Все категории</option>
            {(availableCategories || []).map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.label}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.filterGroup}>
          <label className={styles.filterLabel}>С даты</label>
          <input 
            type="date"
            className={styles.filterInput}
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
          />
        </div>

        <div className={styles.filterGroup}>
          <label className={styles.filterLabel}>По дату</label>
          <input 
            type="date"
            className={styles.filterInput}
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
          />
        </div>
      </div>

      {/* Список транзакций */}
      <div className={styles.listContainer}>
        <TransactionList 
          transactions={filteredTransactions}
          onEdit={handleEdit}
          onDelete={handleDelete}
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
        title={editingTransaction ? 'Редактировать операцию' : 'Новая операция'}
      >
        <TransactionForm
          onSubmit={handleSubmit}
          onCancel={handleCloseModal}
          editData={editingTransaction}
        />
      </Modal>
    </div>
  );
}

export default History;