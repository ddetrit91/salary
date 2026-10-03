import * as summaryService from '../services/summaryService.js';

/**
 * GET /api/v1/summary/balance
 * Получение баланса текущего пользователя
 */
export const getBalance = async (req, res, next) => {
  try {
    const data = await summaryService.getBalance(req.userId);
    res.json({ data });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/summary/by-category
 * Получение статистики по категориям для текущего пользователя
 */
export const getByCategory = async (req, res, next) => {
  try {
    const { type } = req.query;
    const data = await summaryService.getByCategory(req.userId, type);
    res.json({ data });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/summary/by-month
 * Получение ежемесячной сводки для текущего пользователя
 */
export const getMonthlySummary = async (req, res, next) => {
  try {
    const data = await summaryService.getMonthlySummary(req.userId);
    res.json({ data });
  } catch (error) {
    next(error);
  }
};