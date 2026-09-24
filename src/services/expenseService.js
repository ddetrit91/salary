import { getItem, setItem, generateId } from './storage';
import { STORAGE_KEYS } from '../utils/constants';

/**
 * Получает все расходы из хранилища
 * @returns {Array} массив расходов, отсортированный по дате (новые первыми)
 */
export const getExpenses = () => {
  const expenses = getItem(STORAGE_KEYS.EXPENSES, []);
  // Сортируем по дате: новые сначала
  return (expenses || []).sort((a, b) => {
    return new Date(b.date) - new Date(a.date);
  });
};

/**
 * Получает расход по ID
 * @param {string} id - идентификатор расхода
 * @returns {Object|null} объект расхода или null, если не найден
 */
export const getExpenseById = (id) => {
  if (!id) return null;
  const expenses = getItem(STORAGE_KEYS.EXPENSES, []);
  return (expenses || []).find((expense) => expense.id === id) || null;
};

/**
 * Добавляет новый расход в хранилище
 * @param {Object} expenseData - данные расхода (type, category, amount, date, comment)
 * @returns {Object|null} созданный расход с ID или null при ошибке
 */
export const addExpense = (expenseData) => {
  if (!expenseData) return null;
  
  const expenses = getItem(STORAGE_KEYS.EXPENSES, []);
  
  // Создаём новый объект с уникальным ID и типом 'expense'
  const newExpense = {
    id: generateId(),
    type: 'expense',
    category: expenseData.category || 'other',
    amount: parseFloat(expenseData.amount) || 0,
    date: expenseData.date || new Date().toISOString().split('T')[0],
    comment: expenseData.comment?.trim() || '',
    createdAt: new Date().toISOString(),
  };
  
  const updatedExpenses = [...(expenses || []), newExpense];
  const success = setItem(STORAGE_KEYS.EXPENSES, updatedExpenses);
  
  return success ? newExpense : null;
};

/**
 * Обновляет существующий расход
 * @param {string} id - идентификатор расхода
 * @param {Object} updates - новые данные для обновления
 * @returns {Object|null} обновлённый расход или null, если не найден
 */
export const updateExpense = (id, updates) => {
  if (!id || !updates) return null;
  
  const expenses = getItem(STORAGE_KEYS.EXPENSES, []);
  const index = (expenses || []).findIndex((expense) => expense.id === id);
  
  if (index === -1) return null;
  
  // Обновляем только переданные поля
  const updatedExpense = {
    ...expenses[index],
    ...updates,
    id, // ID нельзя изменить
    type: 'expense', // Тип фиксированный
    updatedAt: new Date().toISOString(),
  };
  
  const updatedExpenses = [...expenses];
  updatedExpenses[index] = updatedExpense;
  
  const success = setItem(STORAGE_KEYS.EXPENSES, updatedExpenses);
  return success ? updatedExpense : null;
};

/**
 * Удаляет расход из хранилища
 * @param {string} id - идентификатор расхода
 * @returns {boolean} true, если удаление успешно
 */
export const deleteExpense = (id) => {
  if (!id) return false;
  
  const expenses = getItem(STORAGE_KEYS.EXPENSES, []);
  const filteredExpenses = (expenses || []).filter((expense) => expense.id !== id);
  
  // Если ничего не изменилось — значит, расход не найден
  if (filteredExpenses.length === expenses.length) return false;
  
  return setItem(STORAGE_KEYS.EXPENSES, filteredExpenses);
};