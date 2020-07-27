const _ = require('lodash');
const axios = require('axios');
const faker = require('faker');
const qs = require('querystring');
const nodemailer = require('nodemailer');

const env = _.capitalize(process.env.NODE_ENV || 'development');

const schema = {
  query: {
    type: 'object',
    required: ['code'],
    properties: {
      code: { type: 'string' }
    }
  }
};

module.exports = async function (fastify) {
  fastify.get('/authorize', { schema }, async function (request, reply) {
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

    // send mail
    const mailPromise = process.env.GITTRENDS_MAIL_TO
      ? nodemailer
          .createTransport({
            host: process.env.GITTRENDS_MAIL_HOST,
            port: process.env.GITTRENDS_MAIL_PORT,
            secure: process.env.GITTRENDS_MAIL_PORT === 465,
            auth: {
              user: process.env.GITTRENDS_MAIL_USER,
              pass: process.env.GITTRENDS_MAIL_PASS
            }
          })
          .sendMail({
            from: `"GitTrends.app - ${env} Environment" <root@gittrends.app>`,
            to: process.env.GITTRENDS_MAIL_TO,
            subject: `[GitTrends.app] - New access token donated from ${uInfo.login} ✔`,
            text: `Hey, we have a great news!  donated a token.\n
             Access token: ${token} (${type})\n
             Scopes: ${scope}\n
             Created at: ${new Date().toISOString()}`.replace(/ +/g, ' ')
          })
      : null;

    const insertPromise = fastify
      .knex('github_tokens')
      .insert({ token, type, scope, login: uInfo.login, email: uInfo.email });

    await Promise.all([mailPromise, insertPromise]);

    return reply.redirect(
      `${request.headers.referer}authorization?success=true&login=${uInfo.login}`
    );
  });
};
