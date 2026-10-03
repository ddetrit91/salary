import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// Загружаем переменные окружения (.env)
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const localDbPath = path.resolve(__dirname, '../../data/database.sqlite');

export const config = {
  // Порт сервера
  port: process.env.PORT || 3001,

  // JWT секрет
  jwtSecret: process.env.JWT_SECRET || 'super-secret-dev-key-change-me-in-production',

  // Настройки Turso / SQLite
  // Если задан TURSO_DATABASE_URL — используем удаленный Turso (libsql://...)
  // Иначе используем локальный файл SQLite
  turso: {
    url: process.env.TURSO_DATABASE_URL || `file:${localDbPath}`,
    authToken: process.env.TURSO_AUTH_TOKEN || '',
  },

  // Настройки CORS: поддерживаем localhost и любые Vercel домены
  cors: {
    origin: process.env.CORS_ORIGIN 
      ? (process.env.CORS_ORIGIN.includes(',') ? process.env.CORS_ORIGIN.split(',') : process.env.CORS_ORIGIN)
      : true,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  },

  // Локальный путь к SQLite (для миграций и резервной копии)
  dbPath: localDbPath,
};

export default config;