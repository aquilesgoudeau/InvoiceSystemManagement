import { jest } from '@jest/globals';
import mongoose from 'mongoose';

// Mock DB connection immediately
const connectSpy = jest.spyOn(mongoose, 'connect').mockResolvedValue(mongoose);

// Mock mailersend before importing app
const mockSend = jest.fn();
jest.unstable_mockModule('mailersend', () => {
  return {
    MailerSend: jest.fn().mockImplementation(() => {
      return {
        email: {
          send: mockSend
        }
      };
    }),
    EmailParams: jest.fn().mockImplementation(() => {
      const mockParams = {
        setFrom: jest.fn().mockImplementation(() => mockParams),
        setTo: jest.fn().mockImplementation(() => mockParams),
        setSubject: jest.fn().mockImplementation(() => mockParams),
        setHtml: jest.fn().mockImplementation(() => mockParams),
        setAttachments: jest.fn().mockImplementation(() => mockParams)
      };
      return mockParams;
    }),
    Sender: jest.fn().mockImplementation((email, name) => ({ email, name })),
    Recipient: jest.fn().mockImplementation((email) => ({ email })),
    Attachment: jest.fn().mockImplementation((content, fileName, disposition) => ({ content, fileName, disposition }))
  };
});

// Import app and other things after mocking mailersend
const { default: app } = await import('../src/index.js');
import request from 'supertest';

// IMPORTANT: this must be a dynamic import, not a static `import { EmailParams }
// from 'mailersend'` — static imports are hoisted above jest.unstable_mockModule(),
// so a static import here would resolve to the REAL mailersend package instead
// of the mock, and EmailParams.mock would be undefined.
const { EmailParams } = await import('mailersend');

// Helper to read the subject string that was passed to setSubject() on the
// most recently constructed EmailParams instance — this is how we can
// observe the internal (non-exported) formatDateString()'s output.
function getLastEmailSubject() {
  const lastInstance = EmailParams.mock.results[EmailParams.mock.results.length - 1].value;
  return lastInstance.setSubject.mock.calls[0][0];
}

describe('ReportsRoutes API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    connectSpy.mockResolvedValue(mongoose);
  });

  describe('POST /reports/send', () => {
    const validInvoices = [
      {
        invoiceDate: '2026-08-01',
        vendorName: 'Google LLC',
        abn: '12345678901',
        invoiceNumber: 'INV-001',
        subtotal: 100,
        tax: 10,
        total: 110,
        category: 'Software'
      },
      {
        invoiceDate: '2026-08-10',
        vendorName: 'Apple Inc',
        abn: '98765432109',
        invoiceNumber: 'INV-002',
        subtotal: 200,
        tax: 20,
        total: 220,
        category: 'Hardware'
      }
    ];

    it('should send the report successfully with valid invoices and email', async () => {
      mockSend.mockResolvedValue({ success: true });

      const response = await request(app)
        .post('/reports/send')
        .send({
          invoices: validInvoices,
          recipientEmail: 'test@example.com',
          dateRange: {
            startDate: '2026-08-01',
            endDate: '2026-08-15'
          }
        });

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ success: true });
      expect(mockSend).toHaveBeenCalled();
    });

    it('should auto-calculate date range from invoices if not provided', async () => {
      mockSend.mockResolvedValue({ success: true });

      const response = await request(app)
        .post('/reports/send')
        .send({
          invoices: validInvoices,
          recipientEmail: 'test@example.com'
        });

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ success: true });
      expect(mockSend).toHaveBeenCalled();
    });

    it('should return 422 if recipientEmail is invalid', async () => {
      const response = await request(app)
        .post('/reports/send')
        .send({
          invoices: validInvoices,
          recipientEmail: 'invalid-email'
        });

      expect(response.status).toBe(422);
      expect(response.body.error).toBe('Email inválido');
      expect(mockSend).not.toHaveBeenCalled();
    });

    it('should return 422 if invoices is empty', async () => {
      const response = await request(app)
        .post('/reports/send')
        .send({
          invoices: [],
          recipientEmail: 'test@example.com'
        });

      expect(response.status).toBe(422);
      expect(response.body.error).toBe('No hay facturas para exportar');
      expect(mockSend).not.toHaveBeenCalled();
    });

    it('should return 422 if invoices is not an array', async () => {
      const response = await request(app)
        .post('/reports/send')
        .send({
          invoices: 'not-an-array',
          recipientEmail: 'test@example.com'
        });

      expect(response.status).toBe(422);
      expect(response.body.error).toBe('No hay facturas para exportar');
      expect(mockSend).not.toHaveBeenCalled();
    });

    it('should return 500 if MailerSend fails to send email', async () => {
      mockSend.mockRejectedValue(new Error('SMTP Error'));

      const response = await request(app)
        .post('/reports/send')
        .send({
          invoices: validInvoices,
          recipientEmail: 'test@example.com'
        });

      expect(response.status).toBe(500);
      expect(response.body.error).toBe('No se pudo enviar el reporte');
      expect(mockSend).toHaveBeenCalled();
    });

    it('should handle a malformed (non YYYY-MM-DD) date string without crashing', async () => {
      // "August 1 2026" has no dashes, so cleanDateStr.split('-') has
      // length 1, not 3 — this exercises formatDateString's fallback
      // `new Date(input)` branch instead of the manual Y/M/D parse.
      mockSend.mockResolvedValue({ success: true });

      const response = await request(app)
        .post('/reports/send')
        .send({
          invoices: validInvoices,
          recipientEmail: 'test@example.com',
          dateRange: {
            startDate: 'August 1 2026',
            endDate: 'August 15 2026'
          }
        });

      expect(response.status).toBe(200);
      expect(mockSend).toHaveBeenCalled();

      const subject = getLastEmailSubject();
      expect(subject).not.toContain('Invalid Date');
      // formatDateString uses a short 2-digit year (e.g. "1 August 26"),
      // not the full 4-digit year.
      expect(subject).toContain('August 26');
    });

    it('should handle a numeric (epoch timestamp) date without crashing', async () => {
      // A number is neither a Date instance nor a string, so this
      // exercises formatDateString's final `else { date = new Date(input) }`
      // branch.
      mockSend.mockResolvedValue({ success: true });

      const response = await request(app)
        .post('/reports/send')
        .send({
          invoices: validInvoices,
          recipientEmail: 'test@example.com',
          dateRange: {
            startDate: 1754006400000, // 2025-08-01 as epoch ms
            endDate: 1755302400000    // 2025-08-16 as epoch ms
          }
        });

      expect(response.status).toBe(200);
      expect(mockSend).toHaveBeenCalled();

      const subject = getLastEmailSubject();
      expect(subject).not.toContain('Invalid Date');
    });

    it('should fall back to "All dates" when invoices have no date fields and no dateRange is given', async () => {
      // No dateRange, and no invoiceDate/date/fecha/createdAt on any invoice,
      // so rawStart never gets set — this hits the `if (!input) return ''`
      // early-return branch inside formatDateString, and the false side of
      // the rangeLabel ternary.
      mockSend.mockResolvedValue({ success: true });

      const invoicesWithoutDates = [
        { vendorName: 'No Date Vendor', total: 50 }
      ];

      const response = await request(app)
        .post('/reports/send')
        .send({
          invoices: invoicesWithoutDates,
          recipientEmail: 'test@example.com'
        });

      expect(response.status).toBe(200);
      expect(mockSend).toHaveBeenCalled();

      const subject = getLastEmailSubject();
      expect(subject).toContain('All dates');
    });
  });
});