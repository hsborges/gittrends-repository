/*
 *  Author: Hudson S. Borges
 */
import { compact, isNil, truncate, uniq } from 'lodash';

import Component from '../github/Component';
import { HttpClientResponse } from '../github/HttpClient';

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

export class RepositoryCrawlerError extends BaseError {
  readonly errors: Error[];

  constructor(errors: Error | Error[]) {
    const errorsArray = Array.isArray(errors) ? errors : [errors];
    const messageFragment = errorsArray
      .map((error) => `[${error.constructor.name}]: ${truncate(error.message, { length: 100 })}`)
      .join(' & ');

    super(`Errors occurred when updating (see "errors" field) @ ${messageFragment}`);
    this.errors = errorsArray;
  }
}

export type RequestErrorOptions = {
  components?: Component | Component[];
  status?: number;
  data?: any;
};

export class RequestError extends ExtendedError {
  readonly response?: { message: string; status?: number; data?: any };
  readonly components?: any[];

  static create(error: Error, opts?: RequestErrorOptions): RequestError;
  static create(error: Error & HttpClientResponse, opts?: RequestErrorOptions): RequestError {
    const status = error.status || opts?.status;
    if (status) {
      if (/[24]\d{2}/.test(status.toString())) return new GithubRequestError(error, opts);
      else return new ServerRequestError(error, opts);
    } else {
      return new RequestError(error, opts);
    }
  }

  constructor(error: Error, opts?: RequestErrorOptions);
  constructor(error: Error & HttpClientResponse, opts?: RequestErrorOptions) {
    super(error);

    this.response = {
      message: error.message,
      status: opts?.status ?? error.status,
      data: opts?.data ?? error.data
    };

    if (opts?.components) {
      const componentArray = Array.isArray(opts?.components)
        ? opts?.components
        : [opts?.components];
      this.components = componentArray.map((component) => component.toJSON());
    }
  }
}

export class ServerRequestError extends RequestError {
  readonly type: 'BAD_GATEWAY' | 'INTERNAL_SERVER' | 'UNKNOWN';

  constructor(error: Error, opts?: RequestErrorOptions);
  constructor(error: Error & HttpClientResponse, opts?: RequestErrorOptions) {
    super(error, opts);

    if (this.response?.status === 500) this.type = 'INTERNAL_SERVER';
    else if (this.response?.status === 502) this.type = 'BAD_GATEWAY';
    else this.type = 'UNKNOWN';
  }
}

type GithubRequestErrorType =
  | 'BLOQUED'
  | 'FORBIDDEN'
  | 'INTERNAL'
  | 'MAX_NODE_LIMIT_EXCEEDED'
  | 'NOT_FOUND'
  | 'NOT_MODIFIED'
  | 'SERVICE_UNAVAILABLE'
  | 'TIMEDOUT'
  | 'LOADING'
  | 'SOMETHING_WENT_WRONG'
  | 'UNKNOWN';

export class GithubRequestError extends RequestError {
  readonly type: GithubRequestErrorType[] = [];

  constructor(error: Error, opts?: RequestErrorOptions);
  constructor(error: Error & HttpClientResponse, opts?: RequestErrorOptions) {
    super(error, opts);

    if (this.response?.data?.errors) {
      this.type = (
        this.response.data.errors as (unknown & { type?: string; message?: string })[]
      ).map((value) => {
        if (value.type === 'FORBIDDEN') return 'FORBIDDEN';
        else if (value.type === 'INTERNAL') return 'INTERNAL';
        else if (value.type === 'NOT_FOUND') return 'NOT_FOUND';
        else if (value.type === 'MAX_NODE_LIMIT_EXCEEDED') return 'MAX_NODE_LIMIT_EXCEEDED';
        else if (value.type === 'SERVICE_UNAVAILABLE') return 'SERVICE_UNAVAILABLE';
        else if (value.message === 'timedout') return 'TIMEDOUT';
        else if (value.message === 'loading') return 'LOADING';
        else if (/^something.went.wrong.*/i.test(value.message as string))
          return 'SOMETHING_WENT_WRONG';
        return 'UNKNOWN';
      });
    }
  }

  public is(type: GithubRequestErrorType): boolean {
    return this.type.length === 1 && this.type[0] === type;
  }

  public all(type: GithubRequestErrorType): boolean {
    const uniqTypes = compact(uniq(this.type));
    return uniqTypes.length === 1 && uniqTypes[0] === type;
  }

  public some(type: GithubRequestErrorType): boolean {
    return !isNil(this.type?.find((t) => t === type));
  }
}
