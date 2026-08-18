const authService = require("../services/auth.service");
const env = require("../config/env");

const AUTH_COOKIE_NAME = "token";
const AUTH_COOKIE_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000; // 7 días

// sameSite "none" es necesario porque frontend y backend viven en dominios distintos
// (cross-site); requiere secure:true, por eso solo se activa detrás de HTTPS real.
const authCookieOptions = {
  httpOnly: true,
  secure: env.isProduction,
  sameSite: env.isProduction ? "none" : "lax",
  maxAge: AUTH_COOKIE_MAX_AGE_MS,
};

async function signup(req, res, next) {
  try {
    const user = await authService.signup(req.body);
    res.status(201).json({
      message: "Cuenta creada. Revisa tu correo para verificarla.",
      user,
    });
  } catch (err) {
    next(err);
  }
}

async function verifyEmail(req, res, next) {
  try {
    await authService.verifyEmail(req.params.token);
    res.status(200).json({ message: "Cuenta verificada correctamente." });
  } catch (err) {
    next(err);
  }
}

async function login(req, res, next) {
  try {
    const { token, user } = await authService.login(req.body);
    res.cookie(AUTH_COOKIE_NAME, token, authCookieOptions);
    res.status(200).json({ message: "Inicio de sesión exitoso", user });
  } catch (err) {
    next(err);
  }
}

async function logout(req, res) {
  res.clearCookie(AUTH_COOKIE_NAME, {
    httpOnly: true,
    secure: env.isProduction,
    sameSite: env.isProduction ? "none" : "lax",
  });
  res.status(200).json({ message: "Sesión cerrada" });
}

async function forgotPassword(req, res, next) {
  try {
    await authService.forgotPassword(req.body.email);
    // Respuesta genérica siempre, exista o no el email (evita enumeración de cuentas).
    res.status(200).json({
      message: "Si el correo existe, recibirás instrucciones para restablecer tu contraseña.",
    });
  } catch (err) {
    next(err);
  }
}

async function resetPassword(req, res, next) {
  try {
    await authService.resetPassword(req.params.token, req.body.password);
    res.status(200).json({ message: "Contraseña actualizada correctamente." });
  } catch (err) {
    next(err);
  }
}

module.exports = { signup, verifyEmail, login, logout, forgotPassword, resetPassword };
