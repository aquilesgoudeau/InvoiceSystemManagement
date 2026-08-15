import mongoose from 'mongoose';
import { protectedKeys } from '../config/keys.js';

// Opción recomendada: Ejecutar la conexión inmediatamente
const mongoUri = protectedKeys.mongoUri;

mongoose.connect(mongoUri)
    .then(() => console.log("Connected to MongoDB successfully"))
    .catch(err => console.error("Could not connect to MongoDB", err));

// Exportamos mongoose por si lo necesitas en otro lado
export default mongoose;
