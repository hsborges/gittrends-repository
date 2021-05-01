/*
 *  Author: Hudson S. Borges
 */
import serverlessExpress from '@vendia/serverless-express';

import { configureApp } from './app';
import { APIGatewayProxyHandler } from 'aws-lambda';

export const handler: APIGatewayProxyHandler = serverlessExpress({ app: configureApp() });
