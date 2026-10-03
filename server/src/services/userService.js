import db from '../db/connection.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import config from '../config/index.js';

// Секретный ключ для JWT
const JWT_SECRET = config.jwtSecret || 'super-secret-dev-key-change-me-in-production';

/**
 * Инициализация таблицы пользователей и служебных таблиц
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

  // Миграция: добавляем колонки роли и последней активности, если их ещё нет
  const columns = db.prepare('PRAGMA table_info(users)').all().map((c) => c.name);
  if (!columns.includes('role')) {
    db.exec(`ALTER TABLE users ADD COLUMN role TEXT DEFAULT 'user'`);
  }
  if (!columns.includes('last_activity')) {
    db.exec(`ALTER TABLE users ADD COLUMN last_activity TEXT`);
  }

  // Журнал активности (для статистики посещаемости)
  db.exec(`
    CREATE TABLE IF NOT EXISTS activity_logs (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      method TEXT NOT NULL,
      path TEXT NOT NULL,
      ip TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  // Системные настройки (ключ-значение)
  db.exec(`
    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    )
  `);
  db.exec(`INSERT OR IGNORE INTO settings (key, value) VALUES ('allow_registration', 'true')`);

  // Создаём первого администратора, если админов ещё нет
  const adminExists = db.prepare(`SELECT id FROM users WHERE role = 'admin'`).get();
  if (!adminExists) {
    const adminUsername = process.env.ADMIN_USERNAME || 'admin';
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
    const passwordHash = bcrypt.hashSync(adminPassword, 10);
    db.prepare(`INSERT INTO users (id, username, password_hash, role) VALUES (?, ?, ?, 'admin')`)
      .run(crypto.randomUUID(), adminUsername, passwordHash);
    console.log(`⚠️  Создан администратор по умолчанию: ${adminUsername} / ${adminPassword}`);
    console.log(`⚠️  Обязательно смените пароль после первого входа!`);
  }
};

/**
 * Проверка: разрешена ли регистрация новым пользователям
 */
export const isRegistrationAllowed = () => {
  const row = db.prepare(`SELECT value FROM settings WHERE key = 'allow_registration'`).get();
  return row ? row.value === 'true' : true;
};

/**
 * Регистрация нового пользователя (всегда с ролью 'user')
 */
export const register = async (username, password) => {
  if (!isRegistrationAllowed()) {
    const error = new Error('Регистрация временно отключена администратором');
    error.statusCode = 403;
    error.errorCode = 'REGISTRATION_DISABLED';
    throw error;
  }

  const existingUser = db.prepare('SELECT id FROM users WHERE username = ?').get(username);
  if (existingUser) {
    throw new Error('Пользователь с таким именем уже существует');
  }

  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(password, salt);
  const id = crypto.randomUUID();
  
  db.prepare('INSERT INTO users (id, username, password_hash, role) VALUES (?, ?, ?, ?)')
    .run(id, username, passwordHash, 'user');
  
  return { id, username, role: 'user' };
};

/**
 * Авторизация пользователя (возвращает токен и данные с ролью)
 */
export const login = async (username, password) => {
  const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username);
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
      role: user.role || 'user', // Роль передаётся на фронтенд для интерфейса
    } 
  };
};

/**
 * Обновляет время последней активности пользователя
 */
export const touchLastActivity = (userId) => {
  db.prepare('UPDATE users SET last_activity = ? WHERE id = ?')
    .run(new Date().toISOString(), userId);
};

/**
 * Записывает событие в журнал активности (посещение)
 */
export const logActivity = (userId, method, path, ip) => {
  db.prepare('INSERT INTO activity_logs (id, user_id, method, path, ip, created_at) VALUES (?, ?, ?, ?, ?, ?)')
    .run(crypto.randomUUID(), userId, method, path, ip || null, new Date().toISOString());
};