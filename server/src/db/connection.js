import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import config from '../config/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Убеждаемся, что папка для базы данных существует
const dbDir = path.dirname(config.dbPath);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

// Создаём подключение к SQLite (файл будет создан автоматически, если не существует)
const db = new Database(config.dbPath);

// Включаем режим WAL для лучшей производительности при одновременных чтениях/записях
db.pragma('journal_mode = WAL');

// Применяем SQL-схему: создаём таблицы и индексы, если их ещё нет
const schemaPath = path.join(__dirname, 'schema.sql');
const schema = fs.readFileSync(schemaPath, 'utf-8');
db.exec(schema);

console.log('✅ База данных инициализирована:', config.dbPath);

export default db;