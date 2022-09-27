import { Request, Response, NextFunction } from 'express';

function logger(req: Request, _res: Response, next: NextFunction) {
  console.log(`[${req.method}] ${req.originalUrl}`);
  return next();
}

export { logger };
