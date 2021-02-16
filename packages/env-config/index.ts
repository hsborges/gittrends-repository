/*
 *  Author: Hudson S. Borges
 */
import find from 'find-up';
import { config } from 'dotenv';

config({ path: find.sync(process.env.ENV_FILE ?? '.env') });
