const crypto = require("crypto");

// Token opaco, no reversible: se guarda tal cual en DB porque es de un solo uso y expira.
function generateToken() {
  return crypto.randomBytes(32).toString("hex");
}

module.exports = { generateToken };
