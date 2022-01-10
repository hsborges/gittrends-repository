/*
 *  Author: Hudson S. Borges
 */
import HttpClient from '../github/HttpClient';

const proxyUrl = new URL(process.env.GT_PROXY_URL || 'http://localhost:3000');

const httpClient = new HttpClient({
  protocol: proxyUrl.protocol,
  host: proxyUrl.hostname,
  port: proxyUrl.port ? parseInt(proxyUrl.port, 10) : undefined,
  timeout: process.env.GT_PROXY_TIMEOUT ? parseInt(process.env.GT_PROXY_TIMEOUT, 10) : undefined,
  retries: process.env.GT_PROXY_RETRIES ? parseInt(process.env.GT_PROXY_RETRIES, 5) : undefined,
  userAgent: process.env.GT_PROXY_USER_AGENT || undefined
});

export function useHttpClient(): HttpClient {
  return httpClient;
}
