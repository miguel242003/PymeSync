const crypto = require("crypto");
const env = require("../config/env");

// Verifica que el POST realmente venga de Meta comparando la firma HMAC SHA-256
// (X-Hub-Signature-256) contra el body crudo firmado con el App Secret.
function verifySignature(rawBody, signatureHeader) {
  if (!signatureHeader || !rawBody) return false;

  const expected =
    "sha256=" +
    crypto.createHmac("sha256", env.metaAppSecret).update(rawBody).digest("hex");

  const expectedBuf = Buffer.from(expected);
  const receivedBuf = Buffer.from(signatureHeader);

  // timingSafeEqual requiere buffers del mismo largo; evita filtrar el secreto por temporización.
  if (expectedBuf.length !== receivedBuf.length) return false;

  return crypto.timingSafeEqual(expectedBuf, receivedBuf);
}

// Normaliza los distintos shapes de payload de Meta (WhatsApp / Messenger / Instagram) a un
// formato común que message.service.js puede persistir sin conocer la plataforma de origen.
function extractMessageEntries(body) {
  if (body.object === "whatsapp_business_account") {
    return extractWhatsAppEntries(body);
  }
  if (body.object === "page") {
    // Meta entrega tanto Messenger como (en algunas configuraciones) Instagram bajo "page".
    // channel.service.js resuelve la plataforma real buscando el externalId registrado.
    return extractMessengerOrInstagramEntries(body);
  }
  if (body.object === "instagram") {
    return extractMessengerOrInstagramEntries(body, "INSTAGRAM");
  }
  return [];
}

function extractWhatsAppEntries(body) {
  const results = [];
  for (const entry of body.entry ?? []) {
    for (const change of entry.changes ?? []) {
      const value = change.value;
      const phoneNumberId = value?.metadata?.phone_number_id;
      for (const msg of value?.messages ?? []) {
        const contact = (value.contacts ?? []).find((c) => c.wa_id === msg.from);
        results.push({
          platform: "WHATSAPP",
          externalId: phoneNumberId,
          contactExternalId: msg.from,
          contactName: contact?.profile?.name ?? null,
          externalMessageId: msg.id,
          contentType: msg.type,
          text: msg.text?.body ?? null,
          mediaId: msg[msg.type]?.id ?? null,
          sentAt: new Date(Number(msg.timestamp) * 1000),
          rawPayload: msg,
        });
      }
    }
  }
  return results;
}

function extractMessengerOrInstagramEntries(body, forcedPlatform) {
  const results = [];
  for (const entry of body.entry ?? []) {
    const pageId = entry.id;
    for (const messaging of entry.messaging ?? []) {
      if (!messaging.message || messaging.message.is_echo) continue; // ignora ecos de mensajes salientes

      results.push({
        platform: forcedPlatform ?? "MESSENGER",
        externalId: pageId,
        contactExternalId: messaging.sender.id,
        contactName: null, // requeriría llamar a la Graph API; fuera de alcance en este milestone
        externalMessageId: messaging.message.mid,
        contentType: messaging.message.attachments ? messaging.message.attachments[0].type : "text",
        text: messaging.message.text ?? null,
        mediaId: messaging.message.attachments?.[0]?.payload?.url ?? null,
        sentAt: new Date(messaging.timestamp),
        rawPayload: messaging,
      });
    }
  }
  return results;
}

module.exports = { verifySignature, extractMessageEntries };
