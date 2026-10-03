import { useState, useEffect } from 'react';
import styles from './TransactionForm.module.css';

// --- Fallback-категории ---
// Позже заменим на импорт из utils/constants.js
const INCOME_CATEGORIES_FALLBACK = [
  { id: 'salary', label: 'Зарплата' },
  { id: 'freelance', label: 'Подработка' },
  { id: 'bonus', label: 'Премия' },
  { id: 'debt_return', label: 'Возврат долга' },
  { id: 'deposit_interest', label: 'Проценты по вкладу' },
  { id: 'gift', label: 'Подарок' },
  { id: 'other', label: 'Прочее' },
];

const EXPENSE_CATEGORIES_FALLBACK = [
  { id: 'groceries', label: 'Продукты' },
  { id: 'utilities', label: 'Коммуналка' },
  { id: 'rent', label: 'Аренда' },
  { id: 'subscriptions', label: 'Подписки' },
  { id: 'transport', label: 'Транспорт' },
  { id: 'health', label: 'Здоровье' },
  { id: 'clothing', label: 'Одежда' },
  { id: 'entertainment', label: 'Развлечения' },
  { id: 'communication', label: 'Связь' },
  { id: 'other', label: 'Прочее' },
];
// --------------------------------

// Формат даты для input[type=date]: YYYY-MM-DD
const getTodayString = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

function TransactionForm({ onSubmit, onCancel, editData }) {
  // Определяем режим: редактирование или создание
  const isEditing = Boolean(editData);

  // Состояния полей формы
  const [type, setType] = useState(editData?.type || 'income');
  const [category, setCategory] = useState(editData?.category || '');
  const [amount, setAmount] = useState(editData?.amount?.toString() || '');
  const [date, setDate] = useState(editData?.date || getTodayString());
  const [comment, setComment] = useState(editData?.comment || '');

  // При смене типа операции сбрасываем категорию на первую из нового списка
  useEffect(() => {
    const categories = type === 'income' ? INCOME_CATEGORIES_FALLBACK : EXPENSE_CATEGORIES_FALLBACK;
    // Если текущая категория не из нового списка — сбрасываем
    const isValid = categories.some(c => c.id === category);
    if (!isValid) {
      setCategory(categories[0]?.id || '');
    }
  }, [type]); // eslint-disable-line react-hooks/exhaustive-deps

  // Текущий список категорий в зависимости от типа
  const currentCategories = type === 'income' ? INCOME_CATEGORIES_FALLBACK : EXPENSE_CATEGORIES_FALLBACK;

  const handleTypeChange = (newType) => {
    setType(newType);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Простая валидация
    const parsedAmount = parseFloat(amount);
    if (!parsedAmount || parsedAmount <= 0) {
      alert('Введите корректную сумму');
      return;
    }
    if (!category) {
      alert('Выберите категорию');
      return;
    }
    if (!date) {
      alert('Укажите дату');
      return;
    }

    // Формируем объект транзакции
    const transactionData = {
      id: editData?.id || crypto.randomUUID(),
      type,
      category,
      amount: parsedAmount,
      date,
      comment: comment.trim(),
    };

    onSubmit(transactionData);
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      {/* Переключатель типа операции */}
      <div className={styles.typeSwitcher}>
        <button
          type="button"
          className={`${styles.typeButton} ${type === 'income' ? styles.activeIncome : ''}`}
          onClick={() => handleTypeChange('income')}
        >
          Доход
        </button>
        <button
          type="button"
          className={`${styles.typeButton} ${type === 'expense' ? styles.activeExpense : ''}`}
          onClick={() => handleTypeChange('expense')}
        >
          Расход
        </button>
      </div>

      {/* Категория */}
      <div className={styles.fieldGroup}>
        <label className={styles.fieldLabel}>Категория</label>
        <select
          className={styles.fieldSelect}
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          {(currentCategories || []).map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.label}
            </option>
          ))}
        </select>
      </div>

      {/* Сумма и дата в одну строку */}
      <div className={styles.row}>
        <div className={styles.fieldGroup}>
          <label className={styles.fieldLabel}>Сумма (сум)</label>
          <input
            type="number"
            className={styles.fieldInput}
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0"
            min="0"
            step="0.01"
            required
          />
        </div>

        <div className={styles.fieldGroup}>
          <label className={styles.fieldLabel}>Дата</label>
          <input
            type="date"
            className={styles.fieldInput}
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />
        </div>
      </div>

      {/* Комментарий */}
      <div className={styles.fieldGroup}>
        <label className={styles.fieldLabel}>Комментарий</label>
        <textarea
          className={styles.fieldTextarea}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Необязательное примечание..."
        />
      </div>

      {/* Кнопки действий */}
      <div className={styles.actions}>
        <button
          type="button"
          className={`${styles.button} ${styles.cancelButton}`}
          onClick={onCancel}
        >
          Отмена
        </button>
        <button
          type="submit"
          className={`${styles.button} ${styles.submitButton}`}
        >
          {isEditing ? 'Сохранить' : 'Добавить'}
        </button>
      </div>
    </form>
  );
}

export default TransactionForm;