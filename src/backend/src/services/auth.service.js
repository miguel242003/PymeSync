const bcrypt = require("bcrypt");
const prisma = require("../config/prisma");
const { AppError } = require("../middlewares/error.middleware");
const { generateToken } = require("../utils/token.util");
const { signAuthToken } = require("../utils/jwt.util");
const emailService = require("./email.service");

const SALT_ROUNDS = 12;
const VERIFICATION_TOKEN_TTL_MS = 24 * 60 * 60 * 1000; // 24h
const RESET_TOKEN_TTL_MS = 60 * 60 * 1000; // 1h

async function signup({ email, password, name, companyName }) {
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    // No revelamos si el email existe en un mensaje distinto para no facilitar enumeración de cuentas.
    throw new AppError("No fue posible registrar la cuenta con esos datos", 409);
  }

  const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
  const verificationToken = generateToken();

  // El signup crea la empresa (tenant) y su primer usuario en una sola operación atómica.
  const user = await prisma.$transaction(async (tx) => {
    const tenant = await tx.tenant.create({ data: { name: companyName } });

    return tx.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        tenantId: tenant.id,
        verificationToken,
        verificationTokenExpires: new Date(Date.now() + VERIFICATION_TOKEN_TTL_MS),
      },
    });
  });

  await emailService.sendVerificationEmail(user.email, verificationToken);

  return { id: user.id, email: user.email, name: user.name };
}

async function verifyEmail(token) {
  const user = await prisma.user.findUnique({ where: { verificationToken: token } });

  if (!user || !user.verificationTokenExpires || user.verificationTokenExpires < new Date()) {
    throw new AppError("Token de verificación inválido o expirado", 400);
  }

  await prisma.user.update({
    where: { id: user.id },
    data: {
      isVerified: true,
      verificationToken: null,
      verificationTokenExpires: null,
    },
  });
}

async function login({ email, password }) {
  const user = await prisma.user.findUnique({ where: { email } });

  // Mismo mensaje de error para email inexistente y password incorrecta: evita enumeración de usuarios.
  const invalidCredentialsError = new AppError("Credenciales inválidas", 401);

  if (!user) throw invalidCredentialsError;

  const passwordMatches = await bcrypt.compare(password, user.password);
  if (!passwordMatches) throw invalidCredentialsError;

  if (!user.isVerified) {
    throw new AppError("Debes verificar tu correo antes de iniciar sesión", 403);
  }

  const token = signAuthToken(user.id);

  return { token, user: { id: user.id, email: user.email, name: user.name } };
}

async function forgotPassword(email) {
  const user = await prisma.user.findUnique({ where: { email } });

  // Responder igual exista o no el usuario, para no filtrar qué emails están registrados.
  if (!user) return;

  const resetPasswordToken = generateToken();

  await prisma.user.update({
    where: { id: user.id },
    data: {
      resetPasswordToken,
      resetPasswordExpires: new Date(Date.now() + RESET_TOKEN_TTL_MS),
    },
  });

  await emailService.sendPasswordResetEmail(user.email, resetPasswordToken);
}

async function resetPassword(token, newPassword) {
  const user = await prisma.user.findUnique({ where: { resetPasswordToken: token } });

  if (!user || !user.resetPasswordExpires || user.resetPasswordExpires < new Date()) {
    throw new AppError("Token de restablecimiento inválido o expirado", 400);
  }

  const hashedPassword = await bcrypt.hash(newPassword, SALT_ROUNDS);

  await prisma.user.update({
    where: { id: user.id },
    data: {
      password: hashedPassword,
      resetPasswordToken: null,
      resetPasswordExpires: null,
    },
  });
}

module.exports = { signup, verifyEmail, login, forgotPassword, resetPassword };
