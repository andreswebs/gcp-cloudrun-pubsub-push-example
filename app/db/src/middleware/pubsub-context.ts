import { Request, Response, NextFunction } from 'express';
import { context, trace } from '@opentelemetry/api';
import { getSpanContext } from '../utils';
import { tracer } from '../tracer';

/**
 * Propagate OTel context through Google Cloud Pub/Sub
 */
function pubsubContext(req: Request, _res: Response, next: NextFunction) {
  const spanContext = getSpanContext(req.body.message);

  try {
    if (spanContext) {
      spanContext.isRemote = true;
      const ctx = trace.setSpanContext(context.active(), spanContext);
      tracer.startActiveSpan('pubsub message', {}, ctx, (span) => {
        req.app.locals.opentelemetry = { span };
        return next();
      });
    }
  } catch (e) {
    console.error(JSON.stringify({ error: `${e.name}: ${e.message}` }));
  }

  return next();
}

export default pubsubContext;
