import './tracer';

import { port } from './constants';

import { handleSignals } from './utils';

import app from './app';

const server = app.listen(port, () => {
  console.log(JSON.stringify({ msg: `server listening on port ${port}` }));
});

handleSignals(server);
