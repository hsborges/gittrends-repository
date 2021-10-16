/*
 *  Author: Hudson S. Borges
 */
import axios from 'axios';
import { json, urlencoded } from 'body-parser';
import compression from 'compression';
import consola from 'consola';
import cors from 'cors';
import express, { Express } from 'express';
import faker from 'faker';
import { capitalize } from 'lodash';
import nodemailer from 'nodemailer';
import SMTPTransport from 'nodemailer/lib/smtp-transport';
import qs from 'querystring';

import { PrismaClient } from '@prisma/client';

import repositoryRouter from './routes/repository.routes';

const ENV = capitalize(process.env.NODE_ENV || 'development');

export const prisma = new PrismaClient();

export function configureApp(): Express {
  const app = express();

  app.use(compression());
  app.use(cors());
  app.use(json());
  app.use(urlencoded({ extended: true }));

  app.use('/repo', repositoryRouter);

  app.get('/authorize', async (req, res) => {
    if (!req.query.code) return res.status(400).json({ message: 'Parameter "code" is missing!' });

    consola.info(`Authorization request received (code: ${req.query.code})`);

    consola.debug(`Obtaining access token (code: ${req.query.code}) ...`);
    const tokenInfo = await axios
      .post('https://github.com/login/oauth/access_token', {
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_SECRET_ID,
        code: req.query.code
      })
      .then(({ data }) => data)
      .catch((err) => {
        consola.error(err);
        res.status(err.response.status).send(err.message);
        throw err;
      });

    const { access_token: token, token_type: type, scope } = qs.parse(tokenInfo);
    consola.success(`Access token obtained (code: ${req.query.code} token: ${token})!`);

    consola.debug('Getting user metadata ...');
    const uInfo = await axios
      .get('https://api.github.com/user', {
        headers: {
          'User-Agent': faker.internet.userAgent(),
          Authorization: `Token ${token}`
        }
      })
      .then(({ data }) => data)
      .catch((err) => {
        consola.error(err);
        res.status(err.response.status).send(err.message);
        throw err;
      });

    // send mail
    consola.info(`Sending token by email (code: ${req.query.code}) ...`);
    await (process.env.GITTRENDS_MAIL_TO
      ? nodemailer
          .createTransport({
            host: process.env.GITTRENDS_MAIL_HOST,
            port: process.env.GITTRENDS_MAIL_PORT,
            secure: process.env.GITTRENDS_MAIL_PORT === '465',
            auth: {
              user: process.env.GITTRENDS_MAIL_USER,
              pass: process.env.GITTRENDS_MAIL_PASS
            }
          } as SMTPTransport.Options)
          .sendMail({
            from: `"GitTrends.app - ${ENV} Environment" <root@gittrends.app>`,
            to: process.env.GITTRENDS_MAIL_TO,
            subject: `[GitTrends.app] - New access token donated from ${uInfo.login} ✔`,
            text: `Hey, we have a great news!  donated a token.\n
             Access token: ${token} (${type})\n
             Scopes: ${scope}\n
             Created at: ${new Date().toISOString()}`.replace(/ +/g, ' ')
          })
      : Promise.resolve());

    consola.success(`Email sent (${req.query.code})! Redirecting user to ${req.headers.referer}.`);
    res.redirect(`${req.headers.referer}authorization?success=true&login=${uInfo.login}`);
  });

  return app;
}
