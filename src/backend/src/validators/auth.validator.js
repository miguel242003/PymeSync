const { z } = require("zod");

const signupSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres"),
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  companyName: z.string().min(2, "El nombre de la empresa debe tener al menos 2 caracteres"),
});

const loginSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(1, "La contraseña es requerida"),
});

const forgotPasswordSchema = z.object({
  email: z.string().email("Email inválido"),
});

const resetPasswordSchema = z.object({
  password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres"),
});

module.exports = {
  signupSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
};
