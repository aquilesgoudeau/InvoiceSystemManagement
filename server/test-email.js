// test-email.js
// Script de prueba AISLADO para verificar la configuración de MailerSend
// sin necesidad de pasar por la app, el emulador, ni facturas reales escaneadas.
//
// Cómo usarlo:
// 1. Coloca este archivo en la raíz de tu proyecto backend (donde tengas node_modules con "mailersend" instalado)
// 2. Ejecuta: node test-email.js tu-email-de-prueba@ejemplo.com
//    (si no pasas un email, usará el mismo protectedKeys.emailFrom como destinatario)
// 3. Lee la consola: te va a mostrar el error EXACTO que devuelve MailerSend, sin nada de por medio.

import { MailerSend, EmailParams, Sender, Recipient, Attachment } from "mailersend";
import { protectedKeys } from './src/config/keys.js'; // ajusta la ruta si tu archivo real está en otro lugar

const mailerSend = new MailerSend({
  apiKey: protectedKeys.mailerSendApiKey,
});

// Email de destino: lo pasas como argumento en la terminal, o si no, usa el mismo emailFrom
const testRecipient = process.argv[2] || protectedKeys.emailFrom;

console.log('--- Test de envío MailerSend ---');
console.log('From:', protectedKeys.emailFrom);
console.log('To:', testRecipient);
console.log('API key presente:', !!protectedKeys.mailerSendApiKey);
console.log('---------------------------------');

async function runTest() {
  try {
    // CSV falso, no necesitamos facturas reales del emulador
    const fakeCsv = 'Invoice,Date,Total\nINV-001,2026-08-01,150.00\nINV-002,2026-08-05,320.50';

    const sentFrom = new Sender(protectedKeys.emailFrom, "Tu App Invoices");
    const recipients = [new Recipient(testRecipient)];
    const attachments = [
      new Attachment(
        Buffer.from(fakeCsv).toString('base64'),
        'test-report.csv',
        'attachment'
      ),
    ];

    const emailParams = new EmailParams()
      .setFrom(sentFrom)
      .setTo(recipients)
      .setSubject('Prueba de envío - Invoice Report')
      .setHtml('<p>Este es un correo de prueba para verificar la configuración de MailerSend.</p>')
      .setAttachments(attachments);

    const response = await mailerSend.email.send(emailParams);

    console.log('✅ ÉXITO. Respuesta de MailerSend:');
    console.log(JSON.stringify(response.body || response, null, 2));
  } catch (err) {
    console.log('❌ ERROR al enviar. Detalle completo:');
    console.log(JSON.stringify(err.body || err.response?.body || err, null, 2));

    // Por si el error no tiene .body, mostramos también el objeto crudo
    if (!err.body && !err.response?.body) {
      console.log('Error crudo (sin .body):', err);
    }
  }
}

runTest();