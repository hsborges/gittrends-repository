/*
 *  Author: Hudson S. Borges
 */
import { truncate } from 'lodash';

class ExtendedError extends Error {
  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
    this.message = message;
    if (typeof Error.captureStackTrace === 'function') {
      Error.captureStackTrace(this, this.constructor);
    } else {
      this.stack = new Error(message).stack;
    }
  }
}
class CustomError extends ExtendedError {
  readonly cause?: Error;

  constructor(message: string, err?: Error) {
    super(message);
    if (err && err instanceof Error) {
      this.cause = err;
      this.stack += '\nFrom previous ' + this.cause?.stack;
    }
  }
}

export class RequestError extends CustomError {
  readonly response?: string;
  readonly query?: TObject | string;

  constructor(message: string, err?: Error | null, response?: string, query?: TObject | string) {
    const internalMessage =
      message +
      `\nQuery: ${truncate(JSON.stringify(query), { length: 96 })}` +
      `\nResponse: ${typeof response === 'string' ? response : JSON.stringify(response)}`;
    super(internalMessage, err || undefined);
    this.response = response;
    this.query = query;
  }
}

export class ResourceUpdateError extends CustomError {}
export class RetryableError extends RequestError {}
export class BadGatewayError extends RetryableError {}
export class BlockedError extends RequestError {}
export class ForbiddenError extends RequestError {}
export class InternalError extends RetryableError {}
export class InternalServerError extends RetryableError {}
export class MaxNodeLimitExceededError extends RetryableError {}
export class NotFoundError extends RequestError {}
export class NotModifiedError extends RequestError {}
export class ServiceUnavailableError extends RetryableError {}
export class TimedoutError extends RetryableError {}
export class LoadingError extends RetryableError {}
export class SomethingWentWrongError extends RetryableError {}
