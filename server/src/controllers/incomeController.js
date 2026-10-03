import * as incomeService from '../services/incomeService.js';

/**
 * GET /api/v1/incomes
 * Получение списка доходов текущего пользователя
 */
export const getAll = async (req, res, next) => {
  try {
    const result = await incomeService.getAll(req.userId, req.query);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/incomes/:id
 * Получение дохода по ID (только если он принадлежит пользователю)
 */
export const getById = async (req, res, next) => {
  try {
    const data = await incomeService.getById(req.params.id, req.userId);
    if (!data) {
      const error = new Error('Доход не найден');
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
 * POST /api/v1/incomes
 * Создание нового дохода для текущего пользователя
 */
export const create = async (req, res, next) => {
  try {
    const data = await incomeService.create(req.userId, req.body);
    res.status(201).json({ data });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/v1/incomes/:id
 * Обновление дохода (только если он принадлежит пользователю)
 */
export const update = async (req, res, next) => {
  try {
    const data = await incomeService.update(req.params.id, req.userId, req.body);
    res.json({ data });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/v1/incomes/:id
 * Удаление дохода (только если он принадлежит пользователю)
 */
export const deleteIncome = async (req, res, next) => {
  try {
    await incomeService.deleteIncome(req.params.id, req.userId);
    res.status(204).send(); 
  } catch (error) {
    next(error);
  }
};