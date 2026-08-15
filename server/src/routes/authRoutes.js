import jwt from "jsonwebtoken";
import { protectedKeys } from '../config/keys.js';
import appleSignin from 'apple-signin-auth';
import { OAuth2Client } from 'google-auth-library';
import User from '../models/User.js'; // ajusta la ruta si tu archivo User.js está en otra carpeta


const client = new OAuth2Client();

export const AuthRoutes = app => {
  app.post('/auth/apple-login', async (req, res) => {
    const { identityToken, name } = req.body;
    if (!identityToken) return res.status(422).send({ error: 'Identity token is required.'});

    try {
      // 1. Extraemos el appleId y el correo (encriptado dentro del token, verificado por Apple)
      const { sub: appleId, email: tokenEmail } = await appleSignin.verifyIdToken(identityToken, {
        audience: protectedKeys.appleBundleId,
      });

      // 2. Buscamos SOLO por appleId. Nunca confiamos en un email enviado por el cliente
      //    para hacer match con una cuenta existente (evita account takeover).
      let user = await User.findOne({ appleId });

      if (!user) {
        user = new User({
          appleId,
          email: tokenEmail || null,
          name,
          isVerified: !!tokenEmail,
        });
        await user.save();
      } else if (tokenEmail && user.email !== tokenEmail) {
        // Apple solo reenvía el email en logins posteriores en casos puntuales;
        // si llega, lo sincronizamos.
        user.email = tokenEmail;
        user.isVerified = true;
        await user.save();
      }

      const token = jwt.sign({ id: user._id }, protectedKeys.jwtSecret, { expiresIn: '30d' });
      res.send({ token, user: { id: user._id, email: user.email, name: user.name } });

    } catch (err) {
      console.error('Error verifying Apple Token:', err);
      res.status(401).send({ error: 'Unable to sign in with Apple right now. Please try again in a moment.' });
    }
  });
  app.post('/auth/google-login', async (req, res) => {
    const { idToken } = req.body;
    
    if (!idToken) return res.status(422).send({ error: 'ID token is required.' });
    
    try {
      const ticket = await client.verifyIdToken({
        idToken,
        audience: [
          protectedKeys.googleWebClientId,
          protectedKeys.googleAndroidClientId,
        ],
      });

      const payload = ticket.getPayload();
      //console.log(payload);
      
      const { sub: googleId, email, name, picture } = payload;

      // Buscamos SOLO por googleId. Apple está limitado a iOS y Google a Android,
      // así que un mismo usuario nunca autentica con ambos providers en el mismo
      // dispositivo, y los datos (invoices) viven en SQLite local por dispositivo.
      // No hay razón para fusionar cuentas por email.
      let user = await User.findOne({ googleId });

      if (!user) {
        user = new User({
          email: email || null,
          googleId,
          name,
          isVerified: true
        });
        await user.save();
      }

      const token = jwt.sign({ id: user._id }, protectedKeys.jwtSecret, { expiresIn: '30d' });
      res.send({ token, user: { id: user._id, email: user.email, name: user.name, picture } });

    } catch (err) {
      console.error('Error verifying Google Token:', err);
      res.status(401).send({ error: 'Unable to sign in with Google right now. Please try again in a moment.' });
    }
  });
}

