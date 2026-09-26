import { Router } from 'express';
import * as expenseController from '../controllers/expenseController.js';
import { validateTransaction, validateId, validatePagination } from '../middleware/validate.js';

const router = Router();

/**
 * GET /api/v1/expenses
 * Получение списка расходов с пагинацией и фильтрацией
 * Query: page, limit, category, dateFrom, dateTo, isRecurring
 */
router.get('/', validatePagination, expenseController.getAll);

/**
 * GET /api/v1/expenses/:id
 * Получение расхода по ID
 */
router.get('/:id', validateId, expenseController.getById);

/**
 * POST /api/v1/expenses
 * Создание нового расхода
 * Body: { amount, date, category, comment?, isRecurring? }
 */
router.post('/', validateTransaction('expense'), expenseController.create);

/**
 * PUT /api/v1/expenses/:id
 * Обновление существующего расхода
 * Body: { amount?, date?, category?, comment?, isRecurring? }
 */
router.put('/:id', validateId, validateTransaction('expense'), expenseController.update);

/**
 * DELETE /api/v1/expenses/:id
 * Удаление расхода по ID
 */
router.delete('/:id', validateId, expenseController.deleteExpense);

export default router;