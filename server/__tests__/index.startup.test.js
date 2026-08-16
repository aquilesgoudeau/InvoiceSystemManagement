import { jest } from '@jest/globals';

// Mock db.js entirely so we can force connectDB() to fail on demand,
// without needing a real (or even mocked) mongoose connection.
const mockConnectDB = jest.fn();

jest.unstable_mockModule('../src/services/db.js', () => {
  return {
    connectDB: mockConnectDB,
    default: {},
  };
});

describe('index.js startup', () => {
  it('propagates the error instead of starting the app when the DB connection fails', async () => {
    // process.env.NODE_ENV is 'test' here (set automatically by Jest), so
    // index.js should take the `throw err` branch rather than process.exit(1) —
    // this lets us assert on the failure without killing the test worker.
    mockConnectDB.mockRejectedValue(new Error('DB down'));

    await expect(import('../src/index.js')).rejects.toThrow('DB down');
    expect(mockConnectDB).toHaveBeenCalledTimes(1);
  });
});