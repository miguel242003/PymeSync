const { z } = require("zod");

const updateProfileSchema = z.object({
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres").optional(),
});

module.exports = { updateProfileSchema };
