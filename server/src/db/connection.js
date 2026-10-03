import { createClient } from '@libsql/client';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import config from '../config/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Если используется локальный файл SQLite, убеждаемся, что директория существует
if (config.turso.url.startsWith('file:')) {
  const filePath = config.turso.url.replace(/^file:/, '');
  const dbDir = path.dirname(filePath);
  if (!fs.existsSync(dbDir)) {
    try {
      fs.mkdirSync(dbDir, { recursive: true });
    } catch (e) {
      // Игнорируем ошибки создания директории в read-only окружениях
    }
  }
}

// Создаём клиент libSQL (работает и с Turso облаком, и с локальным файлом)
export const client = createClient({
  url: config.turso.url,
  authToken: config.turso.authToken,
});

/**
 * Обертка с удобным промис-ориентированным API
 */
export const db = {
  client,

  /**
   * Получить одну строку или null
   */
  get: async (sql, args = []) => {
    const res = await client.execute({ sql, args });
    return res.rows.length > 0 ? res.rows[0] : null;
  },

  /**
   * Получить массив строк
   */
  all: async (sql, args = []) => {
    const res = await client.execute({ sql, args });
    return res.rows;
  },

  /**
   * Выполнить INSERT / UPDATE / DELETE
   */
  run: async (sql, args = []) => {
    const res = await client.execute({ sql, args });
    return {
      changes: res.rowsAffected,
      lastInsertRowid: res.lastInsertRowid,
    };
  },

  /**
   * Выполнить несколько SQL инструкций (например, схему)
   */
  exec: async (sql) => {
    return client.executeMultiple(sql);
  },

  /**
   * Пакетное атомарное выполнение нескольких запросов
   */
  batch: async (statements, mode = 'write') => {
    return client.batch(statements, mode);
  },
};

export default db;