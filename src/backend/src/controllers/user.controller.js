const userService = require("../services/user.service");

async function getMe(req, res, next) {
  try {
    const user = await userService.getProfile(req.userId);
    res.status(200).json({ user });
  } catch (err) {
    next(err);
  }
}

async function updateMe(req, res, next) {
  try {
    const user = await userService.updateProfile(req.userId, req.body);
    res.status(200).json({ message: "Perfil actualizado", user });
  } catch (err) {
    next(err);
  }
}

module.exports = { getMe, updateMe };
