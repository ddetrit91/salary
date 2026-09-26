import styles from './TransactionList.module.css';
import EmptyState from '../EmptyState/EmptyState';
import { INCOME_CATEGORIES, EXPENSE_CATEGORIES } from '../../utils/constants';

function TransactionList({ transactions = [], onEdit, onDelete }) {
  // Если транзакций нет — показываем заглушку
  if (!transactions || transactions.length === 0) {
    return (
      <EmptyState 
        title="Нет операций" 
        description="Добавьте первую запись, нажав кнопку «+»"
        icon="📝"
      />
    );
  }

  // Форматирование даты
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  // Получение читаемого названия категории с учётом типа операции
  const getCategoryLabel = (categoryId, type) => {
    const categories = type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
    const category = categories.find(c => c.id === categoryId);
    return category ? category.label : (categoryId || 'Без категории');
  };

  return (
    <div className={styles.list}>
      {/* Заголовок таблицы */}
      <div className={styles.header}>
        <div>Дата</div>
        <div>Описание</div>
        <div style={{ textAlign: 'right' }}>Сумма</div>
        <div></div>
      </div>

      {/* Строки транзакций */}
      {transactions.map((transaction) => (
        <div key={transaction.id} className={styles.row}>
          <div className={styles.date}>
            {formatDate(transaction.date)}
          </div>
          
          <div className={styles.info}>
            <div className={styles.category}>
              {getCategoryLabel(transaction.category, transaction.type)}
            </div>
            {transaction.comment && (
              <div className={styles.comment}>{transaction.comment}</div>
            )}
          </div>

          {/* Используем transaction.type для знака и CSS-класса */}
          <div className={`${styles.amount} ${transaction.type === 'income' ? styles.income : styles.expense}`}>
            {transaction.type === 'income' ? '+' : '−'}
            {(transaction.amount ?? 0).toLocaleString('ru-RU')} ₽
          </div>

          <div className={styles.actions}>
            {onEdit && (
              <button 
                className={`${styles.actionButton} ${styles.editButton}`}
                onClick={() => onEdit(transaction)}
                title="Редактировать"
              >
                ✎
              </button>
            )}
            {onDelete && (
              <button 
                className={`${styles.actionButton} ${styles.deleteButton}`}
                onClick={() => onDelete(transaction.id)}
                title="Удалить"
              >
                ×
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

export default TransactionList;