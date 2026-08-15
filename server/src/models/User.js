import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
   googleId: { type: String, unique: true, sparse: true },
   appleId: { type: String, unique: true, sparse: true },
   email: { type: String,sparse: true },
   name: { type: String },
   isVerified: { type: Boolean, default: false },
});

// Creación del modelo a partir del esquema.
const User = mongoose.model('User', userSchema);

export default User;
