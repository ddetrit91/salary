import { api } from '../utils/api.js';

/**
 * Получает список доходов с пагинацией и фильтрацией
 * @param {Object} params - параметры запроса (page, limit, category, dateFrom, dateTo)
 * @returns {Promise<Array>} массив доходов
 */
export const getIncomes = async (params = {}) => {
  const queryParams = new URLSearchParams();
  if (params.page) queryParams.append('page', params.page);
  if (params.limit) queryParams.append('limit', params.limit);
  if (params.category) queryParams.append('category', params.category);
  if (params.dateFrom) queryParams.append('dateFrom', params.dateFrom);
  if (params.dateTo) queryParams.append('dateTo', params.dateTo);

  const queryString = queryParams.toString();
  const response = await api.get(`/incomes${queryString ? `?${queryString}` : ''}`);
  
  // Бэкенд возвращает { data: [...], meta: {...} }, мы извлекаем массив данных
  return response.data || [];
};

/**
 * Получает доход по ID
 * @param {string} id - идентификатор дохода
 * @returns {Promise<Object>} объект дохода
 */
export const getIncomeById = async (id) => {
  const response = await api.get(`/incomes/${id}`);
  return response.data;
};

/**
 * Добавляет новый доход
 * @param {Object} incomeData - данные дохода
 * @returns {Promise<Object>} созданный доход
 */
export const addIncome = async (incomeData) => {
  const response = await api.post('/incomes', incomeData);
  return response.data;
};

/**
 * Обновляет существующий доход
 * @param {string} id - идентификатор дохода
 * @param {Object} updates - новые данные
 * @returns {Promise<Object>} обновлённый доход
 */
export const updateIncome = async (id, updates) => {
  const response = await api.put(`/incomes/${id}`, updates);
  return response.data;
};

/**
 * Удаляет доход по ID
 * @param {string} id - идентификатор дохода
 * @returns {Promise<boolean>} true, если успешно
 */
export const deleteIncome = async (id) => {
  await api.delete(`/incomes/${id}`);
  return true;
};