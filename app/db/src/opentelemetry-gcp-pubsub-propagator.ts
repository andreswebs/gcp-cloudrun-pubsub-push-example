import {
  TextMapPropagator,
  Context,
  trace,
  TextMapSetter,
  TextMapGetter,
  SpanContext,
} from '@opentelemetry/api';

export const otelPubSubAttribute = 'googclient_OpenTelemetrySpanContext';
const FIELDS = [otelPubSubAttribute];

class CloudPubSubPropagator implements TextMapPropagator {
  inject(
    context: Context,
    carrier: unknown,
    setter: TextMapSetter<unknown>
  ): void {
    const spanContext = trace.getSpanContext(context);
    if (!spanContext) {
      return;
    }
    setter.set(carrier, otelPubSubAttribute, JSON.stringify(spanContext));
  }

  extract(
    context: Context,
    carrier: unknown,
    getter: TextMapGetter<unknown>
  ): Context {
    try {
      const traceContextAttribute = getter.get(carrier, otelPubSubAttribute);

      const traceContextAttributeValue = Array.isArray(traceContextAttribute)
        ? traceContextAttribute[0]
        : traceContextAttribute;

      if (typeof traceContextAttributeValue !== 'string') {
        return context;
      }

      const spanContext: SpanContext = JSON.parse(traceContextAttributeValue);

      console.log(
        `CloudPubSubPropagator: spanContext:\n${JSON.stringify(spanContext)}`
      );

      return trace.setSpanContext(context, spanContext);
    } catch (e) {
      return context;
    }
  }

  fields(): string[] {
    return FIELDS;
  }
}

export default CloudPubSubPropagator;
export { CloudPubSubPropagator };
