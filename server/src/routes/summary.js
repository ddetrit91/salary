import { Router } from 'express';
import * as summaryController from '../controllers/summaryController.js';

const router = Router();

/**
 * GET /api/v1/summary/balance
 * Получение общего баланса: доходы, расходы, разница
 */
router.get('/balance', summaryController.getBalance);

/**
 * GET /api/v1/summary/by-category
 * Получение распределения по категориям
 * Query: type - 'income' или 'expense' (по умолчанию 'expense')
 */
router.get('/by-category', summaryController.getByCategory);

/**
 * GET /api/v1/summary/by-month
 * Получение ежемесячной динамики доходов и расходов
 */
router.get('/by-month', summaryController.getByMonth);

export default router;