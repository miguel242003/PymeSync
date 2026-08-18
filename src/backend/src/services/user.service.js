const prisma = require("../config/prisma");
const { AppError } = require("../middlewares/error.middleware");

const PUBLIC_USER_FIELDS = {
  id: true,
  email: true,
  name: true,
  isVerified: true,
  createdAt: true,
  tenantId: true,
  tenant: {
    select: { id: true, name: true },
  },
};

async function getProfile(userId) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: PUBLIC_USER_FIELDS,
  });

  if (!user) throw new AppError("Usuario no encontrado", 404);

  return user;
}

async function updateProfile(userId, data) {
  const user = await prisma.user.update({
    where: { id: userId },
    data,
    select: PUBLIC_USER_FIELDS,
  });

  return user;
}

module.exports = { getProfile, updateProfile };
