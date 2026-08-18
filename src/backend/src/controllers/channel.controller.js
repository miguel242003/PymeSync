const userService = require("../services/user.service");
const channelService = require("../services/channel.service");

async function create(req, res, next) {
  try {
    const user = await userService.getProfile(req.userId);
    const channel = await channelService.createChannel({ tenantId: user.tenantId, ...req.body });
    res.status(201).json({ message: "Canal conectado correctamente", channel });
  } catch (err) {
    next(err);
  }
}

module.exports = { create };
