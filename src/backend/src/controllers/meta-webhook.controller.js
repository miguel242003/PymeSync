const env = require("../config/env");
const metaWebhookService = require("../services/meta-webhook.service");
const metaQueueService = require("../services/meta-queue.service");

// Handshake de verificación de Meta: se llama una sola vez (y cada vez que se edita) al
// configurar el webhook en el dashboard.
function verify(req, res) {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode === "subscribe" && token === env.metaVerifyToken) {
    return res.status(200).send(challenge);
  }

  return res.sendStatus(403);
}

// Eventos entrantes. Meta requiere una respuesta 200 rápida o reintenta y puede terminar
// deshabilitando la suscripción, así que acá solo se valida la firma y se encola.
async function receive(req, res, next) {
  try {
    const isValid = metaWebhookService.verifySignature(
      req.rawBody,
      req.headers["x-hub-signature-256"]
    );

    if (!isValid) {
      return res.sendStatus(401);
    }

    await metaQueueService.enqueueMetaEvent(req.body);
    return res.sendStatus(200);
  } catch (err) {
    next(err);
  }
}

module.exports = { verify, receive };
