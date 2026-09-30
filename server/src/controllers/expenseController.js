import * as expenseService from '../services/expenseService.js';

/**
 * GET /api/v1/expenses
 * Получение списка расходов текущего пользователя
 */
export const getAll = (req, res, next) => {
  try {
    const result = expenseService.getAll(req.userId, req.query);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/expenses/:id
 * Получение расхода по ID (только если он принадлежит пользователю)
 */
export const getById = (req, res, next) => {
  try {
    const data = expenseService.getById(req.params.id, req.userId);
    if (!data) {
      const error = new Error('Расход не найден');
      error.statusCode = 404;
      error.errorCode = 'NOT_FOUND';
      throw error;
    }
    res.json({ data });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/v1/expenses
 * Создание нового расхода для текущего пользователя
 */
export const create = (req, res, next) => {
  try {
    const data = expenseService.create(req.userId, req.body);
    res.status(201).json({ data });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/v1/expenses/:id
 * Обновление расхода (только если он принадлежит пользователю)
 */
export const update = (req, res, next) => {
  try {
    const data = expenseService.update(req.params.id, req.userId, req.body);
    res.json({ data });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/v1/expenses/:id
 * Удаление расхода (только если он принадлежит пользователю)
 */
export const deleteExpense = (req, res, next) => {
  try {
    expenseService.deleteExpense(req.params.id, req.userId);
    res.status(204).send(); 
  } catch (error) {
    next(error);
  }
};