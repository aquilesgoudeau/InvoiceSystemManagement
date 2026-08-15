import * as SQLite from 'expo-sqlite';

const DATABASE_NAME = 'invoices.db';
const DATABASE_VERSION = 1;

let db = null;
let initPromise = null;

export function initDatabase() {
  if (!initPromise) {
    initPromise = (async () => {
      const database = await SQLite.openDatabaseAsync(DATABASE_NAME);
      await migrateDbIfNeeded(database);
      db = database;
      return db;
    })();
  }
  return initPromise;
}

async function migrateDbIfNeeded(database) {
  const result = await database.getFirstAsync('PRAGMA user_version');
  let currentVersion = result?.user_version ?? 0;

  if (currentVersion === 0) {
    await database.execAsync(`
      PRAGMA journal_mode = WAL;
      CREATE TABLE IF NOT EXISTS invoices (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        vendorName TEXT,
        abn TEXT,
        invoiceNumber TEXT,
        invoiceDate TEXT,
        currency TEXT,
        subtotal REAL,
        tax REAL,
        total REAL,
        items TEXT,
        createdAt TEXT DEFAULT (datetime('now'))
      );
    `);
    currentVersion = 1;
  }


  await database.execAsync(`PRAGMA user_version = ${currentVersion}`);
}

async function getDb() {
  if (db) return db;
  return initDatabase();
}

// Guarda una factura extraída por Gemini. Devuelve el id insertado.
export async function saveInvoice(invoice) {
  const database = await getDb();
  const {
    vendorName = null,
    abn = null,
    invoiceNumber = null,
    invoiceDate = null,
    currency = null,
    subtotal = null,
    tax = null,
    total = null,
    items = [],
  } = invoice;

  const result = await database.runAsync(
    `INSERT INTO invoices
      (vendorName, abn, invoiceNumber, invoiceDate, currency, subtotal, tax, total, items)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    vendorName,
    abn,
    invoiceNumber,
    invoiceDate,
    currency,
    subtotal,
    tax,
    total,
    JSON.stringify(items)
  );

  return result.lastInsertRowId;
}

// Devuelve todas las facturas guardadas, más recientes primero.
export async function getAllInvoices() {
  const database = await getDb();
  const rows = await database.getAllAsync('SELECT * FROM invoices ORDER BY createdAt DESC');

  return rows.map((row) => ({
    ...row,
    items: row.items ? JSON.parse(row.items) : [],
  }));
}

// Elimina una factura por id.
export async function deleteInvoice(id) {
  const database = await getDb();
  await database.runAsync('DELETE FROM invoices WHERE id = ?', id);
}

async function ensureSettingsTable(database) {
  await database.execAsync(`
    CREATE TABLE IF NOT EXISTS app_settings (
      key TEXT PRIMARY KEY,
      value TEXT
    );
  `);
}

export async function getSetting(key) {
  const database = await getDb();
  await ensureSettingsTable(database);
  const row = await database.getFirstAsync(
    'SELECT value FROM app_settings WHERE key = ?',
    key
  );
  return row?.value ?? null;
}

export async function setSetting(key, value) {
  const database = await getDb();
  await ensureSettingsTable(database);
  await database.runAsync(
    'INSERT OR REPLACE INTO app_settings (key, value) VALUES (?, ?)',
    key,
    value
  );
}

export const getLastReportEmail = () => getSetting('last_report_email');
export const saveLastReportEmail = (email) => setSetting('last_report_email', email);