const { Resend } = require("resend");
const env = require("./env");

const resend = new Resend(env.resendApiKey);

module.exports = resend;
