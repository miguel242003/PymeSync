const { Worker } = require("bullmq");
const redisConnection = require("../config/redis");
const { QUEUE_NAME } = require("../services/meta-queue.service");
const metaWebhookService = require("../services/meta-webhook.service");
const messageService = require("../services/message.service");

const worker = new Worker(
  QUEUE_NAME,
  async (job) => {
    const entries = metaWebhookService.extractMessageEntries(job.data);

    for (const entry of entries) {
      await messageService.persistInboundMessage(entry);
    }
  },
  { connection: redisConnection, concurrency: 5 }
);

worker.on("failed", (job, err) => {
  console.error(`Job ${job?.id} del worker de Meta falló:`, err);
});

worker.on("completed", (job) => {
  console.log(`Job ${job.id} procesado correctamente.`);
});

console.log("Worker de eventos de Meta iniciado, escuchando la cola:", QUEUE_NAME);

module.exports = worker;
