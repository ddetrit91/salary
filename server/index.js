import app from './src/app.js';
import config from './src/config/index.js';
import { initDatabase } from './src/db/init.js';

const startServer = async () => {
  try {
    // Инициализируем базу данных перед запуском сервера
    await initDatabase();

    const PORT = config.port;
    app.listen(PORT, () => {
      console.log(`\n🚀 Сервер Salary Tracker запущен!`);
      console.log(`📍 Адрес: http://localhost:${PORT}`);
      console.log(`🔗 API: http://localhost:${PORT}/api/v1`);
      console.log(`💚 Health check: http://localhost:${PORT}/api/v1/health\n`);
    });
  } catch (error) {
    console.error('❌ Ошибка запуска сервера:', error);
    process.exit(1);
  }
};

startServer();

// Обработка необработанных исключений
process.on('uncaughtException', (error) => {
  console.error('❌ Необработанное исключение:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Необработанный отказ промиса:', reason);
});