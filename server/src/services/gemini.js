import { GoogleGenAI } from "@google/genai";
import { protectedKeys } from "../config/keys.js";

const ai = new GoogleGenAI({ apiKey: protectedKeys.geminiApiKey });

// Definimos la forma exacta que queremos que Gemini nos devuelva.
// responseSchema obliga al modelo a responder SIEMPRE con este shape
// (nada de texto libre que haya que parsear con regex).
const invoiceSchema = {
  type: "OBJECT",
  properties: {
    vendorName: { type: "STRING", description: "Nombre del comercio o proveedor que emite la factura" },
    abn: { type: "STRING", description: "ABN (Australian Business Number) del negocio emisor, 11 dígitos, con o sin espacios (ej. 51 824 753 556)" },
    invoiceNumber: { type: "STRING", description: "Número o folio de la factura/recibo" },
    invoiceDate: { type: "STRING", description: "Fecha de la factura, formato YYYY-MM-DD si es posible" },
    currency: { type: "STRING", description: "Código de moneda, ej. USD, CLP, MXN" },
    subtotal: { type: "NUMBER", description: "Monto antes de impuestos" },
    tax: { type: "NUMBER", description: "Monto total de impuestos (IVA u otro)" },
    total: { type: "NUMBER", description: "Monto total final de la factura" },
    items: {
      type: "ARRAY",
      description: "Detalle de cada línea de producto o servicio",
      items: {
        type: "OBJECT",
        properties: {
          description: { type: "STRING" },
          quantity: { type: "NUMBER" },
          unitPrice: { type: "NUMBER" },
          amount: { type: "NUMBER" },
        },
        required: ["description", "amount"],
      },
    },
  },
  required: ["total"],
};

export async function analyzeReceip(base64Data, mimeType) {
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: [
      {
        role: "user",
        parts: [
          {
            text:
              "Esta imagen es una factura o recibo (invoice). Extrae toda la " +
              "información posible: proveedor, ABN (Australian Business Number, " +
              "normalmente 11 dígitos, puede aparecer como 'ABN' seguido del número), " +
              "número de factura, fecha, moneda, " +
              "subtotal, impuestos, total, y el detalle línea por línea de cada " +
              "producto o servicio (descripción, cantidad, precio unitario, monto). " +
              "Si un dato no aparece claramente en la imagen, omítelo en vez de inventarlo.",
          },
          {
            inlineData: {
              mimeType,
              data: base64Data,
            },
          },
        ],
      },
    ],
    config: {
      responseMimeType: "application/json",
      responseSchema: invoiceSchema,
    },
  });

  return JSON.parse(response.text);
}
