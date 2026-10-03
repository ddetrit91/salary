import db from '../db/connection.js';

// Соответствие технических ID категорий русским названиям
const CATEGORY_LABELS = {
  // Доходы
  salary: 'Зарплата',
  freelance: 'Фриланс',
  bonus: 'Премия',
  debt_return: 'Возврат долга',
  deposit_interest: 'Проценты по вкладу',
  // Расходы
  groceries: 'Продукты',
  utilities: 'Коммунальные услуги',
  rent: 'Аренда жилья',
  subscriptions: 'Подписки',
  transport: 'Транспорт',
  health: 'Здоровье',
  clothing: 'Одежда',
  entertainment: 'Развлечения',
  communication: 'Связь',
  // Общие
  gift: 'Подарок',
  other: 'Другое',
};

// Возвращает русское название категории или сам ID, если название не найдено
const getLabel = (categoryId) => CATEGORY_LABELS[categoryId] || categoryId;

/**
 * Получает общий баланс текущего пользователя
 */
export const getBalance = async (userId) => {
  const totalIncomeRow = await db.get(
    'SELECT COALESCE(SUM(amount), 0) as total FROM incomes WHERE user_id = ?',
    [userId]
  );
  const totalExpenseRow = await db.get(
    'SELECT COALESCE(SUM(amount), 0) as total FROM expenses WHERE user_id = ?',
    [userId]
  );

  const totalIncome = totalIncomeRow ? Number(totalIncomeRow.total) : 0;
  const totalExpense = totalExpenseRow ? Number(totalExpenseRow.total) : 0;
  
  return {
    totalIncome,
    totalExpense,
    balance: totalIncome - totalExpense,
  };
};

/**
 * Получает суммы по категориям для текущего пользователя (с русскими названиями)
 */
export const getByCategory = async (userId, type = 'expense') => {
  const tableName = type === 'income' ? 'incomes' : 'expenses';
  
  const rows = await db.all(`
    SELECT category, SUM(amount) as total, COUNT(*) as count 
    FROM ${tableName} 
    WHERE user_id = ? 
    GROUP BY category 
    ORDER BY total DESC
  `, [userId]);

  // Палитра цветов для графиков
  const colors = ['#4CAF50', '#FF9800', '#2196F3', '#9C27B0', '#E91E63', '#00BCD4', '#FFEB3B', '#795548', '#607D8B', '#F44336'];
  
  return rows.map((row, index) => ({
    name: getLabel(row.category),
    value: Number(row.total),
    count: Number(row.count),
    color: colors[index % colors.length],
  }));
};

/**
 * Получает ежемесячную сводку доходов и расходов текущего пользователя
 */
export const getMonthlySummary = async (userId) => {
  const rows = await db.all(`
    SELECT 
      strftime('%Y-%m', date) as month,
      COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END), 0) as income,
      COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0) as expense
    FROM (
      SELECT date, amount, 'income' as type FROM incomes WHERE user_id = ?
      UNION ALL
      SELECT date, amount, 'expense' as type FROM expenses WHERE user_id = ?
    )
    GROUP BY month
    ORDER BY month ASC
  `, [userId, userId]);

  return rows.map((r) => ({
    month: r.month,
    income: Number(r.income),
    expense: Number(r.expense),
  }));
};