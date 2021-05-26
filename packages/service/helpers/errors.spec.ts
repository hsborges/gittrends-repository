import * as Errors from './errors';

describe('Custom application errors', () => {
  it('should be instance retriable errors', () => {
    expect(new Errors.RetryableError('')).toBeInstanceOf(Errors.RequestError);
    expect(new Errors.BadGatewayError('')).toBeInstanceOf(Errors.RetryableError);
    expect(new Errors.InternalError('')).toBeInstanceOf(Errors.RetryableError);
    expect(new Errors.InternalServerError('')).toBeInstanceOf(Errors.RetryableError);
    expect(new Errors.MaxNodeLimitExceededError('')).toBeInstanceOf(Errors.RetryableError);
    expect(new Errors.ServiceUnavailableError('')).toBeInstanceOf(Errors.RetryableError);
    expect(new Errors.TimedoutError('')).toBeInstanceOf(Errors.RetryableError);
    expect(new Errors.LoadingError('')).toBeInstanceOf(Errors.RetryableError);
    expect(new Errors.SomethingWentWrongError('')).toBeInstanceOf(Errors.RetryableError);
  });

  it('should be instance of request errors', () => {
    expect(new Errors.BlockedError('')).toBeInstanceOf(Errors.RequestError);
    expect(new Errors.NotFoundError('')).toBeInstanceOf(Errors.RequestError);
    expect(new Errors.NotModifiedError('')).toBeInstanceOf(Errors.RequestError);
    expect(new Errors.ForbiddenError('')).toBeInstanceOf(Errors.RequestError);
  });

  it('should be instance of custom errors', () => {
    expect(new Errors.RequestError('')).toBeInstanceOf(Error);
    expect(new Errors.ResourceUpdateError('')).toBeInstanceOf(Error);
  });
});
