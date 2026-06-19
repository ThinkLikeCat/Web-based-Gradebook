import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';

export function validate(schema: ZodSchema, source: 'body' | 'params' | 'query' = 'body') {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req[source]);
    if (!result.success) {
      const details = result.error.issues.map(issue => ({
        field: issue.path.join('.'),
        message: issue.message,
      }));
      res.status(400).json({ error: 'Validation failed', details });
      return;
    }
    req[source] = result.data;
    next();
  };
}
