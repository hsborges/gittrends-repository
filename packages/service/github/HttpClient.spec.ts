import axios from 'axios';
import nock from 'nock';

import client, { BASE_URL, RETRIES, TIMEOUT } from './HttpClient';

let scope: nock.Scope;

const spy = jest.spyOn(axios, 'post');

beforeEach(() => {
  scope = nock(BASE_URL, { allowUnmocked: false }).persist();
  spy.mockClear();
});

afterEach(() => {
  nock.cleanAll();
  nock.abortPendingRequests();
});

test('it should correctly respond to success queries (2xx)', async () => {
  scope.post('/graphql').reply(200);
  await expect(client('')).resolves.toBeDefined();
});

test('it should correctly respond to client error queries (4xx)', async () => {
  scope.post('/graphql').reply(400);
  await expect(client('')).rejects.toThrowError();
});

test('it should correctly respond to github server error (5xx)', async () => {
  scope.post('/graphql').reply(500);
  await expect(client('')).rejects.toThrowError();
});

test('it should correctly respond to proxy server error (6xx)', async () => {
  scope.post('/graphql').reply(600);
  await expect(client('')).rejects.toThrowError();
});

test('it should retry the request when it fails with 6xx or no status', async () => {
  scope.post('/graphql').reply(600);
  await expect(client('')).rejects.toThrowError();
  expect(spy).toHaveBeenCalledTimes(1 + RETRIES);
});

test("it shouldn't retry the request when it fails with 4xx", async () => {
  scope.post('/graphql').reply(400);
  await expect(client('')).rejects.toThrowError();
  expect(spy).toHaveBeenCalledTimes(1);
});

test("it shouldn't retry the request when it fails with 5xx", async () => {
  scope.post('/graphql').reply(500);
  await expect(client('')).rejects.toThrowError();
  expect(spy).toHaveBeenCalledTimes(1);
});

test('it should abort long time running requests', async () => {
  scope
    .post('/graphql')
    .delay(TIMEOUT + 50)
    .reply(200);
  await expect(client('')).rejects.toThrowError();
  expect(spy).toHaveBeenCalledTimes(1 + RETRIES);
});
