import * as summaryService from '../services/summaryService.js';

/**
 * Получает общий баланс: доходы, расходы, разница
 * GET /api/v1/summary/balance
 */
export const getBalance = (req, res, next) => {
  try {
    const balance = summaryService.getBalance();
    
    res.json({
      data: balance,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Получает распределение по категориям
 * GET /api/v1/summary/by-category?type=expense
 * Query: type - 'income' или 'expense' (по умолчанию 'expense')
 */
export const getByCategory = (req, res, next) => {
  try {
    const { type } = req.query;
    
    // Валидация типа
    if (type && type !== 'income' && type !== 'expense') {
      const error = new Error('Параметр "type" должен быть "income" или "expense"');
      error.statusCode = 400;
      error.errorCode = 'VALIDATION_ERROR';
      throw error;
    }
    
    const categoryData = summaryService.getByCategory(type || 'expense');
    
    res.json({
      data: categoryData,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Получает ежемесячную динамику доходов и расходов
 * GET /api/v1/summary/by-month
 */
export const getByMonth = (req, res, next) => {
  try {
    const monthlyData = summaryService.getByMonth();
    
    res.json({
      data: monthlyData,
    });
  } catch (error) {
    next(error);
  }
};