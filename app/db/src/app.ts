import express from 'express';

import { PubSubReqBody } from './types';
import { listenForMessages, createMessage } from './utils';
import { signals, port, pull } from './constants';

const app = express();

app.use(express.json());

// logger
app.use('/', (req, _res, next) => {
  console.log(`[${req.method}] ${req.originalUrl}`);
  return next();
});

app.get('/health', (_req, res) => {
  res.send('healthy');
});

app.post('/', (req, res) => {
  if (!req.body) {
    const msg = 'no Pub/Sub message received';
    console.error(`error: ${msg}`);
    res.status(400).send(`Bad Request: ${msg}`);
    return;
  }
  if (!req.body.message) {
    const msg = 'invalid Pub/Sub message format';
    console.error(`error: ${msg}`);
    res.status(400).send(`Bad Request: ${msg}`);
    return;
  }

  const body: PubSubReqBody = req.body;

  const message = body.message;
  const data = JSON.parse(
    message.data ? Buffer.from(message.data, 'base64').toString().trim() : ''
  );

  if (data) {
    createMessage({
      msgId: message.messageId,
      msg: data.msg,
      attributes: message.attributes,
    }).catch(console.error);
  }

  res.status(204).send();
});

if (pull) {
  listenForMessages();
} else {
  const server = app.listen(port, () => {
    console.log(`server listening on port ${port}`);
  });

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
}
