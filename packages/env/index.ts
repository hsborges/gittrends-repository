/*
 *  Author: Hudson S. Borges
 */
import { config } from 'dotenv';
import findUp from 'findup-sync';

const find = function (file: string): string | undefined {
  return findUp(file, { cwd: __dirname }) || undefined;
};

config({ path: find(`.env.${process.env.NODE_ENV || 'development'}`) });
config({ path: find('.env.local') });
config({ path: find('.env') });
