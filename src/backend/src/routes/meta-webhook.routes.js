const { Router } = require("express");
const rawBody = require("../middlewares/raw-body.middleware");
const metaWebhookController = require("../controllers/meta-webhook.controller");

const router = Router();

// GET: handshake de verificación de Meta.
router.get("/", metaWebhookController.verify);

// POST: eventos entrantes. rawBody captura el body sin parsear para validar la firma HMAC.
router.post("/", rawBody, metaWebhookController.receive);

module.exports = router;
