import * as adminService from '../services/adminService.js';

/**
 * GET /api/v1/admin/users
 * Список всех пользователей
 */
export const getUsers = async (req, res, next) => {
  try {
    const data = await adminService.getUsers();
    res.json({ data });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/v1/admin/users
 * Создание пользователя администратором
 * Body: { username, password, role }
 */
export const createUser = async (req, res, next) => {
  try {
    const { username, password, role } = req.body;
    const data = await adminService.createUser(username, password, role);
    res.status(201).json({ data });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/v1/admin/users/:id
 * Удаление пользователя (с защитами от удаления себя и последнего админа)
 */
export const deleteUser = async (req, res, next) => {
  try {
    await adminService.deleteUser(req.params.id, req.userId);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/v1/admin/users/:id/role
 * Смена роли пользователя
 * Body: { role }
 */
export const updateUserRole = async (req, res, next) => {
  try {
    const { role } = req.body;
    const data = await adminService.updateUserRole(req.params.id, role, req.userId);
    res.json({ data });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/v1/admin/users/:id/password
 * Сброс пароля пользователя
 * Body: { password }
 */
export const resetUserPassword = async (req, res, next) => {
  try {
    const { password } = req.body;
    await adminService.resetUserPassword(req.params.id, password);
    res.json({ data: { success: true } });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/admin/stats
 * Общая системная статистика
 */
export const getSystemStats = async (req, res, next) => {
  try {
    const data = await adminService.getSystemStats();
    res.json({ data });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/admin/activity
 * Статистика активности и последние события
 */
export const getActivityStats = async (req, res, next) => {
  try {
    const data = await adminService.getActivityStats();
    res.json({ data });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/admin/settings
 * Системные настройки
 */
export const getSettings = async (req, res, next) => {
  try {
    const data = await adminService.getSettings();
    res.json({ data });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/v1/admin/settings
 * Обновление системных настроек
 * Body: { allowRegistration }
 */
export const updateSettings = async (req, res, next) => {
  try {
    const { allowRegistration } = req.body;
    const data = await adminService.updateSettings({ allowRegistration });
    res.json({ data });
  } catch (error) {
    next(error);
  }
};