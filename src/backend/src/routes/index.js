const { Router } = require("express");
const authRoutes = require("./auth.routes");
const userRoutes = require("./user.routes");
const channelRoutes = require("./channel.routes");

const router = Router();

router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/channels", channelRoutes);

module.exports = router;
