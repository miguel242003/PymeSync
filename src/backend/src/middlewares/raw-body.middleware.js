const express = require("express");

// Meta firma el body crudo tal cual llegó (X-Hub-Signature-256). Validar la firma requiere
// esos bytes exactos, no el objeto ya parseado (re-serializar con JSON.stringify puede no
// coincidir byte a byte y rompería la verificación).
const rawBody = express.json({
  verify: (req, res, buf) => {
    req.rawBody = buf;
  },
});

module.exports = rawBody;
