import app from './src/app.js';
import config from './src/config/index.js';
import { initUsersTable } from './src/services/userService.js';

// Инициализируем таблицу пользователей при старте сервера
initUsersTable();
console.log('✅ Таблица пользователей инициализирована');

// Запускаем сервер на указанном порту
const PORT = config.port;

app.listen(PORT, () => {
  console.log(`\n🚀 Сервер Salary Tracker запущен!`);
  console.log(`📍 Адрес: http://localhost:${PORT}`);
  console.log(`🔗 API: http://localhost:${PORT}/api/v1`);
  console.log(`💚 Health check: http://localhost:${PORT}/api/v1/health\n`);
});

// Обработка необработанных исключений
process.on('uncaughtException', (error) => {
  console.error('❌ Необработанное исключение:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Необработанный отказ промиса:', reason);
});