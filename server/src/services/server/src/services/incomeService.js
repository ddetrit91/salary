import db from '../db/connection.js';
import { NotFoundError } from '../middleware/errorHandler.js';
import crypto from 'crypto';

// Вспомогательная функция для преобразования полей из snake_case в camelCase
const mapRowToCamelCase = (row) => {
  if (!row) return null;
  return {
    id: row.id,
    amount: row.amount,
    date: row.date,
    category: row.category,
    comment: row.comment,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
};

/**
 * Получает список доходов с пагинацией и фильтрацией
 * @param {Object} options - опции запроса
 * @param {number} options.page - номер страницы (по умолчанию 1)
 * @param {number} options.limit - количество записей на странице (по умолчанию 20)
 * @param {string} options.category - фильтр по категории (опционально)
 * @param {string} options.dateFrom - фильтр по дате "от" (YYYY-MM-DD, опционально)
 * @param {string} options.dateTo - фильтр по дате "до" (YYYY-MM-DD, опционально)
 * @returns {Object} { data: Array, total: number, page: number, limit: number }
 */
export const getAll = ({ page = 1, limit = 20, category, dateFrom, dateTo } = {}) => {
  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
  const offset = (pageNum - 1) * limitNum;

  // Строим динамический WHERE-блок
  const conditions = [];
  const params = [];

  if (category) {
    conditions.push('category = ?');
    params.push(category);
  }
  if (dateFrom) {
    conditions.push('date >= ?');
    params.push(dateFrom);
  }
  if (dateTo) {
    conditions.push('date <= ?');
    params.push(dateTo);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  // Получаем общее количество записей для пагинации
  const countQuery = `SELECT COUNT(*) as total FROM incomes ${whereClause}`;
  const { total } = db.prepare(countQuery).get(...params);

  // Получаем данные с пагинацией
  const dataQuery = `
    SELECT * FROM incomes 
    ${whereClause}
    ORDER BY date DESC, created_at DESC
    LIMIT ? OFFSET ?
  `;
  const rows = db.prepare(dataQuery).all(...params, limitNum, offset);

  return {
    data: rows.map(mapRowToCamelCase),
    total,
    page: pageNum,
    limit: limitNum,
  };
};

/**
 * Получает доход по ID
 * @param {string} id - идентификатор дохода
 * @returns {Object} объект дохода в camelCase
 * @throws {NotFoundError} если доход не найден
 */
export const getById = (id) => {
  const row = db.prepare('SELECT * FROM incomes WHERE id = ?').get(id);
  if (!row) {
    throw new NotFoundError(`Доход с ID "${id}" не найден`);
  }
  return mapRowToCamelCase(row);
};

/**
 * Создаёт новый доход
 * @param {Object} data - данные дохода
 * @param {number} data.amount - сумма (должна быть > 0)
 * @param {string} data.date - дата в формате YYYY-MM-DD
 * @param {string} data.category - категория
 * @param {string} data.comment - комментарий (опционально)
 * @returns {Object} созданный доход в camelCase
 */
export const create = ({ amount, date, category, comment = '' }) => {
  const id = crypto.randomUUID();
  const now = new Date().toISOString();

  const stmt = db.prepare(`
    INSERT INTO incomes (id, amount, date, category, comment, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  stmt.run(id, amount, date, category, comment, now, now);

  return getById(id);
};

/**
 * Обновляет существующий доход
 * @param {string} id - идентификатор дохода
 * @param {Object} data - новые данные (только переданные поля будут обновлены)
 * @returns {Object} обновлённый доход в camelCase
 * @throws {NotFoundError} если доход не найден
 */
export const update = (id, data) => {
  // Проверяем, что доход существует
  const existing = db.prepare('SELECT * FROM incomes WHERE id = ?').get(id);
  if (!existing) {
    throw new NotFoundError(`Доход с ID "${id}" не найден`);
  }

  const now = new Date().toISOString();
  const updates = [];
  const params = [];

  // Собираем только переданные поля для обновления
  if (data.amount !== undefined) {
    updates.push('amount = ?');
    params.push(data.amount);
  }
  if (data.date !== undefined) {
    updates.push('date = ?');
    params.push(data.date);
  }
  if (data.category !== undefined) {
    updates.push('category = ?');
    params.push(data.category);
  }
  if (data.comment !== undefined) {
    updates.push('comment = ?');
    params.push(data.comment);
  }

  // Если нет полей для обновления — просто возвращаем существующую запись
  if (updates.length === 0) {
    return mapRowToCamelCase(existing);
  }

  updates.push('updated_at = ?');
  params.push(now);
  params.push(id);

  const query = `UPDATE incomes SET ${updates.join(', ')} WHERE id = ?`;
  db.prepare(query).run(...params);

  return getById(id);
};

/**
 * Удаляет доход по ID
 * @param {string} id - идентификатор дохода
 * @returns {boolean} true, если удаление успешно
 * @throws {NotFoundError} если доход не найден
 */
export const deleteIncome = (id) => {
  const result = db.prepare('DELETE FROM incomes WHERE id = ?').run(id);
  if (result.changes === 0) {
    throw new NotFoundError(`Доход с ID "${id}" не найден`);
  }
  return true;
};