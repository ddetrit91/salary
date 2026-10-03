import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import db from './connection.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let isInitialized = false;
let initPromise = null;

/**
 * Инициализирует схему базы данных и стандартные записи (настройки, админа)
 */
export const initDatabase = async () => {
  if (isInitialized) return;
  if (initPromise) return initPromise;

  initPromise = (async () => {
    try {
      // 1. Применяем SQL схему
      const schemaPath = path.join(__dirname, 'schema.sql');
      const schema = fs.readFileSync(schemaPath, 'utf-8');
      await db.exec(schema);

      // 2. Проверяем / мигрируем колонки users (на случай старой БД)
      try {
        const columnsRes = await db.all('PRAGMA table_info(users)');
        const colNames = columnsRes.map((c) => c.name);
        if (!colNames.includes('role')) {
          await db.exec(`ALTER TABLE users ADD COLUMN role TEXT DEFAULT 'user'`);
        }
        if (!colNames.includes('last_activity')) {
          await db.exec(`ALTER TABLE users ADD COLUMN last_activity TEXT`);
        }
      } catch (e) {
        // Игнорируем ошибки PRAGMA, если не поддерживается
      }

      // 3. Добавляем колонку user_id в incomes и expenses, если их там ещё нет
      try {
        const incomeCols = (await db.all('PRAGMA table_info(incomes)')).map((c) => c.name);
        if (!incomeCols.includes('user_id')) {
          await db.exec(`ALTER TABLE incomes ADD COLUMN user_id TEXT`);
        }
      } catch (e) {}

      try {
        const expenseCols = (await db.all('PRAGMA table_info(expenses)')).map((c) => c.name);
        if (!expenseCols.includes('user_id')) {
          await db.exec(`ALTER TABLE expenses ADD COLUMN user_id TEXT`);
        }
      } catch (e) {}

      // 4. Добавляем стандартные настройки
      await db.run(
        `INSERT OR IGNORE INTO settings (key, value) VALUES ('allow_registration', 'true')`
      );

      // 5. Создаём первого администратора, если в системе ещё нет админов
      const adminExists = await db.get(`SELECT id FROM users WHERE role = 'admin' LIMIT 1`);
      if (!adminExists) {
        const adminUsername = process.env.ADMIN_USERNAME || 'admin';
        const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
        const passwordHash = await bcrypt.hash(adminPassword, 10);
        await db.run(
          `INSERT INTO users (id, username, password_hash, role) VALUES (?, ?, ?, 'admin')`,
          [crypto.randomUUID(), adminUsername, passwordHash]
        );
        console.log(`⚠️  Создан администратор по умолчанию: ${adminUsername} / ${adminPassword}`);
      }

      isInitialized = true;
      console.log('✅ База данных успешно инициализирована');
    } catch (err) {
      console.error('❌ Ошибка инициализации базы данных:', err);
      throw err;
    } finally {
      initPromise = null;
    }
  })();

  return initPromise;
};

export default initDatabase;
