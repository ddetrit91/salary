import * as expenseService from '../services/expenseService.js';

/**
 * Получает список расходов с пагинацией и фильтрацией
 * GET /api/v1/expenses?page=1&limit=20&category=groceries&dateFrom=2024-01-01&dateTo=2024-12-31&isRecurring=true
 */
export const getAll = (req, res, next) => {
  try {
    const { page, limit, category, dateFrom, dateTo, isRecurring } = req.query;
    
    // Преобразуем isRecurring из строки в boolean
    let isRecurringBool;
    if (isRecurring !== undefined) {
      isRecurringBool = isRecurring === 'true' || isRecurring === '1';
    }
    
    const result = expenseService.getAll({
      page,
      limit,
      category,
      dateFrom,
      dateTo,
      isRecurring: isRecurringBool,
    });

    // Формат ответа с мета-информацией о пагинации
    res.json({
      data: result.data,
      meta: {
        total: result.total,
        page: result.page,
        limit: result.limit,
        totalPages: Math.ceil(result.total / result.limit),
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Получает расход по ID
 * GET /api/v1/expenses/:id
 */
export const getById = (req, res, next) => {
  try {
    const { id } = req.params;
    const expense = expenseService.getById(id);
    
    res.json({
      data: expense,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Создаёт новый расход
 * POST /api/v1/expenses
 * Body: { amount, date, category, comment?, isRecurring? }
 */
export const create = (req, res, next) => {
  try {
    const { amount, date, category, comment, isRecurring } = req.body;
    
    const newExpense = expenseService.create({
      amount,
      date,
      category,
      comment,
      isRecurring,
    });

    res.status(201).json({
      data: newExpense,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Обновляет существующий расход
 * PUT /api/v1/expenses/:id
 * Body: { amount?, date?, category?, comment?, isRecurring? }
 */
export const update = (req, res, next) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    // Преобразуем isRecurring из строки в boolean, если он передан
    if (updates.isRecurring !== undefined && typeof updates.isRecurring === 'string') {
      updates.isRecurring = updates.isRecurring === 'true' || updates.isRecurring === '1';
    }
    
    const updatedExpense = expenseService.update(id, updates);

    res.json({
      data: updatedExpense,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Удаляет расход по ID
 * DELETE /api/v1/expenses/:id
 */
export const deleteExpense = (req, res, next) => {
  try {
    const { id } = req.params;
    
    expenseService.deleteExpense(id);

    res.status(204).send();
  } catch (error) {
    next(error);
  }
};