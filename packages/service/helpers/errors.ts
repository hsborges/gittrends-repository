/*
 *  Author: Hudson S. Borges
 */
import { AxiosError } from 'axios';
import { bold } from 'chalk';
import { pick, truncate } from 'lodash';

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

class CustomError extends BaseError {
  constructor(error: Error) {
    super(error.message);
    this.stack += `\n${bold('From previous:')} ${error.stack?.replace(/\n/g, '\n\t')}`;
  }
}

export class RequestError extends CustomError {
  readonly response?: string;
  readonly components?: any[];

  constructor(error: Error, components?: Component | Component[]);
  constructor(error: AxiosError, components?: Component | Component[]) {
    super(error);
    this.response = JSON.stringify({
      message: error.message,
      ...pick(error.response, ['status', 'data'])
    });

    if (components) {
      const componentArray = Array.isArray(components) ? components : [components];
      this.components = componentArray.map((component) => component.toJSON());
    }
  }
}

export class ResourceUpdateError extends BaseError {
  readonly errors: Error[];

  constructor(errors: Error | Error[]) {
    const errorsArray = Array.isArray(errors) ? errors : [errors];
    const messageFragment = errorsArray
      .map((error) => `[${error.constructor.name}]: ${truncate(error.message, { length: 80 })}`)
      .join(' -- ');

    super(`Several errors occurred (see "errors" field). Summary: ${messageFragment}`);
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
