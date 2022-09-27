// import { setupTracing } from './tracer';
// setupTracing('api');

import './tracer';

import { port } from './constants';

import { handleSignals } from './utils';

import app from './app';

const server = app.listen(port, () => {
  console.log(`server listening on port ${port}`);
});

handleSignals(server);
