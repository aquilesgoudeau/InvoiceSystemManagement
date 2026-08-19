import { MailerSend, EmailParams, Sender, Recipient, Attachment } from "mailersend";
import { protectedKeys } from '../config/keys.js';
import { generateInvoicesCSV, buildReportFileName } from '../services/reports.js';
import { requireAuth } from '../middleware/authMiddleware.js';

const mailerSend = new MailerSend({
  apiKey: protectedKeys.mailerSendApiKey,
});

// Función para formatear fechas consistentemente a "5 August 26"
const formatDateString = (input) => {
  if (!input) return '';

  let date;
  if (input instanceof Date) {
    date = input;
  } else if (typeof input === 'string') {
    const cleanDateStr = input.split('T')[0];
    const parts = cleanDateStr.split('-');
    if (parts.length === 3) {
      const [year, month, day] = parts.map(Number);
      date = new Date(year, month - 1, day);
    } else {
      date = new Date(input);
    }
  } else {
    date = new Date(input);
  }

  if (isNaN(date.getTime())) return '';

  const dayNum = date.getDate();
  const monthName = date.toLocaleDateString('en-US', { month: 'long' });
  const shortYear = date.getFullYear().toString().slice(-2);

  return `${dayNum} ${monthName} ${shortYear}`;
};

