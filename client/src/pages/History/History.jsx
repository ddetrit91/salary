import { useState, useEffect, useMemo, useCallback } from 'react';
import styles from './History.module.css';
import TransactionList from '../../components/TransactionList/TransactionList';
import Modal from '../../components/Modal/Modal';
import TransactionForm from '../../components/TransactionForm/TransactionForm';
import { getIncomes, addIncome, updateIncome, deleteIncome } from '../../services/incomeService';
import { getExpenses, addExpense, updateExpense, deleteExpense } from '../../services/expenseService';
import { INCOME_CATEGORIES, EXPENSE_CATEGORIES } from '../../utils/constants';
import { exportTransactionsToExcel } from '../../utils/exportExcel';
import { useToast } from '../../components/Toast/ToastContext';

function History() {
  const toast = useToast();
  // Состояния для фильтров
  const [typeFilter, setTypeFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  // Состояния для данных и UI
  const [allTransactions, setAllTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);

  // Функция загрузки всех транзакций (асинхронная)
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      // Запрашиваем данные с большим лимитом, чтобы получить всю историю
      const [incomes, expenses] = await Promise.all([
        getIncomes({ limit: 1000 }),
        getExpenses({ limit: 1000 })
      ]);
      
      // Объединяем и сортируем по дате (новые первыми)
      const combined = [...incomes, ...expenses].sort((a, b) => {
        return new Date(b.date) - new Date(a.date);
      });
      
      setAllTransactions(combined);
    } catch (err) {
      console.error('Ошибка загрузки истории:', err);
      toast.error('Не удалось загрузить историю операций');
    } finally {
      setLoading(false);
    }
  }, []);

  // Загрузка данных при монтировании
  useEffect(() => {
    loadData();
  }, [loadData]);

  // Мемоизированная фильтрация транзакций
  const filteredTransactions = useMemo(() => {
    let filtered = allTransactions;

    if (typeFilter !== 'all') {
      filtered = filtered.filter((t) => t.type === typeFilter);
    }
    if (categoryFilter !== 'all') {
      filtered = filtered.filter((t) => t.category === categoryFilter);
    }
    if (dateFrom) {
      filtered = filtered.filter((t) => t.date >= dateFrom);
    }
    if (dateTo) {
      filtered = filtered.filter((t) => t.date <= dateTo);
    }

    return filtered;
  }, [allTransactions, typeFilter, categoryFilter, dateFrom, dateTo]);

  // Категории для фильтра в зависимости от выбранного типа
  const availableCategories = useMemo(() => {
    if (typeFilter === 'income') return INCOME_CATEGORIES;
    if (typeFilter === 'expense') return EXPENSE_CATEGORIES;
    return [...INCOME_CATEGORIES, ...EXPENSE_CATEGORIES];
  }, [typeFilter]);

  // Сброс фильтра категории при смене типа
  useEffect(() => {
    setCategoryFilter('all');
  }, [typeFilter]);
    // Экспорт текущих (отфильтрованных!) операций в CSV
  const handleExport = () => {
    const success = exportTransactionsToExcel(filteredTransactions);
    if (success) {
      toast.success(`Экспортировано записей: ${filteredTransactions.length}`);
    } else {
      toast.error('Нечего экспортировать — нет данных по фильтру');
    }
  };

  // Управление модалкой
  const handleOpenModal = () => {
    setEditingTransaction(null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingTransaction(null);
  };

  const handleEdit = (transaction) => {
    setEditingTransaction(transaction);
    setIsModalOpen(true);
  };

  // Удаление транзакции (асинхронное)
  const handleDelete = async (id) => {
    if (!confirm('Вы уверены, что хотите удалить эту операцию?')) {
      return;
    }

    const transaction = allTransactions.find((t) => t.id === id);
    if (!transaction) return;

    try {
      if (transaction.type === 'income') {
        await deleteIncome(id);
      } else {
        await deleteExpense(id);
      }
      await loadData(); // Перезагружаем данные после успешного удаления
      toast.success('Операция удалена');
    } catch (err) {
      console.error('Ошибка при удалении:', err);
      toast.error('Не удалось удалить операцию');
    }
  };

  // Обработка отправки формы (асинхронная)
  const handleSubmit = async (data) => {
    try {
      if (editingTransaction) {
        // Режим редактирования
        if (editingTransaction.type === 'income') {
          await updateIncome(editingTransaction.id, data);
        } else {
          await updateExpense(editingTransaction.id, data);
        }
        toast.success('Операция обновлена');
      } else {
        // Режим добавления
        if (data.type === 'income') {
          await addIncome(data);
        } else {
          await addExpense(data);
        }
        toast.success('Операция добавлена');
      }

      await loadData(); // Перезагружаем данные после сохранения
      handleCloseModal();
    } catch (err) {
      console.error('Ошибка при сохранении:', err);
      toast.error('Не удалось сохранить операцию. Проверьте данные.');
    }
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
            disabled={loading}
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

        {/* Кнопка экспорта в Excel — прижата вправо панели фильтров */}
        <button
          className={styles.exportButton}
          onClick={handleExport}
          title="Скачать операции в Excel (.xlsx)"
        >
          <span className={styles.excelIcon}>X</span>
          Скачать операции
        </button>
      </div>

      {/* Список транзакций или индикатор загрузки */}
      <div className={styles.listContainer}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <p>Загрузка истории...</p>
          </div>
        ) : (
          <TransactionList 
            transactions={filteredTransactions}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        )}
      </div>

      {/* Плавающая кнопка добавления */}
      <button 
        className={styles.addButton} 
        title="Добавить операцию"
        onClick={handleOpenModal}
        disabled={loading}
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