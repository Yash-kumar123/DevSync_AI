import type { HttpError } from '../interfaces/http-error.interface.js';

export function createHttpError(message: string, statusCode: number): HttpError {
  const error = new Error(message) as HttpError;
  error.statusCode = statusCode;
  return error;
}
