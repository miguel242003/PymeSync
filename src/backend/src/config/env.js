require("dotenv").config();

const required = [
  "DATABASE_URL",
  "JWT_SECRET",
  "RESEND_API_KEY",
  "RESEND_FROM_EMAIL",
  "REDIS_URL",
  "META_APP_SECRET",
  "META_VERIFY_TOKEN",
];

for (const key of required) {
  if (!process.env[key]) {
    throw new Error(`Falta la variable de entorno requerida: ${key}`);
  }
}

module.exports = {
  port: process.env.PORT || 4000,
  nodeEnv: process.env.NODE_ENV || "development",
  isProduction: process.env.NODE_ENV === "production",
  clientUrl: process.env.CLIENT_URL || "http://localhost:5173",
  clientUrls: (process.env.CLIENT_URL || "http://localhost:5173")
    .split(",")
    .map((url) => url.trim()),
  databaseUrl: process.env.DATABASE_URL,
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "7d",
  resendApiKey: process.env.RESEND_API_KEY,
  resendFromEmail: process.env.RESEND_FROM_EMAIL,
  redisUrl: process.env.REDIS_URL,
  metaAppSecret: process.env.META_APP_SECRET,
  metaVerifyToken: process.env.META_VERIFY_TOKEN,
};
