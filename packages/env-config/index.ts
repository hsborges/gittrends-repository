/*
 *  Author: Hudson S. Borges
 */
import { config } from 'dotenv';
import find from 'find-up';

config({ path: find.sync(`.env.${process.env.NODE_ENV || 'development'}`) });
config({ path: find.sync('.env.local') });
config({ path: find.sync('.env') });
