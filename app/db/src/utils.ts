import { provider } from './tracer';
import { PubSub, Message } from '@google-cloud/pubsub';
import db, { MessageSchema } from './db';

import { signals, timeout, subscriptionNameOrId } from './constants';
import { Server } from 'http';

const pubSubClient = new PubSub();

const subscription = pubSubClient.subscription(subscriptionNameOrId, {
  enableOpenTelemetryTracing: true,
});

async function sleep(waitMilliseconds: number) {
  return new Promise((resolve) => setTimeout(resolve, waitMilliseconds));
}

async function createMessage(data: MessageSchema) {
  await db.connection;
  return db.Message.create(data);
}

async function listenForMessages() {
  let messageCount = 0;

  let poll = true;

  const stopListen = async (signal: string, value: number) => {
    console.log('shutdown');
    console.log(`stopped by ${signal}`);
    poll = false;
    await provider.shutdown();
    process.exit(128 + value);
  };

  Object.keys(signals).forEach((signal) => {
    process.on(signal, async () => {
      console.log(`\nreceived ${signal}`);
      await stopListen(signal, signals[signal]);
    });
  });

  const messageHandler = (message: Message) => {
    const data = JSON.parse(message.data.toString());
    console.log(`Received message ${message.id}:`);
    console.log(`Data:\n${JSON.stringify(data, null, 2)}`);
    console.log(`Attributes: ${JSON.stringify(message.attributes, null, 2)}`);
    messageCount += 1;

    createMessage({
      msgId: message.id,
      msg: data.msg,
      attributes: message.attributes,
    })
      .then(() => message.ack())
      .catch(console.error);
  };

  subscription.on('message', messageHandler);

  while (poll) {
    await sleep(timeout * 1000).then(() => {
      console.log(`${messageCount} message(s) received.`);
      messageCount = 0;
    });
  }
}

const handleSignals = (server: Server) => {
  const shutdown = (signal: string, value: number) => {
    console.log('shutdown');
    server.close(async () => {
      await provider.shutdown();
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

export { listenForMessages, createMessage, handleSignals };
