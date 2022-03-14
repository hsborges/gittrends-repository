/*
 *  Author: Hudson S. Borges
 */
import { program } from 'commander';

import { version } from './package.json';

program
  .name('updater')
  .version(version)
  .command('collect', 'Collect data from GitHub API and send to message broker')
  .command('persist', 'Persist collected data on yarn database')
  .parse(process.argv);
