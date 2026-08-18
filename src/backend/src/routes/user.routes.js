const { Router } = require("express");
const userController = require("../controllers/user.controller");
const requireAuth = require("../middlewares/auth.middleware");
const validate = require("../middlewares/validate.middleware");
const { updateProfileSchema } = require("../validators/user.validator");

const router = Router();

router.get("/me", requireAuth, userController.getMe);
router.put("/me", requireAuth, validate(updateProfileSchema), userController.updateMe);

module.exports = router;
