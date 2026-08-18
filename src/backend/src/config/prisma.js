const { PrismaClient } = require("@prisma/client");

// Instancia única compartida por toda la app (evita agotar conexiones de MySQL).
const prisma = new PrismaClient();

module.exports = prisma;
