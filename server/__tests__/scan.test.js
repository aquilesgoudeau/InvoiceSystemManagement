import { jest } from '@jest/globals';
import mongoose from 'mongoose';

// Mock DB connection immediately
const connectSpy = jest.spyOn(mongoose, 'connect').mockResolvedValue(mongoose);

// Mock analyzeReceip from gemini service
const mockAnalyzeReceip = jest.fn();
jest.unstable_mockModule('../src/services/gemini.js', () => {
  return {
    analyzeReceip: mockAnalyzeReceip
  };
});

// Now import app and others dynamically after the mock is registered
const { default: app } = await import('../src/index.js');
import request from 'supertest';
import jwt from 'jsonwebtoken';
import { protectedKeys } from '../src/config/keys.js';

describe('ScanRoutes API', () => {
  let token;

  beforeAll(() => {
    // Generate a valid JWT token for auth
    token = jwt.sign({ id: 'test-user-id' }, protectedKeys.jwtSecret);
  });

  beforeEach(() => {
    jest.clearAllMocks();
    connectSpy.mockResolvedValue(mongoose);
  });

  describe('POST /api/scan', () => {
    it('should return 401 if unauthorized (no token)', async () => {
      const response = await request(app)
        .post('/api/scan')
        .attach('image', Buffer.from('fake-image-data'), 'invoice.jpg');

      expect(response.status).toBe(401);
      expect(response.body.error).toContain('No autorizado');
    });

    it('should return 400 if no image is uploaded', async () => {
      const response = await request(app)
        .post('/api/scan')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('No se recibió ninguna imagen');
    });

    it('should successfully scan and analyze an invoice', async () => {
      const fakeInvoiceData = {
        vendorName: "Woolworths",
        abn: "21000014236",
        invoiceNumber: "INV-10023",
        invoiceDate: "2026-08-15",
        total: 45.50,
        items: [
          { description: "Apples", quantity: 2, unitPrice: 2.50, amount: 5.00 },
          { description: "Milk 2L", quantity: 1, unitPrice: 4.50, amount: 4.50 }
        ]
      };

      mockAnalyzeReceip.mockResolvedValue(fakeInvoiceData);

      const response = await request(app)
        .post('/api/scan')
        .set('Authorization', `Bearer ${token}`)
        .attach('image', Buffer.from('fake-image-data'), {
          filename: 'invoice.jpg',
          contentType: 'image/jpeg'
        });

      expect(response.status).toBe(200);
      expect(response.body).toEqual(fakeInvoiceData);
      expect(mockAnalyzeReceip).toHaveBeenCalledWith(
        Buffer.from('fake-image-data').toString('base64'),
        'image/jpeg'
      );
    });

    it('should return 500 if scan processing fails', async () => {
      mockAnalyzeReceip.mockRejectedValue(new Error('Gemini API Error'));

      const response = await request(app)
        .post('/api/scan')
        .set('Authorization', `Bearer ${token}`)
        .attach('image', Buffer.from('fake-image-data'), 'invoice.jpg');

      expect(response.status).toBe(500);
      expect(response.body.error).toBe('Error al procesar la imagen del invoice');
    });
  });
});
