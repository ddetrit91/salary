import { Router } from 'express';
import * as authController from '../controllers/authController.js';
import { authRateLimiter } from '../middleware/rateLimit.js';

const router = Router();

// Защита от брутфорса и спама
router.use(authRateLimiter);

/**
 * POST /api/v1/auth/register
 * Регистрация нового пользователя
 * Body: { username, password }
 */
router.post('/register', authController.register);

/**
 * POST /api/v1/auth/login
 * Авторизация пользователя
 * Body: { username, password }
 */
router.post('/login', authController.login);

export default router;