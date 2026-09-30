import * as summaryService from '../services/summaryService.js';

/**
 * GET /api/v1/summary/balance
 * Получение баланса текущего пользователя
 */
export const getBalance = (req, res, next) => {
  try {
    const data = summaryService.getBalance(req.userId);
    res.json({ data });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/summary/by-category
 * Получение статистики по категориям для текущего пользователя
 */
export const getByCategory = (req, res, next) => {
  try {
    // Получаем тип операции из query-параметров (по умолчанию 'expense')
    const { type } = req.query;
    const data = summaryService.getByCategory(req.userId, type);
    res.json({ data });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/summary/by-month
 * Получение ежемесячной сводки для текущего пользователя
 */
export const getMonthlySummary = (req, res, next) => {
  try {
    const data = summaryService.getMonthlySummary(req.userId);
    res.json({ data });
  } catch (error) {
    next(error);
  }
};