import { Server } from 'node:http';
import { PubSub, Message } from '@google-cloud/pubsub';
import db, { MessageSchema } from './db';
import { provider } from './tracer';
import { SpanContext } from '@opentelemetry/api';

import {
  signals,
  timeout,
  subscriptionNameOrId,
  otelPubSubAttribute,
} from './constants';

const pubSubClient = new PubSub();

const subscription = pubSubClient.subscription(subscriptionNameOrId, {
  enableOpenTelemetryTracing: true,
});

async function sleep(waitMilliseconds: number) {
  return new Promise((resolve) => setTimeout(resolve, waitMilliseconds));
}

/**
 * Save Pub/Sub message to database
 */
async function saveMessage(data: MessageSchema) {
  await db.connection;
  console.log(JSON.stringify(data));
  const res = await db.Message.create(data);
  const query = db.Message.findById(res._id);

  const otel = data.attributes[otelPubSubAttribute];

  if (otel) {
    query.comment(`opentelemetry: ${otel}`);
  }

  await query.exec();
}

async function listenForMessages() {
  let messageCount = 0;

  let poll = true;

  const stopListen = async (signal: string, value: number) => {
    poll = false;
    await provider.shutdown();
    console.log(`stopped by ${signal}`);
    process.exit(128 + value);
  };

  Object.keys(signals).forEach((signal) => {
    process.on(signal, async () => {
      await stopListen(signal, signals[signal]);
    });
  });

  const messageHandler = (message: Message) => {
    const data = JSON.parse(message.data.toString());
    console.log(`Received message ${message.id}:`);
    console.log(`Data:\n${JSON.stringify(data, null, 2)}`);
    console.log(`Attributes: ${JSON.stringify(message.attributes, null, 2)}`);
    messageCount += 1;

    saveMessage({
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

/**
 * Get OTel span context from Google Cloud Pub/Sub message attribute
 */
function getSpanContext(message: Message): SpanContext | undefined {
  const otelPubSubAttribute = 'googclient_OpenTelemetrySpanContext';
  if (message.attributes) {
    try {
      return JSON.parse(message.attributes[otelPubSubAttribute]);
    } catch (error) {
      console.error(error);
      return;
    }
  }
}

export { listenForMessages, saveMessage, handleSignals, getSpanContext };
