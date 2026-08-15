import { jest } from '@jest/globals';

// Mock the GoogleGenAI client itself (NOT our own gemini.js module),
// so the real analyzeReceip code actually runs.
const mockGenerateContent = jest.fn();

jest.unstable_mockModule('@google/genai', () => {
  return {
    GoogleGenAI: jest.fn().mockImplementation(() => ({
      models: {
        generateContent: mockGenerateContent,
      },
    })),
  };
});

// Import AFTER the mock is registered
const { analyzeReceip } = await import('../src/services/gemini.js');

describe('gemini service - analyzeReceip', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('parses a valid JSON response from Gemini and returns it', async () => {
    const fakeInvoice = {
      vendorName: 'Woolworths',
      abn: '21000014236',
      total: 45.5,
    };

    mockGenerateContent.mockResolvedValue({
      text: JSON.stringify(fakeInvoice),
    });

    const result = await analyzeReceip('base64imagedata', 'image/jpeg');

    expect(result).toEqual(fakeInvoice);
  });

  it('sends the image data and mimeType correctly to Gemini', async () => {
    mockGenerateContent.mockResolvedValue({ text: '{"total": 10}' });

    await analyzeReceip('abc123base64', 'image/png');

    const callArgs = mockGenerateContent.mock.calls[0][0];

    expect(callArgs.model).toBe('gemini-2.5-flash');
    expect(callArgs.contents[0].parts[1].inlineData).toEqual({
      mimeType: 'image/png',
      data: 'abc123base64',
    });
    expect(callArgs.config.responseMimeType).toBe('application/json');
    expect(callArgs.config.responseSchema).toBeDefined();
  });

  it('throws if Gemini returns invalid JSON', async () => {
    mockGenerateContent.mockResolvedValue({
      text: 'not valid json {{{',
    });

    await expect(analyzeReceip('base64data', 'image/jpeg')).rejects.toThrow();
  });

  it('propagates errors thrown by the Gemini API call itself', async () => {
    mockGenerateContent.mockRejectedValue(new Error('Gemini API Error'));

    await expect(analyzeReceip('base64data', 'image/jpeg')).rejects.toThrow(
      'Gemini API Error'
    );
  });

  it('returns an empty-ish object when Gemini omits optional fields', async () => {
    // Schema only requires "total" — everything else is optional
    mockGenerateContent.mockResolvedValue({
      text: JSON.stringify({ total: 12.99 }),
    });

    const result = await analyzeReceip('base64data', 'image/jpeg');

    expect(result).toEqual({ total: 12.99 });
    expect(result.vendorName).toBeUndefined();
  });
});