import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { sendResponse } from '../utils/apiResponse';

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  console.error('🔥 Server Error Handler Caught:', err);

  // Handle Zod validation error
  if (err instanceof ZodError) {
    const formattedErrors = err.errors.map(e => ({
      field: e.path.join('.'),
      message: e.message,
    }));
    sendResponse(res, 400, false, 'Validation failed', undefined, undefined, formattedErrors);
    return;
  }

  // Handle Mongoose duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    sendResponse(res, 400, false, `Duplicate field value entered: ${field} must be unique.`);
    return;
  }

  // Handle Mongoose CastError (invalid ObjectId)
  if (err.name === 'CastError') {
    sendResponse(res, 400, false, `Invalid Resource ID format: ${err.value}`);
    return;
  }

  // Handle JWT Error
  if (err.name === 'JsonWebTokenError') {
    sendResponse(res, 401, false, 'Invalid authentication token');
    return;
  }

  if (err.name === 'TokenExpiredError') {
    sendResponse(res, 401, false, 'Authentication token has expired');
    return;
  }

  // Generic fallback
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  sendResponse(res, statusCode, false, message);
};
