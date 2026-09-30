import { api } from './api.js';

/**
 * Получает общий баланс (доходы, расходы, разница)
 * @returns {Promise<Object>} { totalIncome, totalExpense, balance }
 */
export const getBalance = async () => {
  const response = await api.get('/summary/balance');
  return response.data;
};

/**
 * Получает суммы по категориям для указанного типа операции
 * @param {string} type - 'income' или 'expense'
 * @returns {Promise<Array>} массив объектов { name, value, color }
 */
export const getByCategory = async (type = 'expense') => {
  const response = await api.get(`/summary/by-category?type=${type}`);
  return response.data || [];
};

/**
 * Получает ежемесячную сводку доходов и расходов
 * @returns {Promise<Array>} массив объектов { month, income, expense }
 */
export const getMonthlySummary = async () => {
  const response = await api.get('/summary/by-month');
  return response.data || [];
};

/**
 * Получает последние N операций (объединяет доходы и расходы)
 * @param {number} limit - количество операций
 * @returns {Promise<Array>} массив транзакций, отсортированный по дате (новые первыми)
 */
export const getRecentTransactions = async (limit = 5) => {
  // Запрашиваем последние доходы и расходы параллельно
  const [incomesResponse, expensesResponse] = await Promise.all([
    api.get(`/incomes?limit=${limit}`),
    api.get(`/expenses?limit=${limit}`)
  ]);

  const incomes = incomesResponse.data || [];
  const expenses = expensesResponse.data || [];

  // Объединяем и сортируем по дате (новые первыми)
  const allTransactions = [...incomes, ...expenses].sort((a, b) => {
    return new Date(b.date) - new Date(a.date);
  });

  return allTransactions.slice(0, limit);
};