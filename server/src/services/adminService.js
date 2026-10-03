import db from '../db/connection.js';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

// ---------- Вспомогательные функции ----------

// Получить пользователя по ID
const getUserById = async (id) =>
  db.get('SELECT id, username, role, created_at, last_activity FROM users WHERE id = ?', [id]);

// Количество администраторов в системе
const countAdmins = async () => {
  const row = await db.get(`SELECT COUNT(*) AS count FROM users WHERE role = 'admin'`);
  return row ? Number(row.count) : 0;
};

// Преобразование строки БД в camelCase для фронтенда
const mapUser = (row) => row && {
  id: row.id,
  username: row.username,
  role: row.role || 'user',
  createdAt: row.created_at,
  lastActivity: row.last_activity,
  incomesCount: Number(row.incomes_count || 0),
  expensesCount: Number(row.expenses_count || 0),
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

// Ошибка 400
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
export const getUsers = async () => {
  const rows = await db.all(`
    SELECT u.id, u.username, u.role, u.created_at, u.last_activity,
      (SELECT COUNT(*) FROM incomes i WHERE i.user_id = u.id) AS incomes_count,
      (SELECT COUNT(*) FROM expenses e WHERE e.user_id = u.id) AS expenses_count
    FROM users u
    ORDER BY u.created_at
  `);
  return rows.map(mapUser);
};

/**
 * Создание пользователя администратором
 */
export const createUser = async (username, password, role = 'user') => {
  assertUsername(username);
  assertPassword(password);
  assertRole(role);

  const existing = await db.get('SELECT id FROM users WHERE username = ?', [username.trim()]);
  if (existing) {
    const error = new Error('Пользователь с таким именем уже существует');
    error.statusCode = 409;
    error.errorCode = 'CONFLICT';
    throw error;
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const id = crypto.randomUUID();
  await db.run(
    'INSERT INTO users (id, username, password_hash, role) VALUES (?, ?, ?, ?)',
    [id, username.trim(), passwordHash, role]
  );

  const created = await getUserById(id);
  return mapUser(created);
};

/**
 * Удаление пользователя вместе со всеми его данными.
 * Защиты: нельзя удалить себя и последнего администратора.
 */
export const deleteUser = async (targetId, currentAdminId) => {
  const target = await getUserById(targetId);
  if (!target) throw notFoundError();

  if (target.id === currentAdminId) {
    throw badRequestError('Нельзя удалить собственный аккаунт');
  }

  const totalAdmins = await countAdmins();
  if (target.role === 'admin' && totalAdmins <= 1) {
    throw badRequestError('Нельзя удалить последнего администратора');
  }

  // Атомарное каскадное удаление через пакетный запрос Turso/libsql
  await db.batch([
    { sql: 'DELETE FROM incomes WHERE user_id = ?', args: [target.id] },
    { sql: 'DELETE FROM expenses WHERE user_id = ?', args: [target.id] },
    { sql: 'DELETE FROM activity_logs WHERE user_id = ?', args: [target.id] },
    { sql: 'DELETE FROM users WHERE id = ?', args: [target.id] },
  ], 'write');

  return true;
};

/**
 * Смена роли пользователя.
 * Защиты: нельзя менять свою роль и разжаловать последнего админа.
 */
export const updateUserRole = async (targetId, newRole, currentAdminId) => {
  assertRole(newRole);
  const target = await getUserById(targetId);
  if (!target) throw notFoundError();

  if (target.id === currentAdminId) {
    throw badRequestError('Нельзя изменить собственную роль');
  }

  const totalAdmins = await countAdmins();
  if (target.role === 'admin' && newRole === 'user' && totalAdmins <= 1) {
    throw badRequestError('Нельзя лишить прав последнего администратора');
  }

  await db.run('UPDATE users SET role = ? WHERE id = ?', [newRole, target.id]);
  const updated = await getUserById(target.id);
  return mapUser(updated);
};

/**
 * Сброс пароля пользователя администратором
 */
export const resetUserPassword = async (targetId, newPassword) => {
  assertPassword(newPassword);
  const target = await getUserById(targetId);
  if (!target) throw notFoundError();

  const passwordHash = await bcrypt.hash(newPassword, 10);
  await db.run('UPDATE users SET password_hash = ? WHERE id = ?', [passwordHash, target.id]);
  return true;
};

// ---------- Статистика и активность ----------

/**
 * Общая системная статистика
 */
export const getSystemStats = async () => {
  const usersRow = await db.get('SELECT COUNT(*) AS count FROM users');
  const usersTotal = usersRow ? Number(usersRow.count) : 0;
  const adminsTotal = await countAdmins();

  const activeTodayRow = await db.get(`SELECT COUNT(*) AS count FROM users WHERE date(last_activity) = date('now')`);
  const activeToday = activeTodayRow ? Number(activeTodayRow.count) : 0;

  const requestsTodayRow = await db.get(`SELECT COUNT(*) AS count FROM activity_logs WHERE date(created_at) = date('now')`);
  const requestsToday = requestsTodayRow ? Number(requestsTodayRow.count) : 0;

  const incomes = await db.get('SELECT COUNT(*) AS count, COALESCE(SUM(amount), 0) AS total FROM incomes');
  const expenses = await db.get('SELECT COUNT(*) AS count, COALESCE(SUM(amount), 0) AS total FROM expenses');

  const registrationsPerDay = await db.all(`
    SELECT date(created_at) AS day, COUNT(*) AS count 
    FROM users GROUP BY day ORDER BY day DESC LIMIT 7
  `);

  const requestsPerDay = await db.all(`
    SELECT date(created_at) AS day, COUNT(*) AS count 
    FROM activity_logs GROUP BY day ORDER BY day DESC LIMIT 7
  `);

  return {
    usersTotal,
    adminsTotal,
    activeToday,
    requestsToday,
    incomesCount: incomes ? Number(incomes.count) : 0,
    incomesTotal: incomes ? Number(incomes.total) : 0,
    expensesCount: expenses ? Number(expenses.count) : 0,
    expensesTotal: expenses ? Number(expenses.total) : 0,
    registrationsPerDay: registrationsPerDay.map((r) => ({ day: r.day, count: Number(r.count) })),
    requestsPerDay: requestsPerDay.map((r) => ({ day: r.day, count: Number(r.count) })),
  };
};

/**
 * Статистика активности: по пользователям и последние события
 */
export const getActivityStats = async () => {
  const perUser = await db.all(`
    SELECT u.id, u.username, u.role, u.last_activity, COUNT(a.id) AS requests_count
    FROM users u
    LEFT JOIN activity_logs a ON a.user_id = u.id
    GROUP BY u.id
    ORDER BY requests_count DESC
  `);

  const recentEvents = await db.all(`
    SELECT a.method, a.path, a.created_at, u.username
    FROM activity_logs a
    JOIN users u ON u.id = a.user_id
    ORDER BY a.created_at DESC
    LIMIT 50
  `);

  return {
    perUser: perUser.map((u) => ({ ...u, requests_count: Number(u.requests_count) })),
    recentEvents,
  };
};

// ---------- Настройки ----------

/**
 * Получить системные настройки
 */
export const getSettings = async () => {
  const row = await db.get(`SELECT value FROM settings WHERE key = 'allow_registration'`);
  return { allowRegistration: row ? row.value === 'true' : true };
};

/**
 * Обновить системные настройки
 */
export const updateSettings = async ({ allowRegistration }) => {
  if (typeof allowRegistration === 'boolean') {
    await db.run(`
      INSERT INTO settings (key, value) VALUES ('allow_registration', ?)
      ON CONFLICT(key) DO UPDATE SET value = excluded.value
    `, [String(allowRegistration)]);
  }
  return getSettings();
};