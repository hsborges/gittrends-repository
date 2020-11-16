/*
 *  Author: Hudson S. Borges
 */
const { Actor } = require('@gittrends/database-config');
const pRetry = require('promise-retry');

module.exports = (users, transaction) =>
  Promise.map(users, (user) =>
    pRetry(
      (retry) =>
        Actor.query(transaction)
          .insert(user)
          .toKnexQuery()
          .onConflict('id')
          .ignore()
          .catch((err) => {
            if (err.message.indexOf('deadlock') >= 0) retry(err);
            throw err;
          }),
      { retries: 3 }
    )
  );
