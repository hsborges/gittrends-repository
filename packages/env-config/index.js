const find = require('find-up');

require('dotenv').config({ path: find.sync(process.env.ENV_FILE || '.env') });
