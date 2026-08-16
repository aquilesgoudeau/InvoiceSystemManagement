import mongoose from 'mongoose';
import { protectedKeys } from '../config/keys.js';

const mongoUri = protectedKeys.mongoUri;

export async function connectDB() {
  try {
    await mongoose.connect(mongoUri);
    console.log("Connected to MongoDB successfully");
  } catch (err) {
    console.error("Could not connect to MongoDB", err);
    throw err; // dejamos que quien llama decida: exit(1), reintentar, etc.
  }
}

// Exportamos mongoose por si lo necesitas en otro lado
export default mongoose;
/*
import mongoose from 'mongoose';
import { protectedKeys } from '../config/keys.js';

// Opción recomendada: Ejecutar la conexión inmediatamente
const mongoUri = protectedKeys.mongoUri;

mongoose.connect(mongoUri)
    .then(() => console.log("Connected to MongoDB successfully"))
    .catch(err => console.error("Could not connect to MongoDB", err));

// Exportamos mongoose por si lo necesitas en otro lado
export default mongoose;
*/
