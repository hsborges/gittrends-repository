/*
 *  Author: Hudson S. Borges
 */
import serverlessExpress from '@vendia/serverless-express';
import { APIGatewayProxyHandler } from 'aws-lambda';

import { configureApp } from './app';

export const handler: APIGatewayProxyHandler = serverlessExpress({ app: configureApp() });
