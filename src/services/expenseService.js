import { api } from '../utils/api.js';

/**
 * Получает список расходов с пагинацией и фильтрацией
 * @param {Object} params - параметры запроса (page, limit, category, dateFrom, dateTo, isRecurring)
 * @returns {Promise<Array>} массив расходов
 */
export const getExpenses = async (params = {}) => {
  const queryParams = new URLSearchParams();
  if (params.page) queryParams.append('page', params.page);
  if (params.limit) queryParams.append('limit', params.limit);
  if (params.category) queryParams.append('category', params.category);
  if (params.dateFrom) queryParams.append('dateFrom', params.dateFrom);
  if (params.dateTo) queryParams.append('dateTo', params.dateTo);
  if (params.isRecurring !== undefined) queryParams.append('isRecurring', params.isRecurring);

  const queryString = queryParams.toString();
  const response = await api.get(`/expenses${queryString ? `?${queryString}` : ''}`);
  
  return response.data || [];
};

/**
 * Получает расход по ID
 * @param {string} id - идентификатор расхода
 * @returns {Promise<Object>} объект расхода
 */
export const getExpenseById = async (id) => {
  const response = await api.get(`/expenses/${id}`);
  return response.data;
};

/**
 * Добавляет новый расход
 * @param {Object} expenseData - данные расхода
 * @returns {Promise<Object>} созданный расход
 */
export const addExpense = async (expenseData) => {
  const response = await api.post('/expenses', expenseData);
  return response.data;
};

/**
 * Обновляет существующий расход
 * @param {string} id - идентификатор расхода
 * @param {Object} updates - новые данные
 * @returns {Promise<Object>} обновлённый расход
 */
export const updateExpense = async (id, updates) => {
  const response = await api.put(`/expenses/${id}`, updates);
  return response.data;
};

/**
 * Удаляет расход по ID
 * @param {string} id - идентификатор расхода
 * @returns {Promise<boolean>} true, если успешно
 */
export const deleteExpense = async (id) => {
  await api.delete(`/expenses/${id}`);
  return true;
};