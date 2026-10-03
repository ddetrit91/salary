import { Router } from 'express';
import * as adminController from '../controllers/adminController.js';
import { authenticate } from '../middleware/authMiddleware.js';
import { requireAdmin } from '../middleware/adminMiddleware.js';

const router = Router();

// ГЛОБАЛЬНАЯ ЗАЩИТА ВСЕХ АДМИН-МАРШРУТОВ:
// 1) authenticate — проверяет JWT-токен И существование пользователя в базе,
//    читает его текущую роль из БД, пишет активность в журнал.
// 2) requireAdmin — пропускает ТОЛЬКО роль 'admin', иначе 403 Forbidden.
// Без прохождения обоих шагов ни один маршрут ниже недоступен.
router.use(authenticate, requireAdmin);

// ---------- Пользователи ----------

/**
 * GET /api/v1/admin/users
 * Список всех пользователей
 */
router.get('/users', adminController.getUsers);

/**
 * POST /api/v1/admin/users
 * Создание пользователя
 * Body: { username, password, role }
 */
router.post('/users', adminController.createUser);

/**
 * DELETE /api/v1/admin/users/:id
 * Удаление пользователя
 */
router.delete('/users/:id', adminController.deleteUser);

/**
 * PUT /api/v1/admin/users/:id/role
 * Смена роли пользователя
 * Body: { role }
 */
router.put('/users/:id/role', adminController.updateUserRole);

/**
 * PUT /api/v1/admin/users/:id/password
 * Сброс пароля пользователя
 * Body: { password }
 */
router.put('/users/:id/password', adminController.resetUserPassword);

// ---------- Статистика и активность ----------

/**
 * GET /api/v1/admin/stats
 * Общая системная статистика
 */
router.get('/stats', adminController.getSystemStats);

/**
 * GET /api/v1/admin/activity
 * Активность пользователей и последние события
 */
router.get('/activity', adminController.getActivityStats);

// ---------- Настройки ----------

/**
 * GET /api/v1/admin/settings
 * Системные настройки
 */
router.get('/settings', adminController.getSettings);

/**
 * PUT /api/v1/admin/settings
 * Обновление настроек
 * Body: { allowRegistration }
 */
router.put('/settings', adminController.updateSettings);

export default router;