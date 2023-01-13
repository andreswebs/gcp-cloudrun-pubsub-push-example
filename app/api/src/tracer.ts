import { serviceName } from './constants';

import {
  diag,
  DiagConsoleLogger,
  DiagLogLevel,
  trace,
} from '@opentelemetry/api';

import {
  BatchSpanProcessor,
  // ConsoleSpanExporter,
  // SimpleSpanProcessor,
} from '@opentelemetry/sdk-trace-base';

import { registerInstrumentations } from '@opentelemetry/instrumentation';

import {
  NodeTracerProvider,
  NodeTracerConfig,
} from '@opentelemetry/sdk-trace-node';

import { Resource } from '@opentelemetry/resources';

import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';

import {
  HttpInstrumentation,
  IgnoreIncomingRequestFunction,
} from '@opentelemetry/instrumentation-http';

import { ExpressInstrumentation } from '@opentelemetry/instrumentation-express';
import { TraceExporter } from '@google-cloud/opentelemetry-cloud-trace-exporter';
import { CloudPropagator } from '@google-cloud/opentelemetry-cloud-trace-propagator';

diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.ERROR);

const tracerConfig: NodeTracerConfig = {
  resource: new Resource({
    [SemanticResourceAttributes.SERVICE_NAME]: serviceName,
  }),
};

const provider = new NodeTracerProvider(tracerConfig);
const exporter = new TraceExporter();
// const processor = new SimpleSpanProcessor(exporter);
const processor = new BatchSpanProcessor(exporter);
const propagator = new CloudPropagator();

provider.addSpanProcessor(processor);

const ignorePaths: IgnoreIncomingRequestFunction = function ignorePaths(req) {
  const regex = /^\/(health*|computeMetadata*)$/;
  return !!req.url.match(regex);
};

registerInstrumentations({
  instrumentations: [
    new HttpInstrumentation({
      ignoreIncomingRequestHook: ignorePaths,
    }),
    new ExpressInstrumentation(),
  ],
});

provider.register({ propagator });

const tracer = trace.getTracer(serviceName);

export default tracer;
export { tracer, provider };
