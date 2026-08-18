const { verifyAuthToken } = require("../utils/jwt.util");

function requireAuth(req, res, next) {
  const token = req.cookies?.token;

  if (!token) {
    return res.status(401).json({ error: "No autenticado" });
  }

  try {
    const payload = verifyAuthToken(token);
    req.userId = payload.sub;
    next();
  } catch {
    return res.status(401).json({ error: "Sesión inválida o expirada" });
  }
}

module.exports = requireAuth;