export const ReportsRoutes = app => {

  app.post('/reports/send',requireAuth, async (req, res) => {
    const { invoices, recipientEmail, dateRange } = req.body;

    if (!recipientEmail || !/^\S+@\S+\.\S+$/.test(recipientEmail)) {
      return res.status(422).json({ error: 'Invalid email address' });
    }
   if (!Array.isArray(invoices) || invoices.length === 0) {
      return res.status(422).json({ error: 'No invoices to export' });
    }

    try {
      const csvContent = generateInvoicesCSV(invoices);
      const fileName = buildReportFileName(dateRange);

      const sentFrom = new Sender(protectedKeys.emailFrom, "InvoicesSM");
      const recipients = [new Recipient(recipientEmail)];
      const attachments = [
        new Attachment(
          Buffer.from(csvContent).toString('base64'),
          fileName,
          'attachment'
        ),
      ];

      // 1. Obtener fechas del filtro si vienen definidas
      let rawStart = dateRange?.startDate || dateRange?.from || dateRange?.start;
      let rawEnd = dateRange?.endDate || dateRange?.to || dateRange?.end;

      // 2. Si no se seleccionó rango:
      // - Inicio: la fecha de la factura más antigua
      // - Fin: la fecha de hoy
      if (!rawStart || !rawEnd) {
        const invoiceDates = invoices
          .map(inv => inv.date || inv.invoiceDate || inv.fecha || inv.createdAt)
          .filter(Boolean)
          .map(d => new Date(d))
          .filter(d => !isNaN(d.getTime()))
          .sort((a, b) => a - b);

        if (!rawStart && invoiceDates.length > 0) {
          rawStart = invoiceDates[0]; // Factura más antigua
        }
        if (!rawEnd) {
          rawEnd = new Date(); // Fecha actual (hoy)
        }
      }

      const formattedStart = formatDateString(rawStart);
      const formattedEnd = formatDateString(rawEnd);

      const rangeLabel = formattedStart && formattedEnd
        ? (formattedStart === formattedEnd ? formattedStart : `${formattedStart} – ${formattedEnd}`)
        : 'All dates';

      const logoUrl = "https://ismlogoemail.s3.us-east-1.amazonaws.com/ism.png"; 

      const emailHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { margin: 0; padding: 0; background-color: #f4f4f5; font-family: Arial, sans-serif; }
          </style>
        </head>
        <body style="margin: 0; padding: 40px 0; background-color: #f4f4f5;">
          <table border="0" cellpadding="0" cellspacing="0" width="100%">
            <tr>
              <td align="center">
                <!-- Tarjeta Principal -->
                <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 580px; background-color: #ffffff; border-radius: 8px; overflow: hidden; border: 1px solid #e4e4e7;">
                  
                  <!-- Header / Banner Azul Superior -->
                  <tr>
                    <td align="center" style="background-color: #0099ff; padding: 35px 20px;">
                      <h1 style="color: #ffffff; margin: 0; font-size: 26px; font-weight: bold;">
                        Your invoice reports are ready!
                      </h1>
                    </td>
                  </tr>

                  <!-- Sección del Logo -->
                  <tr>
                    <td align="center" style="background-color: #f9fafb; padding: 25px 0 10px 0;">
                      <img src="${logoUrl}" alt="ISM Logo" width="100" style="display: block; width: 100px; height: auto;" />
                    </td>
                  </tr>

                  <!-- Cuerpo del Mensaje -->
                  <tr>
                    <td align="center" style="background-color: #f9fafb; padding: 15px 40px 40px 40px; color: #333333; text-align: center;">
                      <h2 style="font-size: 20px; font-weight: bold; margin-top: 0; margin-bottom: 20px; color: #111827;">
                        Hello from Invoice System Management,
                      </h2>
                      
                      <p style="font-size: 15px; line-height: 1.6; color: #4b5563; margin-bottom: 12px;">
                        Please find attached the invoice report for the period <strong>${rangeLabel}</strong>.
                      </p>

                      <p style="font-size: 15px; line-height: 1.6; color: #4b5563; margin: 0;">
                        Total invoices included: <strong>${invoices.length}</strong>
                      </p>
                    </td>
                  </tr>

                </table>

                <!-- Footer fuera de la tarjeta -->
                <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 580px; margin-top: 20px;">
                  <tr>
                    <td align="center" style="font-size: 12px; color: #9ca3af;">
                      Invoice System Management • Automatic Notification
                    </td>
                  </tr>
                </table>

              </td>
            </tr>
          </table>
        </body>
        </html>
      `;

      const emailParams = new EmailParams()
        .setFrom(sentFrom)
        .setTo(recipients)
        .setSubject(`Invoice report - ${rangeLabel}`)
        .setHtml(emailHtml)
        .setAttachments(attachments);

      await mailerSend.email.send(emailParams);

      res.json({ success: true });
    } catch (err) {
      /*console.error('Error enviando reporte:', err);
      res.status(500).json({ error: 'No se pudo enviar el reporte' });*/
      console.error('Error enviando reporte:', JSON.stringify(err.body || err.response?.body || err, null, 2));
      res.status(500).json({ 
        error: 'No se pudo enviar el reporte',
        detail: err.body || err.response?.body || err.message // ⚠️ quitar esta línea antes de producción final
      });
    }
  });

};


/*
import { MailerSend, EmailParams, Sender, Recipient, Attachment } from "mailersend";
import { protectedKeys } from '../config/keys.js';
import { generateInvoicesCSV, buildReportFileName } from '../services/reports.js';
import { requireAuth } from '../middleware/authMiddleware.js';

const mailerSend = new MailerSend({
  apiKey: protectedKeys.mailerSendApiKey,
});

export const ReportsRoutes = app => {

  app.post('/reports/send',requireAuth, async (req, res) => {
    const { invoices, recipientEmail, dateRange } = req.body;

    if (!recipientEmail || !/^\S+@\S+\.\S+$/.test(recipientEmail)) {
      return res.status(422).json({ error: 'Email inválido' });
    }
    if (!Array.isArray(invoices) || invoices.length === 0) {
      return res.status(422).json({ error: 'No hay facturas para exportar' });
    }

    try {
      const csvContent = generateInvoicesCSV(invoices);
      const fileName = buildReportFileName(dateRange);

      const sentFrom = new Sender(protectedKeys.emailFrom, "ISM");
      const recipients = [new Recipient(recipientEmail)];
      const attachments = [
        new Attachment(
          Buffer.from(csvContent).toString('base64'),
          fileName,
          'attachment'
        ),
      ];

      const rangeLabel = dateRange?.startDate && dateRange?.endDate
        ? `${dateRange.startDate} a ${dateRange.endDate}`
        : 'período seleccionado';

      const emailParams = new EmailParams()
        .setFrom(sentFrom)
        .setTo(recipients)
        .setSubject(`ISM Report - ${rangeLabel}`)
        .setHtml(`
          <p>Hola,</p>
          <p>Adjunto encontrarás el reporte de facturas correspondiente al período ${rangeLabel}.</p>
          <p>Total de facturas incluidas: ${invoices.length}</p>
        `)
        .setAttachments(attachments);

      await mailerSend.email.send(emailParams);

      res.json({ success: true });
    } catch (err) {
      console.error('Error enviando reporte:', err);
      res.status(500).json({ error: 'No se pudo enviar el reporte' });
    }
  });

};
*/