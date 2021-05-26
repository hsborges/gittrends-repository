/*
 *  Author: Hudson S. Borges
 */
import find from 'find-up';
import { config } from 'dotenv';

config({ path: find.sync(`.env.${process.env.NODE_ENV || 'development'}`) });
config({ path: find.sync('.env.local') });
config({ path: find.sync('.env') });
