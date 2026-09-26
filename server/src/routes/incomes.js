import { Router } from 'express';
import * as incomeController from '../controllers/incomeController.js';
import { validateTransaction, validateId, validatePagination } from '../middleware/validate.js';

const router = Router();

/**
 * GET /api/v1/incomes
 * Получение списка доходов с пагинацией и фильтрацией
 * Query: page, limit, category, dateFrom, dateTo
 */
router.get('/', validatePagination, incomeController.getAll);

/**
 * GET /api/v1/incomes/:id
 * Получение дохода по ID
 */
router.get('/:id', validateId, incomeController.getById);

/**
 * POST /api/v1/incomes
 * Создание нового дохода
 * Body: { amount, date, category, comment? }
 */
router.post('/', validateTransaction('income'), incomeController.create);

/**
 * PUT /api/v1/incomes/:id
 * Обновление существующего дохода
 * Body: { amount?, date?, category?, comment? }
 */
router.put('/:id', validateId, validateTransaction('income'), incomeController.update);

/**
 * DELETE /api/v1/incomes/:id
 * Удаление дохода по ID
 */
router.delete('/:id', validateId, incomeController.deleteIncome);

export default router;