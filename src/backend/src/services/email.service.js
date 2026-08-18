const resend = require("../config/resend");
const env = require("../config/env");

async function sendVerificationEmail(to, token) {
  const verifyUrl = `${env.clientUrl}/verify-email?token=${token}`;

  await resend.emails.send({
    from: env.resendFromEmail,
    to,
    subject: "Confirma tu cuenta en PymeSync",
    html: `
      <p>Bienvenido a PymeSync. Confirma tu cuenta haciendo clic en el siguiente enlace:</p>
      <p><a href="${verifyUrl}">${verifyUrl}</a></p>
      <p>Si no creaste esta cuenta, ignora este correo.</p>
    `,
  });
}

async function sendPasswordResetEmail(to, token) {
  const resetUrl = `${env.clientUrl}/reset-password?token=${token}`;

  await resend.emails.send({
    from: env.resendFromEmail,
    to,
    subject: "Restablece tu contraseña en PymeSync",
    html: `
      <p>Recibimos una solicitud para restablecer tu contraseña.</p>
      <p><a href="${resetUrl}">${resetUrl}</a></p>
      <p>Este enlace expira en 1 hora. Si no solicitaste esto, ignora este correo.</p>
    `,
  });
}

module.exports = { sendVerificationEmail, sendPasswordResetEmail };
