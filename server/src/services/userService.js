import db from '../db/connection.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import config from '../config/index.js';
import { initDatabase } from '../db/init.js';

// Секретный ключ для JWT
const JWT_SECRET = config.jwtSecret || 'super-secret-dev-key-change-me-in-production';

/**
 * Инициализация таблицы пользователей и служебных таблиц
 */
export const initUsersTable = async () => {
  return initDatabase();
};

/**
 * Проверка: разрешена ли регистрация новым пользователям
 */
export const isRegistrationAllowed = async () => {
  const row = await db.get(`SELECT value FROM settings WHERE key = 'allow_registration'`);
  return row ? row.value === 'true' : true;
};

/**
 * Регистрация нового пользователя (всегда с ролью 'user')
 */
export const register = async (username, password) => {
  const allowed = await isRegistrationAllowed();
  if (!allowed) {
    const error = new Error('Регистрация временно отключена администратором');
    error.statusCode = 403;
    error.errorCode = 'REGISTRATION_DISABLED';
    throw error;
  }

  const existingUser = await db.get('SELECT id FROM users WHERE username = ?', [username]);
  if (existingUser) {
    throw new Error('Пользователь с таким именем уже существует');
  }

  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(password, salt);
  const id = crypto.randomUUID();
  
  await db.run(
    'INSERT INTO users (id, username, password_hash, role) VALUES (?, ?, ?, ?)',
    [id, username, passwordHash, 'user']
  );
  
  return { id, username, role: 'user' };
};

/**
 * Авторизация пользователя (возвращает токен и данные с ролью)
 */
export const login = async (username, password) => {
  const user = await db.get('SELECT * FROM users WHERE username = ?', [username]);
  if (!user) {
    throw new Error('Неверное имя пользователя или пароль');
  }

  const isMatch = await bcrypt.compare(password, user.password_hash);
  if (!isMatch) {
    throw new Error('Неверное имя пользователя или пароль');
  }

  const token = jwt.sign(
    { userId: user.id, username: user.username },
    JWT_SECRET,
    { expiresIn: '7d' }
  );

  return { 
    token, 
    user: { 
      id: user.id, 
      username: user.username, 
      role: user.role || 'user',
    } 
  };
};

/**
 * Обновляет время последней активности пользователя
 */
export const touchLastActivity = async (userId) => {
  try {
    await db.run('UPDATE users SET last_activity = ? WHERE id = ?', [new Date().toISOString(), userId]);
  } catch (err) {
    console.error('Ошибка обновления активности:', err.message);
  }
};

/**
 * Записывает событие в журнал активности (посещение)
 */
export const logActivity = async (userId, method, path, ip) => {
  try {
    await db.run(
      'INSERT INTO activity_logs (id, user_id, method, path, ip, created_at) VALUES (?, ?, ?, ?, ?, ?)',
      [crypto.randomUUID(), userId, method, path, ip || null, new Date().toISOString()]
    );
  } catch (err) {
    console.error('Ошибка записи журнала активности:', err.message);
  }
};
/**
 * Сохраняет последний IP пользователя в таблице users.
 * Выполняется фоново (без await), чтобы не замедлять ответы API.
 */
export const touchLastIp = async (userId, ip) => {
  try {
    // Нормализация IPv6 в IPv4, если пришёл mapped-адрес типа ::ffff:192.168.1.1
    let cleanIp = ip;
    if (cleanIp && cleanIp.startsWith('::ffff:')) {
      cleanIp = cleanIp.substring(7);
    }

    // Валидация: только IPv4 и IPv6 (без пустых строк и мусора)
    const ipv4Regex = /^(?:(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d\d?)$/;
    const ipv6Regex = /^(?:[A-Fa-f0-9]{1,4}:){7}[A-Fa-f0-9]{1,4}$/;

    if (!cleanIp || !(ipv4Regex.test(cleanIp) || ipv6Regex.test(cleanIp))) {
      // IP невалиден или отсутствует — пропускаем запись
      return;
    }

    await db.run('UPDATE users SET last_ip = ? WHERE id = ?', [cleanIp, userId]);
  } catch (err) {
    console.error('Ошибка обновления IP:', err.message);
  }
};