import db from '../db/connection.js';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

// ---------- Вспомогательные функции ----------

// Получить пользователя по ID
const getUserById = (id) =>
  db.prepare('SELECT id, username, role, created_at, last_activity FROM users WHERE id = ?').get(id);

// Количество администраторов в системе
const countAdmins = () =>
  db.prepare(`SELECT COUNT(*) AS count FROM users WHERE role = 'admin'`).get().count;

// Преобразование строки БД в camelCase для фронтенда
const mapUser = (row) => row && {
  id: row.id,
  username: row.username,
  role: row.role || 'user',
  createdAt: row.created_at,
  lastActivity: row.last_activity,
  incomesCount: row.incomes_count,
  expensesCount: row.expenses_count,
};

// Проверка допустимости роли
const assertRole = (role) => {
  if (role !== 'admin' && role !== 'user') {
    const error = new Error('Недопустимая роль. Разрешены: user, admin');
    error.statusCode = 400;
    error.errorCode = 'VALIDATION_ERROR';
    throw error;
  }
};

// Проверка надёжности пароля
const assertPassword = (password) => {
  if (!password || password.length < 6) {
    const error = new Error('Пароль должен содержать минимум 6 символов');
    error.statusCode = 400;
    error.errorCode = 'VALIDATION_ERROR';
    throw error;
  }
};

// Проверка имени пользователя
const assertUsername = (username) => {
  if (!username || username.trim().length < 3) {
    const error = new Error('Имя пользователя должно содержать минимум 3 символа');
    error.statusCode = 400;
    error.errorCode = 'VALIDATION_ERROR';
    throw error;
  }
};

// Ошибка 404
const notFoundError = (message = 'Пользователь не найден') => {
  const error = new Error(message);
  error.statusCode = 404;
  error.errorCode = 'NOT_FOUND';
  return error;
};

// Ошибка 400 с自定义 сообщением
const badRequestError = (message) => {
  const error = new Error(message);
  error.statusCode = 400;
  error.errorCode = 'BAD_REQUEST';
  return error;
};

// ---------- Управление пользователями ----------

/**
 * Список всех пользователей с ролями и статистикой операций
 */
export const getUsers = () => {
  const rows = db.prepare(`
    SELECT u.id, u.username, u.role, u.created_at, u.last_activity,
      (SELECT COUNT(*) FROM incomes i WHERE i.user_id = u.id) AS incomes_count,
      (SELECT COUNT(*) FROM expenses e WHERE e.user_id = u.id) AS expenses_count
    FROM users u
    ORDER BY u.created_at
  `).all();
  return rows.map(mapUser);
};

/**
 * Создание пользователя администратором
 */
