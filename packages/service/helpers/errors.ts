/*
 *  Author: Hudson S. Borges
 */
import { AxiosError } from 'axios';
import { truncate } from 'lodash';

import Component from '../github/Component';

class BaseError extends Error {
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

class ExtendedError extends BaseError {
  constructor(error: Error) {
    super(error.message);
    this.stack += `\nFrom previous: ${error.stack?.replace(/\n/g, '\n    ')}`;
  }
}

type RequestErrorOptions = {
  components?: Component | Component[];
  status?: number;
  data?: any;
};

export class RequestError extends ExtendedError {
  readonly response?: { message: string; status?: number; data?: any };
  readonly components?: any[];

  constructor(error: Error, opts?: RequestErrorOptions);
  constructor(error: AxiosError, opts?: RequestErrorOptions) {
    super(error);

    this.response = {
      message: error.message,
      status: opts?.status ?? error.response?.status,
      data: opts?.data ?? error.response?.data
    };

    if (opts?.components) {
      const componentArray = Array.isArray(opts?.components)
        ? opts?.components
        : [opts?.components];
      this.components = componentArray.map((component) => component.toJSON());
    }
  }
}

export class ResourceUpdateError extends ExtendedError {}
export class RepositoryUpdateError extends BaseError {
  readonly errors: Error[];

  constructor(errors: Error | Error[]) {
    const errorsArray = Array.isArray(errors) ? errors : [errors];
    const messageFragment = errorsArray
      .map((error) => `[${error.constructor.name}]: ${truncate(error.message, { length: 80 })}`)
      .join(' & ');

    super(`Errors occurred when updating (see "errors" field) @ ${messageFragment}`);
    this.errors = errorsArray;
  }
}

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
