import db from '../db/connection.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import config from '../config/index.js';

// Секретный ключ для JWT (берём из конфига или используем запасной для разработки)
const JWT_SECRET = config.jwtSecret || 'super-secret-dev-key-change-me-in-production';

/**
 * Инициализация таблицы пользователей (вызывается один раз при старте сервера)
 */
export const initUsersTable = () => {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);
};

/**
 * Регистрация нового пользователя
 * @param {string} username - имя пользователя
 * @param {string} password - пароль в открытом виде
 * @returns {Object} { id, username }
 */
export const register = async (username, password) => {
  // Проверяем, не занят ли логин
  const existingUser = db.prepare('SELECT id FROM users WHERE username = ?').get(username);
  if (existingUser) {
    throw new Error('Пользователь с таким именем уже существует');
  }

  // Хешируем пароль
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(password, salt);
  const id = crypto.randomUUID();
  
  // Сохраняем в БД
  db.prepare('INSERT INTO users (id, username, password_hash) VALUES (?, ?, ?)').run(id, username, passwordHash);
  
  return { id, username };
};

/**
 * Авторизация пользователя
 * @param {string} username - имя пользователя
 * @param {string} password - пароль в открытом виде
 * @returns {Object} { token, user: { id, username } }
 */
export const login = async (username, password) => {
  // Ищем пользователя по имени
  const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username);
  if (!user) {
    throw new Error('Неверное имя пользователя или пароль');
  }

  // Сравниваем хеши паролей
  const isMatch = await bcrypt.compare(password, user.password_hash);
  if (!isMatch) {
    throw new Error('Неверное имя пользователя или пароль');
  }

  // Генерируем JWT токен (действует 7 дней)
  const token = jwt.sign(
    { userId: user.id, username: user.username },
    JWT_SECRET,
    { expiresIn: '7d' }
  );

  return { 
    token, 
    user: { id: user.id, username: user.username } 
  };
};