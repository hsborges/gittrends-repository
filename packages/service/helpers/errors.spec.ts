import axios from 'axios';
import nock from 'nock';

import { GithubRequestError, ServerRequestError, RequestError } from './errors';

const url = 'http://localhost';

afterEach(() => {
  nock.cleanAll();
});

describe('Test request errors', () => {
  test('it should store information of the failed request', async () => {
    nock(url).get('/').reply(500, 'failed');

    await expect(
      axios.get<string>(url).catch(async ({ response: { data, status } }) => {
        const error = new RequestError(new Error(), { data, status: status });
        expect(error.response?.status).toBe(500);
        expect(error.response?.data).toBe('failed');
      })
    ).resolves.toBeUndefined();
  });

  test('it should create the appropriated error (network issues)', async () => {
    nock(url).get('/').reply(500);

    let error = await axios
      .get(url)
      .catch(({ response }) => RequestError.create(new Error(), { status: response.status }));
    expect(error).toBeInstanceOf(ServerRequestError);
    expect((error as ServerRequestError).type).toBe('INTERNAL_SERVER');

    nock(url).get('/').reply(502);

    error = await axios
      .get(url)
      .catch(({ response }) => RequestError.create(new Error(), { status: response.status }));
    expect(error).toBeInstanceOf(ServerRequestError);
    expect((error as ServerRequestError).type).toBe('BAD_GATEWAY');
  });

  test('it should create the appropriated error (github issues)', async () => {
    nock(url)
      .get('/errors')
      .reply(200, {
        errors: [
          { type: 'FORBIDDEN', message: 'testing' },
          { type: 'INTERNAL', message: 'testing' },
          { type: 'NOT_FOUND', message: 'testing' },
          { type: 'MAX_NODE_LIMIT_EXCEEDED', message: 'testing' },
          { type: 'SERVICE_UNAVAILABLE', message: 'testing' },
          { type: 'test', message: 'timedout' },
          { type: 'test', message: 'loading' },
          { type: 'test', message: 'Something went wrong ...' }
        ]
      });

    let response = await axios.get(`${url}/errors`);
    let error = RequestError.create(new Error(), {
      data: response.data,
      status: response.status
    });

    expect(error).toBeInstanceOf(GithubRequestError);
    expect((error as GithubRequestError).type).toStrictEqual([
      'FORBIDDEN',
      'INTERNAL',
      'NOT_FOUND',
      'MAX_NODE_LIMIT_EXCEEDED',
      'SERVICE_UNAVAILABLE',
      'TIMEDOUT',
      'LOADING',
      'SOMETHING_WENT_WRONG'
    ]);
    expect((error as GithubRequestError).all('FORBIDDEN')).toBe(false);
    expect((error as GithubRequestError).some('FORBIDDEN')).toBe(true);

    nock(url)
      .get('/errors')
      .reply(200, {
        errors: [
          { type: 'FORBIDDEN', message: 'testing' },
          { type: 'FORBIDDEN', message: 'testing' }
        ]
      });

    response = await axios.get(`${url}/errors`);
    error = RequestError.create(new Error(), {
      data: response.data,
      status: response.status
    });

    expect((error as GithubRequestError).all('FORBIDDEN')).toBe(true);
  });
});
