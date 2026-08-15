import multer from 'multer';
import { analyzeReceip } from '../services/gemini.js';
import { requireAuth } from '../middleware/authMiddleware.js';

const upload = multer({ storage: multer.memoryStorage() });

export const ScanRoutes = (app) => {

  app.post('/api/scan', requireAuth, upload.single('image'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No se recibió ninguna imagen' });
      }


      const base64Data = req.file.buffer.toString('base64');
      const mimeType = req.file.mimetype;

      const invoiceData = await analyzeReceip(base64Data, mimeType);

      res.json(invoiceData);

    } catch (error) {
      console.error('Error procesando el escaneo:', error);
      res.status(500).json({ error: 'Error al procesar la imagen del invoice' });
    }
  });

};