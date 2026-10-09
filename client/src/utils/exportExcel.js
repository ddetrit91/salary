import * as XLSX from 'xlsx';
import { INCOME_CATEGORIES, EXPENSE_CATEGORIES } from './constants';

/**
 * Название категории по id (для человекочитаемой колонки)
 */
const getCategoryLabel = (categoryId, type) => {
  const categories = type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
  const category = (categories || []).find((c) => c.id === categoryId);
  return category ? category.label : categoryId || 'Без категории';
};

/**
 * Дата в формате ДД.ММ.ГГГГ
 */
const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (isNaN(date)) return dateString;
  return date.toLocaleDateString('ru-RU');
};

/**
 * Экспортирует операции в настоящий Excel-файл (.xlsx) и скачивает его.
 * @param {Array} transactions - операции для выгрузки
 * @returns {boolean} true, если файл сформирован и скачан
 */
export const exportTransactionsToExcel = (transactions = []) => {
  if (!transactions || transactions.length === 0) return false;

  const rows = transactions.map((t) => ({
    'Дата': formatDate(t.date),
    'Тип': t.type === 'income' ? 'Доход' : 'Расход',
    'Категория': getCategoryLabel(t.category, t.type),
    // Сумма числом: расходы отрицательные — в Excel можно считать формулы
    'Сумма': t.type === 'income' ? (t.amount ?? 0) : -(t.amount ?? 0),
    'Комментарий': t.comment || '',
  }));

  const worksheet = XLSX.utils.json_to_sheet(rows);
  // Ширина колонок для аккуратного вида
  worksheet['!cols'] = [
    { wch: 12 }, // Дата
    { wch: 10 }, // Тип
    { wch: 20 }, // Категория
    { wch: 16 }, // Сумма
    { wch: 40 }, // Комментарий
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Операции');

  const dateStamp = new Date().toISOString().slice(0, 10);
  XLSX.writeFile(workbook, `salary-tracker-${dateStamp}.xlsx`);

  return true;
};