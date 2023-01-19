const serviceName = 'db';

const signals = {
  SIGHUP: 1,
  SIGINT: 2,
  SIGTERM: 15,
};

const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 8080;

const otelEnabled: boolean = (() => {
  if (String(process.env.APP_OTEL_ENABLED).toLowerCase() === 'false') {
    return false;
  }
  return process.env.APP_OTEL_ENABLED ? true : false;
})();

const pull = process.env.PULL ? true : false;
const timeout = process.env.TIMEOUT_SECONDS
  ? parseInt(process.env.TIMEOUT_SECONDS, 10)
  : 60;

const subscriptionNameOrId = process.env.SUBSCRIPTION || 'api-events';

const mongoProto = process.env.MONGO_PROTO || 'mongodb';
const mongoHost = process.env.MONGO_HOST;
const mongoUser = process.env.MONGO_USERNAME;
const mongoPass = process.env.MONGO_PASSWORD;
const mongoDatabase = process.env.MONGO_DATABASE;

const mongoTLSCA = process.env.MONGO_TLS_CA_CRT;
const mongoTLSKey = process.env.MONGO_TLS_KEY;
const mongoTLSKeyPass = process.env.MONGO_TLS_KEY_PASSWORD;

const mongoTLSLocalEnabled: boolean = (() => {
  if (String(process.env.MONGO_TLS_LOCAL_ENABLED).toLowerCase() === 'false') {
    return false;
  }
  return process.env.MONGO_TLS_LOCAL_ENABLED ? true : false;
})();

const mongoReplicaSet = process.env.MONGO_REPLICA_SET;

const mongoAuthSourceDB = process.env.MONGO_AUTH_SOURCE_DB || 'admin';

const errMsg = 'missing env var';

if (!mongoHost) {
  throw new Error(`${errMsg}: MONGO_HOST`);
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

const mongoTLSOpts = (() => {
  let tlsOpts = '';

  if (!mongoTLSLocalEnabled) {
    return tlsOpts;
  }

  if (mongoTLSCA && mongoTLSKey) {
    tlsOpts += `&tls=true&tlsCAFile=${mongoTLSCA}&tlsCertificateKeyFile=${mongoTLSKey}`;
  }

  if (mongoTLSKeyPass) {
    tlsOpts += `&tlsCertificateKeyFilePassword=${mongoTLSKeyPass}`;
  }

  return tlsOpts;
})();

const mongoRSOpts = (() => {
  let rsOpts = '';
  if (mongoReplicaSet) {
    rsOpts += `&replicaSet=${mongoReplicaSet}`;
  }
  return rsOpts;
})();

const mongoURI = `${mongoProto}://${mongoUser}:${mongoPass}@${mongoHost}/${mongoDatabase}?authSource=${mongoAuthSourceDB}${mongoRSOpts}${mongoTLSOpts}`;

const otelPubSubAttribute = 'googclient_OpenTelemetrySpanContext';

export {
  signals,
  port,
  pull,
  subscriptionNameOrId,
  timeout,
  mongoURI,
  serviceName,
  otelEnabled,
  otelPubSubAttribute,
};
