import { Request, Response, NextFunction } from 'express';

import { CloudPubSubPropagator } from './opentelemetry-gcp-pubsub-propagator';

import { context, defaultTextMapGetter } from '@opentelemetry/api';

function logger(req: Request, _res: Response, next: NextFunction) {
  console.log(`[${req.method}] ${req.originalUrl}`);
  return next();
}

function pubsubContext(req: Request, _res: Response, next: NextFunction) {
  const propagator = new CloudPubSubPropagator();
  const currentContext = context.active();
  const carrier = { ...req.body.message.attributes };

  const parentContext = propagator.extract(
    currentContext,
    carrier,
    defaultTextMapGetter
  );

  console.log('pubsubContext middleware:');

  console.log(`Carrier:\n${JSON.stringify(carrier, null, 2)}`);

  console.log(`Extract operation:\n${JSON.stringify(parentContext, null, 2)}`);

  next();
}

export { logger, pubsubContext };
