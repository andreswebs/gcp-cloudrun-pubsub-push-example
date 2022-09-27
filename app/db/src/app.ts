import express from 'express';

import { PubSubReqBody } from './types';
import { createMessage } from './utils';
import { logger } from './middleware';

const app = express();

app.use(express.json());

app.use(logger);

app.get('/health', (_req, res) => {
  res.status(204).send('healthy');
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
      luck: parseInt(data.luck),
      attributes: message.attributes,
    }).catch(console.error);
  }

  res.status(204).send('ok');
});

export default app;
