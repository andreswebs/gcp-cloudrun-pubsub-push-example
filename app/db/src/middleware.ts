import { Request, Response, NextFunction } from 'express';

import { tracer } from './tracer';

import { context, trace } from '@opentelemetry/api';

function logger(req: Request, _res: Response, next: NextFunction) {
  console.log(`[${req.method}] ${req.originalUrl}`);
  return next();
}

function pubsubContext(req: Request, _res: Response, next: NextFunction) {
  const otelPubSubAttribute = 'googclient_OpenTelemetrySpanContext';

  const attributes = req.body.message.attributes;

  try {
    const spanContext = JSON.parse(attributes[otelPubSubAttribute]);

    const ctx = trace.setSpanContext(context.active(), spanContext);

    const span = tracer.startSpan('pubsub message', {}, ctx);
    console.log(`pubsubContext:\n${JSON.stringify(span.spanContext())}`);

    req.app.locals.opentelemetry = { span };
  } catch (e) {
    console.error(e);
  }

  next();
}

export { logger, pubsubContext };
