const prisma = require("../config/prisma");
const { AppError } = require("../middlewares/error.middleware");

async function findByExternalId(platform, externalId) {
  if (!externalId) return null;
  return prisma.channel.findUnique({
    where: { platform_externalId: { platform, externalId } },
  });
}

async function createChannel({ tenantId, platform, externalId, accessToken, displayName }) {
  const existing = await findByExternalId(platform, externalId);
  if (existing) {
    throw new AppError("Ya existe un canal registrado con ese identificador", 409);
  }

  return prisma.channel.create({
    data: { tenantId, platform, externalId, accessToken, displayName },
  });
}

module.exports = { findByExternalId, createChannel };
