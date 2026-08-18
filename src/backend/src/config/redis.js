const IORedis = require("ioredis");
const env = require("./env");

// maxRetriesPerRequest: null es requerido por BullMQ para las conexiones de Queue/Worker.
const redisConnection = new IORedis(env.redisUrl, {
  maxRetriesPerRequest: null,
});

module.exports = redisConnection;
