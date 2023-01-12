import { Server } from 'node:http';
import { PubSub } from '@google-cloud/pubsub';
import { provider } from './tracer';
import { topicName, signals } from './constants';

const pubSubClient = new PubSub();

const topic = pubSubClient.topic(topicName, {
  enableOpenTelemetryTracing: true,
});

/**
 * Publish a message to Google Cloud Pub/Sub
 */
async function publishMessage(msg: string) {
  const data = Buffer.from(msg);
  const messageId = await topic.publishMessage({
    data,
  });
  console.log(`Message ${messageId} published.`);
  return messageId;
}

/**
 * Handle linux signals
 */
function handleSignals(server: Server) {
  const shutdown = async (signal: string, value: number) => {
    await provider.shutdown();
    server.close(() => {
      console.log(`stopped by ${signal}`);
      process.exit(128 + value);
    });
  };

  Object.keys(signals).forEach((signal) => {
    process.on(signal, async () => {
      await shutdown(signal, signals[signal]);
    });
  });
}

export { publishMessage, handleSignals };
