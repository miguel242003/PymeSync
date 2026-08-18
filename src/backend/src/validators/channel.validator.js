const { z } = require("zod");

const createChannelSchema = z.object({
  platform: z.enum(["WHATSAPP", "MESSENGER", "INSTAGRAM"]),
  externalId: z.string().min(1, "externalId es requerido"),
  accessToken: z.string().min(1, "accessToken es requerido"),
  displayName: z.string().optional(),
});

module.exports = { createChannelSchema };
