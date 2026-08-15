import dotenv from 'dotenv';
dotenv.config();
export const protectedKeys ={
    mongoUri: process.env.MONGO_URI,
    geminiApiKey:process.env.GEMINI_API_KEY,
    mailerSendApiKey:process.env.MAILERSEND_API_KEY,
    emailFrom:process.env.MAILERSEND_FROM_EMAIL,
    jwtSecret: process.env.JWTSECRET,
    appleBundleId: process.env.APPLE_BUNDLE_ID,
    googleWebClientId: process.env.GOOGLE_WEB_CLIENT_ID,
    googleAndroidClientId: process.env.GOOGLE_ANDROID_CLIENT_ID,
    port:process.env.PORT
}
