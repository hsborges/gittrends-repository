/*
 *  Author: Hudson S. Borges
 */
import { pickBy } from 'lodash';

process.stdout.write(
  JSON.stringify(
    pickBy(
      process.env,
      (_, key) =>
        key.startsWith('GITTRENDS_MAIL_') || key.startsWith('GITHUB_') || key === 'NODE_ENV'
    )
  )
);
