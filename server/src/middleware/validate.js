import { ValidationError } from './errorHandler.js';
import { getAllIncomeCategoryIds, getAllExpenseCategoryIds } from '../utils/categories.js';

// Регулярное выражение для проверки формата даты YYYY-MM-DD
const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

// Функция для проверки валидности даты
const isValidDate = (dateString) => {
  if (!DATE_REGEX.test(dateString)) return false;
  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date.getTime());
};

// Middleware для валидации транзакции (дохода или расхода)
// type: 'income' или 'expense'
export const validateTransaction = (type) => {
  return (req, res, next) => {
    const { amount, date, category, comment } = req.body;

    // Проверка amount
    if (amount === undefined || amount === null) {
      throw new ValidationError('Поле "amount" обязательно');
    }
    const numAmount = Number(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      throw new ValidationError('Поле "amount" должно быть положительным числом');
    }

    // Проверка date
    if (!date) {
      throw new ValidationError('Поле "date" обязательно');
    }
    if (!isValidDate(date)) {
      throw new ValidationError('Поле "date" должно быть в формате YYYY-MM-DD');
    }

    // Проверка category
    if (!category) {
      throw new ValidationError('Поле "category" обязательно');
    }
    
    // Получаем список допустимых категорий для указанного типа
    const validCategories = type === 'income' 
      ? getAllIncomeCategoryIds() 
      : getAllExpenseCategoryIds();
    
    if (!validCategories.includes(category)) {
      throw new ValidationError(
        `Недопустимая категория "${category}". Допустимые значения: ${validCategories.join(', ')}`
      );
    }

    // Проверка comment (опциональное поле, но если есть — должно быть строкой)
    if (comment !== undefined && typeof comment !== 'string') {
      throw new ValidationError('Поле "comment" должно быть строкой');
    }

    // Если всё ок — передаём управление дальше
    next();
  };
};

// Middleware для валидации ID в параметрах маршрута
export const validateId = (req, res, next) => {
  const { id } = req.params;
  if (!id || typeof id !== 'string' || id.trim() === '') {
    throw new ValidationError('Некорректный ID');
  }
  next();
};

// Middleware для валидации query-параметров пагинации
export const validatePagination = (req, res, next) => {
  const { page, limit } = req.query;

  if (page !== undefined) {
    const pageNum = parseInt(page, 10);
    if (isNaN(pageNum) || pageNum < 1) {
      throw new ValidationError('Параметр "page" должен быть положительным числом');
    }
  }

  if (limit !== undefined) {
    const limitNum = parseInt(limit, 10);
    if (isNaN(limitNum) || limitNum < 1 || limitNum > 1000) {
      throw new ValidationError('Параметр "limit" должен быть числом от 1 до 1000');
    }
  }

  next();
};