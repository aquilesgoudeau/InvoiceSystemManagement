describe('Database SQLite Integration Tests', () => {
  let db;

  beforeEach(() => {
    jest.resetModules();
    db = require('../../src/db/database');
    jest.clearAllMocks();

    // Default mock implementation of getFirstAsync to avoid query collisions
    global.mockDb.getFirstAsync.mockImplementation(async (query) => {
      if (query.includes('PRAGMA user_version')) {
        return { user_version: 1 };
      }
      return null;
    });
  });

  describe('initDatabase & Migrations', () => {
    it('should initialize and run migrations on user_version = 0', async () => {
      // Simulate database user_version = 0
      global.mockDb.getFirstAsync.mockImplementation(async (query) => {
        if (query.includes('PRAGMA user_version')) {
          return { user_version: 0 };
        }
        return null;
      });

      const databaseInstance = await db.initDatabase();

      expect(databaseInstance).toBe(global.mockDb);
      expect(global.mockDb.getFirstAsync).toHaveBeenCalledWith('PRAGMA user_version');
      expect(global.mockDb.execAsync).toHaveBeenCalledWith(expect.stringContaining('CREATE TABLE IF NOT EXISTS invoices'));
    });

    it('should skip migrations on user_version = 1', async () => {
      // Simulate database user_version = 1
      global.mockDb.getFirstAsync.mockImplementation(async (query) => {
        if (query.includes('PRAGMA user_version')) {
          return { user_version: 1 };
        }
        return null;
      });

      await db.initDatabase();

      // execAsync should only run for user_version settings, not tables recreating
      expect(global.mockDb.execAsync).toHaveBeenCalledWith('PRAGMA user_version = 1');
    });

    it('should default to version 0 when PRAGMA user_version returns no row at all', async () => {
      // Different from the "user_version = 0" test above: here the query
      // itself returns null/undefined (e.g. a brand new file), exercising
      // the `result?.user_version ?? 0` fallback rather than an explicit 0.
      global.mockDb.getFirstAsync.mockImplementation(async (query) => {
        if (query.includes('PRAGMA user_version')) {
          return null;
        }
        return null;
      });

      await db.initDatabase();

      expect(global.mockDb.execAsync).toHaveBeenCalledWith(
        expect.stringContaining('CREATE TABLE IF NOT EXISTS invoices')
      );
    });
  });

  describe('getDb connection caching', () => {
    it('reuses the existing connection instead of opening a new one on later calls', async () => {
      const SQLite = require('expo-sqlite');

      await db.initDatabase();
      expect(SQLite.openDatabaseAsync).toHaveBeenCalledTimes(1);

      // saveInvoice() internally calls getDb(), which should now hit the
      // `if (db) return db` cached branch instead of reconnecting.
      global.mockDb.runAsync.mockResolvedValueOnce({ lastInsertRowId: 1 });
      await db.saveInvoice({ vendorName: 'Test Vendor' });

      expect(SQLite.openDatabaseAsync).toHaveBeenCalledTimes(1);
    });
  });

  describe('saveInvoice', () => {
    it('should insert invoice into the database and return the insert row id', async () => {
      global.mockDb.runAsync.mockResolvedValueOnce({ lastInsertRowId: 42 });

      const invoiceData = {
        vendorName: 'Woolworths',
        abn: '12 345 678 901',
        invoiceNumber: 'INV-1022',
        invoiceDate: '2026-08-15',
        currency: 'AUD',
        subtotal: 100.0,
        tax: 10.0,
        total: 110.0,
        items: [{ description: 'Milk', quantity: 2, amount: 100.0 }],
      };

      const resultId = await db.saveInvoice(invoiceData);

      expect(resultId).toBe(42);
      expect(global.mockDb.runAsync).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO invoices'),
        'Woolworths',
        '12 345 678 901',
        'INV-1022',
        '2026-08-15',
        'AUD',
        100.0,
        10.0,
        110.0,
        JSON.stringify(invoiceData.items)
      );
    });

    it('should fall back to null/[] defaults when optional fields are missing', async () => {
      global.mockDb.runAsync.mockResolvedValueOnce({ lastInsertRowId: 7 });

      const resultId = await db.saveInvoice({ vendorName: 'Only Vendor' });

      expect(resultId).toBe(7);
      expect(global.mockDb.runAsync).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO invoices'),
        'Only Vendor',
        null, // abn
        null, // invoiceNumber
        null, // invoiceDate
        null, // currency
        null, // subtotal
        null, // tax
        null, // total
        JSON.stringify([]) // items defaults to an empty array
      );
    });
  });

  describe('getAllInvoices', () => {
    it('should query and parse saved invoices correctly', async () => {
      const mockRows = [
        {
          id: 1,
          vendorName: 'Coles',
          total: 50.0,
          items: JSON.stringify([{ description: 'Bread', amount: 50.0 }]),
          createdAt: '2026-08-15 12:00:00',
        },
      ];
      global.mockDb.getAllAsync.mockResolvedValueOnce(mockRows);

      const invoices = await db.getAllInvoices();

      expect(invoices).toHaveLength(1);
      expect(invoices[0].vendorName).toBe('Coles');
      expect(invoices[0].items).toEqual([{ description: 'Bread', amount: 50.0 }]);
    });

    it('should return empty list when no invoices in database', async () => {
      global.mockDb.getAllAsync.mockResolvedValueOnce([]);

      const invoices = await db.getAllInvoices();
      expect(invoices).toEqual([]);
    });

    it('should default items to an empty array when the stored value is falsy', async () => {
      const mockRows = [
        { id: 2, vendorName: 'NoItemsVendor', total: 20, items: null, createdAt: '2026-08-16' },
      ];
      global.mockDb.getAllAsync.mockResolvedValueOnce(mockRows);

      const invoices = await db.getAllInvoices();

      expect(invoices[0].items).toEqual([]);
    });
  });

  describe('deleteInvoice', () => {
    it('should trigger delete statement with proper row id', async () => {
      await db.deleteInvoice(5);
      expect(global.mockDb.runAsync).toHaveBeenCalledWith('DELETE FROM invoices WHERE id = ?', 5);
    });
  });

  describe('Settings', () => {
    it('should fetch and save settings keys correctly', async () => {
      // getSetting
      global.mockDb.getFirstAsync.mockImplementation(async (query) => {
        if (query.includes('PRAGMA user_version')) {
          return { user_version: 1 };
        }
        if (query.includes('SELECT value FROM app_settings')) {
          return { value: 'hello@test.com' };
        }
        return null;
      });

      const email = await db.getSetting('some_key');
      expect(email).toBe('hello@test.com');

      // setSetting
      await db.setSetting('some_key', 'new@test.com');
      expect(global.mockDb.runAsync).toHaveBeenCalledWith(
        expect.stringContaining('INSERT OR REPLACE INTO app_settings'),
        'some_key',
        'new@test.com'
      );
    });

    it('should return null when the requested setting key does not exist', async () => {
      global.mockDb.getFirstAsync.mockImplementation(async (query) => {
        if (query.includes('PRAGMA user_version')) {
          return { user_version: 1 };
        }
        if (query.includes('SELECT value FROM app_settings')) {
          return null; // no row for this key
        }
        return null;
      });

      const value = await db.getSetting('nonexistent_key');
      expect(value).toBeNull();
    });

    it('should support email helper methods', async () => {
      global.mockDb.getFirstAsync.mockImplementation(async (query) => {
        if (query.includes('PRAGMA user_version')) {
          return { user_version: 1 };
        }
        if (query.includes('SELECT value FROM app_settings')) {
          return { value: 'test@admin.com' };
        }
        return null;
      });

      const lastEmail = await db.getLastReportEmail();
      expect(lastEmail).toBe('test@admin.com');

      await db.saveLastReportEmail('another@admin.com');
      expect(global.mockDb.runAsync).toHaveBeenCalledWith(
        expect.stringContaining('INSERT OR REPLACE INTO app_settings'),
        'last_report_email',
        'another@admin.com'
      );
    });
  });
});