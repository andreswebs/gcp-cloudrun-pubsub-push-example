import { Request, Response, NextFunction } from 'express';

import { CloudPubSubPropagator } from './opentelemetry-gcp-pubsub-propagator';

import {
  context,
  ROOT_CONTEXT,
  defaultTextMapGetter,
} from '@opentelemetry/api';

function logger(req: Request, _res: Response, next: NextFunction) {
  console.log(`[${req.method}] ${req.originalUrl}`);
  return next();
}

function pubsubContext(req: Request, _res: Response, next: NextFunction) {
  const propagator = new CloudPubSubPropagator();
  const currentContext = context.active() || ROOT_CONTEXT;
  propagator.extract(
    currentContext,
    req.body.message.attributes,
    defaultTextMapGetter
  );
  next();
}

export { logger, pubsubContext };
