import express from 'express';
import { publishMessage } from './utils';

const app = express();

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

export default app;
