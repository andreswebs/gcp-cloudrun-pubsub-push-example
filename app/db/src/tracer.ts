import { serviceName } from './constants';

import {
  diag,
  DiagConsoleLogger,
  DiagLogLevel,
  trace,
  Attributes,
  SpanKind,
} from '@opentelemetry/api';

import {
  // ConsoleSpanExporter,
  // SimpleSpanProcessor,
  BatchSpanProcessor,
  AlwaysOnSampler,
  Sampler,
  SamplingDecision,
} from '@opentelemetry/sdk-trace-base';

import { registerInstrumentations } from '@opentelemetry/instrumentation';

import {
  NodeTracerProvider,
  NodeTracerConfig,
} from '@opentelemetry/sdk-trace-node';

import { Resource } from '@opentelemetry/resources';

import {
  SemanticResourceAttributes,
  SemanticAttributes,
} from '@opentelemetry/semantic-conventions';

import { HttpInstrumentation } from '@opentelemetry/instrumentation-http';
import { ExpressInstrumentation } from '@opentelemetry/instrumentation-express';
import { MongooseInstrumentation } from 'opentelemetry-instrumentation-mongoose';
import { TraceExporter } from '@google-cloud/opentelemetry-cloud-trace-exporter';
import { CloudPropagator } from '@google-cloud/opentelemetry-cloud-trace-propagator';

type FilterFunction = (
  spanName: string,
  spanKind: SpanKind,
  attributes: Attributes
) => boolean;

function filterSampler(filterFn: FilterFunction, parent: Sampler): Sampler {
  return {
    shouldSample(ctx, tid, spanName, spanKind, attr, links) {
      if (!filterFn(spanName, spanKind, attr)) {
        return { decision: SamplingDecision.NOT_RECORD };
      }
      return parent.shouldSample(ctx, tid, spanName, spanKind, attr, links);
    },
    toString() {
      return `FilterSampler(${parent.toString()})`;
    },
  };
}

function ignoreHealthCheck(
  _spanName: string,
  spanKind: SpanKind,
  attributes: Attributes
) {
  return (
    spanKind !== SpanKind.SERVER ||
    attributes[SemanticAttributes.HTTP_ROUTE] !== '/health'
  );
}

diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.INFO);

const propagator = new CloudPropagator();

const tracerConfig: NodeTracerConfig = {
  resource: new Resource({
    [SemanticResourceAttributes.SERVICE_NAME]: serviceName,
  }),
  sampler: filterSampler(ignoreHealthCheck, new AlwaysOnSampler()),
};

const provider = new NodeTracerProvider(tracerConfig);

const exporter = new TraceExporter();

provider.addSpanProcessor(new BatchSpanProcessor(exporter));
// provider.addSpanProcessor(new SimpleSpanProcessor(new ConsoleSpanExporter()));

provider.register({ propagator });

registerInstrumentations({
  instrumentations: [
    new HttpInstrumentation(),
    new ExpressInstrumentation(),
    new MongooseInstrumentation(),
  ],
});

const tracer = trace.getTracer(serviceName);

export default tracer;
export { tracer, provider };
