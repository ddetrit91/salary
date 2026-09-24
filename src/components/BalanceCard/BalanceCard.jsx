import styles from './BalanceCard.module.css';

function BalanceCard({ title, amount, type = 'balance' }) {
  // Fallback для amount: если не передан или null/undefined, показываем 0
  const displayAmount = amount ?? 0;
  
  // Форматирование числа с разделителями тысяч
  const formattedAmount = displayAmount.toLocaleString('ru-RU');
  
  // Определяем CSS-класс в зависимости от типа
  const typeClass = styles[type] || styles.balance;

  return (
    <div className={`${styles.card} ${typeClass}`}>
      <h3 className={styles.title}>{title}</h3>
      <p className={styles.amount}>{formattedAmount} ₽</p>
    </div>
  );
}

export default BalanceCard;