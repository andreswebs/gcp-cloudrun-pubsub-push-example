import express from 'express';
import { query } from 'express-validator';
import { publishMessage } from './utils';
import { logger } from './middleware';

const app = express();

app.use(express.json());

app.use(logger);

app.get('/health', (_req, res) => {
  res.status(204).send('healthy');
});

app.get('/msg', query('msg').trim().escape(), (req, res) => {
  const luck = Math.floor(Math.random() * 100);
  const msg = { msg: req.query.msg, luck };
  publishMessage(JSON.stringify(msg))
    .then(() => {
      res.send(
        `message sent; luck: ${luck}\n<br />\n<br />\nmsg: ${req.query.msg}`
      );
    })
    .catch((e) => {
      res.send(`failed with ${e.name}: ${e.message}`);
    });
});

export default app;
