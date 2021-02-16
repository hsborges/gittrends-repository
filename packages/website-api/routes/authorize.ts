/*
 *  Author: Hudson S. Borges
 */
import _ from 'lodash';
import axios from 'axios';
import faker from 'faker';
import qs from 'querystring';
import nodemailer from 'nodemailer';
import SMTPTransport from 'nodemailer/lib/smtp-transport';

import { FastifyInstance } from 'fastify';
import { IGithubToken, GithubToken } from '@gittrends/database-config';

export default async function (fastify: FastifyInstance): Promise<void> {
  const env = _.capitalize(process.env.NODE_ENV || 'development');

  fastify.get<{ Querystring: { code: string } }>('/authorize', async function (request, reply) {
    const { data: tokenInfo } = await axios
      .post('https://github.com/login/oauth/access_token', {
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_SECRET_ID,
        code: request.query.code
      })
      .catch((err) => reply.code(err.response.status).send(err.message));

    const { access_token: token, token_type: type, scope } = qs.parse(tokenInfo);

    const { data: uInfo } = await axios
      .get('https://api.github.com/user', {
        headers: {
          'User-Agent': faker.internet.userAgent(),
          Authorization: `Token ${token}`
        }
      })
      .catch((err) => reply.code(err.response.status).send(err.message));

    const transportOptions: SMTPTransport.Options = {
      host: process.env.GITTRENDS_MAIL_HOST,
      port: process.env?.GITTRENDS_MAIL_PORT
        ? parseInt(process.env.GITTRENDS_MAIL_PORT, 10)
        : undefined,
      secure: process.env.GITTRENDS_MAIL_PORT == '465',
      auth: {
        user: process.env.GITTRENDS_MAIL_USER,
        pass: process.env.GITTRENDS_MAIL_PASS
      }
    };

    // send mail
    const mailPromise = process.env.GITTRENDS_MAIL_TO
      ? nodemailer.createTransport(transportOptions).sendMail({
          from: `"GitTrends.app - ${env} Environment" <root@gittrends.app>`,
          to: process.env.GITTRENDS_MAIL_TO,
          subject: `[GitTrends.app] - New access token donated from ${uInfo.login} ✔`,
          text: `Hey, we have a great news!  donated a token.\n
             Access token: ${token} (${type})\n
             Scopes: ${scope}\n
             Created at: ${new Date().toISOString()}`.replace(/ +/g, ' ')
        })
      : null;

    const data: IGithubToken = {
      token: token as string,
      type: type as string,
      scope: scope as string,
      login: uInfo.login,
      email: uInfo.email,
      created_at: new Date()
    };

    await Promise.all([mailPromise, GithubToken.insert(data)]);

    return reply.redirect(`${request.headers.referer}authorization?success&login=${uInfo.login}`);
  });
}
