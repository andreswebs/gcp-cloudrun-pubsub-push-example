import { PubSub } from '@google-cloud/pubsub';
import { Server } from 'http';

import { topicName, signals } from './constants';

const pubSubClient = new PubSub();

const topic = pubSubClient.topic(topicName, {
  enableOpenTelemetryTracing: true,
});

async function publishMessage(msg: string) {
  const data = Buffer.from(msg);
  const messageId = await topic.publishMessage({
    data,
  });
  console.log(`Message ${messageId} published.`);
  return messageId;
}

const handleSignals = (server: Server) => {
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
};

export { publishMessage, handleSignals };
