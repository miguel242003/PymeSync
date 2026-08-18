const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const helmet = require("helmet");
const env = require("./config/env");
const routes = require("./routes");
const metaWebhookRoutes = require("./routes/meta-webhook.routes");
const { notFoundHandler, errorHandler } = require("./middlewares/error.middleware");

const app = express();

app.use(helmet());
app.use(
  cors({
    origin: env.clientUrls,
    credentials: true, // Permite que el navegador envíe/reciba la cookie httpOnly.
  })
);

// Se monta ANTES del express.json() global: necesita capturar el body crudo para validar
// la firma HMAC de Meta antes de que cualquier otro parser consuma el stream del request.
app.use("/api/v1/webhooks/meta", metaWebhookRoutes);

app.use(express.json());
app.use(cookieParser());

app.use("/api/v1", routes);

app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
