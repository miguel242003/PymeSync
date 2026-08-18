const { Router } = require("express");
const requireAuth = require("../middlewares/auth.middleware");
const validate = require("../middlewares/validate.middleware");
const channelController = require("../controllers/channel.controller");
const { createChannelSchema } = require("../validators/channel.validator");

const router = Router();

router.use(requireAuth);
router.post("/", validate(createChannelSchema), channelController.create);

module.exports = router;
