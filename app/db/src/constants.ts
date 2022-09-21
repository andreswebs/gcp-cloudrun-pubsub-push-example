const signals = {
  SIGHUP: 1,
  SIGINT: 2,
  SIGTERM: 15,
};

const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 8080;
const pull = process.env.PULL ? true : false;

const mongoProto = process.env.MONGO_PROTO;
const mongoHost = process.env.MONGO_HOST;
const mongoDatabase = process.env.MONGO_DATABASE;
const mongoUser = process.env.MONGO_USERNAME;
const mongoPass = process.env.MONGO_PASSWORD;

const errMsg = 'missing env var';

if (!mongoProto) {
  throw new Error(`${errMsg}: MONGO_PROTO`);
}

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

export {
  signals,
  port,
  pull,
  mongoProto,
  mongoHost,
  mongoDatabase,
  mongoUser,
  mongoPass,
};
