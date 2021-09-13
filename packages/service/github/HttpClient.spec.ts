import axios from 'axios';
import express from 'express';
import getPort from 'get-port';
import { mocked } from 'ts-jest/utils';
import { RequestError } from '../helpers/errors';
import client from './HttpClient';

jest.mock('axios');

const mokedAxios = mocked(axios, true);
const timeout = parseInt(process.env.GITTRENDS_PROXY_TIMEOUT ?? '15000', 10);
const retries = parseInt(process.env.GITTRENDS_PROXY_RETRIES ?? '0', 5);

const actualAxios = <typeof axios>jest.requireActual('axios');
mokedAxios.CancelToken.source.mockImplementation(actualAxios.CancelToken.source);

let app: ReturnType<typeof express>;
let server: ReturnType<typeof app.listen>;

beforeEach(async () => {
  const port = await getPort();

  app = express();
  app.use(express.json());

  mokedAxios.post.mockImplementation((url, data, options) => {
    expect(url).toBe('/graphql');
    expect(data).toBeDefined();
    expect(options?.baseURL).toBeDefined();
    expect(options?.responseType).toBe('json');
    expect(options?.headers['user-agent']).toBeDefined();
    expect(options?.timeout).toBeDefined();
    return actualAxios.post(url, data, { ...options, baseURL: `http://localhost:${port}` });
  });

  app.post('/graphql', (req, res) => {
    if (req.body.status === 200) res.status(200).json({ data: 200 });
    else if (req.body.status === 300) res.status(300).json({ data: 300 });
    else if (req.body.status === 400) res.status(400).json({ data: 400 });
    else if (req.body.status === 500) res.status(500).json({ data: 500 });
    else setTimeout(() => res.status(600).json({ data: 600 }), timeout + 1000);
  });

  server = app.listen(port);

  await new Promise((resolve) => server.on('listening', resolve));
});

afterEach(async () => {
  await new Promise((resolve) => server.close(resolve));
});

beforeEach(() => mokedAxios.post.mockClear());

test('it should correctly respond to common status codes (2xx, 4xx, and 5xx)', async () => {
  await expect(client({ status: 200 })).resolves.toHaveProperty('data.data', 200);
  await expect(client({ status: 400 })).rejects.toThrowError(RequestError);
  await expect(client({ status: 500 })).rejects.toThrowError(RequestError);
  expect(mokedAxios.post.mock.calls.length).toEqual(3);
});

test('it should retry the request when it fails with 6xx or no status', async () => {
  await expect(client({ status: 600 })).rejects.toThrowError(RequestError);
  expect(mokedAxios.post.mock.calls.length).toEqual(1 + retries);
  await new Promise((resolve) => server.close(resolve));
  await expect(client({ status: 200 })).rejects.toThrowError(RequestError);
  expect(mokedAxios.post.mock.calls.length).toEqual((1 + retries) * 2);
});

test("it shouldn't retry the request when it fails with 4xx or 5xx", async () => {
  await expect(client({ status: 400 })).rejects.toThrowError(RequestError);
  expect(mokedAxios.post.mock.calls.length).toEqual(1);
  await expect(client({ status: 500 })).rejects.toThrowError(RequestError);
  expect(mokedAxios.post.mock.calls.length).toEqual(2);
});

test('it should abort long time running requests', async () => {
  await expect(client({ status: 600 })).rejects.toThrowError(RequestError);
  expect(mokedAxios.post.mock.calls.length).toEqual(retries + 1);
});
