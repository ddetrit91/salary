import { createClient } from '@libsql/client';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// Загрузка переменных окружения
dotenv.config();
dotenv.config({ path: path.resolve(process.cwd(), 'server/.env') });

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const parseArgs = () => {
  const args = process.argv.slice(2);
  const result = {};
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--url' && args[i + 1]) {
      result.url = args[++i];
    } else if (args[i] === '--token' && args[i + 1]) {
      result.token = args[++i];
    }
  }
  return result;
};

const cliArgs = parseArgs();
const tursoUrl = cliArgs.url || process.env.TURSO_DATABASE_URL;
const tursoToken = cliArgs.token || process.env.TURSO_AUTH_TOKEN;

if (!tursoUrl || tursoUrl.startsWith('file:')) {
  console.error('\n❌ Ошибка: не указан адрес базы данных Turso!');
  console.log('\nИспользование:');
  console.log('  node scripts/migrate-to-turso.js --url <TURSO_DATABASE_URL> --token <TURSO_AUTH_TOKEN>');
  process.exit(1);
}

const localDbPath = path.resolve(__dirname, '../server/data/database.sqlite');
if (!fs.existsSync(localDbPath)) {
  console.error(`❌ Локальный файл БД не найден: ${localDbPath}`);
  process.exit(1);
}

console.log('🚀 Начинаем миграцию данных в Turso...');
console.log(`📂 Источник (локальный SQLite): ${localDbPath}`);
console.log(`🌐 Цель (Turso): ${tursoUrl}`);

// Для чтения локального SQLite файла используем native better-sqlite3
const sqliteModule = await import('../server/node_modules/better-sqlite3/lib/database.js');
const BetterSqlite = sqliteModule.default;
const localDb = new BetterSqlite(localDbPath);

const hasLocalTable = (tableName) => {
  const row = localDb.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name=?").get(tableName);
  return Boolean(row);
};

// Подключение к облачной базе Turso
const tursoClient = createClient({ url: tursoUrl, authToken: tursoToken });

const migrate = async () => {
  try {
    // 1. Применяем схему к Turso
    console.log('\n1️⃣  Применяем схему таблиц к Turso...');
    const schemaPath = path.resolve(__dirname, '../server/src/db/schema.sql');
    const schemaSql = fs.readFileSync(schemaPath, 'utf-8');
    await tursoClient.executeMultiple(schemaSql);
    console.log('✅ Схема таблиц успешно создана/обновлена в Turso.');

    // 2. Миграция настроек (settings)
    console.log('\n2️⃣  Миграция системных настроек...');
    if (hasLocalTable('settings')) {
      const settings = localDb.prepare('SELECT key, value FROM settings').all();
      if (settings.length > 0) {
        const batch = settings.map((s) => ({
          sql: 'INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)',
          args: [s.key, s.value],
        }));
        await tursoClient.batch(batch, 'write');
      }
      console.log(`✅ Настройки перенесены: ${settings.length} записей`);
    } else {
      await tursoClient.execute("INSERT OR IGNORE INTO settings (key, value) VALUES ('allow_registration', 'true')");
      console.log('✅ Установлены настройки по умолчанию');
    }

    // 3. Миграция пользователей (users)
    console.log('\n3️⃣  Миграция пользователей...');
    if (hasLocalTable('users')) {
      const users = localDb.prepare('SELECT * FROM users').all();
      if (users.length > 0) {
        const batch = users.map((u) => ({
          sql: `INSERT OR REPLACE INTO users (id, username, password_hash, role, last_activity, created_at)
                VALUES (?, ?, ?, ?, ?, ?)`,
          args: [u.id, u.username, u.password_hash, u.role || 'user', u.last_activity || null, u.created_at || new Date().toISOString()],
        }));
        await tursoClient.batch(batch, 'write');
      }
      console.log(`✅ Пользователи перенесены: ${users.length} пользователей`);
    }

    // 4. Миграция доходов (incomes)
    console.log('\n4️⃣  Миграция доходов...');
    if (hasLocalTable('incomes')) {
      const incomes = localDb.prepare('SELECT * FROM incomes').all();
      if (incomes.length > 0) {
        for (let i = 0; i < incomes.length; i += 100) {
          const slice = incomes.slice(i, i + 100);
          const batch = slice.map((inc) => ({
            sql: `INSERT OR REPLACE INTO incomes (id, user_id, amount, date, category, comment, created_at, updated_at)
                  VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            args: [inc.id, inc.user_id || 'legacy', inc.amount, inc.date, inc.category, inc.comment || '', inc.created_at, inc.updated_at],
          }));
          await tursoClient.batch(batch, 'write');
        }
      }
      console.log(`✅ Доходы перенесены: ${incomes.length} записей`);
    }

    // 5. Миграция расходов (expenses)
    console.log('\n5️⃣  Миграция расходов...');
    if (hasLocalTable('expenses')) {
      const expenses = localDb.prepare('SELECT * FROM expenses').all();
      if (expenses.length > 0) {
        for (let i = 0; i < expenses.length; i += 100) {
          const slice = expenses.slice(i, i + 100);
          const batch = slice.map((exp) => ({
            sql: `INSERT OR REPLACE INTO expenses (id, user_id, amount, date, category, comment, is_recurring, created_at, updated_at)
                  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            args: [exp.id, exp.user_id || 'legacy', exp.amount, exp.date, exp.category, exp.comment || '', exp.is_recurring ? 1 : 0, exp.created_at, exp.updated_at],
          }));
          await tursoClient.batch(batch, 'write');
        }
      }
      console.log(`✅ Расходы перенесены: ${expenses.length} записей`);
    }

    // 6. Миграция журнала активности (activity_logs)
    console.log('\n6️⃣  Миграция журнала активности...');
    if (hasLocalTable('activity_logs')) {
      const logs = localDb.prepare('SELECT * FROM activity_logs').all();
      if (logs.length > 0) {
        for (let i = 0; i < logs.length; i += 100) {
          const slice = logs.slice(i, i + 100);
          const batch = slice.map((l) => ({
            sql: `INSERT OR REPLACE INTO activity_logs (id, user_id, method, path, ip, created_at)
                  VALUES (?, ?, ?, ?, ?, ?)`,
            args: [l.id, l.user_id, l.method, l.path, l.ip || null, l.created_at],
          }));
          await tursoClient.batch(batch, 'write');
        }
      }
      console.log(`✅ Журнал активности перенесён: ${logs.length} записей`);
    } else {
      console.log('ℹ️  Таблица activity_logs пуста или отсутствует, пропускаем.');
    }

    console.log('\n🎉 МИГРАЦИЯ УСПЕШНО ЗАВЕРШЕНА!');
    console.log('Все таблицы и данные перенесены в базу данных Turso.');
  } catch (error) {
    console.error('\n❌ Ошибка во время миграции:', error);
    process.exit(1);
  } finally {
    localDb.close();
  }
};

migrate();
