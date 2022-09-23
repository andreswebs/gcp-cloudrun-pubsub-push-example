import { listenForMessages, handleSignals } from './utils';

import { port, pull } from './constants';

import app from './app';

import { setupTracing } from './tracer';

setupTracing('db');

if (pull) {
  listenForMessages();
} else {
  const server = app.listen(port, () => {
    console.log(`server listening on port ${port}`);
  });

  handleSignals(server);
}
