import express from 'express';
import { PubSub } from '@google-cloud/pubsub';

const app = express();
const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 8080;
const pubSubClient = new PubSub();
const topicName = process.env.TOPIC_NAME || 'api-events';

const topic = pubSubClient.topic(topicName);

async function publishMessage(msg: string) {
  const data = Buffer.from(msg);
  const messageId = await topic.publishMessage({ data });
  console.log(`Message ${messageId} published.`);
  return messageId;
}

// logger
app.use('/', (req, _res, next) => {
  console.log(`[${req.method}] ${req.originalUrl}`);
  return next();
});

// Check app status
app.get('/health', (_req, res) => {
  res.send('healthy');
});

// Send message to queue
app.get('/msg', (req, res) => {
  const msg = { msg: req.query.msg };
  publishMessage(JSON.stringify(msg))
    .then(() => {
      res.send('message sent');
    })
    .catch((e) => {
      res.send(`failed with ${e.name}: ${e.message}`);
    });
});

const server = app.listen(port, () => {
  console.log(`server listening on port ${port}`);
});

const signals = {
  SIGHUP: 1,
  SIGINT: 2,
  SIGTERM: 15,
};

const shutdown = (signal: string, value: number) => {
  console.log('shutdown');
  server.close(() => {
    console.log(`stopped by ${signal}`);
    process.exit(128 + value);
  });
};

Object.keys(signals).forEach((signal) => {
  process.on(signal, () => {
    console.log(`\nreceived ${signal}`);
    shutdown(signal, signals[signal]);
  });
});
