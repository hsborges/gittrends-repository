/*
 *  Author: Hudson S. Borges
 */
// eslint-disable-next-line max-classes-per-file
class CustomError extends Error {
  constructor(message, err) {
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

class NotUpdatedError extends CustomError {}
class RequestError extends CustomError {
  constructor(message, err, variables, response) {
    super(message, err);
    this.variables = variables || (err && err.variables);
    this.response = response || (err && err.response);
  }
}

class BadGatewayError extends RequestError {}
class BlockedError extends RequestError {}
class ForbiddenError extends RequestError {}
class MaxNodeLimitExceededError extends RequestError {}
class NotFoundError extends RequestError {}
class NotModifiedError extends RequestError {}
class ServiceUnavailableError extends RequestError {}
class TimedoutError extends RequestError {}
class LoadingError extends RequestError {}
class SomethingWentWrongError extends RequestError {}

module.exports = {
  BadGatewayError,
  BlockedError,
  ForbiddenError,
  MaxNodeLimitExceededError,
  NotFoundError,
  NotModifiedError,
  NotUpdatedError,
  RequestError,
  ServiceUnavailableError,
  TimedoutError,
  LoadingError,
  SomethingWentWrongError
};
