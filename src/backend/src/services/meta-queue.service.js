const { Queue } = require("bullmq");
const redisConnection = require("../config/redis");

const QUEUE_NAME = "meta-events";

const metaEventsQueue = new Queue(QUEUE_NAME, { connection: redisConnection });

async function enqueueMetaEvent(payload) {
  await metaEventsQueue.add("meta-event", payload, {
    attempts: 5,
    backoff: { type: "exponential", delay: 2000 },
    removeOnComplete: 1000,
    removeOnFail: 5000,
  });
}

module.exports = { metaEventsQueue, enqueueMetaEvent, QUEUE_NAME };
