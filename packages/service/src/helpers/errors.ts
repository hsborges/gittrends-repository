/*
 *  Author: Hudson S. Borges
 */
class CustomError extends Error {
  readonly cause: Error | undefined;

  constructor(message: string, err?: Error | null) {
    super(message);
    this.name = this.constructor.name;
    this.message = message;
    if (typeof Error.captureStackTrace === 'function') {
      Error.captureStackTrace(this, this.constructor);
    } else {
      this.stack = new Error(message).stack;
    }
    if (err && err instanceof Error) this.cause = err;
  }
}

export class RequestError extends CustomError {
  readonly response: string | undefined;

  constructor(message: string, err?: Error | null, response?: string) {
    super(message, err);
    this.response = response;
  }
}

export class RetryableError extends RequestError {}
export class BadGatewayError extends RetryableError {}
export class BlockedError extends RequestError {}
export class ForbiddenError extends RequestError {}
export class InternalError extends RetryableError {}
export class MaxNodeLimitExceededError extends RetryableError {}
export class NotFoundError extends RequestError {}
export class NotModifiedError extends RequestError {}
export class ServiceUnavailableError extends RequestError {}
export class TimedoutError extends RetryableError {}
export class LoadingError extends RetryableError {}
export class SomethingWentWrongError extends RetryableError {}
