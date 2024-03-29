import express from 'express';
import { query } from 'express-validator';
import { publishMessage } from './utils';

import { HTTPError } from './errors';

import logger from './middleware/logger';
import notFound from './middleware/not-found';
import errorHandler from './middleware/error-handler';

const app = express();

app.use(express.json());

app.get('/health', (_req, res) => {
  return res.status(200).json({ msg: 'healthy' });
});

app.use(logger);

app.get('/msg', query('msg').trim().escape(), async (req, res, next) => {
  const luck = Math.floor(Math.random() * 100);
  const msg = { msg: req.query.msg, luck };
  try {
    await publishMessage(JSON.stringify(msg));
    return res.json(msg);
  } catch (e) {
    return next(
      new HTTPError(500, `${e.name}: ${e.message}`, { expose: true })
    );
  }
});

app.get('/', (_req, res) => {
  return res.status(204).send();
});

app.use(notFound);
app.use(errorHandler);

export default app;
