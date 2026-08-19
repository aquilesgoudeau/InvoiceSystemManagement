// Convierte una fecha de factura (viene como texto desde la extracción de
// Gemini, normalmente en formato ISO "YYYY-MM-DD") a formato "DD-MM-YYYY"
// para mostrar en la UI. Parsea el string directamente en vez de usar
// `new Date()` para evitar que el timezone del dispositivo corra la fecha
// un día (algo que sí puede pasar con new Date("YYYY-MM-DD") en UTC).
export const formatInvoiceDate = (rawDate) => {
  if (!rawDate) return null;

  // Caso más común: ya viene en ISO "YYYY-MM-DD" (con o sin hora pegada)
  const isoMatch = String(rawDate).match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (isoMatch) {
    const [, year, month, day] = isoMatch;
    return `${day}-${month}-${year}`;
  }

  // Fallback: si no vino en ISO, intentamos parsear con Date normal.
  const date = new Date(rawDate);
  if (isNaN(date.getTime())) return rawDate; // no parseable: mostramos el texto original

  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();

  return `${day}-${month}-${year}`;
};