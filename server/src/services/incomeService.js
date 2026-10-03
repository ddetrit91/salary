import db from '../db/connection.js';
import crypto from 'crypto';

// Вспомогательная функция для преобразования полей из snake_case в camelCase
const mapRowToCamelCase = (row) => {
  if (!row) return null;
  return {
    id: row.id,
    type: 'income',
    amount: row.amount,
    date: row.date,
    category: row.category,
    comment: row.comment,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
};

/**
 * Получает список доходов текущего пользователя с пагинацией и фильтрацией
 */
export const getAll = async (userId, filters = {}) => {
  const { page = 1, limit = 20, category, dateFrom, dateTo } = filters;
  const offset = (page - 1) * limit;

  let query = 'SELECT * FROM incomes WHERE user_id = ?';
  const params = [userId];

  if (category) {
    query += ' AND category = ?';
    params.push(category);
  }
  if (dateFrom) {
    query += ' AND date >= ?';
    params.push(dateFrom);
  }
  if (dateTo) {
    query += ' AND date <= ?';
    params.push(dateTo);
  }

  const countQuery = query.replace('SELECT *', 'SELECT COUNT(*) as count');
  const countRow = await db.get(countQuery, params);
  const count = countRow ? Number(countRow.count) : 0;

  query += ' ORDER BY date DESC, created_at DESC LIMIT ? OFFSET ?';
  params.push(Number(limit), Number(offset));

  const rows = await db.all(query, params);

  return {
    data: rows.map(mapRowToCamelCase),
    meta: {
      total: count,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(count / limit) || 1,
    },
  };
};

/**
 * Получает доход по ID (только если он принадлежит текущему пользователю)
 */
export const getById = async (id, userId) => {
  const row = await db.get('SELECT * FROM incomes WHERE id = ? AND user_id = ?', [id, userId]);
  return mapRowToCamelCase(row);
};

/**
 * Создаёт новый доход для текущего пользователя
 */
export const create = async (userId, incomeData) => {
  const { amount, date, category, comment } = incomeData;
  const id = crypto.randomUUID();
  const now = new Date().toISOString();

  await db.run(`
    INSERT INTO incomes (id, user_id, amount, date, category, comment, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `, [id, userId, Number(amount), date, category, comment || null, now, now]);

  return getById(id, userId);
};

/**
 * Обновляет существующий доход (только если он принадлежит текущему пользователю)
 */
export const update = async (id, userId, updates) => {
  const { amount, date, category, comment } = updates;
  const now = new Date().toISOString();

  const result = await db.run(`
    UPDATE incomes 
    SET amount = COALESCE(?, amount),
        date = COALESCE(?, date),
        category = COALESCE(?, category),
        comment = COALESCE(?, comment),
        updated_at = ?
    WHERE id = ? AND user_id = ?
  `, [
    amount !== undefined ? Number(amount) : null,
    date ?? null,
    category ?? null,
    comment !== undefined ? comment : null,
    now,
    id,
    userId,
  ]);

  if (result.changes === 0) {
    const error = new Error('Доход не найден или не принадлежит пользователю');
    error.statusCode = 404;
    error.errorCode = 'NOT_FOUND';
    throw error;
  }

  return getById(id, userId);
};

/**
 * Удаляет доход по ID (только если он принадлежит текущему пользователю)
 */
export const deleteIncome = async (id, userId) => {
  const result = await db.run('DELETE FROM incomes WHERE id = ? AND user_id = ?', [id, userId]);
  
  if (result.changes === 0) {
    const error = new Error('Доход не найден или не принадлежит пользователю');
    error.statusCode = 404;
    error.errorCode = 'NOT_FOUND';
    throw error;
  }

  return true;
};