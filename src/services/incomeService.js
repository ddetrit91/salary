import { getItem, setItem, generateId } from './storage';
import { STORAGE_KEYS } from '../utils/constants';

/**
 * Получает все доходы из хранилища
 * @returns {Array} массив доходов, отсортированный по дате (новые первыми)
 */
export const getIncomes = () => {
  const incomes = getItem(STORAGE_KEYS.INCOMES, []);
  // Сортируем по дате: новые сначала
  return (incomes || []).sort((a, b) => {
    return new Date(b.date) - new Date(a.date);
  });
};

/**
 * Получает доход по ID
 * @param {string} id - идентификатор дохода
 * @returns {Object|null} объект дохода или null, если не найден
 */
export const getIncomeById = (id) => {
  if (!id) return null;
  const incomes = getItem(STORAGE_KEYS.INCOMES, []);
  return (incomes || []).find((income) => income.id === id) || null;
};

/**
 * Добавляет новый доход в хранилище
 * @param {Object} incomeData - данные дохода (type, category, amount, date, comment)
 * @returns {Object|null} созданный доход с ID или null при ошибке
 */
export const addIncome = (incomeData) => {
  if (!incomeData) return null;
  
  const incomes = getItem(STORAGE_KEYS.INCOMES, []);
  
  // Создаём новый объект с уникальным ID и типом 'income'
  const newIncome = {
    id: generateId(),
    type: 'income',
    category: incomeData.category || 'other',
    amount: parseFloat(incomeData.amount) || 0,
    date: incomeData.date || new Date().toISOString().split('T')[0],
    comment: incomeData.comment?.trim() || '',
    createdAt: new Date().toISOString(),
  };
  
  const updatedIncomes = [...(incomes || []), newIncome];
  const success = setItem(STORAGE_KEYS.INCOMES, updatedIncomes);
  
  return success ? newIncome : null;
};

/**
 * Обновляет существующий доход
 * @param {string} id - идентификатор дохода
 * @param {Object} updates - новые данные для обновления
 * @returns {Object|null} обновлённый доход или null, если не найден
 */
export const updateIncome = (id, updates) => {
  if (!id || !updates) return null;
  
  const incomes = getItem(STORAGE_KEYS.INCOMES, []);
  const index = (incomes || []).findIndex((income) => income.id === id);
  
  if (index === -1) return null;
  
  // Обновляем только переданные поля
  const updatedIncome = {
    ...incomes[index],
    ...updates,
    id, // ID нельзя изменить
    type: 'income', // Тип фиксированный
    updatedAt: new Date().toISOString(),
  };
  
  const updatedIncomes = [...incomes];
  updatedIncomes[index] = updatedIncome;
  
  const success = setItem(STORAGE_KEYS.INCOMES, updatedIncomes);
  return success ? updatedIncome : null;
};

/**
 * Удаляет доход из хранилища
 * @param {string} id - идентификатор дохода
 * @returns {boolean} true, если удаление успешно
 */
export const deleteIncome = (id) => {
  if (!id) return false;
  
  const incomes = getItem(STORAGE_KEYS.INCOMES, []);
  const filteredIncomes = (incomes || []).filter((income) => income.id !== id);
  
  // Если ничего не изменилось — значит, доход не найден
  if (filteredIncomes.length === incomes.length) return false;
  
  return setItem(STORAGE_KEYS.INCOMES, filteredIncomes);
};