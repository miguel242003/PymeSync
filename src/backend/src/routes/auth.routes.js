const { Router } = require("express");
const rateLimit = require("express-rate-limit");
const authController = require("../controllers/auth.controller");
const validate = require("../middlewares/validate.middleware");
const {
  signupSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} = require("../validators/auth.validator");

const router = Router();

// Limita fuerza bruta sobre login y reset de contraseña.
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
});

router.post("/signup", validate(signupSchema), authController.signup);
router.get("/verify/:token", authController.verifyEmail);
router.post("/login", authLimiter, validate(loginSchema), authController.login);
router.post("/logout", authController.logout);
router.post(
  "/forgot-password",
  authLimiter,
  validate(forgotPasswordSchema),
  authController.forgotPassword
);
router.post(
  "/reset-password/:token",
  authLimiter,
  validate(resetPasswordSchema),
  authController.resetPassword
);

module.exports = router;
