import styles from './TransactionList.module.css';
import EmptyState from '../EmptyState/EmptyState';
import { INCOME_CATEGORIES, EXPENSE_CATEGORIES } from '../../utils/constants';

// Соответствие категорий → иконка + пастельный цвет круга
const CATEGORY_ICON_MAP = {
  // Доходы
  salary:           { icon: '💼', color: '#DBEAFE' }, // голубой
  freelance:        { icon: '💻', color: '#FEF3C7' }, // жёлтый
  bonus:            { icon: '🎉', color: '#FCE7F3' }, // розовый
  debt_return:      { icon: '🔄', color: '#E0E7FF' }, // индиго
  deposit_interest: { icon: '🏦', color: '#D1FAE5' }, // мятный
  // Расходы
  groceries:        { icon: '🛒', color: '#DCFCE7' }, // зелёный
  utilities:        { icon: '💡', color: '#FEF9C3' }, // светло-жёлтый
  rent:             { icon: '🏠', color: '#FED7AA' }, // оранжевый
  subscriptions:    { icon: '📺', color: '#E9D5FF' }, // фиолетовый
  transport:        { icon: '🚗', color: '#BFDBFE' }, // синий
  health:           { icon: '💊', color: '#FECDD3' }, // нежно-розовый
  clothing:         { icon: '👕', color: '#FBCFE8' }, // ярко-розовый
  entertainment:    { icon: '🎬', color: '#FCD6BB' }, // персиковый
  communication:    { icon: '📱', color: '#A5F3FC' }, // циан
  // Общие
  gift:             { icon: '🎁', color: '#FEE2E2' }, // красный
  other:            { icon: '💸', color: '#F3F4F6' }, // серый
};

// Возвращает иконку и цвет для категории (если не найдено — нейтральный бейдж)
const getCategoryIcon = (categoryId) => {
  return CATEGORY_ICON_MAP[categoryId] || { icon: '💸', color: '#F3F4F6' };
};

function TransactionList({ transactions = [], onEdit, onDelete }) {
  if (!transactions || transactions.length === 0) {
    return (
      <EmptyState 
        title="Нет операций" 
        description="Добавьте первую запись, нажав кнопку «+»"
        icon="📝"
      />
    );
  }

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const getCategoryLabel = (categoryId, type) => {
    const categories = type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
    const category = categories.find(c => c.id === categoryId);
    return category ? category.label : (categoryId || 'Без категории');
  };

  return (
    <div className={styles.list}>
      <div className={styles.header}>
        <div>Дата</div>
        <div>Описание</div>
        <div style={{ textAlign: 'right' }}>Сумма</div>
        <div></div>
      </div>

      {transactions.map((transaction) => {
        const iconInfo = getCategoryIcon(transaction.category);

        return (
          <div key={transaction.id} className={styles.row}>
            <div className={styles.date}>
              {formatDate(transaction.date)}
            </div>
            
            {/* Описание: иконка + название категории + комментарий */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: 0 }}>
  {/* Круглая иконка категории (не сжимается) */}
  <div 
    style={{
      width: '40px',
      height: '40px',
      borderRadius: '50%',
      backgroundColor: iconInfo.color,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '20px',
      flexShrink: 0,
    }}
  >
    {iconInfo.icon}
  </div>

  {/* Текстовый блок (категория + комментарий) */}
  <div style={{ minWidth: 0, flex: 1 }}>
    <div className={styles.category}>
      {getCategoryLabel(transaction.category, transaction.type)}
    </div>
    {transaction.comment && (
      <div className={styles.comment}>{transaction.comment}</div>
    )}
  </div>
</div>

            <div className={`${styles.amount} ${transaction.type === 'income' ? styles.income : styles.expense}`}>
              {transaction.type === 'income' ? '+' : '−'}
              {(transaction.amount ?? 0).toLocaleString('ru-RU')} сум
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
        );
      })}
    </div>
  );
}

export default TransactionList;