import express from 'express';
import cors from 'cors';
import config from './config/index.js';
import incomesRouter from './routes/incomes.js';
import expensesRouter from './routes/expenses.js';
import summaryRouter from './routes/summary.js';
import authRouter from './routes/auth.js'; // Импорт роутов авторизации
import { authenticate } from './middleware/authMiddleware.js'; // Импорт middleware
import { errorHandler } from './middleware/errorHandler.js';

// Создаём Express-приложение
const app = express();

// Подключаем CORS для разрешения запросов с фронтенда
app.use(cors(config.cors));

// Парсер JSON для чтения тела запросов
app.use(express.json());

// Базовый эндпоинт для проверки работоспособности сервера (публичный)
app.get('/api/v1/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Salary Tracker API работает',
    timestamp: new Date().toISOString(),
  });
});

// Публичные роуты (авторизация не требуется)
app.use('/api/v1/auth', authRouter);

// Защищённые роуты (требуется валидный JWT токен)
app.use('/api/v1/incomes', authenticate, incomesRouter);
app.use('/api/v1/expenses', authenticate, expensesRouter);
app.use('/api/v1/summary', authenticate, summaryRouter);

// Обработчик для несуществующих маршрутов (404)
app.use((req, res, next) => {
  const error = new Error(`Маршрут не найден: ${req.method} ${req.originalUrl}`);
  error.statusCode = 404;
  error.errorCode = 'NOT_FOUND';
  next(error);
});

// Централизованный обработчик ошибок (должен быть последним middleware)
app.use(errorHandler);

export default app;