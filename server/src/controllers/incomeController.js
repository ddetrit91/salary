import * as incomeService from '../services/incomeService.js';

/**
 * Получает список доходов с пагинацией и фильтрацией
 * GET /api/v1/incomes?page=1&limit=20&category=salary&dateFrom=2024-01-01&dateTo=2024-12-31
 */
export const getAll = (req, res, next) => {
  try {
    const { page, limit, category, dateFrom, dateTo } = req.query;
    
    const result = incomeService.getAll({
      page,
      limit,
      category,
      dateFrom,
      dateTo,
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
 * Получает доход по ID
 * GET /api/v1/incomes/:id
 */
export const getById = (req, res, next) => {
  try {
    const { id } = req.params;
    const income = incomeService.getById(id);
    
    res.json({
      data: income,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Создаёт новый доход
 * POST /api/v1/incomes
 * Body: { amount, date, category, comment? }
 */
export const create = (req, res, next) => {
  try {
    const { amount, date, category, comment } = req.body;
    
    const newIncome = incomeService.create({
      amount,
      date,
      category,
      comment,
    });

    res.status(201).json({
      data: newIncome,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Обновляет существующий доход
 * PUT /api/v1/incomes/:id
 * Body: { amount?, date?, category?, comment? }
 */
export const update = (req, res, next) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    const updatedIncome = incomeService.update(id, updates);

    res.json({
      data: updatedIncome,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Удаляет доход по ID
 * DELETE /api/v1/incomes/:id
 */
export const deleteIncome = (req, res, next) => {
  try {
    const { id } = req.params;
    
    incomeService.deleteIncome(id);

    res.status(204).send();
  } catch (error) {
    next(error);
  }
};