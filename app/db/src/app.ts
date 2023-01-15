import express from 'express';
import { PubSubReqBody } from './types';
import { saveMessage } from './utils';
import { HTTPError } from './errors';

import logger from './middleware/logger';
import pubsubContext from './middleware/pubsub-context';
import notFound from './middleware/not-found';
import errorHandler from './middleware/error-handler';

const app = express();

app.use(express.json());

app.get('/health', (_req, res) => {
  return res.status(200).json({ msg: 'healthy' });
});

app.use(logger);

app.post('/', pubsubContext, async (req, res, next) => {
  if (!req.body) {
    return next(
      new HTTPError(400, 'no Pub/Sub message received', { expose: true })
    );
  }

  if (!req.body.message) {
    return next(
      new HTTPError(400, 'invalid Pub/Sub message format', { expose: true })
    );
  }

  const body: PubSubReqBody = req.body;

  const message = body.message;

  try {
    const data = JSON.parse(
      message.data
        ? Buffer.from(message.data, 'base64').toString().trim()
        : null
    );

    if (!data) {
      return next(
        new HTTPError(400, 'invalid Pub/Sub message format', { expose: true })
      );
    }

    await saveMessage({
      msgId: message.messageId,
      msg: data.msg,
      luck: parseInt(data.luck),
      attributes: message.attributes,
    });

    return res.status(204).send();
  } catch (e) {
    return next(new HTTPError(500, `${e.name}: ${e.message}`));
  }
});

app.get('/', (_req, res) => {
  return res.status(204).send();
});

app.use(notFound);
app.use(errorHandler);

export default app;
