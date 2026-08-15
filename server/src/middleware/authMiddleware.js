import jwt from "jsonwebtoken";
import { protectedKeys } from '../config/keys.js';

export const requireAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No autorizado: falta el token' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, protectedKeys.jwtSecret);
    req.userId = decoded.id; // el mismo campo que firmas en authRoutes.js: jwt.sign({ id: user._id }, ...)
    next();
  } catch (err) {
    // TokenExpiredError, JsonWebTokenError, etc.
    return res.status(401).json({ error: 'Token inválido o expirado' });
  }
};