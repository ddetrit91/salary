import { Router } from 'express';
import * as controller from '../controllers/summaryController.js';

const router = Router();

/**
 * GET /api/v1/summary/balance
 * Получение баланса текущего пользователя
 */
router.get('/balance', controller.getBalance);

/**
 * GET /api/v1/summary/by-category
 * Получение статистики по категориям
 */
router.get('/by-category', controller.getByCategory);

/**
 * GET /api/v1/summary/by-month
 * Получение ежемесячной сводки
 */
router.get('/by-month', controller.getMonthlySummary);

export default router;