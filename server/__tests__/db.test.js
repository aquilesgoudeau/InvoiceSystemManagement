import { jest } from '@jest/globals';

// Mock the mongoose package itself so we can control connect()'s outcome
// without touching a real database.
const mockConnect = jest.fn();

jest.unstable_mockModule('mongoose', () => {
  return {
    default: {
      connect: mockConnect,
    },
  };
});

// Dynamic import AFTER the mock is registered, same pattern as the other
// service tests (gemini.test.js, reportsService.test.js).
const { connectDB } = await import('../src/services/db.js');

describe('db service - connectDB', () => {
  let logSpy;
  let errorSpy;

  beforeEach(() => {
    jest.clearAllMocks();
    logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    logSpy.mockRestore();
    errorSpy.mockRestore();
  });

  it('resolves and logs success when mongoose connects correctly', async () => {
    mockConnect.mockResolvedValue(undefined);

    await expect(connectDB()).resolves.toBeUndefined();

    expect(mockConnect).toHaveBeenCalledTimes(1);
    expect(logSpy).toHaveBeenCalledWith('Connected to MongoDB successfully');
    expect(errorSpy).not.toHaveBeenCalled();
  });

  it('logs and re-throws the error when mongoose fails to connect', async () => {
    const connectionError = new Error('ECONNREFUSED');
    mockConnect.mockRejectedValue(connectionError);

    // This is the branch that was previously uncovered (line 9's catch block).
    await expect(connectDB()).rejects.toThrow('ECONNREFUSED');

    expect(errorSpy).toHaveBeenCalledWith('Could not connect to MongoDB', connectionError);
    expect(logSpy).not.toHaveBeenCalled();
  });
});