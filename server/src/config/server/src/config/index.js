import path from 'path';
import { fileURLToPath } from 'url';

// Получаем директорию текущего модуля (аналог __dirname в CommonJS)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Конфигурация приложения
export const config = {
  // Порт, на котором будет работать сервер
  port: process.env.PORT || 3001,
  
  // Настройки CORS для разрешения запросов с фронтенда (Vite по умолчанию на 5173)
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  },

  // Путь к файлу базы данных SQLite
  // Файл будет создан автоматически в папке server/data при первом запуске
  dbPath: path.join(__dirname, '../../data/database.sqlite'),
};

export default config;