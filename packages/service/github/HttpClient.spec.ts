/*
 *  Author: Hudson S. Borges
 */
import nock from 'nock';

import HttpClient from './HttpClient';

let scope: nock.Scope;

const client = new HttpClient({ protocol: 'http', host: 'localhost', timeout: 1000, retries: 2 });

beforeEach(() => {
  scope = nock(client.baseUrl, { allowUnmocked: false }).persist();
});

afterEach(() => {
  nock.cleanAll();
  nock.abortPendingRequests();
});

test('it should correctly respond to success queries (2xx)', async () => {
  scope.post('/graphql').reply(200);
  await expect(client.request('')).resolves.toBeDefined();
});

test('it should correctly respond to client error queries (4xx)', async () => {
  scope.post('/graphql').reply(400);
  await expect(client.request('')).rejects.toThrowError();
});

test('it should correctly respond to github server error (5xx)', async () => {
  scope.post('/graphql').reply(500);
  await expect(client.request('')).rejects.toThrowError();
});

test('it should correctly respond to proxy server error (6xx)', async () => {
  scope.post('/graphql').reply(600);
  await expect(client.request('')).rejects.toThrowError();
});

test('it should retry the request when it fails with 6xx or no status', async () => {
  let count = 0;
  scope.post('/graphql').reply(() => (count += 1) && [600]);

  await expect(client.request('')).rejects.toThrowError();
  expect(count).toEqual(client.retries + 1);
});

test("it shouldn't retry the request when it fails with 4xx", async () => {
  let count = 0;
  scope.post('/graphql').reply(() => (count += 1) && [400]);

  await expect(client.request('')).rejects.toThrowError();
  expect(count).toEqual(1);
});

test("it shouldn't retry the request when it fails with 5xx", async () => {
  let count = 0;
  scope.post('/graphql').reply(() => (count += 1) && [500]);

  await expect(client.request('')).rejects.toThrowError();
  expect(count).toEqual(1);
});

test('it should abort long time running requests', async () => {
  let count = 0;
  scope
    .post('/graphql')
    .delay(client.timeout + 1)
    .reply(() => (count += 1) && [200]);

  await expect(client.request('')).rejects.toThrowError();
  expect(count).toEqual(client.retries + 1);
});
