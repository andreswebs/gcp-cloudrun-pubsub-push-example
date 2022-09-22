const signals = {
  SIGHUP: 1,
  SIGINT: 2,
  SIGTERM: 15,
};

const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 8080;

const topicName = process.env.TOPIC_NAME;

const errMsg = 'missing env var';

if (!topicName) {
  throw new Error(`${errMsg}: TOPIC_NAME`);
}

export { signals, port, topicName };
