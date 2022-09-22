const signals = {
  SIGHUP: 1,
  SIGINT: 2,
  SIGTERM: 15,
};

const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 8080;
const pull = process.env.PULL ? false : true;
const timeout = process.env.TIMEOUT_SECONDS
  ? parseInt(process.env.TIMEOUT_SECONDS, 10)
  : 60;

const subscriptionNameOrId = process.env.SUBSCRIPTION;

const mongoProto = process.env.MONGO_PROTO || 'mongodb';
const mongoHost = process.env.MONGO_HOST;
const mongoDatabase = process.env.MONGO_DATABASE;
const mongoUser = process.env.MONGO_USERNAME;
const mongoPass = process.env.MONGO_PASSWORD;

const errMsg = 'missing env var';

if (!mongoHost) {
  throw new Error(`${errMsg}: MONGO_HOST`);
}

if (!mongoDatabase) {
  throw new Error(`${errMsg}: MONGO_DATABASE`);
}

if (!mongoUser) {
  throw new Error(`${errMsg}: MONGO_USERNAME`);
}

if (!mongoPass) {
  throw new Error(`${errMsg}: MONGO_PASSWORD`);
}

if (pull && !subscriptionNameOrId) {
  throw new Error(`${errMsg}: SUBSCRIPTION`);
}

export {
  signals,
  port,
  pull,
  subscriptionNameOrId,
  timeout,
  mongoProto,
  mongoHost,
  mongoDatabase,
  mongoUser,
  mongoPass,
};
