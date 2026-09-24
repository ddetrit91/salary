import { getIncomes } from './incomeService';
import { getExpenses } from './expenseService';
import { INCOME_CATEGORIES, EXPENSE_CATEGORIES } from '../utils/constants';
import { getShortMonthName } from '../utils/formatters';

/**
 * Получает общий баланс (доходы, расходы, разница)
 * @returns {Object} { totalIncome, totalExpense, balance }
 */
export const getBalance = () => {
  const incomes = getIncomes();
  const expenses = getExpenses();

  const totalIncome = (incomes || []).reduce((sum, item) => sum + (item.amount ?? 0), 0);
  const totalExpense = (expenses || []).reduce((sum, item) => sum + (item.amount ?? 0), 0);

  return {
    totalIncome,
    totalExpense,
    balance: totalIncome - totalExpense,
  };
};

/**
 * Получает суммы по категориям для указанного типа операции
 * @param {string} type - 'income' или 'expense'
 * @returns {Array} массив объектов { name, value, color } для графиков
 */
export const getByCategory = (type = 'expense') => {
  const items = type === 'income' ? getIncomes() : getExpenses();
  const categories = type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  // Собираем суммы по каждой категории
  const categoryMap = {};
  (items || []).forEach((item) => {
    const cat = item.category || 'other';
    categoryMap[cat] = (categoryMap[cat] || 0) + (item.amount ?? 0);
  });

  // Цветовая палитра для секторов диаграммы
  const colors = [
    '#4361ee', '#3a0ca3', '#7209b7', '#f72585', '#4cc9f0',
    '#4895ef', '#560bad', '#b5179e', '#f77f00', '#06ffa5',
  ];

  // Преобразуем в массив для recharts, фильтруем нулевые значения
  const result = Object.entries(categoryMap)
    .filter(([, value]) => value > 0)
    .map(([categoryId, value], index) => {
      const categoryInfo = (categories || []).find((c) => c.id === categoryId);
      return {
        name: categoryInfo?.label || categoryId,
        value,
        color: colors[index % colors.length],
      };
    });

  return result;
};

/**
 * Получает ежемесячную сводку доходов и расходов
 * @returns {Array} массив объектов { month, income, expense } для столбчатого графика
 */
export const getMonthlySummary = () => {
  const incomes = getIncomes();
  const expenses = getExpenses();

  // Собираем все уникальные месяцы из обеих коллекций
  const monthMap = {};

  (incomes || []).forEach((item) => {
    if (!item.date) return;
    const date = new Date(item.date);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    
    if (!monthMap[key]) {
      monthMap[key] = { year: date.getFullYear(), monthIndex: date.getMonth(), income: 0, expense: 0 };
    }
    monthMap[key].income += item.amount ?? 0;
  });

  (expenses || []).forEach((item) => {
    if (!item.date) return;
    const date = new Date(item.date);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    
    if (!monthMap[key]) {
      monthMap[key] = { year: date.getFullYear(), monthIndex: date.getMonth(), income: 0, expense: 0 };
    }
    monthMap[key].expense += item.amount ?? 0;
  });

  // Преобразуем в массив и сортируем по дате
  const result = Object.entries(monthMap)
    .sort(([keyA], [keyB]) => keyA.localeCompare(keyB))
    .map(([, data]) => ({
      month: `${getShortMonthName(data.monthIndex)} ${data.year}`,
      income: data.income,
      expense: data.expense,
    }));

  return result;
};

/**
 * Получает последние N операций (объединяет доходы и расходы)
 * @param {number} limit - количество операций
 * @returns {Array} массив транзакций, отсортированный по дате (новые первыми)
 */
export const getRecentTransactions = (limit = 5) => {
  const incomes = getIncomes();
  const expenses = getExpenses();

  // Объединяем и сортируем по дате
  const allTransactions = [...(incomes || []), ...(expenses || [])].sort((a, b) => {
    return new Date(b.date) - new Date(a.date);
  });

  return allTransactions.slice(0, limit);
};