export const createUser = async (username, password, role = 'user') => {
  assertUsername(username);
  assertPassword(password);
  assertRole(role);

  const existing = db.prepare('SELECT id FROM users WHERE username = ?').get(username);
  if (existing) {
    const error = new Error('Пользователь с таким именем уже существует');
    error.statusCode = 409;
    error.errorCode = 'CONFLICT';
    throw error;
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const id = crypto.randomUUID();
  db.prepare('INSERT INTO users (id, username, password_hash, role) VALUES (?, ?, ?, ?)')
    .run(id, username.trim(), passwordHash, role);

  return mapUser(getUserById(id));
};

/**
 * Удаление пользователя вместе со всеми его данными.
 * Защиты: нельзя удалить себя и последнего администратора.
 */
export const deleteUser = (targetId, currentAdminId) => {
  const target = getUserById(targetId);
  if (!target) throw notFoundError();

  if (target.id === currentAdminId) {
    throw badRequestError('Нельзя удалить собственный аккаунт');
  }
  if (target.role === 'admin' && countAdmins() <= 1) {
    throw badRequestError('Нельзя удалить последнего администратора');
  }

  // Удаляем пользователя и все связанные данные одной транзакцией
  const deleteWithCascade = db.transaction((id) => {
    db.prepare('DELETE FROM incomes WHERE user_id = ?').run(id);
    db.prepare('DELETE FROM expenses WHERE user_id = ?').run(id);
    db.prepare('DELETE FROM activity_logs WHERE user_id = ?').run(id);
    db.prepare('DELETE FROM users WHERE id = ?').run(id);
  });
  deleteWithCascade(target.id);

  return true;
};

/**
 * Смена роли пользователя.
 * Защиты: нельзя менять свою роль и разжаловать последнего админа.
 */
export const updateUserRole = (targetId, newRole, currentAdminId) => {
  assertRole(newRole);
  const target = getUserById(targetId);
  if (!target) throw notFoundError();

  if (target.id === currentAdminId) {
    throw badRequestError('Нельзя изменить собственную роль');
  }
  if (target.role === 'admin' && newRole === 'user' && countAdmins() <= 1) {
    throw badRequestError('Нельзя лишить прав последнего администратора');
  }

  db.prepare('UPDATE users SET role = ? WHERE id = ?').run(newRole, target.id);
  return mapUser(getUserById(target.id));
};

/**
 * Сброс пароля пользователя администратором
 */
export const resetUserPassword = async (targetId, newPassword) => {
  assertPassword(newPassword);
  const target = getUserById(targetId);
  if (!target) throw notFoundError();

  const passwordHash = await bcrypt.hash(newPassword, 10);
  db.prepare('UPDATE users SET password_hash = ? WHERE id = ?').run(passwordHash, target.id);
  return true;
};

// ---------- Статистика и активность ----------

/**
 * Общая системная статистика
 */
export const getSystemStats = () => {
  const usersTotal = db.prepare('SELECT COUNT(*) AS count FROM users').get().count;
  const adminsTotal = countAdmins();
  const activeToday = db.prepare(`SELECT COUNT(*) AS count FROM users WHERE date(last_activity) = date('now')`).get().count;
  const requestsToday = db.prepare(`SELECT COUNT(*) AS count FROM activity_logs WHERE date(created_at) = date('now')`).get().count;

  const incomes = db.prepare('SELECT COUNT(*) AS count, COALESCE(SUM(amount), 0) AS total FROM incomes').get();
  const expenses = db.prepare('SELECT COUNT(*) AS count, COALESCE(SUM(amount), 0) AS total FROM expenses').get();

  const registrationsPerDay = db.prepare(`
    SELECT date(created_at) AS day, COUNT(*) AS count 
    FROM users GROUP BY day ORDER BY day DESC LIMIT 7
  `).all();

  const requestsPerDay = db.prepare(`
    SELECT date(created_at) AS day, COUNT(*) AS count 
    FROM activity_logs GROUP BY day ORDER BY day DESC LIMIT 7
  `).all();

  return {
    usersTotal,
    adminsTotal,
    activeToday,
    requestsToday,
    incomesCount: incomes.count,
    incomesTotal: incomes.total,
    expensesCount: expenses.count,
    expensesTotal: expenses.total,
    registrationsPerDay,
    requestsPerDay,
  };
};

/**
 * Статистика активности: по пользователям и последние события
 */
export const getActivityStats = () => {
  const perUser = db.prepare(`
    SELECT u.id, u.username, u.role, u.last_activity, COUNT(a.id) AS requests_count
    FROM users u
    LEFT JOIN activity_logs a ON a.user_id = u.id
    GROUP BY u.id
    ORDER BY requests_count DESC
  `).all();

  const recentEvents = db.prepare(`
    SELECT a.method, a.path, a.created_at, u.username
    FROM activity_logs a
    JOIN users u ON u.id = a.user_id
    ORDER BY a.created_at DESC
    LIMIT 50
  `).all();

  return { perUser, recentEvents };
};

// ---------- Настройки ----------

/**
 * Получить системные настройки
 */
export const getSettings = () => {
  const row = db.prepare(`SELECT value FROM settings WHERE key = 'allow_registration'`).get();
  return { allowRegistration: row ? row.value === 'true' : true };
};

/**
 * Обновить системные настройки
 */
export const updateSettings = ({ allowRegistration }) => {
  if (typeof allowRegistration === 'boolean') {
    db.prepare(`
      INSERT INTO settings (key, value) VALUES ('allow_registration', ?)
      ON CONFLICT(key) DO UPDATE SET value = excluded.value
    `).run(String(allowRegistration));
  }
  return getSettings();
};