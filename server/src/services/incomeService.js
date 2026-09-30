import db from '../db/connection.js';
import crypto from 'crypto';

// Инициализация таблицы с полем user_id
const initTable = () => {
  db.exec(`
    CREATE TABLE IF NOT EXISTS incomes (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      amount REAL NOT NULL,
      date TEXT NOT NULL,
      category TEXT NOT NULL,
      comment TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);
};

// Вызываем инициализацию при импорте модуля
initTable();

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
 * @param {string} userId - ID текущего пользователя
 * @param {Object} filters - параметры фильтрации (page, limit, category, dateFrom, dateTo)
 * @returns {Object} { data: [...], meta: { total, page, limit, totalPages } }
 */
export const getAll = (userId, filters = {}) => {
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

  // Получаем общее количество записей для пагинации
  const countQuery = query.replace('SELECT *', 'SELECT COUNT(*) as count');
  const { count } = db.prepare(countQuery).get(...params);

  // Добавляем сортировку и пагинацию
  query += ' ORDER BY date DESC, created_at DESC LIMIT ? OFFSET ?';
  params.push(limit, offset);

  const rows = db.prepare(query).all(...params);

  return {
    data: rows.map(mapRowToCamelCase),
    meta: {
      total: count,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(count / limit),
    },
  };
};

/**
 * Получает доход по ID (только если он принадлежит текущему пользователю)
 * @param {string} id - идентификатор дохода
 * @param {string} userId - ID текущего пользователя
 * @returns {Object} объект дохода
 */
export const getById = (id, userId) => {
  const row = db.prepare('SELECT * FROM incomes WHERE id = ? AND user_id = ?').get(id, userId);
  return mapRowToCamelCase(row);
};

/**
 * Создаёт новый доход для текущего пользователя
 * @param {string} userId - ID текущего пользователя
 * @param {Object} incomeData - данные дохода
 * @returns {Object} созданный доход
 */
export const create = (userId, incomeData) => {
  const { amount, date, category, comment } = incomeData;
  const id = crypto.randomUUID();
  const now = new Date().toISOString();

  db.prepare(`
    INSERT INTO incomes (id, user_id, amount, date, category, comment, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(id, userId, amount, date, category, comment || null, now, now);

  return getById(id, userId);
};

/**
 * Обновляет существующий доход (только если он принадлежит текущему пользователю)
 * @param {string} id - идентификатор дохода
 * @param {string} userId - ID текущего пользователя
 * @param {Object} updates - новые данные
 * @returns {Object} обновлённый доход
 */
export const update = (id, userId, updates) => {
  const { amount, date, category, comment } = updates;
  const now = new Date().toISOString();

  const result = db.prepare(`
    UPDATE incomes 
    SET amount = COALESCE(?, amount),
        date = COALESCE(?, date),
        category = COALESCE(?, category),
        comment = COALESCE(?, comment),
        updated_at = ?
    WHERE id = ? AND user_id = ?
  `).run(
    amount ?? null,
    date ?? null,
    category ?? null,
    comment !== undefined ? comment : null,
    now,
    id,
    userId
  );

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
 * @param {string} id - идентификатор дохода
 * @param {string} userId - ID текущего пользователя
 * @returns {boolean} true, если успешно удалён
 */
export const deleteIncome = (id, userId) => {
  const result = db.prepare('DELETE FROM incomes WHERE id = ? AND user_id = ?').run(id, userId);
  
  if (result.changes === 0) {
    const error = new Error('Доход не найден или не принадлежит пользователю');
    error.statusCode = 404;
    error.errorCode = 'NOT_FOUND';
    throw error;
  }

  return true;
};