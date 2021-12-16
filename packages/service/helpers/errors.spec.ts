import nock from 'nock';
import fetch from 'node-fetch';

import * as Errors from './errors';

const error = new Error();

describe('Test custom errors', () => {
  test('it should be instance retriable errors', () => {
    expect(new Errors.RetryableError(error)).toBeInstanceOf(Errors.RequestError);
    expect(new Errors.BadGatewayError(error)).toBeInstanceOf(Errors.RetryableError);
    expect(new Errors.InternalError(error)).toBeInstanceOf(Errors.RetryableError);
    expect(new Errors.InternalServerError(error)).toBeInstanceOf(Errors.RetryableError);
    expect(new Errors.MaxNodeLimitExceededError(error)).toBeInstanceOf(Errors.RetryableError);
    expect(new Errors.ServiceUnavailableError(error)).toBeInstanceOf(Errors.RetryableError);
    expect(new Errors.TimedoutError(error)).toBeInstanceOf(Errors.RetryableError);
    expect(new Errors.LoadingError(error)).toBeInstanceOf(Errors.RetryableError);
    expect(new Errors.SomethingWentWrongError(error)).toBeInstanceOf(Errors.RetryableError);
  });

  test('it should be instance of request errors', () => {
    expect(new Errors.BlockedError(error)).toBeInstanceOf(Errors.RequestError);
    expect(new Errors.NotFoundError(error)).toBeInstanceOf(Errors.RequestError);
    expect(new Errors.NotModifiedError(error)).toBeInstanceOf(Errors.RequestError);
    expect(new Errors.ForbiddenError(error)).toBeInstanceOf(Errors.RequestError);
  });

  test('it should be instance of custom errors', () => {
    expect(new Errors.RequestError(error)).toBeInstanceOf(Error);
    expect(new Errors.ResourceUpdateError(error)).toBeInstanceOf(Error);
  });

  test('it should store information of the failed request', async () => {
    nock('http://localhost').get('/').reply(500, 'failed');

    await fetch('/').catch((error) => {
      const rError = new Errors.RequestError(error);
      expect(rError.response?.status).toBe(500);
      expect(rError.response?.data).toBe('failed');
      expect(rError.message).toBe(error.message);
    });
  });
});
