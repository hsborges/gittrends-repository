/*
 *  Author: Hudson S. Borges
 */
import UserAgent from 'user-agents';

import HttpClient from '../github/HttpClient';

const proxyUrl = new URL(process.env.GT_PROXY || 'http://localhost:3000');

const httpClient = new HttpClient({
  protocol: proxyUrl.protocol,
  host: proxyUrl.hostname,
  port: parseInt(proxyUrl.port, 10),
  timeout: parseInt(process.env.GT_PROXY_TIMEOUT ?? '15000', 10),
  retries: parseInt(process.env.GT_PROXY_RETRIES ?? '0', 5),
  userAgent: process.env.GT_PROXY_USER_AGENT ?? new UserAgent().random().toString()
});

export function useHttpClient(): HttpClient {
  return httpClient;
}
