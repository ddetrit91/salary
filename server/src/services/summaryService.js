import db from '../db/connection.js';
import { INCOME_CATEGORIES, EXPENSE_CATEGORIES } from '../utils/categories.js';

/**
 * Получает общий баланс: сумма доходов, сумма расходов и разница
 * @returns {Object} { totalIncome, totalExpense, balance }
 */
export const getBalance = () => {
  // Сумма всех доходов
  const incomeResult = db.prepare('SELECT COALESCE(SUM(amount), 0) as total FROM incomes').get();
  const totalIncome = incomeResult.total;

  // Сумма всех расходов
  const expenseResult = db.prepare('SELECT COALESCE(SUM(amount), 0) as total FROM expenses').get();
  const totalExpense = expenseResult.total;

  return {
    totalIncome,
    totalExpense,
    balance: totalIncome - totalExpense,
  };
};

/**
 * Получает суммы по категориям для указанного типа операции
 * @param {string} type - 'income' или 'expense' (по умолчанию 'expense')
 * @returns {Array} массив объектов { name, value, color } для графиков
 */
export const getByCategory = (type = 'expense') => {
  const tableName = type === 'income' ? 'incomes' : 'expenses';
  const categories = type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  // SQL-запрос для группировки по категориям
  const query = `
    SELECT category, SUM(amount) as total
    FROM ${tableName}
    GROUP BY category
    ORDER BY total DESC
  `;

  const rows = db.prepare(query).all();

  // Цветовая палитра для секторов диаграммы
  const colors = [
    '#4361ee', '#3a0ca3', '#7209b7', '#f72585', '#4cc9f0',
    '#4895ef', '#560bad', '#b5179e', '#f77f00', '#06ffa5',
  ];

  // Преобразуем результаты в формат для графика
  return rows.map((row, index) => {
    const categoryInfo = categories.find(c => c.id === row.category);
    return {
      name: categoryInfo?.label || row.category,
      value: row.total,
      color: colors[index % colors.length],
    };
  });
};

/**
 * Получает ежемесячную сводку доходов и расходов
 * @returns {Array} массив объектов { month, income, expense } для столбчатого графика
 */
export const getByMonth = () => {
  // Получаем доходы по месяцам
  const incomeQuery = `
    SELECT 
      strftime('%Y-%m', date) as month_key,
      SUM(amount) as total
    FROM incomes
    GROUP BY month_key
    ORDER BY month_key
  `;
  const incomeRows = db.prepare(incomeQuery).all();

  // Получаем расходы по месяцам
  const expenseQuery = `
    SELECT 
      strftime('%Y-%m', date) as month_key,
      SUM(amount) as total
    FROM expenses
    GROUP BY month_key
    ORDER BY month_key
  `;
  const expenseRows = db.prepare(expenseQuery).all();

  // Объединяем результаты в единую карту
  const monthMap = {};

  // Заполняем данные по доходам
  incomeRows.forEach(row => {
    if (!monthMap[row.month_key]) {
      monthMap[row.month_key] = { month: row.month_key, income: 0, expense: 0 };
    }
    monthMap[row.month_key].income = row.total;
  });

  // Заполняем данные по расходам
  expenseRows.forEach(row => {
    if (!monthMap[row.month_key]) {
      monthMap[row.month_key] = { month: row.month_key, income: 0, expense: 0 };
    }
    monthMap[row.month_key].expense = row.total;
  });

  // Преобразуем в массив и форматируем месяц в читаемый вид
  const result = Object.values(monthMap)
    .sort((a, b) => a.month.localeCompare(b.month))
    .map(item => {
      // Парсим месяц (формат YYYY-MM)
      const [year, monthNum] = item.month.split('-');
      const monthNames = [
        'Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн',
        'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек'
      ];
      const monthName = monthNames[parseInt(monthNum, 10) - 1] || item.month;
      
      return {
        month: `${monthName} ${year}`,
        income: item.income,
        expense: item.expense,
      };
    });

  return result;
};