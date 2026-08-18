const prisma = require("../config/prisma");
const channelService = require("./channel.service");

async function persistInboundMessage(entry) {
  const channel = await channelService.findByExternalId(entry.platform, entry.externalId);

  if (!channel) {
    // Evento de un canal que no está registrado en PymeSync (ej. un tenant que aún no
    // conectó su WhatsApp). Se descarta silenciosamente; no es un error del sistema.
    console.warn(
      `Mensaje entrante ignorado: no existe Channel para ${entry.platform}/${entry.externalId}`
    );
    return;
  }

  const conversation = await prisma.conversation.upsert({
    where: {
      channelId_contactExternalId: {
        channelId: channel.id,
        contactExternalId: entry.contactExternalId,
      },
    },
    update: {
      contactName: entry.contactName ?? undefined,
      lastMessageAt: entry.sentAt,
    },
    create: {
      channelId: channel.id,
      tenantId: channel.tenantId,
      contactExternalId: entry.contactExternalId,
      contactName: entry.contactName,
      lastMessageAt: entry.sentAt,
    },
  });

  // Idempotencia: si el externalMessageId ya existe (reintento de Meta o de BullMQ), no duplica.
  await prisma.message.upsert({
    where: { externalMessageId: entry.externalMessageId },
    update: {},
    create: {
      conversationId: conversation.id,
      tenantId: channel.tenantId,
      direction: "INBOUND",
      externalMessageId: entry.externalMessageId,
      text: entry.text,
      contentType: entry.contentType,
      mediaId: entry.mediaId,
      rawPayload: entry.rawPayload,
      sentAt: entry.sentAt,
    },
  });

  // TODO (milestone futuro): si contentType es media (image/video/audio/document) y se necesita
  // la URL real, llamar a la Graph API con fetch nativo: GET https://graph.facebook.com/v21.0/{media-id}
  // usando channel.accessToken, y guardar la mediaUrl resultante. Fuera de alcance ahora.
}

module.exports = { persistInboundMessage };
