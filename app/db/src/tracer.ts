import {
  diag,
  DiagConsoleLogger,
  DiagLogLevel,
  trace,
  // Attributes,
  // SpanKind,
} from '@opentelemetry/api';

import {
  SimpleSpanProcessor,
  // AlwaysOnSampler,
  // Sampler,
  // SamplingDecision,
} from '@opentelemetry/sdk-trace-base';

import { registerInstrumentations } from '@opentelemetry/instrumentation';
import { NodeTracerProvider } from '@opentelemetry/sdk-trace-node';
import { Resource } from '@opentelemetry/resources';
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';
import { ExpressInstrumentation } from '@opentelemetry/instrumentation-express';
import { HttpInstrumentation } from '@opentelemetry/instrumentation-http';
import { TraceExporter } from '@google-cloud/opentelemetry-cloud-trace-exporter';

diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.INFO);

export const setupTracing = (serviceName: string) => {
  const provider = new NodeTracerProvider({
    resource: new Resource({
      [SemanticResourceAttributes.SERVICE_NAME]: serviceName,
    }),
    // sampler: filterSampler(ignoreHealthCheck, new AlwaysOnSampler()),
  });

  registerInstrumentations({
    tracerProvider: provider,
    instrumentations: [
      // Express instrumentation expects HTTP layer to be instrumented
      new HttpInstrumentation(),
      new ExpressInstrumentation(),
    ],
  });

  const exporter = new TraceExporter();

  provider.addSpanProcessor(new SimpleSpanProcessor(exporter));

  // Initialize the OpenTelemetry APIs to use the NodeTracerProvider bindings
  provider.register();

  return trace.getTracer(serviceName);
};

// type FilterFunction = (
//   spanName: string,
//   spanKind: SpanKind,
//   attributes: Attributes
// ) => boolean;

// function filterSampler(filterFn: FilterFunction, parent: Sampler): Sampler {
//   return {
//     shouldSample(ctx, tid, spanName, spanKind, attr, links) {
//       if (!filterFn(spanName, spanKind, attr)) {
//         return { decision: SamplingDecision.NOT_RECORD };
//       }
//       return parent.shouldSample(ctx, tid, spanName, spanKind, attr, links);
//     },
//     toString() {
//       return `FilterSampler(${parent.toString()})`;
//     },
//   };
// }

// function ignoreHealthCheck(
//   _spanName: string,
//   spanKind: SpanKind,
//   attributes: Attributes
// ) {
//   return (
//     spanKind !== SpanKind.SERVER ||
//     attributes[SemanticAttributes.HTTP_ROUTE] !== '/health'
//   );
// }
